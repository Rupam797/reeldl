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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function extractReel(url: string, type: MediaType = 'VIDEO'): Promise<ExtractionResult> {
  const res = await fetch(`${API_BASE}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type }),
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      error: 'Error',
      message: 'An unexpected error occurred.',
      status: res.status,
    }));
    throw err;
  }

  return res.json();
}

export function getDownloadUrl(sourceUrl: string, filename?: string, type: MediaType = 'VIDEO'): string {
  const params = new URLSearchParams({ url: sourceUrl, type });
  if (filename) params.set('filename', filename);
  return `${API_BASE}/api/download?${params.toString()}`;
}
