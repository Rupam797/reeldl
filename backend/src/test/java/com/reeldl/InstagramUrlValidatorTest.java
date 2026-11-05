package com.reeldl;

import com.reeldl.exception.InvalidUrlException;
import com.reeldl.validator.InstagramUrlValidator;
import com.reeldl.validator.PlatformDetector;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class InstagramUrlValidatorTest {

    private InstagramUrlValidator validator;

    @BeforeEach
    void setUp() {
        validator = new InstagramUrlValidator(new PlatformDetector(null));
    }

    // ── Valid URLs ──────────────────────────────────────────────────

    @ParameterizedTest
    @ValueSource(strings = {
            "https://www.instagram.com/reel/ABC123/",
            "https://instagram.com/reel/ABC123/",
            "https://www.instagram.com/reels/XYZ789/",
            "https://instagram.com/reels/XYZ789/",
            "https://www.instagram.com/p/POST456/",
            "https://instagram.com/p/POST456/",
            "https://www.instagram.com/reel/ABC123",
            "https://www.instagram.com/reel/C1x2y3Z4a5/?igsh=something",
    })
    @DisplayName("Valid Instagram URLs should pass validation")
    void validUrls(String url) {
        assertDoesNotThrow(() -> validator.validateAndNormalize(url));
    }

    @Test
    @DisplayName("Normalized URL should strip query params and ensure trailing slash")
    void normalization() {
        String result = validator.validateAndNormalize("https://www.instagram.com/reel/ABC123?igsh=abc");
        assertEquals("https://www.instagram.com/reel/ABC123/", result);
    }

    @Test
    @DisplayName("Host should be lowercased during normalization")
    void hostLowercase() {
        String result = validator.validateAndNormalize("https://WWW.INSTAGRAM.COM/reel/ABC123/");
        assertEquals("https://www.instagram.com/reel/ABC123/", result);
    }

    // ── Invalid URLs ─────────────────────────────────────────────────

    @Test
    @DisplayName("Null URL should throw")
    void nullUrl() {
        assertThrows(InvalidUrlException.class, () -> validator.validateAndNormalize(null));
    }

    @Test
    @DisplayName("Empty URL should throw")
    void emptyUrl() {
        assertThrows(InvalidUrlException.class, () -> validator.validateAndNormalize(""));
    }

    @Test
    @DisplayName("Blank URL should throw")
    void blankUrl() {
        assertThrows(InvalidUrlException.class, () -> validator.validateAndNormalize("   "));
    }

    @Test
    @DisplayName("HTTP (not HTTPS) should throw")
    void httpUrl() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("http://www.instagram.com/reel/ABC123/"));
    }

    @Test
    @DisplayName("SSRF attempt: instagram.com.evil.com should throw")
    void ssrfSubdomain() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("https://instagram.com.evil.com/reel/ABC123/"));
    }

    @Test
    @DisplayName("SSRF attempt: evil-instagram.com should throw")
    void ssrfSimilarDomain() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("https://evil-instagram.com/reel/ABC123/"));
    }

    @Test
    @DisplayName("File protocol should throw")
    void fileProtocol() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("file:///etc/passwd"));
    }

    @Test
    @DisplayName("JavaScript protocol should throw")
    void javascriptProtocol() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("javascript:alert(1)"));
    }

    @Test
    @DisplayName("Non-Instagram host should throw")
    void nonInstagramHost() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("https://facebook.com/reel/ABC123/"));
    }

    @Test
    @DisplayName("Instagram stories path should throw")
    void storiesPath() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("https://www.instagram.com/stories/user/12345/"));
    }

    @Test
    @DisplayName("Instagram profile path should throw")
    void profilePath() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("https://www.instagram.com/username/"));
    }

    @Test
    @DisplayName("Command injection via semicolon should throw")
    void commandInjectionSemicolon() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("https://instagram.com/reel/x;rm -rf /"));
    }

    @Test
    @DisplayName("Command injection via pipe should throw")
    void commandInjectionPipe() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("https://instagram.com/reel/x|cat /etc/passwd"));
    }

    @Test
    @DisplayName("Command injection via backtick should throw")
    void commandInjectionBacktick() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("https://instagram.com/reel/x`whoami`"));
    }

    @Test
    @DisplayName("URL with userinfo should throw")
    void userInfoUrl() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("https://admin:pass@instagram.com/reel/ABC123/"));
    }

    @Test
    @DisplayName("FTP scheme should throw")
    void ftpScheme() {
        assertThrows(InvalidUrlException.class,
                () -> validator.validateAndNormalize("ftp://instagram.com/reel/ABC123/"));
    }
}

