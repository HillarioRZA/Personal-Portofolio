# Design & Engineering Specification — Reza Pratama Portfolio (Next.js Edition)

> **Target Executor:** AI Coding Agent (Antigravity)  
> **Document Purpose:** Single source of truth for building a production-ready, content-driven AI Systems Engineer portfolio in **Next.js (App Router)** translated directly from the approved interactive preview.  
> **Aesthetic Direction:** **Kinetic Editorial** — high-contrast scroll-driven theme shifting (`Deep Cosmic Obsidian` ↔ `Midnight Carbon` ↔ `Editorial Off-White`) paired with a persistent 3D multi-agent neural core and a frameless 3D workstation hero.

---

## 1. Stack & Content-First Next.js Architecture

### Primary Stack: **Next.js (App Router) + React + TypeScript + Tailwind CSS**
- **Server-First Content Loading:** All portfolio copy, bilingual data, skills, and project case studies live in a top-level `content/` folder as clean `.json` and `.mdx` files. `src/app/page.tsx` (Server Component) reads and validates them with **Zod** + **`gray-matter`** at build/request time and passes strongly typed props to client components.
- **Isolated Client WebGL & Motion Islands:** Three.js canvases (`ThreeBackground`, `HeroArchitect3D`) are wrapped in `'use client'` components loaded via `next/dynamic(..., { ssr: false })` to guarantee zero SSR hydration issues and clean fallback if WebGL is unavailable.
- **Zero-CLS Fonts:** Load `Space Grotesk`, `Plus Jakarta Sans`, and `JetBrains Mono` via `next/font/google` in `src/app/layout.tsx` exposed as CSS variables (`--font-display`, `--font-sans`, `--font-mono`).

### Required Dependencies
```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.170.0",
    "gsap": "^3.12.5",
    "lenis": "^1.1.18",
    "zod": "^3.24.0",
    "gray-matter": "^4.0.3",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@types/three": "^0.170.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.7.0"
  }
}
```
*(Adapt `next`/`react` minor versions if the workspace already has an initialized `create-next-app` setup.)*

---

## 2. Project Directory & Easy-Edit Content Structure

Structure the repository so **all editable text, projects, skills, and links live exclusively inside `content/`**—the owner never needs to touch React/Three.js code to update portfolio data:

```text
├── design.md
├── next.config.ts
├── tailwind.config.ts
├── content/
│   ├── site/
│   │   ├── profile.json               # Name, role ticker list, email, GitHub, LinkedIn, bio (EN/ID)
│   │   ├── philosophy.json            # Approach headline & 3 engineering pillars (EN/ID)
│   │   ├── astraea.json               # Flagship spotlight copy, badges, 4 feature cards, 5 pipeline stages
│   │   └── capabilities.json          # Interactive skill & database matrix cards (EN/ID)
│   └── systems/                       # 1 Markdown/MDX file = 1 Selected System card + Case Study Modal
│       ├── sovereign-os.mdx
│       ├── aegis-shield.mdx
│       └── sonora.mdx
└── src/
    ├── app/
    │   ├── layout.tsx                 # next/font/google setup, SEO/OG metadata, dark root default
    │   ├── page.tsx                   # Server Component: loads & validates `content/` -> passes to shell
    │   └── globals.css                # CSS variables, typography clamp(), spotlight/tilt/cursor CSS
    ├── lib/
    │   ├── content.ts                 # Server-only fs + gray-matter + Zod loader for `content/`
    │   ├── themes.ts                  # Kinetic Editorial theme tokens (dark, obsidian, light)
    │   ├── three-background.ts        # Global fixed 3D Neural Core + 6 morphing formations + cleanup()
    │   └── three-architect.ts         # Hero frameless 3D engineer typing + holo graph + cleanup()
    ├── context/
    │   └── LanguageContext.tsx        # 'use client' reactive EN | ID context provider
    └── components/
        ├── PortfolioShell.tsx         # 'use client' master orchestrator (Lenis, GSAP, theme sync, cursor)
        ├── three/
        │   ├── ThreeBackground.tsx    # 'use client' wrapper for #bg-canvas (loaded ssr: false)
        │   └── HeroArchitect3D.tsx    # 'use client' wrapper for #identity-3d-canvas (loaded ssr: false)
        ├── ui/
        │   ├── Navbar.tsx             # Fixed glassmorphic header, EN|ID switch, mobile drawer, progress bar
        │   ├── CustomCursor.tsx       # Desktop fine-pointer contextual pill cursor
        │   ├── CaseStudyModal.tsx     # Slide-over Architecture Brief drawer (ESC/backdrop, pauses Lenis)
        │   └── Toast.tsx              # Non-blocking clipboard notification toast
        └── sections/
            ├── HeroIdentity.tsx       # Unified Hero + 3D workstation + role scramble + workflow strip
            ├── Approach.tsx           # Light-mode philosophy section
            ├── AstraeaSpotlight.tsx   # Sticky left summary + interactive 5-stage pipeline + 4 cards
            ├── SelectedSystems.tsx    # Filterable case-study grid triggering CaseStudyModal
            ├── CapabilitiesMatrix.tsx # Filterable skill & database bento cards
            └── ContactFooter.tsx      # Initiate CTA, copy-email trigger, social links, minimal footer
```

