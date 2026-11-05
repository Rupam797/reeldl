import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Protocol // ReelDL',
  description: 'ReelDL privacy policy and data governance architecture.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <span className="font-mono text-xs text-[var(--brand)] font-semibold uppercase">
          // DATA_GOVERNANCE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
          Privacy Protocol
        </h1>
      </div>

      <div className="card p-6 space-y-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider font-mono">
          Data Minimization Standard
        </h2>
        <p>
          We adhere to absolute data minimization. We do not maintain user databases, require OAuth logins, capture browser canvas fingerprints, or store session cookies.
        </p>

        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider font-mono pt-2">
          Ephemeral Server Logs
        </h2>
        <p>
          Incoming HTTP request IPs are processed in-memory exclusively for Token Bucket rate limiting. In logs, IP addresses are cryptographically hashed (<code className="text-[var(--brand)] font-mono text-xs">ip_hash</code>) to diagnose routing anomalies without retaining personally identifiable information.
        </p>

        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider font-mono pt-2">
          Volatile Cache Invalidation
        </h2>
        <p>
          Extracted JSON manifests (title, thumbnail CDN link, stream URL) are stored in volatile Redis memory with a strict 30-minute expiration TTL, after which all memory blocks are purged automatically.
        </p>
      </div>
    </div>
  );
}
