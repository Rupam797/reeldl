import Link from 'next/link';
import BrandIcon from './BrandIcon';

const toolLinks = [
  { href: '/', label: 'Instagram Reel Downloader' },
  { href: '/instagram-video-downloader', label: 'Instagram Video Downloader' },
  { href: '/instagram-photo-downloader', label: 'Instagram Photo Downloader' },
  { href: '/instagram-audio-downloader', label: 'Instagram Audio / MP3 Downloader' },
  { href: '/twitter-video-downloader', label: 'X (Twitter) Video Downloader' },
  { href: '/facebook-video-downloader', label: 'Facebook Video Downloader' },
];

const guideLinks = [
  { href: '/how-to-use', label: 'How to Download' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About Us' },
];

const legalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/dmca', label: 'DMCA Takedown' },
  { href: '/contact', label: 'Contact Us' },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-card)] mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identity */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <BrandIcon size={24} />
              <span className="text-xl font-extrabold tracking-tight text-[var(--text-main)]">
                Reel<span className="text-[var(--brand)]">DL</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
              Free, multi-platform media downloader. Save public videos, reels, photos, and audio from Instagram, Facebook, and X in original quality without watermarks.
            </p>
          </div>

          {/* Tool Links */}
          <div>
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-4">
              Downloader Tools
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links & Guides */}
          <div>
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-4">
              Guides &amp; Help
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {guideLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-4">
              Legal &amp; Support
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-dim)]">
          <p>
            &copy; {new Date().getFullYear()} ReelDL. Not affiliated with Meta, Instagram, Facebook, or X Corp. Public content only.
          </p>
          <p className="text-center sm:text-right">
            Designed with high performance &amp; privacy in mind.
          </p>
        </div>
      </div>
    </footer>
  );
}
