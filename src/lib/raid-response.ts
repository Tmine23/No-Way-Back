import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { notifyOfficers } from "@/lib/notify";

export type RaidResponse = "confirmed" | "absent";

/** Sets the viewer's answer on every character of theirs placed in the raid (normally just one). */
export async function respondToRaidAs(
  supabase: SupabaseClient<Database>,
  userId: string,
  raidEventId: string,
  status: RaidResponse,
) {
  const { data: mine } = await supabase.from("characters").select("id").eq("owner_id", userId);
  const ids = (mine ?? []).map((c) => c.id);
  if (ids.length === 0) return { error: "No tienes personajes registrados." };

  const { data, error } = await supabase
    .from("raid_signups")
    .update({ status })
    .eq("raid_event_id", raidEventId)
    .in("character_id", ids)
    .not("slot_index", "is", null)
    .select("id");

  if (error) return { error: error.message };
  if (!data?.length) return { error: "No estás en la composición de esta raid." };

  if (status === "absent") {
    const [{ data: profile }, { data: raid }] = await Promise.all([
      supabase.from("profiles").select("known_as, discord_username").eq("id", userId).single(),
      supabase.from("raid_events").select("title").eq("id", raidEventId).single(),
    ]);
    const name = profile?.known_as || profile?.discord_username || "Alguien";
    await notifyOfficers({
      title: `${name} no puede ir`,
      body: `Rechazó ${raid?.title ?? "la raid"}. Hay un lugar libre en la composición.`,
      url: `/raids/${raidEventId}`,
    });
  }

  return { error: null };
}
