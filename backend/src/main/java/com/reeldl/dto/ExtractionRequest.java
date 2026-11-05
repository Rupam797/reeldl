package com.reeldl.dto;

import jakarta.validation.constraints.NotBlank;

public record ExtractionRequest(
        @NotBlank(message = "URL must not be blank")
        String url,
        MediaType type
) {
    public MediaType typeOrDefault() {
        return type != null ? type : MediaType.VIDEO;
    }
}
