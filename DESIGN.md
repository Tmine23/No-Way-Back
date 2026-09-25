# Design

<!-- impeccable:design-schema 1 -->

## World

"Tabla de parses." The app borrows its visual language from the thing raiders already stare at after every pull: a ranked log table. A deep navy ground, flat slate plates, hairline rules, big condensed headlines, and one strict rule for color: the WoW quality ramp (gray → green → blue → purple → orange → pink → gold) is reserved for ranked or quality data (gearscore percentile, item quality). The guild purple `#9966CC` is the brand and the action color, and it is never used as a ramp value. The earlier near-black "esports ops dashboard" world, with Geist and restrained motion, is retired.

## Palette

- Ground `--bg` `#101422`; surfaces `--surface` `#161b2b`, `--surface-2` `#1d2335`; plate `--plate` `#272b3b` (the one heavier panel per screen, e.g. the next raid)
- Rules `--border` `#262c3d`, `--border-strong` `#363d52`
- Ink `--text` `#f2f4f8`; second ink `--text-muted` `#a8bdce` (steel blue); `--text-faint` `#7c8aa0`
- Brand and action `--accent` `#9966cc`, `--accent-hover` `#a878d6`, `--accent-soft` `#c9aee6`, `--accent-dim` (16% tint)
- Ramp, data only: `--rank-gray` `#7c8595`, `--rank-green` `#1eff00`, `--rank-blue` `#3d8bff`, `--rank-purple` `#a335ee`, `--rank-orange` `#ff8000`, `--rank-pink` `#e268a8`, `--rank-gold` `#e5cc80`. Percentile cutoffs live in `src/lib/ramp.ts` (25/50/75/95/99/100).
- Class colors (`CLASS_COLORS`) color character names only.
- `--danger` `#f06a6f` for destructive and error states.

## Typography

Barlow for UI text, Barlow Condensed for display. Page titles and section titles are Barlow Condensed, bold, uppercase, tight leading (`.display`). Numbers use tabular figures (`.tabular`) so tables and counters line up. No eyebrow labels above headings: "Hardcore guild" is a subtitle under the title, never above it.

## Layout

- App shell: sticky top bar with the emblem and "NO WAY BACK" wordmark, inline links on desktop; fixed bottom tab bar on mobile (Inicio, Raids, Roster, Personajes, Más), where "Más" opens a sheet with the officer and GM sections.
- Pages open with `PageHeader` (display title, optional one-line description, actions on the right).
- Home is asymmetric: the next raid on a plate (title, local date, countdown, composition fill, CTA) beside the schedule in the viewer's local time, then "Tus personajes" as a ranked table, then a hairline stat strip.
- Dense data goes in real tables with hairline rows (`.table`), not card grids. Roster: # · GS with percentile bar · character · class · player · spec; sortable, filterable by role and mains.
- Cards 14px radius, controls 8px.

## Motion

Motion responds to the pointer and to state changes.
- Primary CTAs sit in `Magnetic` (spring pull toward the cursor, mouse only). Every button presses to `scale(0.97)`; hover effects are limited to `(hover: hover) and (pointer: fine)`.
- Percentile bars fill once on mount (700ms, ease-out); roster rows re-sort with a layout spring; nav indicators, filters and RSVP choices slide with shared `layoutId`.
- No decorative 3D. A three.js skyline of ramp-colored bars on login was tried and rejected by the user ("feo, sin sentido"). three.js stays reserved for the future boss plans, where it shows real positions.
- Easing `cubic-bezier(0.23, 1, 0.32, 1)`, UI transitions under 300ms. `MotionConfig reducedMotion="user"` plus a global CSS rule honor reduced motion.

## Mark

The guild emblem `public/logo-icon.png` (peak and arrow monogram, purple). Used at 36px in the top bar, larger on login, recruitment and the pending screen. Never recolored.

## Components

`PageHeader`, `ParseBar` / `RankValue`, `RosterTable`, `Magnetic`, `DateBlock` / `LocalDate` / `Countdown` (all times render in the viewer's zone), `RsvpControls` (segmented Voy / Tal vez / No puedo), `RaidComposition` (drag and drop groups plus bench, role counts).
