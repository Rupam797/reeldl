import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Download Instagram Reels — Step-by-Step Guide',
  description: 'Detailed instructions on downloading public Instagram Reels using ReelDL.',
  alternates: { canonical: '/how-to-use' },
};

export default function HowToUsePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)]">
          How to Download Instagram Reels
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)]">
          Follow these three easy steps to download any public reel or video to your device.
        </p>
      </div>

      <div className="space-y-5">
        <div className="card p-6 space-y-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-base font-bold text-[var(--text-main)]">Copy the Instagram Reel Link</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Open the Instagram app or website and go to the reel or video you want to save. Tap the <strong>Share</strong> button and choose <strong>Copy Link</strong>.
          </p>
        </div>

        <div className="card p-6 space-y-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h2 className="text-base font-bold text-[var(--text-main)]">Paste the Link into ReelDL</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Head to our <Link href="/" className="text-[var(--brand)] underline font-semibold">Home page</Link>. Paste your link into the input box and click the <strong>Download Reel</strong> button.
          </p>
        </div>

        <div className="card p-6 space-y-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h2 className="text-base font-bold text-[var(--text-main)]">Download the MP4 File</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            A preview card will appear with the reel thumbnail and title. Click the green <strong>Download Video (MP4)</strong> button to save the video directly to your phone or computer.
          </p>
        </div>
      </div>
    </div>
  );
}
