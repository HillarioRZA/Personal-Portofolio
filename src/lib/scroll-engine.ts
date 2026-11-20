/**
 * Lenis smooth scroll + GSAP ScrollTrigger theme choreography.
 * Ported from the approved preview (module 12), including the critical
 * anti-light-flash guard:
 *  1. Lock :root to THEMES.dark and graphState 0 synchronously on init.
 *  2. Section triggers use onToggle with start 'top 52%' / end 'bottom 52%'.
 *  3. syncActiveSectionTheme() runs after ScrollTrigger.refresh() and
 *     again after fonts settle; scrollY < 100 always enforces dark.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { applyTheme } from './themes';
import type { SceneControl } from './three-background';

export interface ScrollEngine {
  lenis: Lenis | null;
  destroy: () => void;
}

export function initScrollEngine(sceneControl: SceneControl): ScrollEngine {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lock Dark Theme Immediately On Initial Load (anti-flash guard, step 1)
  applyTheme('dark', true, sceneControl);
  sceneControl.targetGraphState = 0;

  gsap.registerPlugin(ScrollTrigger);

  let lenis: Lenis | null = null;
  let tickerFn: ((time: number) => void) | null = null;

  if (!reducedMotion) {
    try {
      lenis = new Lenis({
        duration: 1.12,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // The npm types name this syncTouch; false is the spec's
        // smoothTouch: false, so touch keeps native momentum scrolling.
        syncTouch: false,
      });
      const instance = lenis;
      instance.on('scroll', ScrollTrigger.update);
      tickerFn = (time: number) => {
        instance.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    } catch (err) {
      console.warn('Lenis fallback to native scroll:', err);
      lenis = null;
    }
  }

  // Smooth Anchor Link Scrolling
  const anchorHandlers: Array<{ el: Element; fn: (e: Event) => void }> = [];
  document.querySelectorAll('[data-scroll-link]').forEach((link) => {
    const fn = (e: Event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target as HTMLElement, { offset: -64 });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    };
    link.addEventListener('click', fn);
    anchorHandlers.push({ el: link, fn });
  });

  // Top Scroll Progress Bar
  const progressEl = document.getElementById('scroll-progress');
  const updateProgress = () => {
    if (!progressEl) return;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? Math.min(100, Math.max(0, (window.scrollY / docH) * 100)) : 0;
    progressEl.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (!reducedMotion) {
    // Hero Masked Kinetic Entrance
    gsap.from('.hero-line', {
      yPercent: 105,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power4.out',
      clearProps: 'transform,opacity',
    });

    gsap.from('.reveal-hero', {
      y: 22,
      opacity: 0,
      duration: 0.78,
      stagger: 0.08,
      delay: 0.14,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    });

    // Masked Headline Reveals Across Sections
    document.querySelectorAll('.reveal-mask').forEach((el) => {
      gsap.from(el, {
        yPercent: 105,
        opacity: 0,
        duration: 0.82,
        ease: 'power4.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    // Staggered Content Reveals
    document.querySelectorAll('.reveal-item').forEach((el) => {
      gsap.from(el, {
        y: 26,
        opacity: 0,
        duration: 0.72,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
  }

  // Theme & 3D Graph Morphing per Section (Zero Initial Light-Theme Bug)
  const sections = Array.from(document.querySelectorAll('section[data-theme]'));
  sections.forEach((sec) => {
    const theme = sec.getAttribute('data-theme') || 'dark';
    const graphState = parseInt(sec.getAttribute('data-graph-state') || '0', 10);

    ScrollTrigger.create({
      trigger: sec,
      start: 'top 52%',
      end: 'bottom 52%',
      onToggle: (self) => {
        if (self.isActive) {
          applyTheme(theme, false, sceneControl);
          sceneControl.targetGraphState = graphState;
        }
      },
    });
  });

  // Enforce Correct Theme Based on Actual Scroll Position After Layout Settles
  const syncActiveSectionTheme = () => {
    if (window.scrollY < 100) {
      applyTheme('dark', true, sceneControl);
      sceneControl.targetGraphState = 0;
      return;
    }
    const midY = window.innerHeight * 0.52;
    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= midY && rect.bottom >= midY) {
        applyTheme(sec.getAttribute('data-theme') || 'dark', true, sceneControl);
        sceneControl.targetGraphState = parseInt(sec.getAttribute('data-graph-state') || '0', 10);
        return;
      }
    }
  };

  ScrollTrigger.refresh();
  syncActiveSectionTheme();
  const settleTimer = setTimeout(() => {
    ScrollTrigger.refresh();
    syncActiveSectionTheme();
  }, 350);

  return {
    lenis,
    destroy: () => {
      clearTimeout(settleTimer);
      window.removeEventListener('scroll', updateProgress);
      anchorHandlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
      if (tickerFn) gsap.ticker.remove(tickerFn);
      if (lenis) lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    },
  };
}
