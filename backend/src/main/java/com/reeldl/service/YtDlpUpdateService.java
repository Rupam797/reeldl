package com.reeldl.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class YtDlpUpdateService {

    private static final Logger log = LoggerFactory.getLogger(YtDlpUpdateService.class);

    private final String ytdlpPath;
    private final String galleryDlPath;

    public YtDlpUpdateService(
            @Value("${app.ytdlp-path:/usr/local/bin/yt-dlp}") String ytdlpPath,
            @Value("${app.gallerydl-path:gallery-dl}") String galleryDlPath) {
        this.ytdlpPath = ytdlpPath;
        this.galleryDlPath = galleryDlPath;
    }

    /**
     * Runs updates for yt-dlp and gallery-dl every day at 3:00 AM.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void updateTools() {
        updateYtDlp();
        updateGalleryDl();
    }

    public void updateYtDlp() {
        log.info("Starting scheduled yt-dlp update...");
        try {
            ProcessBuilder pb = new ProcessBuilder(ytdlpPath, "-U");
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                output = reader.lines().collect(Collectors.joining("\n"));
            }

            boolean finished = process.waitFor(120, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("yt-dlp update timed out after 120 seconds.");
                return;
            }

            log.info("yt-dlp update result (exit code {}): {}", process.exitValue(), output);
            log.info("Current yt-dlp version after update: {}", getVersion());
        } catch (Exception e) {
            log.error("Failed to update yt-dlp", e);
        }
    }

    public void updateGalleryDl() {
        log.info("Starting scheduled gallery-dl update...");
        try {
            // Try gallery-dl --update, or pip install --upgrade gallery-dl
            ProcessBuilder pb = new ProcessBuilder(galleryDlPath, "--update");
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                output = reader.lines().collect(Collectors.joining("\n"));
            }

            boolean finished = process.waitFor(120, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("gallery-dl update timed out after 120 seconds.");
                return;
            }

            log.info("gallery-dl update result (exit code {}): {}", process.exitValue(), output);
        } catch (Exception e) {
            log.warn("gallery-dl self-update failed, falling back to pip: {}", e.getMessage());
            try {
                ProcessBuilder pb = new ProcessBuilder("pip3", "install", "--upgrade", "gallery-dl");
                pb.redirectErrorStream(true);
                Process process = pb.start();
                process.waitFor(60, TimeUnit.SECONDS);
            } catch (Exception ex) {
                log.error("Failed to update gallery-dl via pip", ex);
            }
        }
    }

    /**
     * Returns the current yt-dlp version string.
     */
    public String getVersion() {
        try {
            ProcessBuilder pb = new ProcessBuilder(ytdlpPath, "--version");
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                output = reader.lines().collect(Collectors.joining()).strip();
            }

            boolean finished = process.waitFor(10, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return "unknown (timeout)";
            }

            return output.isBlank() ? "unknown" : output;
        } catch (Exception e) {
            log.warn("Failed to get yt-dlp version: {}", e.getMessage());
            return "unavailable";
        }
    }
}
