import type { Metadata } from 'next';
import DownloaderWidget from '@/components/DownloaderWidget';
import TabBar from '@/components/TabBar';
import AdSlot from '@/components/AdSlot';
import FaqAccordion from '@/components/FaqAccordion';

export const metadata: Metadata = {
  title: 'Instagram Audio Downloader — Extract & Download Instagram MP3 Audio Free',
  description:
    'Convert and download Instagram audio, songs, trending Reel sounds, and background music in high quality 320kbps MP3 format. Fast, free online Instagram MP3 extractor.',
  alternates: {
    canonical: '/instagram-audio-downloader',
  },
  openGraph: {
    title: 'Instagram Audio Downloader — Extract MP3 Sounds Free',
    description: 'Extract MP3 tracks and trending audio from Instagram Reels and videos instantly.',
    url: '/instagram-audio-downloader',
    type: 'website',
  },
};

const FAQ_ITEMS = [
  {
    question: 'How do I download the audio or music from an Instagram Reel?',
    answer: 'Copy the link of the Instagram reel containing your desired song or audio clip, paste it into our extractor above, and tap Download. Our audio engine extracts and encodes the sound directly into an MP3 file ready for offline listening.',
  },
  {
    question: 'What audio format and bitrate will I receive?',
    answer: 'We encode all extracted audio tracks in universal MP3 format with high-fidelity sound quality (up to 320 kbps) using advanced FFmpeg audio processing.',
  },
  {
    question: 'Is it free to extract MP3 audio from Instagram reels?',
    answer: 'Yes, our Instagram audio downloader is 100% free with no hidden subscriptions or limits. You can extract your favorite trending audio clips anytime.',
  },
  {
    question: 'Can I use the downloaded MP3 as a ringtone or offline track?',
    answer: 'Absolutely! The downloaded MP3 file is universally compatible with Android, iPhone (via Files or GarageBand), Windows Media Player, and any audio player app.',
  },
];

export default function InstagramAudioDownloaderPage() {
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
      <TabBar activeTab="audio" />

      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight">
          Instagram Audio <span className="text-[var(--brand)]">Downloader</span>
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] font-sans max-w-xl mx-auto leading-relaxed">
          Extract background music, voiceovers, and trending songs from Instagram Reels and videos directly to MP3.
        </p>
      </section>

      <AdSlot position="top" className="max-w-3xl mx-auto" />

      {/* Downloader Widget */}
      <DownloaderWidget platform="INSTAGRAM" type="AUDIO" />

      {/* How To Steps */}
      <section className="card p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
          How to Extract Audio from Instagram in 3 Simple Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              01
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Copy Reel URL</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Find the Reel or Video featuring the track or sound you love on Instagram. Click Share and tap "Copy Link".
            </p>
          </div>
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              02
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Convert to Audio</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Paste the link into the box above and click "Download". Our high-speed cloud cluster strips the video stream and encodes pure MP3 audio.
            </p>
          </div>
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              03
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Download MP3</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Click "Download MP3" to save the soundtrack straight to your phone or computer. Play it anywhere without internet.
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
          High-Fidelity Instagram to MP3 Audio Extraction Engine
        </h2>
        <p>
          Viral trends on Instagram are frequently fueled by incredible music snippets, original comedy voice tracks, captivating instrumental covers, and motivational spoken-word audio. Often, you want to keep the song or soundbite for your own creative projects, personalized mobile ringtones, or offline music playlists without having to keep a large video file consuming precious device memory.
        </p>
        <p>
          Our dedicated Instagram Audio Downloader is engineered specifically to solve this problem. Backed by industry-standard FFmpeg audio decoders running on high-performance infrastructure, the service isolates the pristine audio stream directly from the video container and transcodes it into clean, high-bitrate MP3 files. Every detail of the original sound is preserved, avoiding unnecessary distortion or pitch shifts.
        </p>
        <p>
          Unlike shady converter websites loaded with intrusive pop-up malware and deceptive download triggers, our service offers a clean, streamlined user interface built with the highest modern web standards. We never ask for your Instagram password, never track your download history, and instantly delete temporary conversion artifacts from our servers the moment your download completes. Enjoy unrestricted access across iOS, Android, macOS, and Windows with flawless reliability.
        </p>
      </section>

      <AdSlot position="bottom" className="max-w-3xl mx-auto" />
    </div>
  );
}
