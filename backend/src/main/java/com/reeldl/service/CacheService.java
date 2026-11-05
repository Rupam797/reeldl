package com.reeldl.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reeldl.dto.ExtractionResponse;
import com.reeldl.dto.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class CacheService {

    private static final Logger log = LoggerFactory.getLogger(CacheService.class);
    private static final String KEY_PREFIX = "reel:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final Duration ttl;

    public CacheService(
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            @Value("${app.cache-ttl-minutes:30}") int ttlMinutes) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.ttl = Duration.ofMinutes(ttlMinutes);
    }

    public Optional<ExtractionResponse> getFromCache(String normalizedUrl) {
        return getFromCache(normalizedUrl, MediaType.VIDEO);
    }

    public Optional<ExtractionResponse> getFromCache(String normalizedUrl, MediaType type) {
        String key = buildKey(normalizedUrl, type);
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json == null) {
                return Optional.empty();
            }
            ExtractionResponse response = objectMapper.readValue(json, ExtractionResponse.class);
            log.debug("Cache HIT for key: {}", key);
            return Optional.of(response);
        } catch (Exception e) {
            log.warn("Failed to read from cache: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public void putInCache(String normalizedUrl, ExtractionResponse response) {
        putInCache(normalizedUrl, response.type() != null ? response.type() : MediaType.VIDEO, response);
    }

    public void putInCache(String normalizedUrl, MediaType type, ExtractionResponse response) {
        String key = buildKey(normalizedUrl, type);
        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(key, json, ttl);
            log.debug("Cache PUT for key: {} (TTL: {})", key, ttl);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize response for caching: {}", e.getMessage());
        }
    }

    private String buildKey(String normalizedUrl, MediaType type) {
        String suffix = (type != null) ? ":" + type.name() : ":VIDEO";
        return KEY_PREFIX + sha256(normalizedUrl + suffix);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
