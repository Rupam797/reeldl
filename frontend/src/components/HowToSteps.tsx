const steps = [
  {
    number: '01',
    title: 'Copy the Reel Link',
    description:
      'Open Instagram on your phone or browser, find the reel you want to save, tap Share and select Copy Link.',
  },
  {
    number: '02',
    title: 'Paste into ReelDL',
    description:
      'Paste the copied link into the input box above and click the "Download Reel" button to preview the video.',
  },
  {
    number: '03',
    title: 'Save MP4 to Device',
    description:
      'Click the download button to instantly save the original quality video file without watermark.',
  },
];

export default function HowToSteps() {
  return (
    <section className="w-full max-w-4xl mx-auto" id="how-to">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
          How to Download Instagram Reels
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Save your favorite reels in three simple steps — no app installation needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step) => (
          <div
            key={step.number}
            className="card p-6 space-y-3 hover:border-[var(--text-dim)] transition-colors"
          >
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 flex items-center justify-center font-mono font-bold text-sm">
              {step.number}
            </div>
            <h3 className="font-sans font-bold text-base text-[var(--text-main)]">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
