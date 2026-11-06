import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ReelDL — Instagram Reel Downloader',
    template: '%s | ReelDL',
  },
  description:
    'Download public Instagram Reels, videos, and posts in original quality. Clean, fast, dev-tool aesthetic. No watermark, no authentication required.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ReelDL',
    title: 'ReelDL — Instagram Reel Downloader',
    description:
      'Fast, minimal, matte dark Instagram Reel & video downloader. No login, no watermark.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReelDL — Instagram Reel Downloader',
    description:
      'Fast, minimal, matte dark Instagram Reel & video downloader.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ReelDL',
    url: siteUrl,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    description:
      'Clean dev-tool style utility for extracting and downloading Instagram Reels and videos.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
