'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { PhilosophyContent } from '@/lib/types';

const ICONS: Record<string, React.ReactNode> = {
  hexagon: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </>
  ),
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  ),
  code: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  ),
};

export default function Approach({ philosophy }: { philosophy: PhilosophyContent }) {
  const { lang } = useLanguage();
  const copy = philosophy[lang] || philosophy.en;

  return (
    <section
      id="approach"
      data-theme="light"
      data-graph-state="1"
      className="py-24 sm:py-36 px-4 sm:px-8 relative"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-14 sm:mb-20">
          <h2 className="section-display font-display font-bold text-[var(--fg)] mb-5">
            <span className="mask-line">
              <span className="mask-inner reveal-mask">{copy.headline1}</span>
            </span>
            <span className="mask-line">
              <span className="mask-inner reveal-mask">{copy.headline2}</span>
            </span>
          </h2>
          <p className="reveal-item text-sm sm:text-lg lg:text-xl leading-relaxed text-[var(--muted)] max-w-2xl">
            {copy.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {copy.pillars.map((pillar, i) => {
            const meta = philosophy.pillarMeta[i];
            return (
              <article
                key={meta.code}
                data-tilt
                className="reveal-item spotlight-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[var(--accent)]">
                      {meta.code}
                    </span>
                    <div className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        {ICONS[meta.icon]}
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[var(--fg)] mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-[var(--muted)]">
                    {pillar.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--border)] font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  {meta.footer}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
