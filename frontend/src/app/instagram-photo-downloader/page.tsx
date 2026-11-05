import type { Metadata } from 'next';
import DownloaderWidget from '@/components/DownloaderWidget';
import TabBar from '@/components/TabBar';
import AdSlot from '@/components/AdSlot';
import FaqAccordion from '@/components/FaqAccordion';

export const metadata: Metadata = {
  title: 'Instagram Photo Downloader — Download High-Res Instagram Photos & Posts Free',
  description:
    'Download Instagram photos, multi-image carousel posts, and pictures in high definition original resolution. Free online Instagram image saver with no login required.',
  alternates: {
    canonical: '/instagram-photo-downloader',
  },
  openGraph: {
    title: 'Instagram Photo Downloader — Save High-Resolution Photos Free',
    description: 'Download Instagram photos and carousels in full HD quality. Fast, free, and secure.',
    url: '/instagram-photo-downloader',
    type: 'website',
  },
};

const FAQ_ITEMS = [
  {
    question: 'How do I download high-resolution photos from Instagram?',
    answer: 'Simply copy the link to any public Instagram photo post, paste the URL into our downloader search bar, and click Download. You will receive the original high-resolution JPEG directly from the source servers.',
  },
  {
    question: 'Can I download carousel posts with multiple images?',
    answer: 'Yes, our extraction engine parses multi-image carousel posts and retrieves the direct high-quality pictures so you can save them effortlessly.',
  },
  {
    question: 'Do I need to sign in with my Instagram account?',
    answer: 'No. Our downloader is completely anonymous and requires zero logins, passwords, or personal credentials. We only process publicly accessible posts.',
  },
  {
    question: 'Does saving Instagram photos compress the image quality?',
    answer: 'No compression is applied. We stream the image directly in its native resolution (up to 1080x1350 for portrait photos) as uploaded by the original creator.',
  },
];

export default function InstagramPhotoDownloaderPage() {
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
      <TabBar activeTab="photo" />

      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight">
          Instagram Photo <span className="text-[var(--brand)]">Downloader</span>
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] font-sans max-w-xl mx-auto leading-relaxed">
          Save high-resolution Instagram pictures and carousels in original quality without watermarks or compression.
        </p>
      </section>

      <AdSlot position="top" className="max-w-3xl mx-auto" />

      {/* Downloader Widget */}
      <DownloaderWidget platform="INSTAGRAM" type="PHOTO" />

      {/* How To Steps */}
      <section className="card p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
          How to Download Instagram Photos in 3 Easy Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              01
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Copy Image Link</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Open Instagram on your phone or browser, find the photo post, tap the three dots or share icon, and select "Copy Link".
            </p>
          </div>
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              02
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Paste Into Downloader</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Paste the copied URL into the box above and tap the "Download" button. Our engine will immediately fetch the full-res asset.
            </p>
          </div>
          <div className="space-y-2.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-mono font-bold flex items-center justify-center text-sm border border-[var(--brand)]/20">
              03
            </div>
            <h3 className="font-semibold text-base text-[var(--text-main)]">Save Full Resolution</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Preview your picture and click "Download Photo" to save the crystal-clear JPEG directly to your photo gallery or downloads.
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
          The Ultimate High-Quality Instagram Photo & Post Downloader
        </h2>
        <p>
          Instagram is home to billions of inspiring photographs, breathtaking travel snapshots, graphic designs, and digital art created by talented photographers across the globe. However, Instagram does not provide an official native download button to preserve these images in high resolution on your device storage. Many users resort to taking low-resolution screenshots, which capture unnecessary interface buttons, lose detail, and degrade visual fidelity due to screen cropping and display compression.
        </p>
        <p>
          Our online Instagram Photo Downloader eliminates the hassle of screenshotting by connecting directly to the content distribution network where original master files are hosted. When you paste any public Instagram photo or carousel post URL, our system inspects the post metadata and extracts the highest dimension available—delivering razor-sharp images up to 1080x1350 pixels. Whether you are preserving memories, assembling an offline mood board, backing up your personal photography portfolio, or creating educational reference collections, our tool provides an uncompromising, watermark-free experience.
        </p>
        <p>
          Security, privacy, and speed remain our core design principles. We do not require account registration, login credentials, or browser extensions. Everything operates smoothly through standard web standards on modern devices including Apple iOS (iPhone & iPad), Google Android smartphones and tablets, Windows workstations, macOS laptops, and Linux operating systems. Simply paste your link and enjoy instant, lightning-fast downloads without privacy compromises or intrusive ad interruptions.
        </p>
      </section>

      <AdSlot position="bottom" className="max-w-3xl mx-auto" />
    </div>
  );
}
