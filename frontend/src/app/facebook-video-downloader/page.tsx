import type { Metadata } from 'next';
import DownloaderWidget from '@/components/DownloaderWidget';
import TabBar from '@/components/TabBar';
import AdSlot from '@/components/AdSlot';
import FaqAccordion from '@/components/FaqAccordion';

export const metadata: Metadata = {
  title: 'Facebook Video Downloader — Download Facebook Reels & Watch Videos in HD MP4',
  description:
    'Download Facebook videos, Reels, and Watch clips in 1080p Full HD MP4. Free online Facebook video saver with no watermark. Fast, simple, and mobile-friendly.',
  alternates: {
    canonical: '/facebook-video-downloader',
  },
  openGraph: {
    title: 'Facebook Video Downloader — Save FB Reels & Watch Videos Free',
    description: 'Download public Facebook videos and reels in high definition MP4 format instantly.',
    url: '/facebook-video-downloader',
    type: 'website',
  },
};

const FAQ_ITEMS = [
  {
    question: 'How do I download videos and Reels from Facebook?',
    answer: 'Copy the URL of any public Facebook video, Reel, or Watch clip. Paste the link into the downloader above, hit Download, and save the MP4 video directly to your smartphone or computer.',
  },
  {
    question: 'Can I download Facebook Watch and fb.watch shortlinks?',
    answer: 'Yes! Our system supports all Facebook video formats including facebook.com/watch, /reel/, /videos/, and shortened fb.watch mobile links.',
  },
  {
    question: 'Can I download private Facebook videos or private group posts?',
    answer: 'No. To respect privacy and terms of service, our downloader only processes public Facebook videos, public creator pages, and public group clips.',
  },
  {
    question: 'What video quality is available for Facebook videos?',
    answer: 'We offer HD (High Definition) and SD (Standard Definition) MP4 formats, providing the highest quality stream provided by Facebook.',
  },
];

export default function FacebookVideoDownloaderPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="space-y-12 py-8 sm:py-12 px-4 max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Pill-shaped Category TabBar */}
      <TabBar activeTab="facebook" />

      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight">
          Facebook Video <span className="text-[var(--brand)]">Downloader</span>
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] font-sans max-w-xl mx-auto leading-relaxed">
          Download public Facebook Reels, Watch videos, and clips in original HD MP4 with zero watermark.
        </p>
      </section>

      <AdSlot position="top" className="max-w-3xl mx-auto" />

      {/* Downloader Widget */}
      <DownloaderWidget platform="FACEBOOK" type="VIDEO" />

      {/* How To Steps */}
      <section className="card p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
          How to Download Facebook Videos in 3 Easy Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              01
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Copy Video URL</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              On the Facebook app or web page, locate the video or reel. Tap the three dots or Share button and select "Copy Link".
            </p>
          </div>
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              02
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Paste in Search Box</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Paste the copied link into the field above and click "Download". Our parser will verify and fetch the video streams instantly.
            </p>
          </div>
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              03
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Save High Quality MP4</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Review the preview, pick your preferred quality, and click "Download Video" to save the MP4 to your device.
            </p>
          </div>
        </div>
      </section>

      <AdSlot position="inline" className="max-w-3xl mx-auto" />

      {/* FAQ Section */}
      <section className="card p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
          Frequently Asked Questions
        </h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>

      {/* 300+ Words SEO Text Block */}
      <section className="card p-6 sm:p-8 space-y-5 text-sm leading-relaxed text-[var(--text-muted)]">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
          Reliable Facebook Video, Reels, and Watch Downloader
        </h2>
        <p>
          Facebook features an immense library of multimedia entertainment ranging from hilarious creator reels, cooking masterclasses, DIY home improvement tutorials, sports recaps, and live event highlights. Because internet connections can be unpredictable and favorite videos can be taken down or lost in endless newsfeeds, having a dependable method to save Facebook media offline is an essential convenience.
        </p>
        <p>
          Our Facebook Video Downloader operates on a distributed architecture that connects directly with Facebook content distribution edge servers. It extracts high-definition MP4 video files without altering the original quality, bitrates, or audio track synchronization. From short-form Facebook Reels to long-form Facebook Watch shows and creator videos, everything is processed smoothly in seconds.
        </p>
        <p>
          We do not require any Facebook login authentication, software installations, or browser plugins. The platform is engineered to function flawlessly inside modern web browsers across all major operating systems, including Android smartphones, Apple iPhones, iPads, Windows desktop PCs, and Apple MacBooks. Rest assured your downloads remain private, secure, and completely ad-clean.
        </p>
      </section>

      <AdSlot position="bottom" className="max-w-3xl mx-auto" />
    </div>
  );
}