### Example Content Schemas (`src/lib/content.ts`)

1. **`content/systems/*.mdx`** — To add a new project later, the owner simply drops a new `.mdx` file with frontmatter:
```yaml
---
slug: "sovereign-os"
order: 1
category: "ai" # "ai" | "security" | "dsp" | "backend"
categoryLabel: "MULTI-AGENT OS"
badge: "PRIVATE"
badgeTone: "amber" # "amber" | "zinc" | "emerald" | "cyan"
title: "SovereignOS"
stack: ["Python", "AstraeaADK", "PostgreSQL", "Atomic DB Leasing", "Sandboxed Runtime", "Web Services"]
cardTags: ["Python", "AstraeaADK", "Atomic DB Leasing"]
en:
  status: "AUTONOMOUS MULTI-AGENT OS • PRIVATE DEPLOYMENT"
  cardDesc: "Autonomous multi-agent OS built on AstraeaADK for solo-founder workflows. Features database-composed runtime roles, atomic Kanban ticket leasing to prevent race conditions, sandboxed execution, and an independent oversight agent."
  cardNote: "Kept private by design to prevent automated abuse; architecture breakdown available upon request."
  summary: "An autonomous multi-agent operating system engineered on top of AstraeaADK to automate complex solo-founder engineering and operational pipelines without losing human governance."
  decisions:
    - "Database-composed agent personas loaded dynamically at runtime rather than hardcoded prompt trees."
    - "Atomic Kanban ticket leasing backed by transactional DB locks to eliminate multi-agent race conditions."
    - "Strict sandboxed execution boundaries paired with an independent oversight agent that audits every privileged action."
  audit: "Kept intentionally private after internal threat modeling showed unguarded autonomous execution loops can be weaponized. Full architecture diagrams and security governance docs are available for private technical review."
  accessNote: "PRIVATE ARCH // BREAKDOWN ON REQUEST"
id:
  status: "OS MULTI-AGENT OTONOM • DEPLOYMENT PRIVAT"
  cardDesc: "Sistem operasi multi-agent otonom di atas AstraeaADK untuk alur kerja solo-founder. Memiliki peran agent berbasis database saat runtime, leasing tiket Kanban atomik, eksekusi sandbox, dan agent pengawas independen."
  cardNote: "Dijaga privat sesuai desain untuk mencegah penyalahgunaan otomatis; rincian arsitektur tersedia atas permintaan."
  summary: "Sistem operasi multi-agent otonom yang dibangun di atas AstraeaADK untuk mengotomasi alur kerja rekayasa dan operasional solo-founder tanpa melepas kendali manusia."
  decisions:
    - "Persona agent disusun dari database saat runtime alih-alih hardcoded prompt yang kaku."
    - "Leasing tiket Kanban atomik berbasis transaksi database untuk mencegah race condition antar agent."
    - "Isolasi eksekusi sandbox ketat yang didampingi agent pengawas independen untuk mengaudit setiap aksi sensitif."
  audit: "Sengaja dijaga privat karena pemodelan ancaman menunjukkan loop eksekusi otonom berisiko disalahgunakan bila dibuka sembarangan. Diagram arsitektur dan dokumen tata kelola tersedia untuk sesi review teknis."
  accessNote: "ARSITEKTUR PRIVAT // TERSEDIA ATAS PERMINTAAN"
---
```

