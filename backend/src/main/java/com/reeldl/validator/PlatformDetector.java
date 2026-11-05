package com.reeldl.validator;

import com.reeldl.dto.Platform;
import com.reeldl.exception.InvalidUrlException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

@Component
public class PlatformDetector {

    private static final Set<String> INSTAGRAM_HOSTS = Set.of(
            "instagram.com",
            "www.instagram.com"
    );

    private static final Set<String> FACEBOOK_HOSTS = Set.of(
            "facebook.com",
            "www.facebook.com",
            "m.facebook.com",
            "fb.watch"
    );

    private static final Set<String> X_HOSTS = Set.of(
            "x.com",
            "twitter.com",
            "www.twitter.com",
            "mobile.twitter.com"
    );

    private static final Set<String> INSTAGRAM_PATH_PREFIXES = Set.of(
            "/reel/",
            "/reels/",
            "/p/",
            "/tv/"
    );

    private static final Set<String> FACEBOOK_PATH_PREFIXES = Set.of(
            "/watch",
            "/reel/",
            "/reels/",
            "/videos/",
            "/share/v/",
            "/share/r/"
    );

    private final String cookiesFile;

    public PlatformDetector(@Value("${app.ytdlp-cookies-file:#{null}}") String cookiesFile) {
        this.cookiesFile = cookiesFile;
    }

    public record DetectionResult(Platform platform, String normalizedUrl) {
    }

    /**
     * Detects the platform and validates/normalizes the given URL.
     *
     * @param url user-provided URL
     * @return DetectionResult with identified platform and sanitized URL
     * @throws InvalidUrlException if URL is invalid, malicious, or points to an unsupported platform/route
     */
    public DetectionResult detectAndValidate(String url) {
        if (url == null || url.isBlank()) {
            throw new InvalidUrlException("URL must not be empty.");
        }

        String trimmed = url.strip();

        // Reject command injection or path traversal primitives
        if (trimmed.contains(";") || trimmed.contains("|") || trimmed.contains("`")
                || trimmed.contains("$") || (trimmed.contains("&") && !trimmed.contains("?"))) {
            throw new InvalidUrlException("URL contains invalid characters.");
        }

        URI uri;
        try {
            uri = new URI(trimmed);
        } catch (URISyntaxException e) {
            throw new InvalidUrlException("Malformed URL syntax.");
        }

        // Scheme MUST be https
        String scheme = uri.getScheme();
        if (scheme == null || !scheme.equalsIgnoreCase("https")) {
            throw new InvalidUrlException("Only HTTPS URLs are accepted.");
        }

        // No credentials allowed (e.g. https://user:pass@instagram.com)
        if (uri.getUserInfo() != null) {
            throw new InvalidUrlException("URL must not contain user credentials.");
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new InvalidUrlException("URL must specify a valid host.");
        }
        host = host.toLowerCase();

        String path = uri.getPath();
        if (path == null || path.isBlank() || path.equals("/")) {
            throw new InvalidUrlException("URL must include a valid resource path.");
        }

        if (INSTAGRAM_HOSTS.contains(host)) {
            return validateInstagram(host, path, uri);
        } else if (FACEBOOK_HOSTS.contains(host)) {
            return validateFacebook(host, path, uri);
        } else if (X_HOSTS.contains(host)) {
            return validateX(host, path, uri);
        } else {
            throw new InvalidUrlException("Unsupported platform or host: " + host + ". Supported: Instagram, Facebook, X/Twitter.");
        }
    }

    private DetectionResult validateInstagram(String host, String path, URI uri) {
        // Check for Stories / Highlights
        if (path.startsWith("/stories/") || path.startsWith("/s/")) {
            boolean hasCookies = cookiesFile != null && !cookiesFile.isBlank() && Files.exists(Path.of(cookiesFile));
            if (!hasCookies) {
                throw new InvalidUrlException("Instagram Stories and Highlights require authentication. To enable this, set YTDLP_COOKIES_FILE in your environment.");
            }
            String normalized = "https://" + host + (path.endsWith("/") ? path : path + "/");
            return new DetectionResult(Platform.INSTAGRAM, normalized);
        }

        boolean pathMatches = INSTAGRAM_PATH_PREFIXES.stream().anyMatch(path::startsWith);
        if (!pathMatches) {
            throw new InvalidUrlException("Instagram URL must point to a reel, post, or video (/reel/, /reels/, /p/, /tv/).");
        }

        String normalizedPath = path.endsWith("/") ? path : path + "/";
        return new DetectionResult(Platform.INSTAGRAM, "https://" + host + normalizedPath);
    }

    private DetectionResult validateFacebook(String host, String path, URI uri) {
        if ("fb.watch".equals(host)) {
            // fb.watch short URLs (e.g., https://fb.watch/xyz123/)
            String normalizedPath = path.endsWith("/") ? path : path + "/";
            return new DetectionResult(Platform.FACEBOOK, "https://" + host + normalizedPath);
        }

        boolean pathMatches = FACEBOOK_PATH_PREFIXES.stream().anyMatch(path::startsWith);
        if (!pathMatches) {
            throw new InvalidUrlException("Facebook URL must point to a watch, reel, or video post (/watch, /reel/, /videos/, /share/v/, /share/r/).");
        }

        // For Facebook /watch?v=... we must retain the 'v' query parameter
        String query = uri.getQuery();
        if (path.startsWith("/watch") && query != null && query.contains("v=")) {
            String vParam = extractQueryParam(query, "v");
            if (vParam != null && !vParam.isBlank()) {
                return new DetectionResult(Platform.FACEBOOK, "https://" + host + "/watch?v=" + vParam);
            }
        }

        String normalizedPath = path.endsWith("/") ? path : path + "/";
        return new DetectionResult(Platform.FACEBOOK, "https://" + host + normalizedPath);
    }

    private DetectionResult validateX(String host, String path, URI uri) {
        if (!path.contains("/status/")) {
            throw new InvalidUrlException("X/Twitter URL must point to a status post containing /status/.");
        }

        // Normalize: keep https + host + clean path without tracking query params
        String cleanPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
        return new DetectionResult(Platform.X, "https://" + host + cleanPath);
    }

    private String extractQueryParam(String query, String paramName) {
        for (String pair : query.split("&")) {
            String[] parts = pair.split("=", 2);
            if (parts.length == 2 && parts[0].equalsIgnoreCase(paramName)) {
                return parts[1];
            }
        }
        return null;
    }
}

