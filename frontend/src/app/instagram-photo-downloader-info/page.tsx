import type { Metadata } from 'next';
import DownloaderWidget from '@/components/DownloaderWidget';
import MediaSwitcher from '@/components/MediaSwitcher';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Instagram Photo Downloader — Save Photos in Full HD',
  description:
    'Download and save high-resolution Instagram photos and carousel albums for free.',
  alternates: { canonical: '/instagram-photo-downloader-info' },
};

export default function InstagramPhotoDownloaderInfoPage() {
  return (
    <div className="space-y-12 py-8 sm:py-12 px-4 max-w-5xl mx-auto">
      {/* Media Type Switcher Pill */}
      <MediaSwitcher />

      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight">
          Instagram Photo <span className="text-[var(--brand)]">Downloader</span>
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Download high-resolution photos and multi-image posts from Instagram for free.
        </p>
      </section>

      <AdSlot position="top" className="max-w-3xl mx-auto" />

      <DownloaderWidget />

      <AdSlot position="inline" className="max-w-3xl mx-auto" />

      <section className="max-w-3xl mx-auto card p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
        <h2 className="text-base font-bold text-[var(--text-main)]">
          Full Resolution Instagram Photo Extraction
        </h2>
        <p>
          Save original uncompressed photos, square posts, and portrait images from public accounts with a single click.
        </p>
      </section>

      <AdSlot position="bottom" className="max-w-3xl mx-auto" />
    </div>
  );
}
