package com.reeldl.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reeldl.dto.FormatInfo;
import com.reeldl.dto.MediaInfo;
import com.reeldl.dto.MediaType;
import com.reeldl.dto.Platform;
import com.reeldl.exception.ContentUnavailableException;
import com.reeldl.exception.ExtractionFailedException;
import com.reeldl.exception.ExtractionTimeoutException;
import com.reeldl.validator.PlatformDetector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class YtDlpExtractorService implements ExtractorService {

    private static final Logger log = LoggerFactory.getLogger(YtDlpExtractorService.class);

    private final String ytdlpPath;
    private final String galleryDlPath;
    private final String cookiesFile;
    private final int timeoutSeconds;
    private final PlatformDetector platformDetector;
    private final ObjectMapper objectMapper;
    private final ProcessLimiterService processLimiterService;

    @Autowired
    public YtDlpExtractorService(
            @Value("${app.ytdlp-path:/usr/local/bin/yt-dlp}") String ytdlpPath,
            @Value("${app.gallerydl-path:gallery-dl}") String galleryDlPath,
            @Value("${app.ytdlp-cookies-file:#{null}}") String cookiesFile,
            @Value("${app.extraction-timeout-seconds:20}") int timeoutSeconds,
            PlatformDetector platformDetector,
            ObjectMapper objectMapper,
            ProcessLimiterService processLimiterService) {
        this.ytdlpPath = ytdlpPath;
        this.galleryDlPath = galleryDlPath;
        this.cookiesFile = cookiesFile;
        this.timeoutSeconds = timeoutSeconds;
        this.platformDetector = platformDetector;
        this.objectMapper = objectMapper;
        this.processLimiterService = processLimiterService;
    }

    public YtDlpExtractorService(
            String ytdlpPath,
            String galleryDlPath,
            String cookiesFile,
            int timeoutSeconds,
            PlatformDetector platformDetector,
            ObjectMapper objectMapper) {
        this(ytdlpPath, galleryDlPath, cookiesFile, timeoutSeconds, platformDetector, objectMapper, new ProcessLimiterService());
    }

    @Override
    public MediaInfo extract(String rawUrl, MediaType type) {
        PlatformDetector.DetectionResult detection = platformDetector.detectAndValidate(rawUrl);
        String normalizedUrl = detection.normalizedUrl();
        Platform platform = detection.platform();

        if (type == MediaType.PHOTO) {
            return extractPhoto(normalizedUrl, platform);
        } else {
            return extractWithYtDlp(normalizedUrl, platform, type);
        }
    }

    private MediaInfo extractPhoto(String url, Platform platform) {
        // Try gallery-dl first for direct photo URLs
        try {
            List<String> command = List.of(galleryDlPath, "-g", url);
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);

            Process process = pb.start();

            CompletableFuture<List<String>> stdoutFuture = CompletableFuture.supplyAsync(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    return reader.lines()
                            .map(String::trim)
                            .filter(line -> line.startsWith("http://") || line.startsWith("https://"))
                            .collect(Collectors.toList());
                } catch (IOException e) {
                    return List.of();
                }
            });

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("gallery-dl timed out, falling back to yt-dlp metadata");
                return extractWithYtDlp(url, platform, MediaType.PHOTO);
            }

            List<String> imageUrls = stdoutFuture.join();
            if (process.exitValue() == 0 && !imageUrls.isEmpty()) {
                String firstImage = imageUrls.get(0);
                List<FormatInfo> formats = List.of(new FormatInfo("Original HD", "jpg", null));
                return new MediaInfo(
                        "Instagram Photo Post",
                        firstImage,
                        "0:00",
                        firstImage,
                        "Instagram Creator",
                        url,
                        platform,
                        MediaType.PHOTO,
                        formats
                );
            }
        } catch (Exception e) {
            log.warn("gallery-dl failed, falling back to yt-dlp: {}", e.getMessage());
        }

        // Fallback to yt-dlp
        return extractWithYtDlp(url, platform, MediaType.PHOTO);
    }

    private MediaInfo extractWithYtDlp(String url, Platform platform, MediaType type) {
        try {
            return processLimiterService.runWithYtDlpPermit(() -> executeYtDlp(url, platform, type));
        } catch (ContentUnavailableException | ExtractionTimeoutException | ExtractionFailedException e) {
            throw e;
        } catch (com.reeldl.exception.ServerBusyException e) {
            throw e;
        } catch (Exception e) {
            log.error("yt-dlp extraction failed for url: {}", url, e);
            throw new ExtractionFailedException("Extraction failed: " + e.getMessage());
        }
    }

    private MediaInfo executeYtDlp(String url, Platform platform, MediaType type) {
        List<String> command = new ArrayList<>();
        command.add(ytdlpPath);
        command.add("--quiet");
        command.add("--no-playlist");
        command.add("--no-warnings");
        command.add("-j");

        if (cookiesFile != null && !cookiesFile.isBlank() && Files.exists(Path.of(cookiesFile))) {
            command.add("--cookies");
            command.add(cookiesFile);
        }

        command.add(url);

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(false);

        Process process;
        try {
            process = pb.start();
        } catch (IOException e) {
            log.error("Failed to start yt-dlp process", e);
            throw new ExtractionFailedException("Failed to start extraction engine.");
        }

        CompletableFuture<String> stdoutFuture = CompletableFuture.supplyAsync(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                return reader.lines().collect(Collectors.joining("\n"));
            } catch (IOException e) {
                return "";
            }
        });

        CompletableFuture<String> stderrFuture = CompletableFuture.supplyAsync(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
                return reader.lines().collect(Collectors.joining("\n"));
            } catch (IOException e) {
                return "";
            }
        });

        boolean finished;
        try {
            finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            throw new ExtractionFailedException("Extraction was interrupted.");
        }

        if (!finished) {
            process.destroyForcibly();
            log.warn("yt-dlp process timed out after {} seconds", timeoutSeconds);
            throw new ExtractionTimeoutException("Extraction timed out after " + timeoutSeconds + " seconds.");
        }

        int exitCode = process.exitValue();
        String stdout = stdoutFuture.join();
        String stderr = stderrFuture.join();

        if (exitCode != 0) {
            log.warn("yt-dlp exited with code {}. stderr: {}", exitCode, stderr);
            classifyStderr(stderr);
            throw new ExtractionFailedException("Extraction engine failed with exit code " + exitCode + ".");
        }

        // Find the JSON payload from stdout
        String jsonPayload = "";
        for (String line : stdout.lines().toList()) {
            String trimmed = line.trim();
            if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                jsonPayload = trimmed;
                break;
            }
        }
        if (jsonPayload.isEmpty()) {
            int firstBrace = stdout.indexOf('{');
            int lastBrace = stdout.lastIndexOf('}');
            if (firstBrace != -1 && lastBrace > firstBrace) {
                jsonPayload = stdout.substring(firstBrace, lastBrace + 1);
            }
        }
        if (jsonPayload.isEmpty()) {
            log.error("yt-dlp produced no JSON. exitCode={}, stdout={}, stderr={}", exitCode, stdout, stderr);
            throw new ExtractionFailedException("No JSON from yt-dlp. stdout len=" + stdout.length() + " [sample=" + (stdout.length() > 100 ? stdout.substring(0, 100) : stdout) + "] stderr=" + (stderr.length() > 200 ? stderr.substring(0, 200) : stderr));
        }

        return parseJson(jsonPayload, url, platform, type);
    }

    private void classifyStderr(String stderr) {
        String lower = stderr.toLowerCase();
        if (lower.contains("private") || lower.contains("login required")) {
            throw new ContentUnavailableException("This media is private or requires login. Only public content can be downloaded.");
        }
        if (lower.contains("not available") || lower.contains("does not exist") || lower.contains("404")) {
            throw new ContentUnavailableException("This media is no longer available or was removed.");
        }
    }

    private MediaInfo parseJson(String json, String sourceUrl, Platform platform, MediaType type) {
        try {
            JsonNode root = objectMapper.readTree(json);

            String title = root.path("title").asText(platform.name() + " Media");
            String thumbnail = root.path("thumbnail").asText("");
            String videoUrl = root.path("url").asText("");
            String uploader = root.path("uploader").asText(root.path("channel").asText(""));
            double durationSec = root.path("duration").asDouble(0.0);

            String durationStr = root.path("duration_string").asText("");
            if (durationStr.isBlank() && durationSec > 0) {
                int mins = (int) (durationSec / 60);
                int secs = (int) (durationSec % 60);
                durationStr = String.format("%d:%02d", mins, secs);
            } else if (durationStr.isBlank()) {
                durationStr = "0:00";
            }

            List<FormatInfo> formats = new ArrayList<>();
            JsonNode formatsNode = root.path("formats");
            if (formatsNode.isArray()) {
                for (JsonNode f : formatsNode) {
                    String quality = f.path("format_note").asText("");
                    if (quality.isBlank() || "null".equalsIgnoreCase(quality)) {
                        quality = f.path("resolution").asText("");
                    }
                    if (quality.isBlank() || "null".equalsIgnoreCase(quality)) {
                        int h = f.path("height").asInt(0);
                        quality = h > 0 ? h + "p" : f.path("format_id").asText("Default");
                    }
                    if ("null".equalsIgnoreCase(quality)) {
                        quality = "Default";
                    }
                    String ext = f.path("ext").asText("mp4");
                    Long fileSize = f.hasNonNull("filesize") ? f.path("filesize").asLong()
                            : (f.hasNonNull("filesize_approx") ? f.path("filesize_approx").asLong() : null);

                    formats.add(new FormatInfo(quality, ext, fileSize));

                    String vcodec = f.path("vcodec").asText("");
                    if (videoUrl.isBlank() && f.hasNonNull("url") && !"none".equalsIgnoreCase(vcodec)) {
                        videoUrl = f.path("url").asText("");
                    }
                }
            }

            if (videoUrl.isBlank() && root.hasNonNull("url")) {
                videoUrl = root.path("url").asText("");
            }
            if (videoUrl.isBlank() && formatsNode.isArray()) {
                for (JsonNode f : formatsNode) {
                    if (f.hasNonNull("url") && !f.path("url").asText("").isBlank()) {
                        videoUrl = f.path("url").asText("");
                        break;
                    }
                }
            }

            if (formats.isEmpty()) {
                formats.add(new FormatInfo("HD 1080p", type == MediaType.AUDIO ? "mp3" : (type == MediaType.PHOTO ? "jpg" : "mp4"), null));
            }

            return new MediaInfo(
                    title,
                    thumbnail,
                    durationStr,
                    videoUrl,
                    uploader,
                    sourceUrl,
                    platform,
                    type,
                    formats
            );
        } catch (Exception e) {
            log.error("Failed to parse yt-dlp JSON output. Error: {}. Input sample: {}", 
                    e.getMessage(), json.substring(0, Math.min(json.length(), 200)), e);
            throw new ExtractionFailedException("Failed to parse media metadata: " + e.getClass().getSimpleName() + ": " + e.getMessage() + " | json length: " + json.length() + " | sample: " + (json.length() > 80 ? json.substring(0, 80) : json));
        }
    }
}
