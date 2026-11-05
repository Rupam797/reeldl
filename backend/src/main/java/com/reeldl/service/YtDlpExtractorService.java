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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

    public YtDlpExtractorService(
            @Value("${app.ytdlp-path:/usr/local/bin/yt-dlp}") String ytdlpPath,
            @Value("${app.gallerydl-path:gallery-dl}") String galleryDlPath,
            @Value("${app.ytdlp-cookies-file:#{null}}") String cookiesFile,
            @Value("${app.extraction-timeout-seconds:20}") int timeoutSeconds,
            PlatformDetector platformDetector,
            ObjectMapper objectMapper) {
        this.ytdlpPath = ytdlpPath;
        this.galleryDlPath = galleryDlPath;
        this.cookiesFile = cookiesFile;
        this.timeoutSeconds = timeoutSeconds;
        this.platformDetector = platformDetector;
        this.objectMapper = objectMapper;
    }

    @Override
    public MediaInfo extract(String url, MediaType type) {
        MediaType targetType = (type != null) ? type : MediaType.VIDEO;
        PlatformDetector.DetectionResult detection = platformDetector.detectAndValidate(url);
        String normalizedUrl = detection.normalizedUrl();
        Platform platform = detection.platform();

        log.debug("Extracting {} for {} on platform {}", targetType, normalizedUrl, platform);

        if (targetType == MediaType.PHOTO && platform == Platform.INSTAGRAM) {
            return extractPhotoWithGalleryDl(normalizedUrl, platform);
        }

        return extractWithYtDlp(normalizedUrl, platform, targetType);
    }

    private MediaInfo extractPhotoWithGalleryDl(String url, Platform platform) {
        List<String> args = List.of(galleryDlPath, "-g", url);
        ProcessBuilder pb = new ProcessBuilder(args);
        pb.redirectErrorStream(false);

        try {
            Process process = pb.start();
            CompletableFuture<List<String>> stdoutFuture = CompletableFuture.supplyAsync(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    return reader.lines().filter(line -> !line.isBlank()).collect(Collectors.toList());
                } catch (IOException e) {
                    return Collections.emptyList();
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
        List<String> command = new ArrayList<>();
        command.add(ytdlpPath);
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
            throw new ExtractionTimeoutException("Extraction was interrupted.");
        }

        if (!finished) {
            process.destroyForcibly();
            throw new ExtractionTimeoutException("Extraction timed out after " + timeoutSeconds + " seconds.");
        }

        String stdout = stdoutFuture.join();
        String stderr = stderrFuture.join();

        if (!stderr.isBlank()) {
            String stderrLower = stderr.toLowerCase();
            if (stderrLower.contains("private") || stderrLower.contains("login required") || stderrLower.contains("login_required")) {
                throw new ContentUnavailableException("This content is private or requires authentication.");
            }
            if (stderrLower.contains("not available") || stderrLower.contains("does not exist") || stderrLower.contains("not found")) {
                throw new ContentUnavailableException("Content is unavailable or has been removed.");
            }
        }

        if (process.exitValue() != 0) {
            throw new ExtractionFailedException("Extraction failed. The post may be restricted or link invalid.");
        }

        if (stdout.isBlank()) {
            throw new ExtractionFailedException("Empty output returned from extractor.");
        }

        try {
            JsonNode root = objectMapper.readTree(stdout);
            String title = getTextOrDefault(root, "title", platform.name() + " Media");
            String thumbnail = getTextOrDefault(root, "thumbnail", "");
            String uploader = getTextOrDefault(root, "uploader", getTextOrDefault(root, "channel", "unknown"));
            String sourceUrl = getTextOrDefault(root, "webpage_url", url);

            String duration = "Unknown";
            if (root.has("duration_string") && !root.get("duration_string").isNull()) {
                duration = root.get("duration_string").asText();
            } else if (root.has("duration") && !root.get("duration").isNull()) {
                int secs = root.get("duration").asInt();
                duration = String.format("%d:%02d", secs / 60, secs % 60);
            }

            // Direct URL
            String videoUrl = getTextOrDefault(root, "url", "");
            List<FormatInfo> formatList = new ArrayList<>();
            Set<String> seenQualities = new HashSet<>();

            if (root.has("formats") && root.get("formats").isArray()) {
                JsonNode formatsNode = root.get("formats");
                for (int i = formatsNode.size() - 1; i >= 0; i--) {
                    JsonNode fmt = formatsNode.get(i);
                    String fmtUrl = getTextOrDefault(fmt, "url", "");
                    String vcodec = getTextOrDefault(fmt, "vcodec", "");
                    String ext = getTextOrDefault(fmt, "ext", "mp4");
                    Long filesize = fmt.has("filesize") && !fmt.get("filesize").isNull() ? fmt.get("filesize").asLong() : null;

                    String quality = "HD";
                    if (fmt.has("format_note") && !fmt.get("format_note").isNull()) {
                        quality = fmt.get("format_note").asText();
                    } else if (fmt.has("resolution") && !fmt.get("resolution").isNull()) {
                        quality = fmt.get("resolution").asText();
                    } else if (fmt.has("height") && !fmt.get("height").isNull()) {
                        quality = fmt.get("height").asInt() + "p";
                    }

                    if (!vcodec.equals("none") && !seenQualities.contains(quality)) {
                        seenQualities.add(quality);
                        formatList.add(new FormatInfo(quality, ext, filesize));
                        if (videoUrl.isEmpty() && !fmtUrl.isEmpty()) {
                            videoUrl = fmtUrl;
                        }
                    }
                }
            }

            if (videoUrl.isEmpty()) {
                videoUrl = thumbnail; // Fallback for photos
            }

            if (formatList.isEmpty()) {
                formatList.add(new FormatInfo(type == MediaType.AUDIO ? "MP3 320kbps" : "Original Quality", type == MediaType.AUDIO ? "mp3" : "mp4", null));
            }

            return new MediaInfo(
                    title,
                    thumbnail,
                    duration,
                    videoUrl,
                    uploader,
                    sourceUrl,
                    platform,
                    type,
                    formatList
            );
        } catch (Exception e) {
            log.error("Failed to parse extractor JSON: {}", e.getMessage());
            throw new ExtractionFailedException("Failed to parse extracted media information.");
        }
    }

    private String getTextOrDefault(JsonNode node, String field, String defaultValue) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return defaultValue;
    }
}
