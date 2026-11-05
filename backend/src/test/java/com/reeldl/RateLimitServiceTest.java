package com.reeldl;

import com.reeldl.exception.RateLimitExceededException;
import com.reeldl.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RateLimitServiceTest {

    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        // 3 extract/min, 2 download/min, 2 audio/min — low limits for testing
        rateLimitService = new RateLimitService(3, 2, 2);
    }

    @Test
    @DisplayName("Requests within extract limit should succeed")
    void withinExtractLimit() {
        HttpServletRequest request = mockRequest("10.0.0.1");

        assertDoesNotThrow(() -> rateLimitService.checkRateLimit(request, "extract"));
        assertDoesNotThrow(() -> rateLimitService.checkRateLimit(request, "extract"));
        assertDoesNotThrow(() -> rateLimitService.checkRateLimit(request, "extract"));
    }

    @Test
    @DisplayName("Requests exceeding extract limit should throw")
    void exceedExtractLimit() {
        HttpServletRequest request = mockRequest("10.0.0.2");

        // Use up the 3-request budget
        rateLimitService.checkRateLimit(request, "extract");
        rateLimitService.checkRateLimit(request, "extract");
        rateLimitService.checkRateLimit(request, "extract");

        // 4th should fail
        assertThrows(RateLimitExceededException.class,
                () -> rateLimitService.checkRateLimit(request, "extract"));
    }

    @Test
    @DisplayName("Requests within download limit should succeed")
    void withinDownloadLimit() {
        HttpServletRequest request = mockRequest("10.0.0.3");

        assertDoesNotThrow(() -> rateLimitService.checkRateLimit(request, "download"));
        assertDoesNotThrow(() -> rateLimitService.checkRateLimit(request, "download"));
    }

    @Test
    @DisplayName("Requests exceeding download limit should throw")
    void exceedDownloadLimit() {
        HttpServletRequest request = mockRequest("10.0.0.4");

        rateLimitService.checkRateLimit(request, "download");
        rateLimitService.checkRateLimit(request, "download");

        assertThrows(RateLimitExceededException.class,
                () -> rateLimitService.checkRateLimit(request, "download"));
    }

    @Test
    @DisplayName("Different endpoints should have independent limits")
    void independentLimits() {
        HttpServletRequest request = mockRequest("10.0.0.5");

        // Use up extract budget
        rateLimitService.checkRateLimit(request, "extract");
        rateLimitService.checkRateLimit(request, "extract");
        rateLimitService.checkRateLimit(request, "extract");

        // Download budget for the same IP should still be available
        assertDoesNotThrow(() -> rateLimitService.checkRateLimit(request, "download"));
    }

    @Test
    @DisplayName("Different IPs should have independent limits")
    void differentIps() {
        HttpServletRequest request1 = mockRequest("10.0.0.6");
        HttpServletRequest request2 = mockRequest("10.0.0.7");

        // Exhaust budget for IP 1
        rateLimitService.checkRateLimit(request1, "extract");
        rateLimitService.checkRateLimit(request1, "extract");
        rateLimitService.checkRateLimit(request1, "extract");
        assertThrows(RateLimitExceededException.class,
                () -> rateLimitService.checkRateLimit(request1, "extract"));

        // IP 2 should still work
        assertDoesNotThrow(() -> rateLimitService.checkRateLimit(request2, "extract"));
    }

    @Test
    @DisplayName("Audio download rate limit should be enforced")
    void audioRateLimit() {
        HttpServletRequest request = mockRequest("10.0.0.10");

        assertDoesNotThrow(() -> rateLimitService.checkRateLimit(request, "download_audio"));
        assertDoesNotThrow(() -> rateLimitService.checkRateLimit(request, "download_audio"));

        // 3rd request exceeds the 2/min limit
        assertThrows(RateLimitExceededException.class,
                () -> rateLimitService.checkRateLimit(request, "download_audio"));
    }

    @Test
    @DisplayName("CF-Connecting-IP header should be preferred over remoteAddr")
    void cloudflareIpHeader() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("CF-Connecting-IP")).thenReturn("203.0.113.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn("10.0.0.100");
        when(request.getRemoteAddr()).thenReturn("172.16.0.1");

        String resolved = rateLimitService.resolveClientIp(request);
        assert "203.0.113.1".equals(resolved);
    }

    @Test
    @DisplayName("X-Forwarded-For first IP should be used when CF header is absent")
    void xForwardedForHeader() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("CF-Connecting-IP")).thenReturn(null);
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.2, 10.0.0.1");
        when(request.getRemoteAddr()).thenReturn("172.16.0.1");

        String resolved = rateLimitService.resolveClientIp(request);
        assert "203.0.113.2".equals(resolved);
    }

    private HttpServletRequest mockRequest(String remoteAddr) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("CF-Connecting-IP")).thenReturn(null);
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn(remoteAddr);
        return request;
    }
}

