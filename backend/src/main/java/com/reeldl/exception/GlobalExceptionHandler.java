package com.reeldl.exception;

import com.reeldl.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidUrlException.class)
    public ResponseEntity<ErrorResponse> handleInvalidUrl(InvalidUrlException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Invalid URL", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation Error", message);
    }

    @ExceptionHandler(ContentUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleContentUnavailable(ContentUnavailableException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Content Unavailable", ex.getMessage());
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimit(RateLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", "60")
                .body(new ErrorResponse("Rate Limit Exceeded", ex.getMessage(), 429));
    }

    @ExceptionHandler(ServerBusyException.class)
    public ResponseEntity<ErrorResponse> handleServerBusy(ServerBusyException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .header("Retry-After", "10")
                .body(new ErrorResponse("Server Busy", ex.getMessage(), 503));
    }

    @ExceptionHandler(ExtractionTimeoutException.class)
    public ResponseEntity<ErrorResponse> handleTimeout(ExtractionTimeoutException ex) {
        return buildResponse(HttpStatus.GATEWAY_TIMEOUT, "Extraction Timeout", ex.getMessage());
    }

    @ExceptionHandler(ExtractionFailedException.class)
    public ResponseEntity<ErrorResponse> handleExtractionFailed(ExtractionFailedException ex) {
        return buildResponse(HttpStatus.BAD_GATEWAY, "Extraction Failed", ex.getMessage());
    }

    @ExceptionHandler(VideoTooLargeException.class)
    public ResponseEntity<ErrorResponse> handleVideoTooLarge(VideoTooLargeException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ErrorResponse("Video Too Large", ex.getMessage(), 413));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception on {} {}", request.getMethod(), request.getRequestURI(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected error occurred. Please try again later.");
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String error, String message) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(error, message, status.value()));
    }
}