2. **`content/site/capabilities.json`** — Easy to append/reorder skills:
```json
{
  "category": "db",
  "accent": "core",
  "tierEn": "CORE MASTERY",
  "tierId": "KEAHLIAN INTI",
  "tags": ["PostgreSQL", "MongoDB", "MySQL", "SQLite", "Schema Design", "Atomic Leasing"],
  "highlightedTags": ["PostgreSQL", "MongoDB", "MySQL", "SQLite"],
  "en": {
    "code": "DATA LAYER",
    "title": "Relational & NoSQL Database Engineering",
    "desc": "End-to-end data modeling, query & index optimization, transactional concurrency control, and hybrid persistent state layers for high-throughput AI and web workloads."
  },
  "id": {
    "code": "LAPISAN DATA",
    "title": "Rekayasa Database Relasional & NoSQL",
    "desc": "Pemodelan data menyeluruh, optimasi query & indeks, kendali konkurensi transaksional, serta lapisan state persisten hibrida untuk beban kerja AI dan web."
  }
}
```

---

## 3. Design System & Visual Tokens

### 3.1 Color Themes (Kinetic Editorial — CSS Custom Properties)
Transitions between themes are animated smoothly (`0.7s`, `power2.out`) on `document.documentElement` via GSAP `ScrollTrigger`.

| Token | `dark` (Hero, AstraeaADK, Contact) | `obsidian` (Selected Systems) | `light` (Approach, Capabilities) |
| :--- | :--- | :--- | :--- |
| `--bg` | `#05060A` | `#090C12` | `#F3F4F0` |
| `--fg` | `#F4F4F7` | `#F4F4F7` | `#0B0E14` |
| `--muted` | `#9CA3AF` | `#9CA3AF` | `#4B5563` |
| `--surface` | `rgba(255, 255, 255, 0.032)` | `rgba(255, 255, 255, 0.034)` | `rgba(255, 255, 255, 0.64)` |
| `--surface-hover` | `rgba(255, 255, 255, 0.068)` | `rgba(255, 255, 255, 0.07)` | `rgba(255, 255, 255, 0.92)` |
| `--border` | `rgba(255, 255, 255, 0.09)` | `rgba(255, 255, 255, 0.10)` | `rgba(11, 14, 20, 0.11)` |
| `--border-strong` | `rgba(56, 189, 248, 0.38)` | `rgba(56, 189, 248, 0.40)` | `rgba(2, 132, 199, 0.42)` |
| `--accent` | `#38BDF8` | `#38BDF8` | `#0284C7` |
| `--accent-2` | `#818CF8` | `#10B981` | `#4F46E5` |
| `--accent-soft` | `rgba(56, 189, 248, 0.13)` | `rgba(56, 189, 248, 0.13)` | `rgba(2, 132, 199, 0.11)` |
| `--nav-bg` | `rgba(5, 6, 10, 0.74)` | `rgba(9, 12, 18, 0.78)` | `rgba(243, 244, 240, 0.84)` |
| `--btn-primary-bg` | `#F4F4F7` | `#F4F4F7` | `#0B0E14` |
| `--btn-primary-fg` | `#05060A` | `#090C12` | `#F4F4F7` |
| `--aurora-1` | `rgba(56, 189, 248, 0.14)` | `rgba(16, 185, 129, 0.11)` | `rgba(2, 132, 199, 0.09)` |
| `--aurora-2` | `rgba(99, 102, 241, 0.12)` | `rgba(56, 189, 248, 0.12)` | `rgba(79, 70, 229, 0.07)` |
| `--grid-line` | `rgba(255, 255, 255, 0.035)` | `rgba(255, 255, 255, 0.036)` | `rgba(11, 14, 20, 0.045)` |
| `--spotlight-color` | `rgba(56, 189, 248, 0.16)` | `rgba(56, 189, 248, 0.16)` | `rgba(2, 132, 199, 0.11)` |

Additional semantic colors:
- **Emerald Signal (Live Status / Verified):** `#10B981`
- **Indigo Pulse:** `#6366F1`

### 3.2 Typography System (`next/font/google`)
Configure in `src/app/layout.tsx` and map inside `tailwind.config.ts`:
- **Display (`font-display` / `--font-display`):** `Space_Grotesk` (weights `500`, `600`, `700`)
- **Body (`font-sans` / `--font-sans`):** `Plus_Jakarta_Sans` (weights `400`, `500`, `600`, `700`)
- **Technical Meta (`font-mono` / `--font-mono`):** `JetBrains_Mono` (weights `400`, `500`, `600`, `700`)

