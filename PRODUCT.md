# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + Tailwind CSS + motion + three.js + Supabase (Postgres, Auth via Discord OAuth). Installable PWA with web push. Existing codebase; not a greenfield stack decision.

## Users

Members of the World of Warcraft guild "No Way Back." The app is meant to outlive any single server, patch, or season the guild happens to be playing on — no realm/version-specific facts belong in the UI. Three practical roles:
- **Guild Master** (owner/admin): full control, assigns Officer rank.
- **Officers**: schedule raids, build raid rosters, record loot, review/promote applicants.
- **No Way Back (raiders) and trials**: register their characters (main + alts), answer raid invitations, view loot history and roster.
- **Applicants**: fill the application questionnaire and wait for approval; they see nothing else.

Everyone logs in with Discord (their guild's existing identity), but a Discord handle is not how they're known in-game — the product must let each member set a recognizable in-game display name distinct from their Discord username, captured right after their first login.

## Product Purpose

Replaces ad hoc coordination via Discord + Raid-Helper bot with a single web app for: registering characters/alts, building raid compositions, inviting the guild by push notification (Discord DM as fallback), and keeping a loot council history. Success = the guild fully stops using Raid-Helper and coordinates raids and loot through this app instead.

## Positioning

Unlike a generic Discord bot (Raid-Helper), this tracks state a bot cannot: multiple characters per player, gear/loot history over time tied to a specific character, and a real roster builder that reads from confirmed attendance instead of a flat signup list. It is guild-specific tooling, not a general LFG/calendar tool.

## Operating Context

- Players live on Discord and on their phones; the app reaches them with push notifications and they answer from the phone.
- Raid nights follow a recurring schedule defined in the guild's timezone (Bolivia) and shown in each member's local time (Colombia, Perú, Chile, Cuba, etc.).
- Schedule/RSVP turnaround matters — officers need to see attendance state at a glance.

## Capabilities and Constraints

- Discord OAuth via Supabase Auth is the only login method (confirmed, already implemented).
- Access is gated: after login and setting an in-game display name, a new member sits in `applicant` state and cannot see any guild data until an Officer or the Guild Master approves them by moving them to another rank. This is deliberate — the Guild Master only wants people they've vetted in the roster.
- Every member can have multiple characters (main + alts) per server; class, two specs with roles, gearscore and professions are tracked per character. Servers and seasons are data, never hardcoded.
- Role-based permissions: Guild Master > Officer > Raider/Trial/Applicant, enforced at the database level (RLS + trigger), not just in the UI.
- Built: drag-and-drop raid composition builder (groups plus bench), push notifications with Discord DM fallback, recruitment pipeline, GM configuration (schedule, servers, seasons, BiS phase).
- Planned: invite-all flow with a hidden officer-only queue, public "what we're missing" page, kill times, UwU Logs rankings, BiS armory per phase, animated boss plans in three.js.

## Brand Commitments

- Name: "No Way Back," with strong presence: big condensed wordmark, "Hardcore guild" as its subtitle.
- Mark: the user's own emblem (`public/logo-icon.png`, peak and arrow monogram). Dragon crests were rejected.
- Palette from the user: `#A8BDCE`, `#101422`, `#FFFFFF`, `#272B3B`, with the guild purple `#9966CC` as brand.
- Motion is reactive (buttons respond to the pointer, data animates on change), always honoring reduced motion. Decorative 3D was rejected; three.js is for boss plans with real positions.
- Copy in neutral Mexican Spanish with "tú". No marketing slogans; no server names (Whitemane, Frostmourne) in fixed UI copy.

## Evidence on Hand

- Live Supabase project `no-way-back-guild` with the schema already in place (profiles, characters, raid_events, raid_signups, loot_items, boss_kills).
- Working end-to-end Discord login flow, roster, raid RSVP, and loot pages exist today and must keep functioning through the redesign.
- No production users yet beyond the Guild Master (one test character and one test raid exist).

## Product Principles

1. Officers plan raids from real, current attendance data — the UI should always make "who's actually confirmed right now" the fastest thing to see.
2. A player is identified by their in-game name first, Discord handle second — every surface that lists people should lead with the name they're recognized by.
3. Permissions are enforced where it matters (the database), and the UI should make it obvious what a given rank can and cannot do, without needing to guess.
4. Motion and 3D earn their place by reacting to the user or to data; they never block a task.
5. The app is Operate mode (scanability first); login and public recruitment are Persuade mode and can carry the brand loudly.
