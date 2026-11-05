package com.reeldl.service;

import com.reeldl.dto.MediaInfo;
import com.reeldl.dto.MediaType;

public interface ExtractorService {
    MediaInfo extract(String url, MediaType type);
}
