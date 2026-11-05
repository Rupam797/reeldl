import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

const INSTAGRAM_HOSTS = ['instagram.com', 'www.instagram.com'];
const FACEBOOK_HOSTS = ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch'];
const X_HOSTS = ['x.com', 'twitter.com', 'www.twitter.com', 'mobile.twitter.com'];

function detectPlatform(host: string): 'INSTAGRAM' | 'FACEBOOK' | 'X' {
  if (INSTAGRAM_HOSTS.includes(host)) return 'INSTAGRAM';
  if (FACEBOOK_HOSTS.includes(host)) return 'FACEBOOK';
  if (X_HOSTS.includes(host)) return 'X';
  throw new Error('Unsupported platform. Only Instagram, Facebook, and X (Twitter) URLs are supported.');
}

function validateAndNormalize(rawUrl: string): { normalizedUrl: string; platform: 'INSTAGRAM' | 'FACEBOOK' | 'X' } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('URL must not be empty.');
  }

  const trimmed = rawUrl.trim();
  if (trimmed.includes(';') || trimmed.includes('|') || trimmed.includes('`') || trimmed.includes('$')) {
    throw new Error('URL contains invalid characters.');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Malformed URL.');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are accepted.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('URL must not contain credentials.');
  }

  const host = parsed.hostname.toLowerCase();
  const platform = detectPlatform(host);
  const pathname = parsed.pathname;

  if (platform === 'INSTAGRAM') {
    if (pathname.includes('/stories/')) {
      throw new Error('Instagram Stories are not supported without private session cookies.');
    }
    const valid = ['/reel/', '/reels/', '/p/', '/tv/'].some((p) => pathname.startsWith(p));
    if (!valid) {
      throw new Error('URL must point to a reel, post, or video (/reel/, /p/, /tv/).');
    }
    const norm = pathname.endsWith('/') ? pathname : `${pathname}/`;
    return { normalizedUrl: `https://${host}${norm}`, platform };
  } else if (platform === 'FACEBOOK') {
    const valid = ['/watch', '/reel/', '/videos/', '/share/v/', '/share/r/'].some((p) => pathname.startsWith(p)) || host === 'fb.watch';
    if (!valid) {
      throw new Error('URL must point to a public Facebook video or reel.');
    }
    return { normalizedUrl: `https://${host}${pathname}`, platform };
  } else {
    // X / Twitter
    if (!pathname.includes('/status/')) {
      throw new Error('X/Twitter URL must point to a status/tweet containing a video.');
    }
    return { normalizedUrl: `https://${host}${pathname}`, platform };
  }
}

async function tryBackend(normalizedUrl: string, type: string = 'VIDEO'): Promise<any | null> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  try {
    const res = await fetch(`${backendUrl}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: normalizedUrl, type }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json().catch(() => null);
    if (err && res.status !== 502 && res.status !== 504) {
      throw new Error(err.message || 'Backend extraction error');
    }
  } catch (e: any) {
    if (e.message && !e.message.includes('fetch failed')) {
      throw e;
    }
  }
  return null;
}

function runLocalYtDlp(url: string, type: string, platform: 'INSTAGRAM' | 'FACEBOOK' | 'X'): Promise<any> {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === 'win32' ? 'python' : 'python3';
    const args = ['-m', 'yt_dlp', '--no-playlist', '--no-warnings', '-j', url];

    const proc = spawn(cmd, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error('Extraction timed out after 25 seconds.'));
    }, 25000);

    proc.on('close', (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        const errLower = stderr.toLowerCase();
        if (errLower.includes('private') || errLower.includes('login required')) {
          reject(new Error('This content appears to be private or requires login. Only public content can be downloaded.'));
          return;
        }
        if (errLower.includes('not available') || errLower.includes('does not exist')) {
          reject(new Error('This content is not available. It may have been deleted or is not accessible.'));
          return;
        }
        reject(new Error(`Failed to extract content (${platform}): ${stderr.slice(0, 200)}`));
        return;
      }

      try {
        const json = JSON.parse(stdout.trim().split('\n')[0]);
        let videoUrl = json.url || '';
        const formats: Array<{ quality: string; ext: string; fileSize?: number | null }> = [];

        if (Array.isArray(json.formats)) {
          for (const f of json.formats) {
            const label = f.format_note || (f.height ? `${f.height}p` : f.format_id || 'default');
            const ext = f.ext || 'mp4';
            formats.push({
              quality: label,
              ext: ext,
              fileSize: f.filesize || f.filesize_approx || null,
            });
            if (!videoUrl && f.url && f.vcodec !== 'none') {
              videoUrl = f.url;
            }
          }
        }

        const durationSeconds = json.duration;
        let formattedDuration = 'Unknown';
        if (durationSeconds && typeof durationSeconds === 'number') {
          const m = Math.floor(durationSeconds / 60);
          const s = Math.floor(durationSeconds % 60);
          formattedDuration = `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        resolve({
          title: json.title || `${platform} media`,
          thumbnail: json.thumbnail || '',
          duration: formattedDuration,
          videoUrl: videoUrl || json.url || '',
          uploader: json.uploader || json.channel || '',
          sourceUrl: url,
          platform,
          type,
          formats: formats.length > 0 ? formats : [{ quality: 'HD 1080p', ext: 'mp4', fileSize: null }],
        });
      } catch (parseErr) {
        reject(new Error('Failed to parse metadata from extractor.'));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Extraction process error: ${err.message}`));
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body?.url;
    const mediaType = body?.type || 'VIDEO';

    if (!rawUrl) {
      return NextResponse.json({ error: 'Bad Request', message: 'URL is required.', status: 400 }, { status: 400 });
    }

    let normalizedUrl: string;
    let platform: 'INSTAGRAM' | 'FACEBOOK' | 'X';

    try {
      const validated = validateAndNormalize(rawUrl);
      normalizedUrl = validated.normalizedUrl;
      platform = validated.platform;
    } catch (e: any) {
      return NextResponse.json({ error: 'Bad Request', message: e.message, status: 400 }, { status: 400 });
    }

    // Try backend first
    try {
      const backendResult = await tryBackend(normalizedUrl, mediaType);
      if (backendResult) {
        return NextResponse.json(backendResult);
      }
    } catch (err: any) {
      return NextResponse.json({ error: 'Backend Error', message: err.message, status: 400 }, { status: 400 });
    }

    // Fallback to local yt-dlp
    const localResult = await runLocalYtDlp(normalizedUrl, mediaType, platform);
    return NextResponse.json(localResult);
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: e.message || 'An unexpected error occurred.', status: 500 },
      { status: 500 }
    );
  }
}
