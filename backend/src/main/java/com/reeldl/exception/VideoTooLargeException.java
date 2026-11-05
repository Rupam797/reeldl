package com.reeldl.exception;

public class VideoTooLargeException extends RuntimeException {
    public VideoTooLargeException(String message) {
        super(message);
    }
}

