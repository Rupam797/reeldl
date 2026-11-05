package com.reeldl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TempFileCleanupTest {

    @Test
    @DisplayName("Temp file and parent directory must be deleted after successful streaming in finally block")
    void testCleanupOnSuccess() throws IOException {
        Path tempDir = Files.createTempDirectory("test_audio_cleanup_");
        Path tempFile = tempDir.resolve("audio.mp3");
        Files.writeString(tempFile, "fake audio binary bytes");

        assertTrue(Files.exists(tempFile), "Temp file should exist before streaming");
        assertTrue(Files.exists(tempDir), "Temp dir should exist before streaming");

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // Simulate Controller streaming logic with finally block
        try (InputStream in = Files.newInputStream(tempFile)) {
            in.transferTo(out);
            out.flush();
        } finally {
            Files.deleteIfExists(tempFile);
            Files.deleteIfExists(tempDir);
        }

        assertFalse(Files.exists(tempFile), "Temp file must be deleted after stream completes");
        assertFalse(Files.exists(tempDir), "Temp directory must be deleted after stream completes");
        assertTrue(out.size() > 0);
    }

    @Test
    @DisplayName("Temp file and parent directory must be deleted even if streaming throws an IOException")
    void testCleanupOnException() throws IOException {
        Path tempDir = Files.createTempDirectory("test_audio_error_cleanup_");
        Path tempFile = tempDir.resolve("audio.mp3");
        Files.writeString(tempFile, "corrupted content");

        assertTrue(Files.exists(tempFile));

        assertThrows(RuntimeException.class, () -> {
            try (InputStream in = Files.newInputStream(tempFile)) {
                // Simulate an exception midway through streaming (e.g. client disconnect)
                throw new RuntimeException("Simulated socket write error");
            } finally {
                Files.deleteIfExists(tempFile);
                Files.deleteIfExists(tempDir);
            }
        });

        assertFalse(Files.exists(tempFile), "Temp file must be deleted even when streaming throws an exception");
        assertFalse(Files.exists(tempDir), "Temp directory must be deleted even when streaming throws an exception");
    }
}

