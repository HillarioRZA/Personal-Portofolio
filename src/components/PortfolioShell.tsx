'use client';

/**
 * Master client orchestrator. Owns the shared scene control object, the
 * Lenis + GSAP scroll engine (inside gsap.context, reverted on unmount),
 * tactile card effects, the case-study modal state, and the copy-email
 * toast. Every initializer is isolated in try/catch so one failing module
 * never breaks the rest of the page.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { initScrollEngine, type ScrollEngine } from '@/lib/scroll-engine';
import { bindCardEffects, initTactileInteractions } from '@/lib/tactile';
import type { SceneControl } from '@/lib/three-background';
import type { PortfolioContent, SystemEntry } from '@/lib/types';
import Navbar from '@/components/ui/Navbar';
import CustomCursor from '@/components/ui/CustomCursor';
import CaseStudyModal from '@/components/ui/CaseStudyModal';
import Toast, { type ToastHandle } from '@/components/ui/Toast';
import HeroIdentity from '@/components/sections/HeroIdentity';
import Approach from '@/components/sections/Approach';
import AstraeaSpotlight from '@/components/sections/AstraeaSpotlight';
import SelectedSystems from '@/components/sections/SelectedSystems';
import CapabilitiesMatrix from '@/components/sections/CapabilitiesMatrix';
import ContactFooter from '@/components/sections/ContactFooter';

const ThreeBackground = dynamic(() => import('@/components/three/ThreeBackground'), {
  ssr: false,
});

function ShellInner({ content }: { content: PortfolioContent }) {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<ToastHandle>(null);
  const lenisRef = useRef<ScrollEngine['lenis']>(null);
  const [sceneControl] = useState<SceneControl>(() => ({ targetGraphState: 0, isLight: false }));
  const [activeCase, setActiveCase] = useState<SystemEntry | null>(null);

  const closeCase = useCallback(() => setActiveCase(null), []);
  const openCase = useCallback((system: SystemEntry) => setActiveCase(system), []);

  useEffect(() => {
    let engine: ScrollEngine | null = null;
    let untactile: (() => void) | undefined;

    const ctx = gsap.context(() => {
      try {
        engine = initScrollEngine(sceneControl);
        lenisRef.current = engine.lenis;
      } catch (err) {
        console.error('Scroll engine init warning:', err);
      }
      try {
        untactile = initTactileInteractions(document);
      } catch (err) {
        console.error('Tactile init warning:', err);
      }
    }, rootRef);

    // Cards mounted later (filter changes) still need spotlight binding.
    const observer = new MutationObserver(() => {
      try {
        bindCardEffects(document);
      } catch {
        // Binding is best-effort; a failure here must not break the page.
      }
    });
    if (rootRef.current) observer.observe(rootRef.current, { childList: true, subtree: true });

    const onModalToggle = (e: Event) => {
      const open = (e as CustomEvent<{ open: boolean }>).detail?.open;
      if (!lenisRef.current) return;
      if (open) lenisRef.current.stop();
      else lenisRef.current.start();
    };
    window.addEventListener('case-modal', onModalToggle);

    return () => {
      window.removeEventListener('case-modal', onModalToggle);
      observer.disconnect();
      if (untactile) untactile();
      if (engine) engine.destroy();
      lenisRef.current = null;
      ctx.revert();
    };
  }, [sceneControl]);

  // Clipboard copy with the original iframe-safe execCommand fallback.
  const copyEmail = useCallback(async () => {
    const email = content.profile.email;
    let copied = false;
    try {
      await navigator.clipboard.writeText(email);
      copied = true;
    } catch {
      copied = false;
    }
    if (!copied) {
      const tempInput = document.createElement('textarea');
      tempInput.value = email;
      tempInput.setAttribute('readonly', '');
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.warn('Clipboard copy fallback failed:', err);
      }
      document.body.removeChild(tempInput);
    }
    toastRef.current?.show(t('toast.copied'));
  }, [content.profile.email, t]);

  return (
    <div ref={rootRef} className="relative">
      <div className="fixed top-0 left-0 w-full h-[2px] z-[75] pointer-events-none bg-transparent">
        <div
          id="scroll-progress"
          className="h-full w-0 bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#10B981]"
        />
      </div>

      <div id="ambient-backdrop" aria-hidden="true">
        <div id="aurora-orb-1" className="aurora-orb" />
        <div id="aurora-orb-2" className="aurora-orb" />
        <div id="micro-grid" />
      </div>

      <ThreeBackground sceneControl={sceneControl} />
      <CustomCursor />
      <Navbar profile={content.profile} />

      <main className="relative z-10">
        <HeroIdentity profile={content.profile} />
        <Approach philosophy={content.philosophy} />
        <AstraeaSpotlight astraea={content.astraea} />
        <SelectedSystems systems={content.systems} onOpenCase={openCase} />
        <CapabilitiesMatrix capabilities={content.capabilities} />
        <ContactFooter profile={content.profile} onCopyEmail={copyEmail} />
      </main>

      <CaseStudyModal system={activeCase} onClose={closeCase} />
      <Toast ref={toastRef} />
    </div>
  );
}

export default function PortfolioShell({ content }: { content: PortfolioContent }) {
  return (
    <LanguageProvider translations={content.translations}>
      <ShellInner content={content} />
    </LanguageProvider>
  );
}