Fluid Responsive Scales:
- `.hero-display` (Name): `clamp(2.15rem, 5.4vw, 4.35rem)`, `line-height: 1.05`, `letter-spacing: -0.035em`
- `.hero-role-display` (Scrambling Role): `clamp(1.3rem, 3.6vw, 2.95rem)`, `line-height: 1.12`, `letter-spacing: -0.025em`
- `.section-display` (Section H2): `clamp(1.85rem, 4.3vw, 3.35rem)`, `line-height: 1.08`, `letter-spacing: -0.03em`
- `.gradient-ink`: `linear-gradient(115deg, var(--fg) 25%, var(--accent) 72%, var(--accent-2) 100%)` clipped to text.

### 3.3 Tactile Surfaces & UI Effects
- **Spotlight Glass Cards (`.spotlight-card`):** `backdrop-filter: blur(14px)`, `1px solid var(--border)`, `::before` pseudo-element rendering a `420px` radial gradient following `--mouse-x` and `--mouse-y` pointer coordinates.
- **3D Card Tilt (`[data-tilt]`):** Desktop fine-pointer only (`@media (hover: hover) and (pointer: fine)`). Max rotation ±`6.5deg` on X/Y axes with `perspective(950px)` and `translateY(-3px)`.
- **Magnetic Buttons (`[data-magnetic]`):** Desktop fine-pointer only. Subtle `0.22x` pointer-offset translation on hover, resetting cleanly on `mouseleave`.
- **Contextual Custom Cursor:** Desktop fine-pointer only. Instant `7px` accent dot (`#cursor-dot`) + smooth `0.17` lerp pill (`#cursor-pill`) expanding into a filled accent badge displaying localized `[data-cursor-en]` / `[data-cursor-id]` text on hover.

---

## 4. Atmospheric Backdrop & Three.js Specifications

### 4.1 Multi-Layer Fixed Background (`z-index: 0` and `z-index: 1`)
1. **Layer 0 (`#ambient-backdrop`, `pointer-events: none`):**
   - Two soft blurred aurora orbs (`filter: blur(110px)`) drifting slowly via CSS keyframes (`16s` and `20s`).
   - Architectural micro-grid (`56px × 56px` linear-gradient lines) masked radially (`ellipse 85% 75% at 50% 45%`).
2. **Layer 1 (`#bg-canvas`, Global Fixed Three.js WebGLRenderer, `alpha: true`):**
   - **DPR Cap:** `min(devicePixelRatio, 1.5)` on mobile (`< 768px`), `1.75` on desktop.
   - **Element A — Crystalline Multi-Agent Core:** `IcosahedronGeometry(2.35, 1)` outer wireframe + `OctahedronGeometry(1.25, 0)` inner wireframe + two tilted orbital `TorusGeometry` rings (`r=3.35`, `r=4.15`). Smoothly `lerp`s to distinct anchor coordinates per section.
   - **Element B — Morphing 3D Neural Graph:** `68` nodes (desktop) / `42` nodes (mobile) rendered with a procedural soft radial-glow `CanvasTexture`, connected by pre-indexed `LineSegments` (`i+1`, `i+3`, `i+7`). Smoothly morphs between **6 mathematical formations** based on active `data-graph-state`:
     - `0` (Hero): Wide framing constellation ring around the 3D workstation.
     - `1` (Approach): Architectural tilted lattice grid with sine Z-wave.
     - `2` (AstraeaADK): 5-cluster hub-and-spoke multi-agent topology.
     - `3` (Systems): Deep diagonal wave ribbon streams.
     - `4` (Capabilities): Twin opposing vertical orbital cylinders.
     - `5` (Contact): Converging central neural sphere behind the CTA.
   - **Element C — Live Signal Pulses:** `28` (desktop) / `16` (mobile) emerald (`#10B981`) glowing particles traveling continuously along random graph edges.
   - **Element D — Latent Space Dust:** `140` (desktop) / `70` (mobile) slow-rotating deep background star-field points.
   - **Theme Adaptation:** Smoothly lerps node/edge/core colors between cyan/indigo (dark) and sky-600/indigo-600 (light), switching particle blending from `THREE.AdditiveBlending` (dark) to `THREE.NormalBlending` (light) so nodes remain crisp on `#F3F4F0`.

