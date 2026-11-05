import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sourceUrl = searchParams.get('url');
  const mediaType = searchParams.get('type') || 'VIDEO';
  const customFilename = searchParams.get('filename');

  if (!sourceUrl) {
    return NextResponse.json({ error: 'Missing url parameter', status: 400 }, { status: 400 });
  }

  // Forward to Spring Boot backend if reachable
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  const backendDownloadUrl = new URL('/api/download', backendUrl);
  backendDownloadUrl.searchParams.set('url', sourceUrl);
  backendDownloadUrl.searchParams.set('type', mediaType);
  if (customFilename) {
    backendDownloadUrl.searchParams.set('filename', customFilename);
  }

  try {
    const backendRes = await fetch(backendDownloadUrl.toString(), {
      headers: {
        'X-Forwarded-For': req.headers.get('x-forwarded-for') || '127.0.0.1',
        'CF-Connecting-IP': req.headers.get('cf-connecting-ip') || '',
      },
      signal: AbortSignal.timeout(35000),
    });

    if (backendRes.ok && backendRes.body) {
      const headers = new Headers();
      headers.set('Content-Type', backendRes.headers.get('Content-Type') || (mediaType === 'AUDIO' ? 'audio/mpeg' : 'video/mp4'));
      headers.set('Content-Disposition', backendRes.headers.get('Content-Disposition') || `attachment; filename="download_${Date.now()}.${mediaType === 'AUDIO' ? 'mp3' : 'mp4'}"`);
      headers.set('Cache-Control', 'no-cache');
      return new NextResponse(backendRes.body as any, {
        status: 200,
        headers,
      });
    }
  } catch {
    // Backend unavailable, fallback to direct streaming
  }

  // Fallback: First extract to get CDN videoUrl
  const extractUrl = new URL('/api/extract', req.url);
  const extractRes = await fetch(extractUrl.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: sourceUrl, type: mediaType }),
  });

  if (!extractRes.ok) {
    const errorData = await extractRes.json().catch(() => ({}));
    return NextResponse.json(errorData, { status: extractRes.status });
  }

  const { videoUrl } = await extractRes.json();
  if (!videoUrl) {
    return NextResponse.json({ error: 'No video stream URL found', status: 404 }, { status: 404 });
  }

  // Fetch and stream the video from CDN
  const videoRes = await fetch(videoUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
    },
  });

  if (!videoRes.ok || !videoRes.body) {
    return NextResponse.json({ error: 'Failed to fetch media stream from CDN', status: 502 }, { status: 502 });
  }

  const defaultExt = mediaType === 'AUDIO' ? 'mp3' : mediaType === 'PHOTO' ? 'jpg' : 'mp4';
  const defaultContentType = mediaType === 'AUDIO' ? 'audio/mpeg' : mediaType === 'PHOTO' ? 'image/jpeg' : 'video/mp4';
  const safeFilename = customFilename || `media_${Math.floor(Date.now() / 1000)}.${defaultExt}`;

  return new NextResponse(videoRes.body, {
    headers: {
      'Content-Type': defaultContentType,
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Cache-Control': 'no-cache',
    },
  });
}
