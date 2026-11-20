/**
 * Kinetic Editorial theme tokens (dark / obsidian / light), ported verbatim
 * from the approved preview (module 5). Values are CSS custom properties
 * applied to document.documentElement.
 */
import gsap from 'gsap';
import type { SceneControl } from './three-background';

export type ThemeKey = 'dark' | 'obsidian' | 'light';

export const THEMES: Record<ThemeKey, Record<string, string>> = {
  dark: {
    '--bg': '#05060A',
    '--fg': '#F4F4F7',
    '--muted': '#9CA3AF',
    '--surface': 'rgba(255, 255, 255, 0.032)',
    '--surface-hover': 'rgba(255, 255, 255, 0.068)',
    '--border': 'rgba(255, 255, 255, 0.09)',
    '--border-strong': 'rgba(56, 189, 248, 0.38)',
    '--accent': '#38BDF8',
    '--accent-2': '#818CF8',
    '--accent-soft': 'rgba(56, 189, 248, 0.13)',
    '--nav-bg': 'rgba(5, 6, 10, 0.74)',
    '--btn-primary-bg': '#F4F4F7',
    '--btn-primary-fg': '#05060A',
    '--aurora-1': 'rgba(56, 189, 248, 0.14)',
    '--aurora-2': 'rgba(99, 102, 241, 0.12)',
    '--grid-line': 'rgba(255, 255, 255, 0.035)',
    '--spotlight-color': 'rgba(56, 189, 248, 0.16)',
  },
  obsidian: {
    '--bg': '#090C12',
    '--fg': '#F4F4F7',
    '--muted': '#9CA3AF',
    '--surface': 'rgba(255, 255, 255, 0.034)',
    '--surface-hover': 'rgba(255, 255, 255, 0.07)',
    '--border': 'rgba(255, 255, 255, 0.1)',
    '--border-strong': 'rgba(56, 189, 248, 0.4)',
    '--accent': '#38BDF8',
    '--accent-2': '#10B981',
    '--accent-soft': 'rgba(56, 189, 248, 0.13)',
    '--nav-bg': 'rgba(9, 12, 18, 0.78)',
    '--btn-primary-bg': '#F4F4F7',
    '--btn-primary-fg': '#090C12',
    '--aurora-1': 'rgba(16, 185, 129, 0.11)',
    '--aurora-2': 'rgba(56, 189, 248, 0.12)',
    '--grid-line': 'rgba(255, 255, 255, 0.036)',
    '--spotlight-color': 'rgba(56, 189, 248, 0.16)',
  },
  light: {
    '--bg': '#F3F4F0',
    '--fg': '#0B0E14',
    '--muted': '#4B5563',
    '--surface': 'rgba(255, 255, 255, 0.64)',
    '--surface-hover': 'rgba(255, 255, 255, 0.92)',
    '--border': 'rgba(11, 14, 20, 0.11)',
    '--border-strong': 'rgba(2, 132, 199, 0.42)',
    '--accent': '#0284C7',
    '--accent-2': '#4F46E5',
    '--accent-soft': 'rgba(2, 132, 199, 0.11)',
    '--nav-bg': 'rgba(243, 244, 240, 0.84)',
    '--btn-primary-bg': '#0B0E14',
    '--btn-primary-fg': '#F4F4F7',
    '--aurora-1': 'rgba(2, 132, 199, 0.09)',
    '--aurora-2': 'rgba(79, 70, 229, 0.07)',
    '--grid-line': 'rgba(11, 14, 20, 0.045)',
    '--spotlight-color': 'rgba(2, 132, 199, 0.11)',
  },
};

export function applyTheme(themeKey: string, instant: boolean, sceneControl: SceneControl) {
  const tokens = THEMES[themeKey as ThemeKey] || THEMES.dark;
  sceneControl.isLight = themeKey === 'light';

  if (!instant) {
    gsap.to(document.documentElement, {
      ...tokens,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  } else {
    gsap.killTweensOf(document.documentElement);
    Object.entries(tokens).forEach(([prop, val]) => {
      document.documentElement.style.setProperty(prop, val);
    });
  }
}
