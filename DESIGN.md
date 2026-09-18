# Design

<!-- impeccable:design-schema 1 -->

## World

A modern esports/ops-team dashboard, not a fantasy-game skin. Near-black neutral base with a single restrained accent (`#9966CC`, the guild's brand purple) used sparingly for active states, links, key numbers, and the mark — never as a glow, gradient fill, or dominant color field. This replaces an earlier dark-fantasy/gold-and-frost direction the user explicitly rejected as generic and unpolished.

## Palette

- `--bg` `#0a0a0c` — page background (off-black, not pure `#000`)
- `--surface` `#131316` / `--surface-2` `#1c1c20` — elevated panels, inputs, hover states
- `--border` `#26262b` / `--border-strong` `#38383f` — hairline dividers, the primary structural device for dense lists (roster, members) instead of boxing every row in its own card
- `--accent` `#9966cc` / `--accent-soft` `#c3a3e0` / `--accent-dim` rgba tint — the one accent color; max one per surface, used at low-to-moderate saturation
- `--text` / `--text-muted` / `--text-faint` — three-step neutral text hierarchy
- `--danger` `#e5484d` — reserved for destructive/error states only

## Typography

Geist (sans) for all UI text; Geist Mono for numeric/data values (stat counts, timestamps, ilvl) to visually distinguish data from prose, echoing an operations/data-tool register. No serif or display face — this is an Operate-mode surface, not a marketing page. Headings are tight-tracked, weight-led (semibold), not oversized.

## Layout

Avoids the generic three-equal-card row and centered hero. The dashboard home uses an asymmetric grid (a wide "next raid" panel beside a narrower stats column); the login page is a left-aligned split screen (content left, feature list right on desktop, stacked on mobile). Dense listings (Roster, Members) are real tables/divided lists with hairline row separators rather than a card per row, so many rows stay scannable.

## Motion

Restrained and purposeful only, per the product's own principle: transform/opacity transitions in the 150–350ms range, entrance fades on page content, a spring-animated shared underline for the active nav link, and a modal enter/exit. No perpetual/looping animation, no scroll-jacking, no decorative motion — this is internal tooling used every raid night, not a marketing surface.

## Mark

The guild's real logo (`LogoNWB.jfif`): a peak pierced by an ascending arrow rendered as a 3D purple badge, with a "NO WAY BACK" wordmark. The source file was a flattened JPEG export with its transparency checkerboard baked into the pixels; `public/logo-icon.png` (icon only, used in nav/favicon/login) and `public/logo-nwb.png` (full icon+wordmark lockup) were produced from it by detecting the checkerboard's achromatic signature and despeckling JPEG ringing at the edges, restoring real alpha transparency. An earlier from-scratch geometric placeholder mark was replaced once the real asset was usable.

## Process note

Built code-led (no image generation available in this environment), so the full Impeccable comp/decision-page round was skipped by contract, not by drift — the direction was committed directly from the user's brief (rejected prior look, purple accent, reference mark, "Emil Kowalski"-style restrained motion, "taste-skill" anti-slop rules) and built in one committed pass, then verified with the mechanical detector (`impeccable detect`, 0 findings) and a manual desktop/mobile screenshot review in place of the shipped finish-reviewer subagent, which this harness could not spawn for this check.
