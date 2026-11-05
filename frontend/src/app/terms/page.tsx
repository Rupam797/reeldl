import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use // ReelDL',
  description: 'Operating constraints and acceptable use policy for ReelDL.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <span className="font-mono text-xs text-[var(--brand)] font-semibold uppercase">
          // ACCEPTABLE_USE_POLICY
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
          Terms of Service
        </h1>
      </div>

      <div className="card p-6 space-y-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider font-mono">
          1. Authorized Usage Only
        </h2>
        <p>
          You agree to utilize this tool exclusively for content you own or have explicit authorization to download for offline archival or fair-use research.
        </p>

        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider font-mono pt-2">
          2. No Denial-of-Service / Abuse
        </h2>
        <p>
          Automated denial-of-service attempts, scraping proxies, or attempts to circumvent Bucket4j IP throttles will result in persistent egress packet rejection.
        </p>

        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider font-mono pt-2">
          3. Limitation of Liability
        </h2>
        <p>
          The service is provided &quot;as-is&quot; without warranties of uptime, stream availability, or platform compatibility. ReelDL operates independently of Meta Platforms, Inc.
        </p>
      </div>
    </div>
  );
}
