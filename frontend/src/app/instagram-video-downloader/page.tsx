import type { Metadata } from 'next';
import DownloaderWidget from '@/components/DownloaderWidget';
import TabBar from '@/components/TabBar';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Instagram Video Downloader — Download Instagram Videos in HD Free',
  description:
    'Download public Instagram videos and posts in high definition MP4 format. Free, fast, and no watermark.',
  alternates: { canonical: '/instagram-video-downloader' },
};

export default function InstagramVideoDownloaderPage() {
  return (
    <div className="space-y-12 py-8 sm:py-12 px-4 max-w-5xl mx-auto">
      <TabBar activeTab="video" />

      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight">
          Instagram Video <span className="text-[var(--brand)]">Downloader</span>
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Save any public Instagram video to your phone or computer in HD quality — fast, free, and watermark-free.
        </p>
      </section>

      <AdSlot position="top" className="max-w-3xl mx-auto" />

      <DownloaderWidget platform="INSTAGRAM" type="VIDEO" />

      <AdSlot position="inline" className="max-w-3xl mx-auto" />

      <section className="max-w-3xl mx-auto card p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
          Download Instagram Feed Videos &amp; Posts in Full HD
        </h2>
        <p>
          ReelDL allows you to download regular Instagram feed videos, clips, and multi-video carousel posts without installing any software. Our service connects directly to public Instagram servers to fetch the cleanest video quality possible.
        </p>
        <h3 className="text-sm font-bold text-[var(--text-main)]">
          Works Across All Platforms
        </h3>
        <p>
          Whether you are browsing on an iPhone, Android smartphone, Windows laptop, or Mac, you can download Instagram videos straight to your local storage with one click.
        </p>
      </section>

      <AdSlot position="bottom" className="max-w-3xl mx-auto" />
    </div>
  );
}
