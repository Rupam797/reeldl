package com.reeldl.service;

import com.reeldl.exception.RateLimitExceededException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);

    private final int extractLimit;
    private final int downloadLimit;
    private final int audioLimit;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitService(
            @Value("${app.rate-limit.extract-requests-per-minute:10}") int extractLimit,
            @Value("${app.rate-limit.download-requests-per-minute:5}") int downloadLimit,
            @Value("${app.rate-limit.audio-requests-per-minute:3}") int audioLimit) {
        this.extractLimit = extractLimit;
        this.downloadLimit = downloadLimit;
        this.audioLimit = audioLimit;
    }

    /**
     * Checks whether the client is within the rate limit for the given endpoint.
     *
     * @param request  the HTTP request (used to extract the client IP)
     * @param endpoint "extract", "download", or "download_audio"
     * @throws RateLimitExceededException if the limit has been exceeded
     */
    public void checkRateLimit(HttpServletRequest request, String endpoint) {
        String clientIp = resolveClientIp(request);
        String bucketKey = clientIp + ":" + endpoint;

        int limit;
        if ("download_audio".equals(endpoint)) {
            limit = audioLimit;
        } else if ("download".equals(endpoint)) {
            limit = downloadLimit;
        } else {
            limit = extractLimit;
        }

        Bucket bucket = buckets.computeIfAbsent(bucketKey, k -> createBucket(limit));

        if (!bucket.tryConsume(1)) {
            log.info("Rate limit exceeded for IP hash: {} on endpoint: {}", clientIp.hashCode(), endpoint);
            throw new RateLimitExceededException(
                    "Too many requests. Please wait a moment before trying again (limit: " + limit + "/min).");
        }
    }

    /**
     * Resolves the real client IP, preferring proxy headers used by Cloudflare and reverse proxies.
     */
    public String resolveClientIp(HttpServletRequest request) {
        // Cloudflare
        String cfIp = request.getHeader("CF-Connecting-IP");
        if (cfIp != null && !cfIp.isBlank()) {
            return cfIp.strip();
        }

        // Standard proxy header
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].strip();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.strip();
        }

        return request.getRemoteAddr();
    }

    private Bucket createBucket(int tokensPerMinute) {
        Bandwidth bandwidth = Bandwidth.builder()
                .capacity(tokensPerMinute)
                .refillGreedy(tokensPerMinute, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(bandwidth).build();
    }
}
