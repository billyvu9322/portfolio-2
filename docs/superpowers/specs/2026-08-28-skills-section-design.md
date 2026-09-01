# Skills Section Design

## Goal

Add a dedicated Skills section below About and above Contact. Section content must live in `app/content/profile.json` so the portfolio owner can edit skills without touching React component code.

## Placement and navigation

- Add `Skills` to the main nav between `About` and `Contact`.
- Add section with `id="skills"` below the existing About section in `ClientShell`.
- Update section tracking so active nav state works for `skills`.

## Content model

Add a top-level `skills` object to `profile.json`:

- `heading`: section title.
- `subheading`: short section descriptor.
- `intro`: concise professional summary from LinkedIn copy.
- `matrix`: grouped technical skills:
  - Languages & Frameworks
  - Cloud & Data
  - AI Ecosystem
- `workingStyle`: focused work habits and delivery claims:
  - 2–3x faster AI-assisted delivery
  - async communication
  - deep codebase comprehension
  - business-focused results
- `availability`: Hanoi GMT+7 and open-to-work text.

Expose this data through `app/lib/content.ts` with TypeScript types.

## UI direction

Use a “Technical Matrix command deck” visual:

- Dark translucent cards matching current cyber/green portfolio style.
- Left intro panel with mono eyebrow, bold heading, and short profile statement.
- Right responsive card grid for grouped skill matrices.
- Small metric/working-style strip below grid.
- Mobile stacks content into readable cards with generous spacing.
- Accent lines, border glows, and mono labels reuse existing design language.

## Components

Create `app/components/Skills.tsx`.

Responsibilities:

- Read `skills` from content exports.
- Render section header, intro panel, matrix cards, working style, and availability.
- Keep markup static/data-driven for static export compatibility.
- No new runtime dependencies.

## Testing and verification

- Run `yarn build` after implementation.
- Verify nav includes Skills.
- Verify section order: About → Skills → Contact.
- Verify content comes from `profile.json` only.
- Verify static export remains compatible with Cloudflare Pages.

## Scope

In scope:

- New Skills section.
- Navigation update.
- Content schema update.
- Responsive UI.

Out of scope:

- Reworking About content.
- Adding animations beyond existing CSS/Tailwind patterns.
- Adding external libraries.
