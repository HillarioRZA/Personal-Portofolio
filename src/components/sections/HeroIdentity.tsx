'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import type { ProfileContent } from '@/lib/types';

const HeroArchitect3D = dynamic(() => import('@/components/three/HeroArchitect3D'), {
  ssr: false,
});

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_#';

export default function HeroIdentity({ profile }: { profile: ProfileContent }) {
  const { lang, t } = useLanguage();
  const roleRef = useRef<HTMLSpanElement>(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  // Cyber-decrypt role scramble: cycles every 3.8s, 24 frames at 30ms.
  useEffect(() => {
    const el = roleRef.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let roleIndex = 0;
    let scrambleTimer: ReturnType<typeof setInterval> | null = null;

    const scrambleTo = (targetText: string) => {
      let frame = 0;
      const totalFrames = 24;
      if (scrambleTimer) clearInterval(scrambleTimer);
      scrambleTimer = setInterval(() => {
        let output = '';
        const revealedCount = Math.floor((frame / totalFrames) * targetText.length);
        for (let i = 0; i < targetText.length; i++) {
          if (targetText[i] === ' ') output += ' ';
          else if (i < revealedCount) output += targetText[i];
          else output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        el.textContent = output;
        frame++;
        if (frame > totalFrames) {
          if (scrambleTimer) clearInterval(scrambleTimer);
          el.textContent = targetText;
        }
      }, 30);
    };

    const cycle = setInterval(() => {
      roleIndex = (roleIndex + 1) % profile.roles.en.length;
      const list = langRef.current === 'id' ? profile.roles.id : profile.roles.en;
      scrambleTo(list[roleIndex]);
    }, 3800);

    return () => {
      clearInterval(cycle);
      if (scrambleTimer) clearInterval(scrambleTimer);
    };
  }, [profile.roles]);

  // Keep the settled role label in sync when the language flips mid-cycle.
  useEffect(() => {
    if (roleRef.current) {
      const list = lang === 'id' ? profile.roles.id : profile.roles.en;
      roleRef.current.textContent = list[0];
    }
  }, [lang, profile.roles]);

  const workflow = [
    { title: t('identity.w1Title'), desc: t('identity.w1Desc') },
    { title: t('identity.w2Title'), desc: t('identity.w2Desc') },
    { title: t('identity.w3Title'), desc: t('identity.w3Desc') },
  ];

  return (
    <section
      id="hero"
      data-theme="dark"
      data-graph-state="0"
      className="min-h-[100svh] flex flex-col justify-center pt-20 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-8 relative"
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        <div className="reveal-hero w-full max-w-2xl mx-auto mb-2 sm:mb-4">
          <HeroArchitect3D />
        </div>

        <h1 className="font-display font-bold text-[var(--fg)] w-full mb-4 sm:mb-5">
          <span className="mask-line">
            <span className="mask-inner hero-line hero-display">{profile.name}</span>
          </span>
          <span className="mask-line mt-1 sm:mt-1.5">
            <span className="mask-inner hero-line hero-role-display inline-flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3">
              <span className="text-[var(--muted)] font-medium select-none">—</span>
              <span ref={roleRef} id="role-scramble" className="gradient-ink uppercase">
                {profile.roles.en[0]}
              </span>
            </span>
          </span>
        </h1>

        <p className="reveal-hero font-display font-medium text-base sm:text-xl lg:text-2xl text-[var(--fg)]/90 tracking-tight max-w-2xl mb-5">
          {t('hero.tagline')}
        </p>

        <div className="reveal-hero space-y-3 text-sm sm:text-base leading-relaxed text-[var(--muted)] max-w-2xl mb-7">
          <p>{t('identity.p1')}</p>
          <p>{t('identity.p2')}</p>
        </div>

        <div className="reveal-hero flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3.5 w-full sm:w-auto mb-10">
          <a
            href="#astraea"
            data-scroll-link
            data-magnetic
            data-cursor="Inspect"
            data-cursor-en="Inspect"
            data-cursor-id="Bedah"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-xl font-mono text-xs sm:text-sm font-semibold tracking-wide bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:opacity-90 transition-all shadow-[0_12px_32px_-8px_rgba(56,189,248,0.35)]"
          >
            <span>{t('hero.ctaPrimary')}</span>
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>

          <a
            href="#systems"
            data-scroll-link
            data-magnetic
            data-cursor="Systems"
            data-cursor-en="Systems"
            data-cursor-id="Sistem"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-xl font-mono text-xs sm:text-sm font-medium tracking-wide border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] backdrop-blur-md transition-all"
          >
            <span>{t('hero.ctaSecondary')}</span>
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        <div className="reveal-hero grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-3xl text-left">
          {workflow.map((w) => (
            <div key={w.title} data-tilt className="spotlight-card p-4 rounded-xl">
              <div className="font-display font-semibold text-sm text-[var(--fg)] mb-1">{w.title}</div>
              <p className="text-xs leading-relaxed text-[var(--muted)]">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
