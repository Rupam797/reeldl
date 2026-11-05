const features = [
  {
    icon: (
      <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'No Watermark Added',
    description: 'Download the clean, original video without any logos, watermarks, or branding placed on top.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '100% Free Forever',
    description: 'Unlimited downloads with zero fees, no trial periods, and no premium subscriptions required.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Original HD Quality',
    description: 'Saves the video at the maximum resolution uploaded by the creator with full audio fidelity.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'No Login or Account',
    description: 'You never need to log in or share your Instagram credentials. Works on all public posts.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Fast & Direct Stream',
    description: 'Instant processing that streams the video file straight to your device without delay.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Works on All Devices',
    description: 'Compatible with Safari, Chrome, Edge, and Firefox on iPhone, Android, Mac, and Windows.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full max-w-4xl mx-auto" id="features">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
          Why Choose ReelDL
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          The cleanest, most reliable way to save Instagram Reels and videos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="card p-6 space-y-3 hover:border-[var(--text-dim)] transition-colors"
          >
            <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center">
              {feature.icon}
            </div>
            <h3 className="font-sans font-bold text-base text-[var(--text-main)]">
              {feature.title}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
