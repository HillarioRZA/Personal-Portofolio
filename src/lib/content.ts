import 'server-only';

/**
 * Server-only content loader. Reads content/ with fs, parses systems/*.mdx
 * frontmatter with gray-matter, and validates everything with Zod.
 * Called once from src/app/page.tsx; typed props flow to client components.
 * To add a project, drop one new .mdx file into content/systems/.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import type { PortfolioContent } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

const localized = <T extends z.ZodTypeAny>(schema: T) => z.object({ en: schema, id: schema });

const translationDict = z.record(z.string(), z.string());

const profileSchema = z.object({
  name: z.string(),
  brand: z.string(),
  roles: localized(z.array(z.string())),
  email: z.string().email(),
  github: z.string().url(),
  githubLabel: z.string(),
  linkedin: z.string().url(),
  footerLeft: z.string(),
  footerRight: z.string(),
  nav: z.array(
    z.object({
      href: z.string(),
      key: z.string(),
      cursor: localized(z.string()),
    }),
  ),
});

const philosophyCopy = z.object({
  headline1: z.string(),
  headline2: z.string(),
  intro: z.string(),
  pillars: z.array(z.object({ title: z.string(), desc: z.string() })),
});

const philosophySchema = z.object({
  en: philosophyCopy,
  id: philosophyCopy,
  pillarMeta: z.array(z.object({ code: z.string(), footer: z.string(), icon: z.string() })),
});

const pipelineStage = z.object({
  title: z.string(),
  badge: z.string(),
  desc: z.string(),
  contract: z.string(),
});

const astraeaCopy = z.object({
  tagline: z.string(),
  problemLabel: z.string(),
  problemBody: z.string(),
  ctaRepo: z.string(),
  ctaFlow: z.string(),
  pipelineEyebrow: z.string(),
  pipelineHint: z.string(),
  features: z.array(z.object({ title: z.string(), desc: z.string() })),
});

const astraeaSchema = z.object({
  en: astraeaCopy,
  id: astraeaCopy,
  name: z.string(),
  repo: z.string().url(),
  badges: z.array(z.string()),
  featureMeta: z.array(z.object({ code: z.string(), footer: z.string() })),
  pipelineOrder: z.array(z.string()),
  pipelineNodes: z.array(z.object({ key: z.string(), num: z.string(), label: z.string() })),
  pipeline: z.record(z.string(), localized(pipelineStage)),
});

const capabilitySchema = z.object({
  category: z.enum(['ai', 'db', 'backend', 'cross']),
  accent: z.enum(['core', 'working']),
  tierEn: z.string(),
  tierId: z.string(),
  tags: z.array(z.string()),
  highlightedTags: z.array(z.string()),
  en: z.object({ code: z.string(), title: z.string(), desc: z.string() }),
  id: z.object({ code: z.string(), title: z.string(), desc: z.string() }),
});

const systemCopy = z.object({
  status: z.string(),
  cardDesc: z.string(),
  cardNote: z.string(),
  summary: z.string(),
  decisions: z.array(z.string()),
  audit: z.string(),
  accessNote: z.string(),
});

const systemSchema = z.object({
  slug: z.string(),
  order: z.number(),
  category: z.enum(['ai', 'security', 'dsp', 'backend']),
  categoryLabel: z.string(),
  badge: z.string(),
  badgeTone: z.enum(['amber', 'zinc', 'emerald', 'cyan']),
  title: z.string(),
  stack: z.array(z.string()),
  cardTags: z.array(z.string()),
  simHref: z.string().optional(),
  en: systemCopy,
  id: systemCopy,
});

function readJson(relativePath: string): unknown {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, relativePath), 'utf8');
  return JSON.parse(raw);
}

function loadSystems() {
  const dir = path.join(CONTENT_DIR, 'systems');
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .sort();
  const systems = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { data } = matter(raw);
    return systemSchema.parse(data);
  });
  return systems.sort((a, b) => a.order - b.order);
}

export function loadPortfolioContent(): PortfolioContent {
  return {
    profile: profileSchema.parse(readJson('site/profile.json')) as PortfolioContent['profile'],
    philosophy: philosophySchema.parse(
      readJson('site/philosophy.json'),
    ) as PortfolioContent['philosophy'],
    astraea: astraeaSchema.parse(readJson('site/astraea.json')) as PortfolioContent['astraea'],
    capabilities: z.array(capabilitySchema).parse(
      readJson('site/capabilities.json'),
    ) as PortfolioContent['capabilities'],
    systems: loadSystems() as PortfolioContent['systems'],
    translations: localized(translationDict).parse(
      readJson('site/translations.json'),
    ) as PortfolioContent['translations'],
  };
}