### 4.2 Hero Centerpiece — Frameless 3D Neural Architect (`#identity-3d-canvas`)
> **Strict Visual Rules:**
> - **NO surrounding card, border, or terminal box.** It sits directly above the hero title over a subtle radial `.stage-floor-glow` melting into the background.
> - **NO mode switcher buttons** (no ASCII/Matrix/Neural buttons).
> - **NO helper text** ("Drag to orbit...") and **NO stat boxes** underneath.

**3D Composition & Geometry:**
- **Holographic Floor Platform:** Rotating concentric cyan & indigo thin torus rings (`r=1.26`, `r=0.86`) over a subtle translucent disc.
- **Ergonomic Futuristic Chair:** 5-spoke caster base, hydraulic stem, dark metallic seat, reclined spine & cushion with glowing vertical cyan accent strip.
- **Floating Glass Tech Desk:** Translucent dark glass tabletop (`1.56 × 0.04 × 0.78`) outlined with crisp cyan `EdgesGeometry`, minimal side legs, plus a desk coffee mug emitting 4 looping translucent rising steam spheres.
- **3D Laptop:** Metallic chassis, `4 × 11` individual emissive keyboard keys (flashing dynamically in sync with typing strokes), glowing trackpad, angled lid with cyan octahedron emblem on the back, and a live `256×160` `CanvasTexture` screen scrolling `AstraeaRuntime` native Python code (`turn_loop`, `cov_guard.audit`, `commit_md_graph`, `AUDIT PASS`).
- **Floating Holographic System Architecture Graph (Above Laptop):**
  - Replaces any external running text/marquee.
  - High-res `512×280` transparent `CanvasTexture` plane levitating gently above the laptop with a faint projection cone beneath it.
  - Displays a live animated hub-and-spoke node graph with traveling signal dots and crisp pill labels for:
    - Center Hub: **`MULTI-AGENT`** (`#38BDF8`)
    - Outer Nodes: **`PYTHON · JS`**, **`PG · MONGO · MYSQL`**, **`ZERO-WRAPPER`**, **`MCP · BYOK`**, **`GOVERNANCE`**, **`MANUAL AUDIT`**
  - **Auto-Facing Orientation:** Dynamically rotates around Y (`camAngle - currentRotY`) so the graph remains readable facing the viewer even while the workstation orbits 360°.
- **Seated Humanoid AI Engineer:**
  - Smooth capsule limbs (`Cylinder` + `Sphere` end-caps), seated thighs/calves, shoes with cyan sole stripes, slightly leaning torso with glowing front jacket seam, head with styled hair, futuristic glowing AR visor, and studio headphones with indigo cup rings.
  - **Procedural Typing Animation:** Natural cycle of `4.7s` active typing bursts followed by `1.5s` thinking pauses; articulated left/right upper arms, forearms, wrists, palms, and 4 individual fingers strike dynamically above the keyboard while the head subtly nods and scans the screen.
- **Responsive Camera & Interaction:**
  - Supports smooth 360° horizontal drag/touch orbit (`touch-action: pan-y` so vertical page scrolling on mobile is never blocked) + gentle idle sway.
  - Adaptive portrait mobile framing: if `aspect < 1.15`, switch `fov` from `35` to `42` and pull camera back slightly (`(2.9, 1.98, 2.02)`) so the full desk, figure, and hologram fit cleanly without clipping.

---

## 5. Section-by-Section Layout & Functional Map

> **Global Styling Rule:** Do **NOT** render numbered section prefixes (`01 //`, `02 //`, `ROLE //`, etc.) or harsh horizontal divider borders between sections. Rely on generous whitespace and smooth background theme shifts for clean section separation.

