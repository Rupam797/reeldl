package com.reeldl.dto;

import java.util.List;

public record ExtractionResponse(
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
    public static ExtractionResponse fromMediaInfo(MediaInfo mediaInfo) {
        return new ExtractionResponse(
                mediaInfo.title(),
                mediaInfo.thumbnail(),
                mediaInfo.duration(),
                mediaInfo.videoUrl(),
                mediaInfo.uploader(),
                mediaInfo.sourceUrl(),
                mediaInfo.platform(),
                mediaInfo.type(),
                mediaInfo.formats()
        );
    }
}
