import type { Metadata } from 'next';
import DownloaderWidget from '@/components/DownloaderWidget';
import TabBar from '@/components/TabBar';
import HowToSteps from '@/components/HowToSteps';
import FeaturesSection from '@/components/FeaturesSection';
import FaqSection from '@/components/FaqSection';
import SeoContent from '@/components/SeoContent';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Instagram Reel Downloader — Download Instagram Reels & Videos Free',
  description:
    'Download Instagram Reels, videos, and posts in high definition MP4. Free, fast, and no watermark. Works seamlessly on iPhone, Android, and PC.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="space-y-12 py-8 sm:py-12 px-4 max-w-5xl mx-auto">
      {/* Pill-shaped Multi-Platform Category TabBar */}
      <TabBar activeTab="reels" />

      {/* Hero Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight">
          Instagram Reel <span className="text-[var(--brand)]">Downloader</span>
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-muted)] font-sans max-w-xl mx-auto leading-relaxed">
          Fast, free, and watermark-free. Paste any public Instagram link to download the video in original HD quality.
        </p>
      </section>

      <AdSlot position="top" className="max-w-3xl mx-auto" />

      <DownloaderWidget platform="INSTAGRAM" type="VIDEO" />

      <HowToSteps />

      <FeaturesSection />

      <AdSlot position="inline" className="max-w-3xl mx-auto" />

      <FaqSection />

      <SeoContent />

      <AdSlot position="bottom" className="max-w-3xl mx-auto" />
    </div>
  );
}
