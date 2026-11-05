import type { Metadata } from 'next';
import FaqSection from '@/components/FaqSection';

export const metadata: Metadata = {
  title: 'FAQ // System Knowledge Base',
  description: 'Frequently asked questions and technical specifications for the ReelDL extraction service.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2 text-center">
        <span className="font-mono text-xs text-[var(--brand)] font-semibold uppercase">
          // HELP_CENTER
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
          Knowledge Base &amp; FAQ
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Comprehensive explanations covering stream resolution, performance limits, and security boundaries.
        </p>
      </div>

      <FaqSection />
    </div>
  );
}
