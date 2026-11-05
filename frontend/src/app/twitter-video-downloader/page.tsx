import type { Metadata } from 'next';
import DownloaderWidget from '@/components/DownloaderWidget';
import TabBar from '@/components/TabBar';
import AdSlot from '@/components/AdSlot';
import FaqAccordion from '@/components/FaqAccordion';

export const metadata: Metadata = {
  title: 'X Video Downloader — Download Twitter / X Videos & GIFs in 1080p MP4 Free',
  description:
    'Download X (Twitter) videos and GIFs in 1080p, 720p, and HD MP4. Free online Twitter video downloader. Fast, watermark-free, and works on all mobile and desktop devices.',
  alternates: {
    canonical: '/twitter-video-downloader',
  },
  openGraph: {
    title: 'X / Twitter Video Downloader — Download HD Videos & GIFs',
    description: 'Download high definition videos and animated GIFs from X (formerly Twitter) free.',
    url: '/twitter-video-downloader',
    type: 'website',
  },
};

const FAQ_ITEMS = [
  {
    question: 'How can I download a video from X (Twitter)?',
    answer: 'Open the post on X or Twitter, click the Share icon under the tweet, and choose "Copy Link". Paste the link into the box above, click Download, and select your preferred video resolution.',
  },
  {
    question: 'Can I download videos from both x.com and twitter.com links?',
    answer: 'Yes! Our system supports links from both x.com and legacy twitter.com domains, including mobile and desktop URL formats.',
  },
  {
    question: 'Can I download Twitter GIFs as MP4 video files?',
    answer: 'Yes, Twitter converts GIFs into looping MP4 video files. Our downloader retrieves the direct MP4 stream so you can save and share the clip anywhere.',
  },
  {
    question: 'What video quality will I get?',
    answer: 'We display all available stream resolutions from 360p, 720p HD, up to full 1080p Full HD depending on the highest quality uploaded by the tweet author.',
  },
];

export default function TwitterVideoDownloaderPage() {
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
      <TabBar activeTab="x" />

      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight">
          X / Twitter Video <span className="text-[var(--brand)]">Downloader</span>
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] font-sans max-w-xl mx-auto leading-relaxed">
          Save high definition videos, status clips, and GIFs from X (Twitter) directly to MP4 with zero watermark.
        </p>
      </section>

      <AdSlot position="top" className="max-w-3xl mx-auto" />

      {/* Downloader Widget */}
      <DownloaderWidget platform="X" type="VIDEO" />

      {/* How To Steps */}
      <section className="card p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
          How to Download Videos from X (Twitter) in 3 Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              01
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Copy Post URL</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Find the tweet or post on X containing the video. Click the share icon at the bottom right of the tweet and choose "Copy Link".
            </p>
          </div>
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              02
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Paste Into Downloader</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Paste the tweet URL into our search bar and click "Download". Our service extracts the video stream in seconds.
            </p>
          </div>
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              03
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Save MP4 Video</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Choose your desired video resolution (1080p, 720p, or 480p) and tap "Download Video" to save it permanently to your device.
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
          The Fastest Online X (Twitter) Video & GIF Downloader
        </h2>
        <p>
          X (formerly known as Twitter) is the world's town square for breaking news, trending cultural moments, viral sports highlights, political commentary, and entertainment. Millions of engaging video clips and looping animations are posted every hour. Yet, like most major social networks, X does not include a direct "Save Video to Camera Roll" option for public posts, forcing viewers to bookmark posts or use third-party tools.
        </p>
        <p>
          Our X Video Downloader is specifically calibrated to handle the modern X infrastructure. When you submit a status URL, our multi-platform engine inspects the HTTP Live Streaming (HLS) and progressive MP4 streams provided by the X content servers. It selects and organizes each available bitrate into crisp resolution options, allowing you to pick Full HD 1080p for crystal-clear playback on large screens or lower 480p bitrates for saving mobile data.
        </p>
        <p>
          We pride ourselves on an ultra-clean developer aesthetic that delivers lightning-quick response times without bloat. You do not need to install browser add-ons, sign up for accounts, or grant permission access to your Twitter account. From iPhone and iPad Safari to Android Chrome and Windows or Mac browsers, saving videos from X is now effortless, dependable, and completely watermark-free.
        </p>
      </section>

      <AdSlot position="bottom" className="max-w-3xl mx-auto" />
    </div>
  );
}
