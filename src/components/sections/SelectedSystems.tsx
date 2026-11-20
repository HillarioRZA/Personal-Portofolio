'use client';

import React, { useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';
import type { SystemCategory, SystemEntry } from '@/lib/types';

const BADGE_CLASSES: Record<SystemEntry['badgeTone'], string> = {
  amber: 'border-amber-400/35 bg-amber-400/10 text-amber-300',
  zinc: 'border-zinc-400/35 bg-zinc-400/10 text-zinc-300',
  emerald: 'border-emeraldSignal/40 bg-emeraldSignal/10 text-emeraldSignal',
  cyan: 'border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent)]',
};

const FILTERS: Array<{ key: 'all' | SystemCategory; labelKey: string }> = [
  { key: 'all', labelKey: 'systems.filterAll' },
  { key: 'ai', labelKey: 'systems.filterAi' },
  { key: 'security', labelKey: 'systems.filterSec' },
  { key: 'dsp', labelKey: 'systems.filterDsp' },
];

interface Props {
  systems: SystemEntry[];
  onOpenCase: (system: SystemEntry) => void;
}

export default function SelectedSystems({ systems, onOpenCase }: Props) {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<'all' | SystemCategory>('all');
  const gridRef = React.useRef<HTMLDivElement>(null);

  const visible = systems.filter((s) => filter === 'all' || s.category === filter);

  const applyFilter = (next: 'all' | SystemCategory) => {
    if (next === filter) return;
    setFilter(next);
    requestAnimationFrame(() => {
      const cards = gridRef.current?.querySelectorAll('[data-sys-card]');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 18, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.07, ease: 'power3.out', clearProps: 'transform' },
        );
      }
      ScrollTrigger.refresh();
    });
  };

  const pillBase =
    'filter-pill px-3.5 py-2 min-h-[40px] rounded-xl border border-[var(--border)] font-mono text-[11px] uppercase tracking-wider';
  const pillIdle = 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)]';

  return (
    <section
      id="systems"
      data-theme="obsidian"
      data-graph-state="3"
      className="py-24 sm:py-36 px-4 sm:px-8 relative"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <h2 className="section-display font-display font-bold text-[var(--fg)]">
              <span className="mask-line">
                <span className="mask-inner reveal-mask">{t('systems.headline')}</span>
              </span>
            </h2>
          </div>

          <div className="reveal-item flex flex-wrap gap-2" role="tablist" aria-label="Filter Systems">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => applyFilter(f.key)}
                className={`${pillBase} ${filter === f.key ? 'is-active' : pillIdle}`}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div ref={gridRef} id="systems-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {visible.map((system) => {
            const copy = system[lang] || system.en;
            return (
              <article
                key={system.slug}
                role="button"
                tabIndex={0}
                data-tilt
                data-sys-card
                data-cursor="Case Study"
                data-cursor-en="Case Study"
                data-cursor-id="Studi Kasus"
                onClick={() => onOpenCase(system)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenCase(system);
                  }
                }}
                className="spotlight-card group rounded-2xl p-6 sm:p-7 text-left flex flex-col justify-between gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider">
                    <span className="text-[var(--accent)]">{system.categoryLabel}</span>
                    <span className={`px-2 py-0.5 rounded border ${BADGE_CLASSES[system.badgeTone]}`}>
                      {system.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-2xl sm:text-3xl text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-2.5">
                      {system.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">{copy.cardDesc}</p>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl bg-black/25 border-l-2 ${
                      system.slug === 'sonora' ? 'border-emeraldSignal' : 'border-[var(--accent)]'
                    } text-xs italic text-[var(--fg)]/80`}
                  >
                    {copy.cardNote}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-[var(--muted)]">
                    {system.cardTags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-md border border-[var(--border)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                    <span>{t('systems.openBrief')}</span>
                    <span className="transform group-hover:translate-x-1.5 transition-transform">→</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
