import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { RaidInvitation } from "@/components/raid-invitation";
import { GROUP_SIZE } from "@/lib/wow";
import { RaidComposition } from "@/components/raid-composition";
import { AnnounceRaidButton } from "@/components/announce-raid-button";
import { FadeIn } from "@/components/fade-in";
import { Countdown, LocalDateTime } from "@/components/local-time";
import type { Tables } from "@/types/database";

type CharacterWithOwner = Tables<"characters"> & {
  profiles: { known_as: string | null; discord_username: string } | null;
};
type SignupWithCharacter = Tables<"raid_signups"> & { characters: CharacterWithOwner };

export default async function RaidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const officer = isOfficer(profile);

  const { data: raid } = await supabase.from("raid_events").select("*").eq("id", id).single();

  if (!raid) notFound();

  const [{ data: signups }, { data: allCharacters }, { data: myCharacters }] = await Promise.all([
    supabase
      .from("raid_signups")
      .select("*, characters(*, profiles(known_as, discord_username))")
      .eq("raid_event_id", id),
    officer
      ? supabase.from("characters").select("*, profiles(known_as, discord_username)")
      : Promise.resolve({ data: [] as CharacterWithOwner[] }),
    profile
      ? supabase.from("characters").select("*").eq("owner_id", profile.id)
      : Promise.resolve({ data: [] as Tables<"characters">[] }),
  ]);

  const typedSignups = (signups ?? []) as SignupWithCharacter[];
  const announced = raid.announced_at !== null;

  const myIds = new Set((myCharacters ?? []).map((c) => c.id));
  const mySignup = typedSignups
    .filter((s) => myIds.has(s.character_id) && s.slot_index !== null && s.slot_index < raid.raid_size)
    .sort((a, b) => (a.slot_index ?? 0) - (b.slot_index ?? 0))[0];

  return (
    <div className="flex flex-col gap-8">
      <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-5xl font-bold uppercase sm:text-6xl">{raid.title}</h1>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <LocalDateTime iso={raid.scheduled_at} className="tabular font-medium" />
            <span className="text-[var(--text-faint)]">·</span>
            <span className="tabular text-[var(--text-muted)]">{raid.raid_size} jugadores</span>
            {raid.status === "scheduled" && (
              <Countdown iso={raid.scheduled_at} className="tabular text-sm text-[var(--accent-soft)]" />
            )}
          </p>
          {raid.notes && <p className="mt-3 max-w-2xl text-[var(--text-muted)]">{raid.notes}</p>}
        </div>
        {officer && <AnnounceRaidButton raidEventId={id} alreadyAnnounced={announced} />}
      </FadeIn>

      {!officer && !announced && (
        <div className="card p-6">
          <p className="font-medium">La composición todavía se está armando.</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Te avisaremos en cuanto esté lista.</p>
        </div>
      )}

      {announced && mySignup && (
        <FadeIn delay={0.05}>
          <RaidInvitation
            raidEventId={id}
            scheduledAt={raid.scheduled_at}
            character={{
              name: mySignup.characters.name,
              class: mySignup.characters.class,
              spec: mySignup.characters.spec_primary,
              role: mySignup.characters.role,
            }}
            group={Math.floor((mySignup.slot_index ?? 0) / GROUP_SIZE) + 1}
            status={mySignup.status}
          />
        </FadeIn>
      )}

      {(officer || announced) && (
        <RaidComposition
          raidEventId={id}
          raidSize={raid.raid_size}
          allCharacters={(allCharacters ?? []) as CharacterWithOwner[]}
          signups={typedSignups}
          canEdit={officer}
          showStatus={announced}
        />
      )}
    </div>
  );
}
