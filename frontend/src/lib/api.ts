export type Platform = 'INSTAGRAM' | 'FACEBOOK' | 'X';
export type MediaType = 'VIDEO' | 'AUDIO' | 'PHOTO';

export interface FormatInfo {
  quality: string;
  ext: string;
  fileSize?: number | null;
}

export interface ExtractionResult {
  title: string;
  thumbnail: string;
  duration: string;
  videoUrl: string;
  uploader: string;
  sourceUrl: string;
  platform?: Platform;
  type?: MediaType;
  formats?: FormatInfo[];
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

// Ensure base URL has no trailing slash and defaults to local backend if unspecified
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const API_BASE = rawApiUrl.replace(/\/+$/, '');

/**
 * Executes a fetch request with an overall timeout (70s) and 1 retry on network failures.
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 1, timeoutMs = 70000): Promise<Response> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      // If aborted due to timeout, do not retry
      if (controller.signal.aborted) {
        throw new Error('Request timed out after 70 seconds. The server might still be waking up. Please try again.');
      }

      // Retry once on network failure after a brief pause
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw lastError || new Error('Network error. Unable to reach server.');
}

/**
 * Extracts metadata for a media post with automatic retry and cold-start tolerance.
 */
export async function extractReel(url: string, type: MediaType = 'VIDEO'): Promise<ExtractionResult> {
  const targetUrl = `${API_BASE}/api/extract`;

  try {
    const res = await fetchWithRetry(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, type }),
    });

    if (!res.ok) {
      const err: ApiError = await res.json().catch(() => ({
        error: 'Error',
        message: res.status === 503 ? 'Server busy, try again.' : 'An unexpected error occurred.',
        status: res.status,
      }));
      throw err;
    }

    return res.json();
  } catch (err: any) {
    if (err.status) {
      throw err;
    }
    throw {
      error: 'Network Error',
      message: err.message || 'Unable to connect to the backend server. Please check your connection and try again.',
      status: 502,
    } as ApiError;
  }
}

/**
 * Generates the full absolute download URL for the target media item.
 */
export function getDownloadUrl(sourceUrl: string, filename?: string, type: MediaType = 'VIDEO'): string {
  const params = new URLSearchParams({ url: sourceUrl, type });
  if (filename) params.set('filename', filename);
  return `${API_BASE}/api/download?${params.toString()}`;
}

/**
 * Silently pings the backend health endpoint (fire-and-forget)
 * to initiate Render container spin-up before the user submits a link.
 */
export function pingBackend(): void {
  try {
    fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
    }).catch(() => {
      // Fire-and-forget: silently ignore errors
    });
  } catch {
    // Ignore
  }
}
