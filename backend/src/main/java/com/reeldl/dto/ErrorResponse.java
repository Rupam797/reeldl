package com.reeldl.dto;

public record ErrorResponse(
        String error,
        String message,
        int status
) {
}

