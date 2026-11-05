package com.reeldl.validator;

import com.reeldl.dto.Platform;
import com.reeldl.exception.InvalidUrlException;
import org.springframework.stereotype.Component;

@Component
public class InstagramUrlValidator {

    private final PlatformDetector platformDetector;

    public InstagramUrlValidator(PlatformDetector platformDetector) {
        this.platformDetector = platformDetector;
    }

    public String validateAndNormalize(String url) {
        PlatformDetector.DetectionResult result = platformDetector.detectAndValidate(url);
        if (result.platform() != Platform.INSTAGRAM) {
            throw new InvalidUrlException("Only instagram.com URLs are supported by this validator.");
        }
        return result.normalizedUrl();
    }
}
