'use client';

import React, { useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/context/LanguageContext';
import type { CapabilityItem } from '@/lib/types';

type CapFilter = 'all' | CapabilityItem['category'];

const FILTERS: Array<{ key: CapFilter; labelKey: string }> = [
  { key: 'all', labelKey: 'stack.tabAll' },
  { key: 'ai', labelKey: 'stack.tabAi' },
  { key: 'db', labelKey: 'stack.tabDb' },
  { key: 'backend', labelKey: 'stack.tabBackend' },
  { key: 'cross', labelKey: 'stack.tabCross' },
];

export default function CapabilitiesMatrix({ capabilities }: { capabilities: CapabilityItem[] }) {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<CapFilter>('all');
  const gridRef = React.useRef<HTMLDivElement>(null);

  const visible =
    filter === 'all' ? capabilities : capabilities.filter((item) => item.category === filter);

  const applyFilter = (next: CapFilter) => {
    if (next === filter) return;
    setFilter(next);
    requestAnimationFrame(() => {
      const cards = gridRef.current?.querySelectorAll('.cap-card');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' },
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
      id="capabilities"
      data-theme="light"
      data-graph-state="4"
      className="py-24 sm:py-36 px-4 sm:px-8 relative"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <h2 className="section-display font-display font-bold text-[var(--fg)]">
              <span className="mask-line">
                <span className="mask-inner reveal-mask">{t('stack.headline')}</span>
              </span>
            </h2>
          </div>

          <div className="reveal-item flex flex-wrap gap-2" role="tablist" aria-label="Filter Capabilities">
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

        <div
          ref={gridRef}
          id="capabilities-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {visible.map((item) => {
            const copy = item[lang] || item.en;
            const tierLabel = lang === 'id' ? item.tierId : item.tierEn;
            const isCore = item.accent === 'core';
            const badgeClass = isCore
              ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]';
            return (
              <article
                key={copy.code + item.category}
                data-tilt
                className="cap-card spotlight-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-[var(--accent)]">
                      {copy.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border font-mono text-[10px] font-semibold tracking-wider ${badgeClass}`}
                    >
                      {tierLabel}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-[var(--fg)] mb-2.5">{copy.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted)]">{copy.desc}</p>
                </div>
                <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => {
                    const isDbHighlight = item.highlightedTags.includes(tag);
                    const tagClass = isDbHighlight
                      ? 'border-[var(--accent)]/50 bg-[var(--accent-soft)] text-[var(--fg)] font-semibold'
                      : 'border-[var(--border)] text-[var(--fg)]/85';
                    return (
                      <span
                        key={tag}
                        className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] ${tagClass}`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
