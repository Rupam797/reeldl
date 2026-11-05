package com.reeldl;

import com.reeldl.dto.Platform;
import com.reeldl.exception.InvalidUrlException;
import com.reeldl.validator.PlatformDetector;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PlatformDetectorTest {

    private PlatformDetector detector;

    @BeforeEach
    void setUp() {
        // By default no cookies file set
        detector = new PlatformDetector(null);
    }

    // ── Instagram Valid Tests ────────────────────────────────────────

    @ParameterizedTest
    @ValueSource(strings = {
            "https://www.instagram.com/reel/ABC123/",
            "https://instagram.com/reels/XYZ456/",
            "https://www.instagram.com/p/POST789/",
            "https://instagram.com/tv/CLIP101/"
    })
    @DisplayName("Valid Instagram URLs should be detected as INSTAGRAM")
    void validInstagram(String url) {
        PlatformDetector.DetectionResult result = detector.detectAndValidate(url);
        assertEquals(Platform.INSTAGRAM, result.platform());
        assertNotNull(result.normalizedUrl());
        assertTrue(result.normalizedUrl().startsWith("https://"));
    }

    @Test
    @DisplayName("Instagram Story without cookies file should throw friendly 400")
    void instagramStoryWithoutCookies() {
        InvalidUrlException ex = assertThrows(InvalidUrlException.class,
                () -> detector.detectAndValidate("https://www.instagram.com/stories/username/12345/"));
        assertTrue(ex.getMessage().contains("require authentication"));
    }

    // ── Facebook Valid Tests ─────────────────────────────────────────

    @ParameterizedTest
    @ValueSource(strings = {
            "https://www.facebook.com/watch?v=123456789",
            "https://facebook.com/reel/987654321/",
            "https://m.facebook.com/videos/11223344/",
            "https://www.facebook.com/share/v/abc123xyz/",
            "https://facebook.com/share/r/reel123/",
            "https://fb.watch/shortlink123/"
    })
    @DisplayName("Valid Facebook URLs should be detected as FACEBOOK")
    void validFacebook(String url) {
        PlatformDetector.DetectionResult result = detector.detectAndValidate(url);
        assertEquals(Platform.FACEBOOK, result.platform());
        assertNotNull(result.normalizedUrl());
    }

    // ── X / Twitter Valid Tests ──────────────────────────────────────

    @ParameterizedTest
    @ValueSource(strings = {
            "https://x.com/user/status/1234567890",
            "https://twitter.com/user/status/1234567890",
            "https://www.twitter.com/i/status/9876543210?s=20",
            "https://mobile.twitter.com/news/status/5566778899"
    })
    @DisplayName("Valid X / Twitter URLs should be detected as X")
    void validX(String url) {
        PlatformDetector.DetectionResult result = detector.detectAndValidate(url);
        assertEquals(Platform.X, result.platform());
        assertNotNull(result.normalizedUrl());
    }

    // ── Malicious / SSRF / Injection Tests ────────────────────────────

    @ParameterizedTest
    @ValueSource(strings = {
            "https://instagram.com.evil.com/reel/123/",
            "https://facebook.com.attacker.com/watch",
            "https://twitter.com.phishing.io/status/1",
            "https://x.com.badsite.com/status/123"
    })
    @DisplayName("Lookalike subdomain SSRF attempts must be rejected")
    void lookalikeSubdomainRejected(String url) {
        assertThrows(InvalidUrlException.class, () -> detector.detectAndValidate(url));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://www.instagram.com/reel/123/",
            "http://facebook.com/reel/123/",
            "http://x.com/user/status/1"
    })
    @DisplayName("Non-HTTPS URLs must be rejected with 400")
    void nonHttpsRejected(String url) {
        assertThrows(InvalidUrlException.class, () -> detector.detectAndValidate(url));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://admin:secret@instagram.com/reel/123/",
            "https://user:pass@facebook.com/watch",
            "https://token:key@x.com/status/1"
    })
    @DisplayName("URLs with credentials must be rejected")
    void credentialsRejected(String url) {
        assertThrows(InvalidUrlException.class, () -> detector.detectAndValidate(url));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://instagram.com/reel/123;rm -rf /",
            "https://facebook.com/reel/123|cat /etc/passwd",
            "https://x.com/status/1`whoami`",
            "https://x.com/status/1$(reboot)"
    })
    @DisplayName("Command injection characters must be rejected")
    void commandInjectionRejected(String url) {
        assertThrows(InvalidUrlException.class, () -> detector.detectAndValidate(url));
    }

    @Test
    @DisplayName("Empty or null URL must be rejected")
    void nullOrEmptyRejected() {
        assertThrows(InvalidUrlException.class, () -> detector.detectAndValidate(null));
        assertThrows(InvalidUrlException.class, () -> detector.detectAndValidate("   "));
    }
}

