'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. Check if user already manually selected a theme in localStorage
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;

    // 2. Otherwise determine theme based on user's browser/system color scheme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const initialTheme: 'dark' | 'light' = saved || (mediaQuery.matches ? 'dark' : 'light');

    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // 3. Listen to browser/OS theme changes if the user hasn't set an explicit preference
    const handleChange = (e: MediaQueryListEvent) => {
      const userSaved = localStorage.getItem('theme');
      if (!userSaved) {
        const browserTheme: 'dark' | 'light' = e.matches ? 'dark' : 'light';
        setTheme(browserTheme);
        document.documentElement.setAttribute('data-theme', browserTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative w-9 h-9 sm:w-10 sm:h-10 rounded-[var(--radius-md)] flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
      aria-label={
        mounted
          ? `Current theme: ${theme} mode. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`
          : 'Toggle theme'
      }
      title={
        mounted
          ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
          : 'Toggle theme'
      }
    >
      {/* Sun / Brightness Icon with 8 radial rays matching uploaded design */}
      <svg
        className={`w-5 h-5 transition-transform duration-300 ease-out group-hover:rotate-45 ${
          theme === 'dark' ? 'text-[var(--text-muted)] group-hover:text-white' : 'text-[var(--text-main)] group-hover:text-[var(--brand)]'
        }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Central circle */}
        <circle cx="12" cy="12" r="4" />
        {/* 8 Radial ray ticks */}
        <line x1="12" y1="2" x2="12" y2="4.5" />
        <line x1="12" y1="19.5" x2="12" y2="22" />
        <line x1="4.22" y1="4.22" x2="5.99" y2="5.99" />
        <line x1="18.01" y1="18.01" x2="19.78" y2="19.78" />
        <line x1="2" y1="12" x2="4.5" y2="12" />
        <line x1="19.5" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.99" y2="18.01" />
        <line x1="18.01" y1="5.99" x2="19.78" y2="4.22" />
      </svg>
    </button>
  );
}
