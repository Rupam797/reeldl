package com.reeldl.controller;

import com.reeldl.dto.ExtractionRequest;
import com.reeldl.dto.ExtractionResponse;
import com.reeldl.dto.HealthResponse;
import com.reeldl.dto.MediaInfo;
import com.reeldl.dto.MediaType;
import com.reeldl.exception.ExtractionFailedException;
import com.reeldl.exception.ExtractionTimeoutException;
import com.reeldl.exception.VideoTooLargeException;
import com.reeldl.service.CacheService;
import com.reeldl.service.ExtractorService;
import com.reeldl.service.RateLimitService;
import com.reeldl.service.YtDlpUpdateService;
import com.reeldl.validator.PlatformDetector;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ReelController {

    private static final Logger log = LoggerFactory.getLogger(ReelController.class);

    private final PlatformDetector platformDetector;
    private final ExtractorService extractorService;
    private final CacheService cacheService;
    private final RateLimitService rateLimitService;
    private final YtDlpUpdateService ytDlpUpdateService;
    private final String ytdlpPath;
    private final String galleryDlPath;
    private final String cookiesFile;
    private final long maxVideoSizeBytes;
    private final long maxAudioSizeBytes = 52_428_800L; // 50 MB
    private final long maxPhotoSizeBytes = 20_971_520L; // 20 MB

    public ReelController(
            PlatformDetector platformDetector,
            ExtractorService extractorService,
            CacheService cacheService,
            RateLimitService rateLimitService,
            YtDlpUpdateService ytDlpUpdateService,
            @Value("${app.ytdlp-path:/usr/local/bin/yt-dlp}") String ytdlpPath,
            @Value("${app.gallerydl-path:gallery-dl}") String galleryDlPath,
            @Value("${app.ytdlp-cookies-file:#{null}}") String cookiesFile,
            @Value("${app.max-video-size-bytes:104857600}") long maxVideoSizeBytes) {
        this.platformDetector = platformDetector;
        this.extractorService = extractorService;
        this.cacheService = cacheService;
        this.rateLimitService = rateLimitService;
        this.ytDlpUpdateService = ytDlpUpdateService;
        this.ytdlpPath = ytdlpPath;
        this.galleryDlPath = galleryDlPath;
        this.cookiesFile = cookiesFile;
        this.maxVideoSizeBytes = maxVideoSizeBytes;
    }

    @PostMapping("/extract")
    public ResponseEntity<ExtractionResponse> extract(
            @RequestBody @Valid ExtractionRequest request,
            HttpServletRequest httpRequest) {

        rateLimitService.checkRateLimit(httpRequest, "extract");

        MediaType type = request.typeOrDefault();
        PlatformDetector.DetectionResult detection = platformDetector.detectAndValidate(request.url());
        String normalizedUrl = detection.normalizedUrl();

        // Check cache first
        Optional<ExtractionResponse> cached = cacheService.getFromCache(normalizedUrl, type);
        if (cached.isPresent()) {
            log.info("Cache hit for {} extraction", type);
            return ResponseEntity.ok(cached.get());
        }

        // Extract via extractor service
        MediaInfo mediaInfo = extractorService.extract(normalizedUrl, type);
        ExtractionResponse response = ExtractionResponse.fromMediaInfo(mediaInfo);

        // Cache result
        cacheService.putInCache(normalizedUrl, type, response);

        log.info("Extraction completed successfully for platform: {}, type: {}", detection.platform(), type);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download")
    public ResponseEntity<StreamingResponseBody> download(
            @RequestParam String url,
            @RequestParam(required = false, defaultValue = "VIDEO") MediaType type,
            @RequestParam(required = false) String filename,
            HttpServletRequest httpRequest) {

        String endpointKey = (type == MediaType.AUDIO) ? "download_audio" : "download";
        rateLimitService.checkRateLimit(httpRequest, endpointKey);

        PlatformDetector.DetectionResult detection = platformDetector.detectAndValidate(url);
        String normalizedUrl = detection.normalizedUrl();

        if (type == MediaType.AUDIO) {
            return downloadAudio(normalizedUrl, filename);
        } else if (type == MediaType.PHOTO) {
            return downloadPhoto(normalizedUrl, filename);
        } else {
            return downloadVideo(normalizedUrl, filename);
        }
    }

    private ResponseEntity<StreamingResponseBody> downloadAudio(String normalizedUrl, String filename) {
        Path tempDir;
        try {
            tempDir = Files.createTempDirectory("reeldl_audio_");
        } catch (Exception e) {
            throw new ExtractionFailedException("Failed to initialize temporary storage for audio extraction.");
        }

        Path targetMp3 = tempDir.resolve("audio.mp3");

        List<String> command = new ArrayList<>();
        command.add(ytdlpPath);
        command.add("-x");
        command.add("--audio-format");
        command.add("mp3");
        command.add("--audio-quality");
        command.add("0");
        command.add("-o");
        command.add(targetMp3.toString());

        if (cookiesFile != null && !cookiesFile.isBlank() && Files.exists(Path.of(cookiesFile))) {
            command.add("--cookies");
            command.add(cookiesFile);
        }

        command.add(normalizedUrl);

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);

        try {
            Process process = pb.start();
            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                cleanupTemp(targetMp3, tempDir);
                throw new ExtractionTimeoutException("Audio extraction timed out after 30 seconds.");
            }

            if (process.exitValue() != 0) {
                cleanupTemp(targetMp3, tempDir);
                throw new ExtractionFailedException("Failed to extract audio stream.");
            }

            // Look for the output file (yt-dlp might name it targetMp3 directly)
            Path finalFile = targetMp3;
            if (!Files.exists(finalFile)) {
                try (var stream = Files.list(tempDir)) {
                    finalFile = stream.filter(p -> p.toString().endsWith(".mp3")).findFirst()
                            .orElse(null);
                }
            }

            if (finalFile == null || !Files.exists(finalFile)) {
                cleanupTemp(targetMp3, tempDir);
                throw new ExtractionFailedException("Audio file could not be generated.");
            }

            long fileSize = Files.size(finalFile);
            if (fileSize > maxAudioSizeBytes) {
                cleanupTemp(finalFile, tempDir);
                throw new VideoTooLargeException("Audio file exceeded maximum permitted size of 50 MB.");
            }

            Path fileToStream = finalFile;
            String downloadFilename = (filename != null && !filename.isBlank())
                    ? sanitizeFilename(filename, "mp3")
                    : "audio_" + (System.currentTimeMillis() / 1000) + ".mp3";

            StreamingResponseBody stream = outputStream -> {
                try (InputStream in = Files.newInputStream(fileToStream)) {
                    in.transferTo(outputStream);
                    outputStream.flush();
                } finally {
                    cleanupTemp(fileToStream, tempDir);
                }
            };

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadFilename + "\"")
                    .header("X-Accel-Buffering", "no")
                    .body(stream);

        } catch (ExtractionFailedException | ExtractionTimeoutException | VideoTooLargeException e) {
            throw e;
        } catch (Exception e) {
            cleanupTemp(targetMp3, tempDir);
            log.error("Audio extraction failed", e);
            throw new ExtractionFailedException("Failed to process audio download: " + e.getMessage());
        }
    }

    private ResponseEntity<StreamingResponseBody> downloadPhoto(String normalizedUrl, String filename) {
        // gallery-dl -g <url>
        String imageUrl = null;
        List<String> command = List.of(galleryDlPath, "-g", normalizedUrl);
        ProcessBuilder pb = new ProcessBuilder(command);
        try {
            Process process = pb.start();
            CompletableFuture<List<String>> stdoutFuture = CompletableFuture.supplyAsync(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    return reader.lines().filter(line -> line.startsWith("http")).collect(Collectors.toList());
                } catch (Exception e) {
                    return List.of();
                }
            });

            boolean finished = process.waitFor(20, TimeUnit.SECONDS);
            if (finished && process.exitValue() == 0) {
                List<String> urls = stdoutFuture.join();
                if (!urls.isEmpty()) {
                    imageUrl = urls.get(0);
                }
            } else {
                process.destroyForcibly();
            }
        } catch (Exception e) {
            log.warn("gallery-dl execution exception: {}", e.getMessage());
        }

        if (imageUrl == null || imageUrl.isBlank()) {
            // Fallback to cache/extractor
            MediaInfo info = extractorService.extract(normalizedUrl, MediaType.PHOTO);
            imageUrl = info.videoUrl();
        }

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new ExtractionFailedException("Could not resolve direct image URL.");
        }

        String downloadFilename = (filename != null && !filename.isBlank())
                ? sanitizeFilename(filename, "jpg")
                : "photo_" + (System.currentTimeMillis() / 1000) + ".jpg";

        return streamFromCdnUrl(imageUrl, downloadFilename, "image/jpeg", maxPhotoSizeBytes);
    }

    private ResponseEntity<StreamingResponseBody> downloadVideo(String normalizedUrl, String filename) {
        // Get extraction result (from cache or fresh)
        ExtractionResponse extraction = cacheService.getFromCache(normalizedUrl, MediaType.VIDEO)
                .orElseGet(() -> {
                    MediaInfo fresh = extractorService.extract(normalizedUrl, MediaType.VIDEO);
                    ExtractionResponse res = ExtractionResponse.fromMediaInfo(fresh);
                    cacheService.putInCache(normalizedUrl, MediaType.VIDEO, res);
                    return res;
                });

        String videoUrl = extraction.videoUrl();
        if (videoUrl == null || videoUrl.isBlank()) {
            throw new ExtractionFailedException("No downloadable video URL found.");
        }

        String downloadFilename = (filename != null && !filename.isBlank())
                ? sanitizeFilename(filename, "mp4")
                : "reel_" + (System.currentTimeMillis() / 1000) + ".mp4";

        return streamFromCdnUrl(videoUrl, downloadFilename, "video/mp4", maxVideoSizeBytes);
    }

    private ResponseEntity<StreamingResponseBody> streamFromCdnUrl(
            String sourceCdnUrl,
            String downloadFilename,
            String contentType,
            long maxSizeBytes) {

        StreamingResponseBody stream = outputStream -> {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection) new URI(sourceCdnUrl).toURL().openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(15_000);
                connection.setReadTimeout(60_000);
                connection.setRequestProperty("User-Agent",
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

                int statusCode = connection.getResponseCode();
                if (statusCode != 200) {
                    throw new ExtractionFailedException("Failed to retrieve media stream from CDN (HTTP " + statusCode + ").");
                }

                long contentLength = connection.getContentLengthLong();
                if (contentLength > maxSizeBytes) {
                    throw new VideoTooLargeException("Payload size (" + (contentLength / 1_048_576) + " MB) exceeds limit of " + (maxSizeBytes / 1_048_576) + " MB.");
                }

                try (InputStream in = connection.getInputStream()) {
                    byte[] buffer = new byte[8192];
                    long totalRead = 0;
                    int bytesRead;
                    while ((bytesRead = in.read(buffer)) != -1) {
                        totalRead += bytesRead;
                        if (totalRead > maxSizeBytes) {
                            throw new VideoTooLargeException("Media stream exceeded maximum size limit during download.");
                        }
                        outputStream.write(buffer, 0, bytesRead);
                        outputStream.flush();
                    }
                }
            } catch (VideoTooLargeException e) {
                throw e;
            } catch (Exception e) {
                log.error("Streaming error", e);
                throw new ExtractionFailedException("Failed to stream payload: " + e.getMessage());
            } finally {
                if (connection != null) {
                    connection.disconnect();
                }
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadFilename + "\"")
                .header("X-Accel-Buffering", "no")
                .body(stream);
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        String version = ytDlpUpdateService.getVersion();
        return ResponseEntity.ok(new HealthResponse("ok", version));
    }

    private void cleanupTemp(Path file, Path dir) {
        try {
            if (file != null) Files.deleteIfExists(file);
            if (dir != null) Files.deleteIfExists(dir);
        } catch (Exception ignored) {
        }
    }

    private String sanitizeFilename(String name, String defaultExt) {
        String sanitized = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (!sanitized.contains(".")) {
            sanitized += "." + defaultExt;
        }
        return sanitized;
    }
}
