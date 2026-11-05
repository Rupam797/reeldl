'use client';

import React, { useRef, KeyboardEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Video, Clapperboard, Image as ImageIcon, PlayCircle, Music } from 'lucide-react';

export type TabId = 'video' | 'reels' | 'photo' | 'igtv' | 'audio' | 'x' | 'facebook';

interface TabItem {
  id: TabId;
  label: string;
  tooltip: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const TABS: TabItem[] = [
  {
    id: 'video',
    label: 'Video',
    tooltip: 'Instagram Video Downloader',
    href: '/instagram-video-downloader',
    icon: (active) => (
      <Video
        className={`w-5 h-5 transition-transform duration-200 ${
          active ? 'text-[var(--brand)] scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
        }`}
        strokeWidth={2}
      />
    ),
  },
  {
    id: 'reels',
    label: 'Reels',
    tooltip: 'Instagram Reel Downloader',
    href: '/',
    icon: (active) => (
      <Clapperboard
        className={`w-5 h-5 transition-transform duration-200 ${
          active ? 'text-[var(--brand)] scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
        }`}
        strokeWidth={2}
      />
    ),
  },
  {
    id: 'photo',
    label: 'Photo',
    tooltip: 'Instagram Photo Downloader',
    href: '/instagram-photo-downloader',
    icon: (active) => (
      <ImageIcon
        className={`w-5 h-5 transition-transform duration-200 ${
          active ? 'text-[var(--brand)] scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
        }`}
        strokeWidth={2}
      />
    ),
  },
  {
    id: 'igtv',
    label: 'IGTV',
    tooltip: 'Instagram IGTV & Long Video Downloader',
    href: '/instagram-video-downloader',
    icon: (active) => (
      <PlayCircle
        className={`w-5 h-5 transition-transform duration-200 ${
          active ? 'text-[var(--brand)] scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
        }`}
        strokeWidth={2}
      />
    ),
  },
  {
    id: 'audio',
    label: 'Audio',
    tooltip: 'Instagram Audio / MP3 Downloader',
    href: '/instagram-audio-downloader',
    icon: (active) => (
      <Music
        className={`w-5 h-5 transition-transform duration-200 ${
          active ? 'text-[var(--brand)] scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
        }`}
        strokeWidth={2}
      />
    ),
  },
  {
    id: 'x',
    label: 'X / Twitter',
    tooltip: 'X (Twitter) Video Downloader',
    href: '/twitter-video-downloader',
    icon: (active) => (
      <svg
        className={`w-4 h-4 transition-transform duration-200 fill-current ${
          active ? 'text-[var(--brand)] scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
        }`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    tooltip: 'Facebook Video & Reels Downloader',
    href: '/facebook-video-downloader',
    icon: (active) => (
      <svg
        className={`w-5 h-5 transition-transform duration-200 fill-current ${
          active ? 'text-[var(--brand)] scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
        }`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

interface TabBarProps {
  activeTab?: TabId;
}

export default function TabBar({ activeTab }: TabBarProps) {
  const pathname = usePathname();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Automatically determine active tab if not passed
  const currentTab = activeTab || (() => {
    if (pathname === '/') return 'reels';
    if (pathname.includes('twitter') || pathname.includes('x')) return 'x';
    if (pathname.includes('facebook')) return 'facebook';
    if (pathname.includes('audio')) return 'audio';
    if (pathname.includes('photo')) return 'photo';
    if (pathname.includes('video')) return 'video';
    return 'reels';
  })();

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    let targetIndex: number | null = null;

    if (e.key === 'ArrowRight') {
      targetIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = TABS.length - 1;
    }

    if (targetIndex !== null) {
      e.preventDefault();
      tabRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <nav className="flex justify-center w-full px-2" aria-label="Media Downloader Categories">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="inline-flex items-center max-w-full overflow-x-auto no-scrollbar px-3 py-2 bg-[var(--bg-card)]/90 backdrop-blur-sm border border-[var(--border-subtle)] rounded-full shadow-sm"
      >
        {TABS.map((tab, idx) => {
          const isActive = tab.id === currentTab;

          return (
            <React.Fragment key={tab.id}>
              {idx > 0 && (
                <div
                  className="h-5 w-[1px] bg-[var(--border-subtle)] mx-1 sm:mx-2 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              <Link
                href={tab.href}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                title={tab.tooltip}
                aria-label={tab.tooltip}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`group relative flex items-center justify-center p-2.5 sm:px-3 sm:py-2 rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
                  isActive
                    ? 'bg-[var(--brand)]/10 text-[var(--brand)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)]/70'
                }`}
              >
                <span className="flex items-center justify-center">
                  {tab.icon(isActive)}
                </span>
                <span className="sr-only sm:not-sr-only sm:ml-2 text-xs tracking-normal hidden md:inline-block">
                  {tab.label}
                </span>
              </Link>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}

