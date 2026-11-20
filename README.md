# Reza Pratama Portfolio

Personal portfolio of Reza Pratama, AI Systems Engineer. Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS 3. The design specification lives in `design.md` and is the source of truth for layout, motion, and the Three.js scenes.

## Run it

```bash
npm install
npm run dev      # local development at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## Edit content

All text, links, projects, and skills live in the top-level `content/` folder. You never need to touch React or Three.js code to update the site. A server-only loader (`src/lib/content.ts`) reads the files, validates them with Zod, and passes typed props to the components.

```text
content/
├── site/
│   ├── profile.json       # name, role ticker list, email, GitHub, LinkedIn, footer
│   ├── philosophy.json    # Approach headline and the 3 engineering pillars (EN/ID)
│   ├── astraea.json       # AstraeaADK copy, badges, 4 feature cards, 5 pipeline stages
│   ├── capabilities.json  # capability and database matrix cards (EN/ID)
│   └── translations.json  # EN/ID dictionary for nav, hero, systems, stack, contact, toast, modal
└── systems/
    ├── sovereign-os.mdx
    ├── aegis-shield.mdx
    └── sonora.mdx
```

Every content file carries both locales. Keep the `en` and `id` blocks in sync when you edit, or the language switch will show a mix.

### Add a project

1. Copy any file in `content/systems/` and rename it, for example `my-project.mdx`.
2. Edit the frontmatter: `slug`, `order` (controls card position), `category` (`ai`, `security`, `dsp`, or `backend`), `categoryLabel`, `badge`, `badgeTone` (`amber`, `zinc`, `emerald`, or `cyan`), `title`, `stack`, `cardTags`, and the `en` / `id` blocks (`status`, `cardDesc`, `cardNote`, `summary`, `decisions`, `audit`, `accessNote`).
3. Rebuild. The card appears in Selected Systems and the slide-over brief reads from the same frontmatter. No component changes needed.

Note: the systems filter pills cover `ai`, `security`, and `dsp`. A project filed under `backend` shows in the "All Systems" view only, unless you add a pill in `src/components/sections/SelectedSystems.tsx`.

### Add a capability card

Append one object to the array in `content/site/capabilities.json` with `category`, `accent` (`core` or `working`), `tierEn`, `tierId`, `tags`, `highlightedTags` (rendered with the accent tint, used for the database names), and `en` / `id` blocks with `code`, `title`, and `desc`.

## Structure

```text
├── design.md                  # design and engineering specification
├── content/                   # all editable content (see above)
└── src/
    ├── app/
    │   ├── layout.tsx         # next/font (Space Grotesk, Plus Jakarta Sans, JetBrains Mono), SEO/OG metadata
    │   ├── page.tsx           # Server Component: loads content, renders the shell
    │   └── globals.css        # theme variables, fluid type scales, spotlight/tilt/cursor CSS
    ├── lib/
    │   ├── content.ts         # server-only loader: fs + gray-matter + Zod
    │   ├── types.ts           # shared content types
    │   ├── themes.ts          # Kinetic Editorial tokens (dark, obsidian, light)
    │   ├── three-background.ts  # fixed neural core and morphing graph (6 formations)
    │   ├── three-architect.ts   # frameless hero 3D workstation with typing figure
    │   ├── scroll-engine.ts   # Lenis + GSAP ScrollTrigger theme sync, anti-flash guard
    │   ├── tactile.ts         # spotlight tracking, card tilt, magnetic buttons
    │   └── cursor.ts          # desktop contextual cursor
    ├── context/
    │   └── LanguageContext.tsx  # reactive EN | ID store
    └── components/
        ├── PortfolioShell.tsx   # client orchestrator: scroll engine, modal state, toast
        ├── three/               # WebGL wrappers, loaded with ssr: false
        ├── ui/                  # Navbar, CustomCursor, CaseStudyModal, Toast
        └── sections/            # HeroIdentity, Approach, AstraeaSpotlight,
                                 # SelectedSystems, CapabilitiesMatrix, ContactFooter
```

## Notes for maintainers

- The Three.js scenes load through `next/dynamic` with `ssr: false` and dispose their geometries, materials, and renderers on unmount, so React StrictMode double-mounting stays clean.
- Theme changes are scroll-driven. The dark theme is locked synchronously on mount before ScrollTriggers register, which prevents a flash of the light theme on first load.
- Both WebGL loops skip rendering while the tab is hidden, and `prefers-reduced-motion` disables Lenis smoothing, the role scramble, and the GSAP entrance transforms.
