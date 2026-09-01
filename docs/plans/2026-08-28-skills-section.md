# Skills Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a data-driven Skills section below About, include it in navigation, and keep content editable from `app/content/profile.json`.

**Architecture:** Add a top-level `skills` content object and matching TypeScript types in the content layer. Create a presentational `Skills` component that maps that content into a responsive command-deck layout. Wire section into `ClientShell`, `Nav`, and section observer IDs.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4 utilities, static export for Cloudflare Pages.

---

### Task 1: Extend content schema and data

**Files:**
- Modify: `app/content/profile.json`
- Modify: `app/lib/content.ts`

**Step 1: Add Skills nav item**

In `app/content/profile.json`, update `nav` to include `Skills` between `About` and `Contact`:

```json
{ "id": "skills", "label": "Skills" }
```

Expected nav order:

```json
[
  { "id": "home", "label": "Home" },
  { "id": "work", "label": "Work" },
  { "id": "about", "label": "About" },
  { "id": "skills", "label": "Skills" },
  { "id": "contact", "label": "Contact" }
]
```

**Step 2: Add top-level Skills content**

In `app/content/profile.json`, add sibling object after `about` and before `contact`:

```json
"skills": {
  "heading": "Skills",
  "subheading": "Technical matrix",
  "intro": "Full-Stack & CI/CD engineer with 4+ years of experience shipping scalable web applications, enterprise integrations, and AI-driven automation systems.",
  "positioning": "Microsoft MVP specializing in taking products from 0 to 1 — combining enterprise backend resilience (.NET / Node.js) with modern web architectures (Next.js / React) and agentic AI workflows.",
  "matrix": [
    {
      "title": "Languages & Frameworks",
      "description": "Production-grade application layers across backend, frontend, and automation workflows.",
      "items": ["C# .NET", "Node.js", "NestJS", "Fastify", "TypeScript", "Next.js", "React", "Python"]
    },
    {
      "title": "Cloud & Data",
      "description": "Reliable infrastructure, data stores, and delivery systems for scalable products.",
      "items": ["Azure", "AWS", "GCP", "PostgreSQL", "Redis", "Microservices", "Docker", "CI/CD"]
    },
    {
      "title": "AI Ecosystem",
      "description": "Agentic workflows and retrieval systems that multiply product delivery speed.",
      "items": ["Claude API", "OpenAI", "Agentic Workflows", "MCP Servers", "RAG Architecture"]
    }
  ],
  "workingStyle": [
    {
      "label": "2–3x faster",
      "detail": "Daily custom AI workflows without compromising code quality."
    },
    {
      "label": "Async-first",
      "detail": "Clear communication across distributed product teams."
    },
    {
      "label": "Deep context",
      "detail": "Codebase comprehension before architecture or implementation changes."
    },
    {
      "label": "Business focus",
      "detail": "Delivery decisions tied to measurable product outcomes."
    }
  ],
  "availability": "Based in Hanoi (GMT+7) · Open to Full-Time Remote, Contract Roles & Technical Consulting"
}
```

**Step 3: Update TypeScript types**

In `app/lib/content.ts`, add types:

```ts
export type SkillMatrixGroup = {
  title: string;
  description: string;
  items: string[];
};

export type WorkingStyle = {
  label: string;
  detail: string;
};

export type SkillsContent = {
  heading: string;
  subheading: string;
  intro: string;
  positioning: string;
  matrix: SkillMatrixGroup[];
  workingStyle: WorkingStyle[];
  availability: string;
};
```

Add to `Profile`:

```ts
skills: SkillsContent;
```

Update named exports:

```ts
export const { nav, hero, works, about, skills, contact, meta } = profile;
```

**Step 4: Commit**

```bash
git add app/content/profile.json app/lib/content.ts
git commit -m "feat: add skills content model"
```

---

### Task 2: Create Skills component

**Files:**
- Create: `app/components/Skills.tsx`

**Step 1: Create presentational component**

Create `app/components/Skills.tsx`:

```tsx
import { skills } from "../lib/content";

export default function Skills() {
  return (
    <section
      id="skills"
      className="relative py-24 md:py-32 px-4 md:px-12 lg:px-20 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-x-4 top-16 h-px bg-linear-to-r from-transparent via-accent/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mb-14 md:mb-18" data-reveal>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {skills.subheading}
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground text-balance">
            <span className="text-accent">{skills.heading.charAt(0)}</span>
            {skills.heading.slice(1)}
          </h2>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          <aside
            className="relative overflow-hidden rounded-3xl border border-accent/25 bg-background/75 p-6 md:p-8 backdrop-blur-sm"
            data-reveal
          >
            <div
              className="absolute -right-16 -top-16 h-36 w-36 rounded-full border border-accent/25"
              aria-hidden="true"
            />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              0 to 1 systems
            </p>
            <p className="mt-6 text-xl md:text-2xl font-semibold leading-relaxed text-foreground text-pretty">
              {skills.intro}
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground text-pretty">
              {skills.positioning}
            </p>
            <p className="mt-8 rounded-2xl border border-border/50 bg-muted/20 p-4 font-mono text-xs uppercase leading-relaxed tracking-wide text-muted-foreground">
              {skills.availability}
            </p>
          </aside>

          <div className="grid gap-4 md:grid-cols-3">
            {skills.matrix.map((group, index) => (
              <article
                key={group.title}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/70 p-5 md:p-6 backdrop-blur-sm transition-colors duration-300 hover:border-accent/45"
                data-reveal
              >
                <span className="font-mono text-xs text-accent/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg md:text-xl font-black uppercase leading-tight tracking-tight text-foreground">
                  {group.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {group.description}
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-wide text-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {skills.workingStyle.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-border/45 bg-background/60 p-4 backdrop-blur-sm"
            >
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add app/components/Skills.tsx
git commit -m "feat: add skills section component"
```

---

### Task 3: Wire Skills into app shell and active section tracking

**Files:**
- Modify: `app/components/ClientShell.tsx`
- Modify: `app/lib/stores.ts`

**Step 1: Update section type**

In `app/lib/stores.ts`, change:

```ts
export type SectionId = "home" | "work" | "about" | "contact";
```

to:

```ts
export type SectionId = "home" | "work" | "about" | "skills" | "contact";
```

**Step 2: Import Skills**

In `app/components/ClientShell.tsx`, add:

```ts
import Skills from "./Skills";
```

**Step 3: Update observed section IDs**

In `SectionObserver`, change:

```ts
const ids: SectionId[] = ["home", "work", "about", "contact"];
```

to:

```ts
const ids: SectionId[] = ["home", "work", "about", "skills", "contact"];
```

**Step 4: Render Skills after About**

In main content, change:

```tsx
<About />
<Contact />
```

to:

```tsx
<About />
<Skills />
<Contact />
```

**Step 5: Commit**

```bash
git add app/components/ClientShell.tsx app/lib/stores.ts
git commit -m "feat: wire skills section into portfolio"
```

---

### Task 4: Verify build and static image export config

**Files:**
- Read-only verification: `next.config.mjs`

**Step 1: Confirm static export image config remains set**

`next.config.mjs` must include:

```js
images: {
  unoptimized: true,
}
```

This keeps `next/image` from generating `/_next/image?...` URLs in static export.

**Step 2: Run build**

```bash
yarn build
```

Expected:

```txt
✓ Compiled successfully
✓ Generating static pages
```

**Step 3: Inspect generated output**

Check output HTML under configured `distDir`:

```bash
grep -R "id=\"skills\"\|Skills\|/_next/image?" build -n
```

Expected:

- `id="skills"` appears.
- `Skills` nav/content appears.
- No `/_next/image?` references for local images.

**Step 4: Manual responsive check**

Run local static server for generated output:

```bash
npx serve build
```

Open local URL and verify:

- Desktop nav shows `Home Work About Skills Contact`.
- Mobile nav includes `Skills`.
- Section order is `About` then `Skills` then `Contact`.
- Skills cards stack cleanly on mobile.
- No horizontal scroll.

**Step 5: Commit verification-only cleanup if needed**

If no code changes after verification, no commit needed. If fixes required:

```bash
git add <changed-files>
git commit -m "fix: polish skills section responsive layout"
```
