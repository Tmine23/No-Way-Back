import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { RsvpControls } from "@/components/rsvp-controls";
import { CLASS_COLORS, RSVP_LABELS } from "@/lib/wow";
import type { Enums, Tables } from "@/types/database";

type SignupWithCharacter = Tables<"raid_signups"> & {
  characters: Tables<"characters">;
};

export default async function RaidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: raid } = await supabase
    .from("raid_events")
    .select("*")
    .eq("id", id)
    .single();

  if (!raid) notFound();

  const { data: signups } = await supabase
    .from("raid_signups")
    .select("*, characters(*)")
    .eq("raid_event_id", id);

  const { data: myCharacters } = profile
    ? await supabase.from("characters").select("*").eq("owner_id", profile.id)
    : { data: [] as Tables<"characters">[] };

  const currentStatuses = Object.fromEntries(
    (signups ?? []).map((s) => [s.character_id, s.status]),
  ) as Record<string, Enums<"rsvp_status">>;

  const grouped: Record<Enums<"rsvp_status">, SignupWithCharacter[]> = {
    confirmed: [],
    tentative: [],
    bench: [],
    absent: [],
  };
  for (const signup of (signups ?? []) as SignupWithCharacter[]) {
    grouped[signup.status].push(signup);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">{raid.title}</h1>
        <p className="text-neutral-400">
          {new Date(raid.scheduled_at).toLocaleString("es-ES")}
        </p>
        {raid.notes && <p className="mt-2 text-neutral-300">{raid.notes}</p>}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Tu asistencia</h2>
          {myCharacters && myCharacters.length > 0 ? (
            <RsvpControls
              raidEventId={id}
              characters={myCharacters}
              currentStatuses={currentStatuses}
            />
          ) : (
            <p className="text-neutral-400">
              No tienes personajes registrados todavía.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Roster de la raid</h2>
          {(Object.keys(grouped) as Enums<"rsvp_status">[]).map((status) => (
            <div key={status}>
              <p className="mb-1 text-sm font-medium text-neutral-400">
                {RSVP_LABELS[status]} ({grouped[status].length})
              </p>
              <div className="flex flex-wrap gap-2">
                {grouped[status].map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full bg-neutral-900 px-3 py-1 text-sm"
                    style={{ color: CLASS_COLORS[s.characters.class] }}
                  >
                    {s.characters.name}
                  </span>
                ))}
                {grouped[status].length === 0 && (
                  <span className="text-sm text-neutral-600">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
