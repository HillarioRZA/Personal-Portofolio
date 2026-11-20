/**
 * Shared content types. The Zod schemas in src/lib/content.ts validate the
 * files under content/ against these shapes at load time.
 */

export type Lang = 'en' | 'id';

export interface Localized<T> {
  en: T;
  id: T;
}

export type TranslationDict = Record<string, string>;
export type Translations = Localized<TranslationDict>;

export interface ProfileContent {
  name: string;
  brand: string;
  roles: Localized<string[]>;
  email: string;
  github: string;
  githubLabel: string;
  linkedin: string;
  footerLeft: string;
  footerRight: string;
  nav: Array<{
    href: string;
    key: string;
    cursor: Localized<string>;
  }>;
}

export interface PhilosophyCopy {
  headline1: string;
  headline2: string;
  intro: string;
  pillars: Array<{ title: string; desc: string }>;
}

export interface PhilosophyContent extends Localized<PhilosophyCopy> {
  pillarMeta: Array<{ code: string; footer: string; icon: string }>;
}

export interface PipelineStage {
  title: string;
  badge: string;
  desc: string;
  contract: string;
}

export type PipelineData = Record<string, Localized<PipelineStage>>;

export interface AstraeaCopy {
  tagline: string;
  problemLabel: string;
  problemBody: string;
  ctaRepo: string;
  ctaFlow: string;
  pipelineEyebrow: string;
  pipelineHint: string;
  features: Array<{ title: string; desc: string }>;
}

export interface AstraeaContent extends Localized<AstraeaCopy> {
  name: string;
  repo: string;
  badges: string[];
  featureMeta: Array<{ code: string; footer: string }>;
  pipelineOrder: string[];
  pipelineNodes: Array<{ key: string; num: string; label: string }>;
  pipeline: PipelineData;
}

export interface CapabilityItem {
  category: 'ai' | 'db' | 'backend' | 'cross';
  accent: 'core' | 'working';
  tierEn: string;
  tierId: string;
  tags: string[];
  highlightedTags: string[];
  en: { code: string; title: string; desc: string };
  id: { code: string; title: string; desc: string };
}

export type SystemCategory = 'ai' | 'security' | 'dsp' | 'backend';
export type BadgeTone = 'amber' | 'zinc' | 'emerald' | 'cyan';

export interface SystemCopy {
  status: string;
  cardDesc: string;
  cardNote: string;
  summary: string;
  decisions: string[];
  audit: string;
  accessNote: string;
}

export interface SystemEntry extends Localized<SystemCopy> {
  slug: string;
  order: number;
  category: SystemCategory;
  categoryLabel: string;
  badge: string;
  badgeTone: BadgeTone;
  title: string;
  stack: string[];
  cardTags: string[];
}

export interface PortfolioContent {
  profile: ProfileContent;
  philosophy: PhilosophyContent;
  astraea: AstraeaContent;
  capabilities: CapabilityItem[];
  systems: SystemEntry[];
  translations: Translations;
}
