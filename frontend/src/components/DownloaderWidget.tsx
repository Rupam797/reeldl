'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  extractReel,
  getDownloadUrl,
  pingBackend,
  type ExtractionResult,
  type ApiError,
  type Platform,
  type MediaType,
} from '@/lib/api';

interface DownloaderWidgetProps {
  platform?: Platform;
  type?: MediaType;
  placeholder?: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

function detectUrlPlatform(url: string): Platform | 'OTHER' {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('instagram.com')) return 'INSTAGRAM';
    if (host.includes('facebook.com') || host.includes('fb.watch')) return 'FACEBOOK';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'X';
  } catch {
    // ignore
  }
  return 'OTHER';
}

function validateUrl(
  input: string,
  targetPlatform: Platform
): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter or paste a valid link.' };
  }

  if (trimmed.includes(';') || trimmed.includes('|') || trimmed.includes('`') || trimmed.includes('$')) {
    return { valid: false, error: 'The link contains invalid characters.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Malformed link. Please enter a full URL starting with https://' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only secure HTTPS links are supported.' };
  }

  const detected = detectUrlPlatform(trimmed);
  if (detected !== targetPlatform && detected !== 'OTHER') {
    const platformNames: Record<Platform, string> = {
      INSTAGRAM: 'Instagram',
      FACEBOOK: 'Facebook',
      X: 'X (Twitter)',
    };
    return {
      valid: false,
      error: `You pasted a ${platformNames[detected]} link into the ${platformNames[targetPlatform]} Downloader. Please switch to the ${platformNames[detected]} tab above or paste an ${platformNames[targetPlatform]} link.`,
    };
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;

  if (targetPlatform === 'INSTAGRAM') {
    if (host !== 'instagram.com' && host !== 'www.instagram.com') {
      return { valid: false, error: 'Please enter a valid Instagram URL (e.g. https://www.instagram.com/reel/...)' };
    }
    if (path.includes('/stories/')) {
      return { valid: false, error: 'Instagram Stories require user credentials and are not supported for anonymous download.' };
    }
    const valid = ['/reel/', '/reels/', '/p/', '/tv/'].some((p) => path.startsWith(p));
    if (!valid) {
      return { valid: false, error: 'URL must point to a public Instagram Reel, Video, or Post (/reel/, /p/, or /tv/).' };
    }
  } else if (targetPlatform === 'FACEBOOK') {
    const validHosts = ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch'];
    if (!validHosts.includes(host)) {
      return { valid: false, error: 'Please enter a valid Facebook video link (facebook.com or fb.watch).' };
    }
    const validPath = ['/watch', '/reel/', '/videos/', '/share/v/', '/share/r/'].some((p) => path.startsWith(p)) || host === 'fb.watch';
    if (!validPath) {
      return { valid: false, error: 'Facebook URL must point to a public Video, Reel, or Watch link.' };
    }
  } else if (targetPlatform === 'X') {
    const validHosts = ['x.com', 'twitter.com', 'www.twitter.com', 'mobile.twitter.com'];
    if (!validHosts.includes(host)) {
      return { valid: false, error: 'Please enter a valid X (Twitter) status URL (x.com or twitter.com).' };
    }
    if (!path.includes('/status/')) {
      return { valid: false, error: 'X / Twitter link must point to a post containing media (e.g. https://x.com/username/status/...)' };
    }
  }

  return { valid: true };
}

export default function DownloaderWidget({
  platform = 'INSTAGRAM',
  type = 'VIDEO',
  placeholder,
}: DownloaderWidgetProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isWakingUp, setIsWakingUp] = useState(false);
  const wakeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Silently ping backend on mount to start waking Render instance if it is asleep
  useEffect(() => {
    pingBackend();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
    };
  }, []);

  const defaultPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    if (platform === 'INSTAGRAM') {
      if (type === 'AUDIO') return 'Paste Instagram link to extract MP3 audio...';
      if (type === 'PHOTO') return 'Paste Instagram photo or post link...';
      return 'Paste Instagram Reel or Video link here...';
    }
    if (platform === 'FACEBOOK') return 'Paste Facebook Video or Reel link here...';
    if (platform === 'X') return 'Paste X (Twitter) video post link here...';
    return 'Paste link here...';
  }, [placeholder, platform, type]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        if (status === 'error') setStatus('idle');
      }
    } catch {
      // Clipboard API permissions
    }
  }, [status]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validation = validateUrl(url, platform);

      if (!validation.valid) {
        setErrorMessage(validation.error || 'Please enter a valid link.');
        setStatus('error');
        return;
      }

      setStatus('loading');
      setIsWakingUp(false);
      setErrorMessage('');
      setResult(null);

      // Start cold-start notification after 5 seconds
      if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
      wakeTimerRef.current = setTimeout(() => {
        setIsWakingUp(true);
      }, 5000);

      try {
        const data = await extractReel(url.trim(), type);
        setResult(data);
        setStatus('success');
      } catch (err) {
        const apiErr = err as ApiError;
        setErrorMessage(
          apiErr?.message || 'Unable to download this media. Please verify the link is public and try again.'
        );
        setStatus('error');
      } finally {
        if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
        setIsWakingUp(false);
      }
    },
    [url, platform, type]
  );

  const handleClear = useCallback(() => {
    setUrl('');
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
    setIsWakingUp(false);
  }, []);

  const downloadLabel = useMemo(() => {
    if (type === 'AUDIO') return '⬇ Download MP3 (Audio)';
    if (type === 'PHOTO') return '⬇ Download Photo (HD)';
    return '⬇ Download Video (MP4)';
  }, [type]);

  const mediaLabel = useMemo(() => {
    if (type === 'AUDIO') return 'Audio Ready to Download';
    if (type === 'PHOTO') return 'Photo Ready to Download';
    return 'Video Ready to Download';
  }, [type]);

  return (
    <section className="w-full max-w-3xl mx-auto">
      {/* Downloader Box */}
      <div className="card p-6 sm:p-8 space-y-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder={defaultPlaceholder}
              className="input-dev w-full px-5 py-4 pr-24 text-sm sm:text-base rounded-[var(--radius-md)] tracking-normal placeholder:text-[var(--text-dim)]"
              aria-label={`${platform} media link input`}
              disabled={status === 'loading'}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="btn-secondary absolute right-3 px-3.5 py-2 text-xs sm:text-sm font-semibold tracking-wide"
              aria-label="Paste link from clipboard"
              disabled={status === 'loading'}
            >
              PASTE
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-brand flex-1 py-4 px-6 text-sm sm:text-base font-bold flex items-center justify-center gap-2 rounded-[var(--radius-md)] tracking-wide shadow-none"
            >
              {status === 'loading' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isWakingUp ? 'Waking up server...' : 'Processing Media...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </>
              )}
            </button>

            {(status === 'success' || status === 'error' || url.length > 0) && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary py-4 px-5 text-sm font-medium rounded-[var(--radius-md)]"
                title="Clear input"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Error Alert */}
        {status === 'error' && errorMessage && (
          <div
            className="p-4 rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 flex items-start gap-3"
            role="alert"
          >
            <svg
              className="w-5 h-5 text-[var(--danger)] flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-[var(--danger)] leading-relaxed font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Loading State / Cold-Start UX */}
        {status === 'loading' && (
          <div className="card-compact p-6 space-y-4 bg-[var(--bg-input)]/40 border-[var(--border-subtle)] text-center">
            <div className="flex justify-center">
              <span className="w-6 h-6 border-2 border-[var(--border-subtle)] border-t-[var(--brand)] rounded-full animate-spin" />
            </div>
            {isWakingUp ? (
              <div className="space-y-1.5 animate-pulse">
                <p className="text-sm font-bold text-[var(--brand)]">
                  Waking up the server, please wait up to 60 seconds...
                </p>
                <p className="text-xs text-[var(--text-dim)]">
                  Free cloud containers spin down when idle. Your media extraction will proceed automatically!
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[var(--text-main)]">
                  Fetching content from {platform} in high quality...
                </p>
                <p className="text-xs text-[var(--text-dim)]">
                  This usually takes 2 to 4 seconds.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Result Card */}
        {status === 'success' && result && (
          <div className="card-compact p-5 sm:p-6 space-y-5 border-[var(--border-subtle)] bg-[var(--bg-input)]/30 rounded-[var(--radius-md)]">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {result.thumbnail && (
                <div className="w-full sm:w-44 h-48 sm:h-32 flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.thumbnail}
                    alt={result.title || 'Media preview'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                  {mediaLabel}
                </div>

                <h3 className="font-sans font-bold text-base sm:text-lg text-[var(--text-main)] line-clamp-2 leading-snug">
                  {result.title || `${platform} Media`}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                  {result.uploader && (
                    <span>By <strong className="text-[var(--text-main)]">@{result.uploader}</strong></span>
                  )}
                  {result.duration && result.duration !== 'Unknown' && (
                    <span>• Duration: <strong className="text-[var(--text-main)]">{result.duration}</strong></span>
                  )}
                  <span>• Format: <strong className="text-[var(--text-main)]">{type === 'AUDIO' ? 'MP3' : type === 'PHOTO' ? 'JPG' : 'MP4'}</strong></span>
                </div>
              </div>
            </div>

            {/* Quality List (formats) */}
            {result.formats && result.formats.length > 0 && (
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                  Available Qualities
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.formats.slice(0, 5).map((f, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    >
                      <span className="font-medium">{f.quality}</span>
                      <span className="text-[var(--text-dim)] uppercase font-mono text-[10px]">{f.ext}</span>
                      {f.fileSize && (
                        <span className="text-[var(--text-muted)] text-[10px]">
                          {(f.fileSize / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Download Button */}
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <a
                href={getDownloadUrl(result.sourceUrl, undefined, type)}
                download
                className="btn-brand block w-full py-4 px-6 text-center text-sm sm:text-base font-bold rounded-[var(--radius-md)] tracking-wide shadow-none"
              >
                {downloadLabel}
              </a>
              <p className="text-center text-xs text-[var(--text-dim)] mt-2.5">
                Fast &amp; direct download • Clean metadata • No watermark
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
