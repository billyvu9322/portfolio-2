# thony32-react

Faithful React + **TailwindCSS v4** reconstruction of [thony32.tech](https://www.thony32.tech/)
(Anthony MAHEFA portfolio). Hand-authored, editable source — not decompiled bundle.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS v4** — real build via `@tailwindcss/postcss`; design tokens in
  `app/globals.css` (`@theme inline`, `.dark` variant), custom component classes
  in `@layer components`
- **React Three Fiber** + **@react-three/drei** — WebGL hero scene
- **GSAP** + **ScrollTrigger** — scroll reveals, hero parallax, works timelines
- **Lenis** (`lenis/react`) — smooth scroll, synced to ScrollTrigger
- **Framer Motion** — hero text reveal, section reveals, audio prompt
- **Zustand** — active-section + music stores
- **Howler** — theme sounds + background music; **canvas-confetti** — theme switch
- **lucide-react** — icons

## Run

```bash
npm install
npm run dev      # http://localhost:8900
npm run build    # production build
```

## Editing content

All profile text lives in one file — edit it, no component changes needed:

```
app/content/profile.json     ← meta, nav, hero, works+projects+archive, about+skills, contact
app/lib/content.ts           ← typed loader (imports the JSON, exports typed objects)
```

Change your name, projects, skills, links, SEO meta, etc. there. Types in
`content.ts` keep edits safe (build fails if a field is malformed).

## Structure

```
app/
  layout.tsx              metadata (from profile.json) + anti-FOUC theme script
  page.tsx                -> ClientShell
  globals.css             Tailwind v4 source: tokens, @theme, custom classes
  content/profile.json    all editable copy
  lib/
    content.ts            typed content loader
    stores.ts             zustand: useSection, useMusic
  components/
    ClientShell.tsx       Lenis root, section observer, mounts everything
    Nav.tsx  Hero.tsx  Works.tsx  About.tsx  Contact.tsx
    Cursor.tsx  Loader.tsx  ThemeAudioDock.tsx  AudioPrompt.tsx
    webgl/
      WebGLBackground.tsx  <Canvas> wrapper (fov 75, cam [0,0,5])
      Scene.tsx            dust cloud, wireframe rings, helix, glow sphere, sparkles
```

## Fidelity notes

- Colors, typography, spacing, DOM structure ported 1:1 from the original.
- WebGL scene rebuilt from the original's R3F params (geometry counts, colors
  `#b8e629`/`#d4ff4d`, camera rig, per-section modulation).
- Works "Quick scan / Gallery" view-toggle is implemented — Gallery is a GSAP
  horizontal pinned-scroll showcase (scrub + snap + progress + ←/→ keys), auto
  disabled on mobile / reduced-motion.
- Case-study links (`/work/*`) point to routes not part of this single-page clone.
