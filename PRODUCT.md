# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + Tailwind CSS + Supabase (Postgres, Auth via Discord OAuth). Existing codebase; not a greenfield stack decision.

## Users

Members of the World of Warcraft guild "No Way Back." The app is meant to outlive any single server, patch, or season the guild happens to be playing on — no realm/version-specific facts belong in the UI. Three practical roles:
- **Guild Master** (owner/admin): full control, assigns Officer rank.
- **Officers**: schedule raids, build raid rosters, record loot, review/promote applicants.
- **Raiders/Trials/Applicants**: register their characters (main + alts), RSVP to raids per character, view loot history and roster.

Everyone logs in with Discord (their guild's existing identity), but a Discord handle is not how they're known in-game — the product must let each member set a recognizable in-game display name distinct from their Discord username, captured right after their first login.

## Product Purpose

Replaces ad hoc coordination via Discord + Raid-Helper bot with a single web app for: registering characters/alts, scheduling raids and collecting per-character RSVPs, building raid compositions from confirmed signups, and keeping a loot history. Success = the guild fully stops using Raid-Helper and coordinates raids and loot through this app instead.

## Positioning

Unlike a generic Discord bot (Raid-Helper), this tracks state a bot cannot: multiple characters per player, gear/loot history over time tied to a specific character, and a real roster builder that reads from confirmed attendance instead of a flat signup list. It is guild-specific tooling, not a general LFG/calendar tool.

## Operating Context

- Players primarily interact with Discord day-to-day; the app is a secondary destination they're asked to visit for structured actions (register a character, RSVP, check loot).
- Raid nights happen on a recurring schedule; officers plan composition ahead of time from who has confirmed.
- Schedule/RSVP turnaround matters — officers need to see attendance state at a glance.

## Capabilities and Constraints

- Discord OAuth via Supabase Auth is the only login method (confirmed, already implemented).
- Access is gated: after login and setting an in-game display name, a new member sits in `applicant` state and cannot see any guild data until an Officer or the Guild Master approves them by moving them to another rank. This is deliberate — the Guild Master only wants people they've vetted in the roster.
- Every member can have multiple characters (main + alts); class/spec/role/ilvl/professions are tracked per character.
- Role-based permissions: Guild Master > Officer > Raider/Trial/Applicant, enforced at the database level (RLS + trigger), not just in the UI.
- Confirmed: a raid roster builder where officers mark which confirmed characters make the final tank/healer/dps lineup for a raid.
- Confirmed: a spreadsheet-style roster view grouping every member's characters together (inspired by a reference spreadsheet the user uses today).
- Planned/open: sending Discord DMs to members to prompt raid RSVP confirmation (requires a Discord bot application in addition to the existing OAuth app — undecided/not yet built).

## Brand Commitments

- Name: "No Way Back." Existing custom SVG crest (dragon skull + ice blade) was rejected by the user as unpolished/generic-feeling ("no me gusta nada") and is being replaced.
- Reference the user provided for the new mark: an abstract geometric monogram (a stylized peak/roofline crossed with an upward arrow) — they specifically like the center emblem, not the flanking character-portrait art in that reference image.
- Requested accent color: a subtle purple, `#9966CC`, used in linework/accents rather than as a dominant fill.
- Explicit direction: move away from the current "dark fantasy gradient" look toward something cleaner, more modern, and more original — informed by real contemporary UI references, not generic AI-generated fantasy UI tropes.
- Motion should be restrained and purposeful (fast, subtle transitions on real state changes), not decorative.

## Evidence on Hand

- Live Supabase project `no-way-back-guild` with the schema already in place (profiles, characters, raid_events, raid_signups, loot_items, boss_kills).
- Working end-to-end Discord login flow, roster, raid RSVP, and loot pages exist today and must keep functioning through the redesign.
- No production users yet beyond the Guild Master (one test character and one test raid exist).

## Product Principles

1. Officers plan raids from real, current attendance data — the UI should always make "who's actually confirmed right now" the fastest thing to see.
2. A player is identified by their in-game name first, Discord handle second — every surface that lists people should lead with the name they're recognized by.
3. Permissions are enforced where it matters (the database), and the UI should make it obvious what a given rank can and cannot do, without needing to guess.
4. Prefer a small number of purposeful, restrained interactions over decorative motion or heavy visual texture.
5. This is guild-internal tooling (Operate mode) — scanability and speed win over marketing-style visual spectacle.
