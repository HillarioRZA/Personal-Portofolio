'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { ProfileContent } from '@/lib/types';

interface Props {
  profile: ProfileContent;
  onCopyEmail: () => void;
}

export default function ContactFooter({ profile, onCopyEmail }: Props) {
  const { t } = useLanguage();

  return (
    <section
      id="contact"
      data-theme="dark"
      data-graph-state="5"
      className="min-h-[82svh] flex flex-col justify-between pt-24 sm:pt-32 pb-8 sm:pb-10 px-4 sm:px-8 relative"
    >
      <div className="max-w-4xl mx-auto w-full text-center my-auto py-8 sm:py-12">
        <h2 className="section-display font-display font-bold text-[var(--fg)] mb-6">
          <span className="mask-line">
            <span className="mask-inner reveal-mask">{t('contact.headline1')}</span>
          </span>
          <span className="mask-line">
            <span className="mask-inner reveal-mask gradient-ink">{t('contact.headline2')}</span>
          </span>
        </h2>

        <p className="reveal-item text-sm sm:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-9 leading-relaxed">
          {t('contact.subcopy')}
        </p>

        <div className="reveal-item flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3.5">
          <button
            type="button"
            id="copy-email-btn"
            data-magnetic
            data-cursor="Copy Email"
            data-cursor-en="Copy Email"
            data-cursor-id="Salin Email"
            onClick={onCopyEmail}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-xl font-mono text-xs sm:text-sm font-semibold tracking-wide bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:opacity-90 transition-all shadow-[0_12px_32px_-8px_rgba(56,189,248,0.35)]"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            <span>{t('contact.copyEmail')}</span>
            <span className="opacity-65 hidden sm:inline">· {profile.email}</span>
          </button>

          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            data-magnetic
            data-cursor="View Repo ↗"
            data-cursor-en="View Repo ↗"
            data-cursor-id="Buka GitHub ↗"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl font-mono text-xs sm:text-sm font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] backdrop-blur-md transition-all"
          >
            <span>{profile.githubLabel}</span>
            <span>↗</span>
          </a>

          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            data-magnetic
            data-cursor="LinkedIn ↗"
            data-cursor-en="LinkedIn ↗"
            data-cursor-id="LinkedIn ↗"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl font-mono text-xs sm:text-sm font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] backdrop-blur-md transition-all"
          >
            <span>LinkedIn</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      <footer className="max-w-7xl mx-auto w-full pt-7 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[var(--muted)]">
        <div>{profile.footerLeft}</div>
        <div className="text-center sm:text-right">{profile.footerRight}</div>
      </footer>
    </section>
  );
}
