'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MediaTab {
  id: string;
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const tabs: MediaTab[] = [
  {
    id: 'video',
    label: 'Instagram Video',
    href: '/instagram-video-downloader',
    icon: (active) => (
      <svg
        className={`w-5 h-5 transition-colors ${active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="5" width="14" height="14" rx="2.5" />
        <polygon points="16,10 22,7 22,17 16,14" />
      </svg>
    ),
  },
  {
    id: 'reel',
    label: 'Instagram Reel',
    href: '/',
    icon: (active) => (
      <svg
        className={`w-5 h-5 transition-colors ${active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <path d="M3 9h18" />
        <path d="M8 4l2 5" />
        <path d="M14 4l2 5" />
        <polygon points="10.5,12.5 14.5,14.5 10.5,16.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'photo',
    label: 'Instagram Photo',
    href: '/instagram-photo-downloader-info',
    icon: (active) => (
      <svg
        className={`w-5 h-5 transition-colors ${active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2.5" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    id: 'story',
    label: 'Instagram Story',
    href: '/instagram-story-downloader-info',
    icon: (active) => (
      <svg
        className={`w-5 h-5 transition-colors ${active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'audio',
    label: 'Instagram Audio',
    href: '/#',
    icon: (active) => (
      <svg
        className={`w-5 h-5 transition-colors ${active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: 'twitter',
    label: 'X (Twitter) Video',
    href: '/#',
    icon: (active) => (
      <svg
        className={`w-4 h-4 transition-colors ${active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook Video',
    href: '/#',
    icon: (active) => (
      <svg
        className={`w-4 h-4 transition-colors ${active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export default function MediaSwitcher() {
  const pathname = usePathname();

  return (
    <div className="flex justify-center w-full mb-8">
      <nav
        aria-label="Media Download Channels"
        className="inline-flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm max-w-full overflow-x-auto"
      >
        {tabs.map((tab, idx) => {
          const isActive = pathname === tab.href;
          return (
            <div key={tab.id} className="flex items-center">
              <Link
                href={tab.href}
                title={tab.label}
                aria-label={tab.label}
                className={`group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all ${
                  isActive
                    ? 'bg-[var(--brand)]/15 border border-[var(--brand)]/30 text-[var(--brand)]'
                    : 'hover:bg-[var(--bg-input)] text-[var(--text-muted)]'
                }`}
              >
                {tab.icon(isActive)}
              </Link>

              {idx < tabs.length - 1 && (
                <div className="h-4 w-px bg-[var(--border-subtle)] mx-1 sm:mx-1.5" />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

