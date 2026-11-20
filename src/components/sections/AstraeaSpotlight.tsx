'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { AstraeaContent } from '@/lib/types';

export default function AstraeaSpotlight({ astraea }: { astraea: AstraeaContent }) {
  const { lang } = useLanguage();
  const copy = astraea[lang] || astraea.en;
  const [activeNode, setActiveNode] = useState(astraea.pipelineOrder[0] || 'input');

  const stage = astraea.pipeline[activeNode];
  const stageCopy = stage ? stage[lang] || stage.en : null;

  return (
    <section
      id="astraea"
      data-theme="dark"
      data-graph-state="2"
      className="py-24 sm:py-36 px-4 sm:px-8 relative"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div>
              <h2 className="section-display font-display font-bold text-[var(--fg)] mb-4">
                <span className="mask-line">
                  <span className="mask-inner reveal-mask gradient-ink">{astraea.name}</span>
                </span>
              </h2>
              <div className="reveal-item flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span className="px-2.5 py-1 rounded-md border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold">
                  {astraea.badges[0]}
                </span>
                <span className="px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)]">
                  {astraea.badges[1]}
                </span>
                <span className="px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]">
                  {astraea.badges[2]}
                </span>
              </div>
            </div>

            <p className="reveal-item text-base sm:text-xl font-medium leading-snug text-[var(--fg)]">
              {copy.tagline}
            </p>

            <div className="reveal-item spotlight-card p-5 rounded-2xl">
              <div className="font-mono text-[11px] uppercase tracking-widest text-[var(--accent)] mb-2">
                {copy.problemLabel}
              </div>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{copy.problemBody}</p>
            </div>

            <div className="reveal-item flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
              <a
                href={astraea.repo}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                data-cursor="View Repo ↗"
                data-cursor-en="View Repo ↗"
                data-cursor-id="Buka Repo ↗"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[46px] rounded-xl font-mono text-xs font-semibold tracking-wide bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:opacity-90 transition-all"
              >
                <span>{copy.ctaRepo}</span>
                <span>↗</span>
              </a>

              <a
                href="#pipeline-inspector"
                data-scroll-link
                data-cursor="Inspect Flow"
                data-cursor-en="Inspect Flow"
                data-cursor-id="Lihat Alur"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[46px] rounded-xl font-mono text-xs font-medium tracking-wide border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                <span>{copy.ctaFlow}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 min-w-0">
            <div id="pipeline-inspector" className="reveal-item spotlight-card p-5 sm:p-8 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="min-w-0">
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[var(--accent)] block mb-1">
                    {copy.pipelineEyebrow}
                  </span>
                  <h3 className="font-display font-semibold text-base sm:text-xl text-[var(--fg)]">
                    {copy.pipelineHint}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-emeraldSignal px-2.5 py-1 rounded-full bg-emeraldSignal/10 border border-emeraldSignal/25 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emeraldSignal animate-pulse" />
                  LIVE TRACE
                </span>
              </div>

              <div className="relative py-1">
                <svg
                  className="hidden sm:block absolute top-1/2 left-4 right-4 w-[calc(100%-2rem)] h-6 -translate-y-1/2 pointer-events-none z-0"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <line x1="0%" y1="12" x2="100%" y2="12" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
                  <line x1="0%" y1="12" x2="100%" y2="12" stroke="#38BDF8" strokeWidth="2" className="pipeline-flow-line" />
                </svg>

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {astraea.pipelineNodes.map((node) => (
                    <button
                      key={node.key}
                      type="button"
                      data-cursor={`Stage ${node.num}`}
                      data-cursor-en={`Stage ${node.num}`}
                      data-cursor-id={`Tahap ${node.num}`}
                      onClick={() => setActiveNode(node.key)}
                      onMouseEnter={() => setActiveNode(node.key)}
                      className={`pipeline-node text-left sm:text-center px-3.5 py-3 min-h-[46px] rounded-xl border border-[var(--border)] bg-[#060810]/95 flex sm:flex-col items-center justify-between sm:justify-center gap-1.5 ${
                        activeNode === node.key ? 'is-active' : ''
                      }`}
                    >
                      <span className="font-mono text-[10px] text-[var(--accent)]">{node.num}</span>
                      <span className="font-mono text-xs font-semibold text-[var(--fg)] leading-tight">
                        {node.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {stageCopy && (
                <div className="mt-5 p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[#05060A]/80 font-mono">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--border)]">
                    <span
                      id="inspector-title"
                      className="text-[11px] sm:text-xs font-semibold text-[var(--accent)] break-words"
                    >
                      {stageCopy.title}
                    </span>
                    <span
                      id="inspector-badge"
                      className="text-[10px] px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
                    >
                      {stageCopy.badge}
                    </span>
                  </div>
                  <p
                    id="inspector-desc"
                    className="font-sans text-xs sm:text-sm leading-relaxed text-[var(--muted)] mb-3"
                  >
                    {stageCopy.desc}
                  </p>
                  <div
                    id="inspector-contract"
                    className="text-[10px] sm:text-[11px] text-emeraldSignal/95 overflow-x-auto pb-1"
                  >
                    {stageCopy.contract}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {copy.features.map((feature, i) => {
                const meta = astraea.featureMeta[i];
                return (
                  <div
                    key={meta.code}
                    data-tilt
                    className="reveal-item spotlight-card p-6 rounded-2xl flex flex-col justify-between gap-4"
                  >
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] block mb-3">
                        {meta.code}
                      </span>
                      <h4 className="font-display font-semibold text-lg text-[var(--fg)] mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-[var(--muted)]">{feature.desc}</p>
                    </div>
                    <div className="font-mono text-[11px] text-[var(--muted)] pt-3 border-t border-[var(--border)]">
                      {meta.footer}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
