import FaqAccordion from './FaqAccordion';

export const faqItems = [
  {
    question: 'Is it completely free to download Instagram Reels?',
    answer:
      'Yes, ReelDL is 100% free with no limits on how many public videos you can download. There are no fees or subscriptions.',
  },
  {
    question: 'Do I need to sign in with my Instagram account?',
    answer:
      'No. ReelDL never asks for your Instagram login or password. It works directly with public links, ensuring complete privacy and safety.',
  },
  {
    question: 'Will downloaded reels have a watermark or logo?',
    answer:
      'No watermark is added by ReelDL. You receive the exact original video file uploaded by the creator.',
  },
  {
    question: 'What video quality will I get?',
    answer:
      'You get the highest resolution available on Instagram for that post (typically 1080p or 720p HD with crystal clear audio).',
  },
  {
    question: 'Can I download private reels or accounts?',
    answer:
      'No. ReelDL respects creator privacy and only supports publicly available Instagram reels and video posts.',
  },
  {
    question: 'Where are the downloaded reels saved on my device?',
    answer:
      'Videos are saved to your browser’s default Downloads folder. On iPhone and Android, you can also save them directly to your Photos or Gallery app.',
  },
  {
    question: 'Does ReelDL store copies of the downloaded videos?',
    answer:
      'No. Videos are streamed directly to your device and never stored on our servers.',
  },
];

export default function FaqSection() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="w-full max-w-3xl mx-auto" id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Common questions about downloading Instagram Reels and videos.
        </p>
      </div>
      <FaqAccordion items={faqItems} />
    </section>
  );
}
