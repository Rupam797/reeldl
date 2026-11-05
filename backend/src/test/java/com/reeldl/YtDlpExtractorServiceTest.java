package com.reeldl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reeldl.dto.MediaInfo;
import com.reeldl.dto.MediaType;
import com.reeldl.dto.Platform;
import com.reeldl.exception.ContentUnavailableException;
import com.reeldl.exception.ExtractionFailedException;
import com.reeldl.exception.ExtractionTimeoutException;
import com.reeldl.service.YtDlpExtractorService;
import com.reeldl.validator.PlatformDetector;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermission;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class YtDlpExtractorServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private PlatformDetector platformDetector;

    @BeforeEach
    void setUp() {
        platformDetector = new PlatformDetector(null);
    }

    @Test
    @DisplayName("Successful extraction should parse JSON correctly for Video")
    void successfulExtraction(@TempDir Path tempDir) throws IOException {
        String jsonOutput = """
                {
                  "title": "Funny Cat",
                  "thumbnail": "https://example.com/thumb.jpg",
                  "duration": 30,
                  "duration_string": "0:30",
                  "url": "https://cdn.example.com/video.mp4",
                  "uploader": "catpage",
                  "webpage_url": "https://www.instagram.com/reel/ABC123/",
                  "formats": [
                    {"format_id": "1", "vcodec": "avc1", "ext": "mp4", "resolution": "1080p", "filesize": 1048576, "url": "https://cdn.example.com/video.mp4"}
                  ]
                }
                """;

        Path script = createMockProcess(tempDir, jsonOutput, "", 0);

        YtDlpExtractorService service = new YtDlpExtractorService(
                script.toString(), "gallery-dl", null, 10, platformDetector, objectMapper);

        MediaInfo result = service.extract("https://www.instagram.com/reel/ABC123/", MediaType.VIDEO);

        assertNotNull(result);
        assertEquals("Funny Cat", result.title());
        assertEquals("https://example.com/thumb.jpg", result.thumbnail());
        assertEquals("0:30", result.duration());
        assertEquals("https://cdn.example.com/video.mp4", result.videoUrl());
        assertEquals("catpage", result.uploader());
        assertEquals("https://www.instagram.com/reel/ABC123/", result.sourceUrl());
        assertEquals(Platform.INSTAGRAM, result.platform());
        assertEquals(MediaType.VIDEO, result.type());
        assertEquals(1, result.formats().size());
        assertEquals("1080p", result.formats().get(0).quality());
    }

    @Test
    @DisplayName("Private content stderr should throw ContentUnavailableException")
    void privateContent(@TempDir Path tempDir) throws IOException {
        Path script = createMockProcess(tempDir, "", "ERROR: login required to access this content", 1);

        YtDlpExtractorService service = new YtDlpExtractorService(
                script.toString(), "gallery-dl", null, 10, platformDetector, objectMapper);

        assertThrows(ContentUnavailableException.class,
                () -> service.extract("https://www.instagram.com/reel/PRIVATE/", MediaType.VIDEO));
    }

    @Test
    @DisplayName("Non-zero exit code without known error should throw ExtractionFailedException")
    void nonZeroExit(@TempDir Path tempDir) throws IOException {
        Path script = createMockProcess(tempDir, "", "some unknown error", 1);

        YtDlpExtractorService service = new YtDlpExtractorService(
                script.toString(), "gallery-dl", null, 10, platformDetector, objectMapper);

        assertThrows(ExtractionFailedException.class,
                () -> service.extract("https://www.instagram.com/reel/ABC123/", MediaType.VIDEO));
    }

    @Test
    @DisplayName("Timeout should throw ExtractionTimeoutException")
    void timeout(@TempDir Path tempDir) throws IOException {
        Path script = createSlowProcess(tempDir, 30);

        YtDlpExtractorService service = new YtDlpExtractorService(
                script.toString(), "gallery-dl", null, 1, platformDetector, objectMapper);

        assertThrows(ExtractionTimeoutException.class,
                () -> service.extract("https://www.instagram.com/reel/ABC123/", MediaType.VIDEO));
    }

    // ── Helper Mock Process Runners ──────────────────────────────────

    private Path createMockProcess(Path dir, String stdout, String stderr, int exitCode) throws IOException {
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

        Path jsonFile = dir.resolve("output.json");
        Files.writeString(jsonFile, stdout);

        Path script;
        if (isWindows) {
            script = dir.resolve("mock_runner.bat");
            StringBuilder sb = new StringBuilder();
            sb.append("@echo off\r\n");
            if (!stdout.isBlank()) {
                sb.append("type \"").append(jsonFile.toAbsolutePath()).append("\"\r\n");
            }
            if (!stderr.isBlank()) {
                sb.append("echo ").append(stderr).append(" 1>&2\r\n");
            }
            sb.append("exit /b ").append(exitCode).append("\r\n");
            Files.writeString(script, sb.toString());
        } else {
            script = dir.resolve("mock_runner.sh");
            StringBuilder sb = new StringBuilder();
            sb.append("#!/bin/sh\n");
            if (!stdout.isBlank()) {
                sb.append("cat \"").append(jsonFile.toAbsolutePath()).append("\"\n");
            }
            if (!stderr.isBlank()) {
                sb.append("echo '").append(stderr).append("' >&2\n");
            }
            sb.append("exit ").append(exitCode).append("\n");
            Files.writeString(script, sb.toString());
            Files.setPosixFilePermissions(script, Set.of(
                    PosixFilePermission.OWNER_READ,
                    PosixFilePermission.OWNER_WRITE,
                    PosixFilePermission.OWNER_EXECUTE));
        }

        return script;
    }

    private Path createSlowProcess(Path dir, int sleepSeconds) throws IOException {
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
        Path script;
        if (isWindows) {
            script = dir.resolve("slow_runner.bat");
            Files.writeString(script, "@echo off\r\nping -n " + (sleepSeconds + 1) + " 127.0.0.1 >nul\r\nexit /b 0\r\n");
        } else {
            script = dir.resolve("slow_runner.sh");
            Files.writeString(script, "#!/bin/sh\nsleep " + sleepSeconds + "\nexit 0\n");
            Files.setPosixFilePermissions(script, Set.of(
                    PosixFilePermission.OWNER_READ,
                    PosixFilePermission.OWNER_WRITE,
                    PosixFilePermission.OWNER_EXECUTE));
        }
        return script;
    }
}
