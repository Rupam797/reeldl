package com.reeldl.dto;

import java.util.List;

public record MediaInfo(
        String title,
        String thumbnail,
        String duration,
        String videoUrl,
        String uploader,
        String sourceUrl,
        Platform platform,
        MediaType type,
        List<FormatInfo> formats
) {
}

