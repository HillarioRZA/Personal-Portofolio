'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { SystemEntry } from '@/lib/types';

interface Props {
  system: SystemEntry | null;
  onClose: () => void;
}

/**
 * Centered popup Architecture Brief. Closes on ESC, backdrop click, or the
 * close button. While open, body scroll is locked and Lenis is paused through
 * the window event the shell listens to. The panel carries data-lenis-prevent
 * so its own overflow scroll keeps working (wheel and touch) while Lenis is
 * stopped; without it Lenis swallows scroll gestures over the panel.
 */
export default function CaseStudyModal({ system, onClose }: Props) {
  const { lang, t } = useLanguage();
  const isOpen = system !== null;
  const copy = system ? system[lang] || system.en : null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('case-modal', { detail: { open: true } }));
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('case-modal', { detail: { open: false } }));
    };
  }, [isOpen, onClose]);

  return (
    <div
      id="case-modal"
      className={`fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
    >
      <div
        id="case-modal-backdrop"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        id="case-modal-panel"
        data-lenis-prevent
        className={`relative z-10 w-full max-w-2xl max-h-[90dvh] bg-[#060810] text-[#F4F4F7] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-y-auto overscroll-contain p-5 sm:p-10 flex flex-col justify-between transition-all duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
        }`}
      >
        {system && copy && (
          <>
            <div>
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
                <span className="font-mono text-xs uppercase tracking-widest text-[#38BDF8]">
                  ARCHITECTURE BRIEF
                </span>
                <button
                  type="button"
                  id="case-modal-close"
                  data-cursor="Close"
                  data-cursor-en="Close"
                  data-cursor-id="Tutup"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg border border-white/15 font-mono text-xs text-zinc-300 hover:border-[#38BDF8] hover:text-[#38BDF8] transition-colors"
                >
                  ESC ✕
                </button>
              </div>

              <div className="mb-7">
                <div
                  id="modal-status"
                  className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-2"
                >
                  {copy.status}
                </div>
                <h3
                  id="modal-title"
                  className="font-display font-bold text-3xl sm:text-4xl text-white mb-4"
                >
                  {system.title}
                </h3>
                <p id="modal-summary" className="text-sm sm:text-base leading-relaxed text-zinc-300">
                  {copy.summary}
                </p>
              </div>

              <div className="space-y-5 mb-7">
                <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                  <h4
                    id="modal-decisions-heading"
                    className="font-mono text-xs uppercase tracking-widest text-[#38BDF8] mb-3"
                  >
                    {t('modal.decisionsHeading')}
                  </h4>
                  <ul
                    id="modal-decisions"
                    className="space-y-2.5 text-sm text-zinc-300 leading-relaxed"
                  >
                    {copy.decisions.map((d) => (
                      <li key={d} className="flex items-start gap-2.5">
                        <span className="text-[#38BDF8] mt-1 shrink-0">▸</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                  <h4
                    id="modal-audit-heading"
                    className="font-mono text-xs uppercase tracking-widest text-emeraldSignal mb-3"
                  >
                    {t('modal.auditHeading')}
                  </h4>
                  <p id="modal-audit" className="text-sm text-zinc-300 leading-relaxed">
                    {copy.audit}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 block mb-2.5">
                  TECHNICAL STACK
                </span>
                <div id="modal-stack" className="flex flex-wrap gap-2 font-mono text-xs">
                  {system.stack.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md border border-white/15 bg-white/[0.04] text-zinc-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-7 mt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-zinc-500">
              <span>REZA PRATAMA // ARCH AUDIT</span>
              <span id="modal-access-note" className="text-[#38BDF8]">
                {copy.accessNote}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
