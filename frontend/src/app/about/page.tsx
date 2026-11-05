import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ReelDL — Fast & Free Instagram Downloader',
  description: 'Learn about ReelDL and our mission to provide clean, fast, and free Instagram video downloading.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)]">
          About ReelDL
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)]">
          A fast, simple, and privacy-respecting tool for saving public Instagram content.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-5 text-sm text-[var(--text-muted)] leading-relaxed">
        <h2 className="text-base font-bold text-[var(--text-main)]">
          Our Mission
        </h2>
        <p>
          ReelDL was created to provide a simple, clean, and reliable alternative to cluttered download sites filled with intrusive pop-ups and confusing redirects. We believe tools should do one thing well: download public Instagram videos in original quality, quickly and safely.
        </p>

        <h2 className="text-base font-bold text-[var(--text-main)]">
          Key Principles
        </h2>
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2.5">
            <span className="text-[var(--brand)] font-bold">•</span>
            <span><strong>User Privacy First:</strong> We never require registration, login, or personal information.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[var(--brand)] font-bold">•</span>
            <span><strong>No Video Retention:</strong> Downloaded videos stream straight to your device and are never kept on our servers.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[var(--brand)] font-bold">•</span>
            <span><strong>High Performance:</strong> Fast processing speeds designed for seamless mobile and desktop use.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