| # | Section ID | Theme | Graph State | Layout & Key Components |
| :-: | :--- | :---: | :---: | :--- |
| **1** | `#hero` | `dark` | `0` | **Unified Hero & Identity (Centered):**<br>1. Top: Frameless 3D Typing Architect (`h-[300px] sm:h-[370px] lg:h-[420px]`).<br>2. Main H1 (Large): `Reza Pratama` on line 1; `— [SCRAMBLING ROLE]` on line 2 (`AI SYSTEMS ENGINEER` / `MULTI-AGENT ARCHITECT` / `DATA & BACKEND SYSTEMS` / `NATIVE AI ENGINEER`, localized EN/ID).<br>3. Subtitle (Smaller): `Building native AI architectures from first principles.`<br>4. Authentic 2-paragraph bio covering Indonesia base, native multi-agent, web services, PostgreSQL/MongoDB/MySQL, architectural design, research, performance/security auditing, frontier AI sparring + manual line-by-line audits.<br>5. 2 Magnetic CTAs (`Inspect AstraeaADK`, `Selected Systems`).<br>6. Compact 3-card Engineering Workflow strip (`Research & Design`, `Native Synthesis`, `Line-by-Line Audit`). |
| **2** | `#approach` | `light` | `1` | **Engineering Philosophy:**<br>- Masked 2-line display heading (`Architecture over syntax.` / `Verification over hype.`) + intro copy.<br>- 3 equal-height `.spotlight-card` + `[data-tilt]` pillars: `Native Over Wrappers`, `Deterministic Governance`, `Audit-Driven Execution`. |
| **3** | `#astraea` | `dark` | `2` | **Flagship Spotlight — AstraeaADK:**<br>- 12-col asymmetric grid: Left 5-col sticky (`lg:sticky lg:top-24`) with gradient title `AstraeaADK`, badges (`v1.5.2`, `PyPI`, `Python • 100% Native`), tagline, `THE PROBLEM` card, and `Explore GitHub Repo ↗` (`https://github.com/HillarioRZA/AstraeaADK`) + `Interactive Pipeline` buttons.<br>- Right 7-col:<br>  a. **Interactive 5-Stage Pipeline Inspector** (`User Input` → `BYOK Router` → `MoA Turn Loop` → `CoV Guardian` → `MD Graph Mem`) connected by an animated dashed cyan SVG line; clicking or hovering any node updates the live trace box (stage title, badge, explanation, contract signature) in EN/ID.<br>  b. **2×2 Tilt Architecture Cards:** Probabilistic Turn Loops & MoA, Markdown Graph Memory, Chain-of-Verification (CoV) Guardians, Protocol & Provider Agnostic (Native MCP + BYOK). |
| **4** | `#systems` | `obsidian` | `3` | **Selected Systems Showcase:**<br>- Header + interactive filter pills (`All Systems`, `Multi-Agent`, `Security R&D`, `Native DSP`) triggering GSAP stagger entrance on filtered cards.<br>- 3-col interactive tilt grid loaded from `content/systems/*.mdx`: **SovereignOS** (Private), **Aegis-Shield** (Archived R&D), **Sonora** (v1.0.1).<br>- Clicking/pressing Enter on any card opens the **Slide-Over Architecture Brief Modal** (dark drawer from right, locks body scroll & pauses Lenis, displays Status, Title, Summary, Key Architecture Decisions list, Security & Empirical Audit box, Tech Stack chips; closes via `ESC`, close button, or backdrop click). |
| **5** | `#capabilities` | `light` | `4` | **Capabilities & Database Matrix:**<br>- Header + domain filter pills (`All`, `AI & Agents`, `Databases`, `Backend & Audit`, `Cross-Stack`).<br>- Dynamic 3-col bento grid loaded from `content/site/capabilities.json` separating **`CORE MASTERY`** (AI Runtime, Relational & NoSQL DB Engineering, Core Languages & Backend, Security & Audit) vs **`WORKING STACK`** (Rust/Tauri/ONNX, TypeScript/React/Flutter/PHP).<br>- Visually emphasize database tags (`PostgreSQL`, `MongoDB`, `MySQL`, `SQLite`) with accent-tinted pills. Never use percentage bars. |
| **6** | `#contact` | `dark` | `5` | **Initiate & Footer:**<br>- Centered masked heading (`Need an engineer who designs` / `the system—not just prompts it?`).<br>- 3 Magnetic Actions: `Copy Email` (copies email via `navigator.clipboard` with `execCommand` fallback + triggers non-blocking Toast notification; never uses `alert()`), `GitHub / HillarioRZA ↗`, `LinkedIn ↗`.<br>- Minimal 1-row footer with copyright & stack signature. |

---

## 6. Next.js / React Lifecycle, Motion & Bug Prevention Guardrails

