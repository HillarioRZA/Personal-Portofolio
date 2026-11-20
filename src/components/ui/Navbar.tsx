'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { ProfileContent } from '@/lib/types';

export default function Navbar({ profile }: { profile: ProfileContent }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const langBtnBase =
    'px-2.5 py-1.5 rounded-full font-mono text-[11px] font-semibold tracking-wider transition-all';
  const langBtnActive = 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]';
  const langBtnIdle = 'text-[var(--muted)] hover:text-[var(--fg)]';

  return (
    <header
      id="main-nav"
      className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] transition-colors duration-500"
      style={{
        backgroundColor: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        <a
          href="#hero"
          data-scroll-link
          data-cursor="Top"
          data-cursor-en="Top"
          data-cursor-id="Atas"
          className="flex items-center gap-2.5 min-w-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emeraldSignal opacity-70" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emeraldSignal" />
          </span>
          <span className="font-display font-bold tracking-tight text-sm sm:text-base text-[var(--fg)] truncate">
            {profile.brand}
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6 lg:gap-7" aria-label="Primary Navigation">
          {profile.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-scroll-link
              data-cursor={item.cursor.en}
              data-cursor-en={item.cursor.en}
              data-cursor-id={item.cursor.id}
              className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="inline-flex items-center rounded-full p-0.5 border border-[var(--border)] bg-[var(--surface)]"
            role="group"
            aria-label="Language Switch"
          >
            <button
              type="button"
              id="lang-en"
              data-cursor="English"
              data-cursor-en="English"
              data-cursor-id="Inggris"
              onClick={() => lang !== 'en' && setLang('en')}
              className={`${langBtnBase} ${lang === 'en' ? langBtnActive : langBtnIdle}`}
            >
              EN
            </button>
            <button
              type="button"
              id="lang-id"
              data-cursor="Indonesia"
              data-cursor-en="Indonesia"
              data-cursor-id="Indonesia"
              onClick={() => lang !== 'id' && setLang('id')}
              className={`${langBtnBase} ${lang === 'id' ? langBtnActive : langBtnIdle}`}
            >
              ID
            </button>
          </div>

          <button
            type="button"
            id="mobile-menu-btn"
            aria-label="Toggle Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)] transition-colors"
          >
            <svg
              className={`w-4 h-4 ${open ? 'hidden' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg
              className={`w-4 h-4 ${open ? '' : 'hidden'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`${open ? '' : 'hidden'} md:hidden border-t border-[var(--border)] px-5 py-5 space-y-1.5`}
        style={{ backgroundColor: 'var(--bg)' }}
      >
        {profile.nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            data-scroll-link
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)]"
          >
            {t(item.key)}
          </a>
        ))}
      </div>
    </header>
  );
}
