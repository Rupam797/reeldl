package com.reeldl.service;

import com.reeldl.exception.ServerBusyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

@Service
public class ProcessLimiterService {

    private static final Logger log = LoggerFactory.getLogger(ProcessLimiterService.class);

    // Render free tier (512 MB): limit concurrent yt-dlp extractions to 2
    private final Semaphore ytDlpSemaphore = new Semaphore(2, true);

    // Render free tier: limit heavy ffmpeg MP3 conversions to 1 at a time
    private final Semaphore ffmpegSemaphore = new Semaphore(1, true);

    @FunctionalInterface
    public interface ProcessAction<T> {
        T run() throws Exception;
    }

    public <T> T runWithYtDlpPermit(ProcessAction<T> action) throws Exception {
        boolean acquired = false;
        try {
            acquired = ytDlpSemaphore.tryAcquire(10, TimeUnit.SECONDS);
            if (!acquired) {
                log.warn("Rate/concurrency limit reached: timed out waiting for yt-dlp permit (10s)");
                throw new ServerBusyException("Server busy, try again");
            }
            return action.run();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ServerBusyException("Server busy, try again");
        } finally {
            if (acquired) {
                ytDlpSemaphore.release();
            }
        }
    }

    public <T> T runWithFfmpegAudioPermit(ProcessAction<T> action) throws Exception {
        boolean ffmpegAcquired = false;
        boolean ytDlpAcquired = false;
        try {
            ffmpegAcquired = ffmpegSemaphore.tryAcquire(10, TimeUnit.SECONDS);
            if (!ffmpegAcquired) {
                log.warn("Rate/concurrency limit reached: timed out waiting for ffmpeg audio permit (10s)");
                throw new ServerBusyException("Server busy, try again");
            }
            ytDlpAcquired = ytDlpSemaphore.tryAcquire(10, TimeUnit.SECONDS);
            if (!ytDlpAcquired) {
                log.warn("Rate/concurrency limit reached: timed out waiting for yt-dlp permit during audio conversion (10s)");
                throw new ServerBusyException("Server busy, try again");
            }
            return action.run();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ServerBusyException("Server busy, try again");
        } finally {
            if (ytDlpAcquired) {
                ytDlpSemaphore.release();
            }
            if (ffmpegAcquired) {
                ffmpegSemaphore.release();
            }
        }
    }
}

