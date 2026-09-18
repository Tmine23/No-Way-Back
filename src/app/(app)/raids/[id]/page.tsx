import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { RsvpControls } from "@/components/rsvp-controls";
import { RaidComposition } from "@/components/raid-composition";
import { AnnounceRaidButton } from "@/components/announce-raid-button";
import type { Enums, Tables } from "@/types/database";

type CharacterWithOwner = Tables<"characters"> & {
  profiles: { known_as: string | null; discord_username: string } | null;
};
type SignupWithCharacter = Tables<"raid_signups"> & { characters: CharacterWithOwner };

export default async function RaidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const officer = isOfficer(profile);

  const { data: raid } = await supabase
    .from("raid_events")
    .select("*")
    .eq("id", id)
    .single();

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

  const invitedCharacterIds = new Set(typedSignups.map((s) => s.character_id));
  const myInvitedCharacters = (myCharacters ?? []).filter((c) => invitedCharacterIds.has(c.id));
  const currentStatuses = Object.fromEntries(
    typedSignups.map((s) => [s.character_id, s.status]),
  ) as Record<string, Enums<"rsvp_status">>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{raid.title}</h1>
        <p className="font-mono text-sm text-[var(--accent-soft)]">
          {new Date(raid.scheduled_at).toLocaleString("es-ES")} · {raid.raid_size} jugadores
        </p>
        {raid.notes && <p className="mt-2 text-[var(--text-muted)]">{raid.notes}</p>}
      </div>

      {!officer && !announced && (
        <p className="text-[var(--text-muted)]">
          La composición de esta raid todavía se está armando. Te avisaremos por
          Discord cuando esté lista.
        </p>
      )}

      {announced && myInvitedCharacters.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-medium">Tu asistencia</h2>
          <RsvpControls
            raidEventId={id}
            characters={myInvitedCharacters}
            currentStatuses={currentStatuses}
          />
        </div>
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

      {officer && <AnnounceRaidButton raidEventId={id} alreadyAnnounced={announced} />}
    </div>
  );
}
