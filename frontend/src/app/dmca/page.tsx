import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA Protocol // ReelDL Compliance',
  description: 'Digital Millennium Copyright Act compliance guidelines and takedown protocols.',
  alternates: { canonical: '/dmca' },
};

export default function DmcaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <span className="font-mono text-xs text-[var(--brand)] font-semibold uppercase">
          // COMPLIANCE_FRAMEWORK
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
          DMCA Protocol &amp; Takedown Procedure
        </h1>
      </div>

      <div className="card p-6 space-y-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider font-mono">
          Non-Custodial Architecture Notice
        </h2>
        <p>
          ReelDL is a stateless protocol utility. We maintain no media library, permanent file stores, or mirrors of Instagram videos. All streams are generated on-demand and transferred via temporary CDN redirect tokens.
        </p>

        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider font-mono pt-2">
          Immediate Mitigation
        </h2>
        <p>
          Because ReelDL only processes publicly visible media, marking your original Instagram account or specific post as <strong>Private</strong> terminates our engine’s ability to parse or stream the content immediately.
        </p>

        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider font-mono pt-2">
          Formal Notice Requirements
        </h2>
        <ul className="list-disc list-inside space-y-1 font-mono text-xs">
          <li>Identify the copyrighted work asserted to have been infringed.</li>
          <li>Exact Instagram URL(s) to be blacklisted in our rate router.</li>
          <li>Legal statement under penalty of perjury asserting authorized ownership.</li>
          <li>Sufficient contact info (Email, Phone, Verified Signature).</li>
        </ul>

        <p className="pt-2">
          Please route signed notices via our <a href="/contact" className="text-[var(--brand)] underline">Dispatch Channel</a>.
        </p>
      </div>
    </div>
  );
}