### 6.1 Critical Fix: Prevent Initial Light-Theme Flash on Load
When initializing GSAP `ScrollTrigger` for theme shifting inside `PortfolioShell.tsx`:
1. Define dark theme tokens directly as default `:root` values in `src/app/globals.css` so SSR HTML renders strictly dark before hydration.
2. On client mount, immediately lock `:root` to `THEMES.dark` and `sceneControl.targetGraphState = 0` before registering ScrollTriggers.
3. Bind each `section[data-theme]` using **`onToggle: (self) => { if (self.isActive) ... }`** (`start: 'top 52%'`, `end: 'bottom 52%'`) instead of firing `onEnter` during initial layout calculation.
4. Run a `syncActiveSectionTheme()` check after `ScrollTrigger.refresh()` and `document.fonts.ready`: if `window.scrollY < 100`, strictly enforce `dark` theme (`graphState = 0`).

### 6.2 React StrictMode & Next.js Hydration Safety
- **Dynamic WebGL Imports:** Load `ThreeBackground` and `HeroArchitect3D` with `dynamic(() => import(...), { ssr: false })` so Three.js never runs on the server.
- **StrictMode Double-Mount Cleanup:** Every `useEffect` initializing Three.js, GSAP, Lenis, or intervals **must return a thorough cleanup function**:
  - GSAP: Wrap all tweens & ScrollTriggers inside `gsap.context(() => { ... }, containerRef)` and call `ctx.revert()` on unmount.
  - Lenis: Remove ticker callback and call `lenis.destroy()` on unmount.
  - Three.js: Cancel `requestAnimationFrame`, remove window/pointer listeners, dispose geometries/materials/textures, and call `renderer.dispose()`.
- **Battery & Performance:** Pause Three.js render loops when `document.hidden === true` (`visibilitychange`), and respect `@media (prefers-reduced-motion: reduce)` by disabling Lenis smoothing, role scramble intervals, and continuous heavy motion.
- **Fault Isolation:** Wrap client initializers in isolated `try/catch` blocks so a WebGL failure on a constrained GPU never crashes React rendering or other UI interactions.

---

## 7. Implementation Checklist for the Antigravity Agent

Before declaring the build complete, verify every item below:

- [ ] **Content Decoupling:** All copy, links, email, projects, pipeline nodes, and capabilities are loaded from `content/` via Zod-validated server loaders (`src/lib/content.ts`) without touching UI components.
- [ ] **Bilingual Parity (`EN | ID`):** Switching between `EN` and `ID` updates navigation, hero role scramble, bio, philosophy, AstraeaADK pipeline trace, system cards, open modal content, capabilities matrix, and copy-email toast seamlessly without page reload.
- [ ] **Hero Hierarchy:** Frameless 3D typing architect is at the very top → Large `Reza Pratama — [ROLE]` heading → Smaller tagline → Bio → CTAs → 3-card workflow strip. No box around the 3D scene, no running marquee strip, no `01 //` numbering anywhere.
- [ ] **Laptop Hologram Graph:** Floating graph above the 3D laptop displays all 7 core nodes (`MULTI-AGENT`, `PYTHON · JS`, `PG · MONGO · MYSQL`, `ZERO-WRAPPER`, `MCP · BYOK`, `GOVERNANCE`, `MANUAL AUDIT`) with live pulses and faces the viewer cleanly.
- [ ] **Theme Transitions:** Initial SSR + hydrated load at scroll `y = 0` is strictly `dark` (`#05060A`) with zero flash of light mode; scrolling smoothly transitions `dark → light → dark → obsidian → light → dark`.
- [ ] **React StrictMode Clean:** Zero duplicate WebGL canvases, zero leaked ScrollTriggers, and zero hydration mismatch warnings in Next.js dev mode.
- [ ] **Mobile Responsiveness (`375px` – `430px`):** Zero horizontal overflow (`overflow-x: clip`), 3D hero scene framed cleanly in portrait mode, vertical scroll works over the 3D canvas (`touch-action: pan-y`), touch targets ≥ `44px`, custom cursor disabled on touch devices.
- [ ] **Production Polish:** Clean `npm run build` (`next build`) with zero TypeScript errors, zero ESLint/console errors, proper OpenGraph metadata in `layout.tsx`, and crisp favicon.