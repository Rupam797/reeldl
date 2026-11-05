import type { Metadata } from 'next';
import DownloaderWidget from '@/components/DownloaderWidget';
import MediaSwitcher from '@/components/MediaSwitcher';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Instagram Story Downloader — Save Stories & Highlights Free',
  description:
    'Download and archive Instagram Stories and Highlights anonymously before they disappear. Free, fast, and no login required.',
  alternates: { canonical: '/instagram-story-downloader-info' },
};

export default function InstagramStoryDownloaderInfoPage() {
  return (
    <div className="space-y-12 py-8 sm:py-12 px-4 max-w-5xl mx-auto">
      {/* Media Type Switcher Pill */}
      <MediaSwitcher />

      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight">
          Instagram Story <span className="text-[var(--brand)]">Downloader</span>
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Download and archive Instagram Stories and Highlights anonymously before they disappear.
        </p>
      </section>

      <AdSlot position="top" className="max-w-3xl mx-auto" />

      <DownloaderWidget />

      <AdSlot position="inline" className="max-w-3xl mx-auto" />

      <section className="max-w-3xl mx-auto card p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
        <h2 className="text-base font-bold text-[var(--text-main)]">
          Save Public Instagram Stories &amp; Highlights
        </h2>
        <p>
          Instagram Stories vanish after 24 hours. ReelDL enables you to download and preserve publicly shared stories, clips, and profile Highlights straight to your device without quality compression.
        </p>
        <p>
          Simply paste any public Instagram story or highlight link into the downloader above to get your direct MP4 download link.
        </p>
      </section>

      <AdSlot position="bottom" className="max-w-3xl mx-auto" />
    </div>
  );
}
