"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { sendDiscordDM } from "@/lib/discord";
import type { Enums } from "@/types/database";

export async function createRaidEvent(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  if (!isOfficer(profile)) {
    throw new Error("Solo los oficiales pueden crear raids");
  }

  const { data, error } = await supabase
    .from("raid_events")
    .insert({
      title: formData.get("title") as string,
      scheduled_at: new Date(formData.get("scheduled_at") as string).toISOString(),
      raid_size: Number(formData.get("raid_size")) === 10 ? 10 : 25,
      notes: (formData.get("notes") as string) || null,
      created_by: profile!.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/raids/${data.id}`);
}

export async function setSignup(
  raidEventId: string,
  characterId: string,
  status: Enums<"rsvp_status">,
) {
  const supabase = await createClient();

  const { error } = await supabase.from("raid_signups").upsert(
    {
      raid_event_id: raidEventId,
      character_id: characterId,
      status,
    },
    { onConflict: "raid_event_id,character_id" },
  );

  if (error) throw new Error(error.message);

  revalidatePath(`/raids/${raidEventId}`);
}

export async function assignSlot(raidEventId: string, characterId: string, slotIndex: number) {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo un Officer o Guild Master puede editar la composición");
  }

  const supabase = await createClient();

  const [{ data: current }, { data: occupant }] = await Promise.all([
    supabase
      .from("raid_signups")
      .select("id, slot_index")
      .eq("raid_event_id", raidEventId)
      .eq("character_id", characterId)
      .maybeSingle(),
    supabase
      .from("raid_signups")
      .select("id, character_id")
      .eq("raid_event_id", raidEventId)
      .eq("slot_index", slotIndex)
      .maybeSingle(),
  ]);

  if (occupant && occupant.character_id !== characterId) {
    const { error } = await supabase
      .from("raid_signups")
      .update({ slot_index: current?.slot_index ?? null })
      .eq("id", occupant.id);
    if (error) throw new Error(error.message);
  }

  const { error } = await supabase.from("raid_signups").upsert(
    {
      raid_event_id: raidEventId,
      character_id: characterId,
      slot_index: slotIndex,
    },
    { onConflict: "raid_event_id,character_id" },
  );
  if (error) throw new Error(error.message);

  revalidatePath(`/raids/${raidEventId}`);
}

export async function unassignSlot(raidEventId: string, characterId: string) {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo un Officer o Guild Master puede editar la composición");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("raid_signups")
    .delete()
    .eq("raid_event_id", raidEventId)
    .eq("character_id", characterId);

  if (error) throw new Error(error.message);

  revalidatePath(`/raids/${raidEventId}`);
}

export type AnnounceRaidResult = {
  sent: string[];
  failed: { name: string; reason: string }[];
};

export async function announceRaid(raidEventId: string): Promise<AnnounceRaidResult> {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo un Officer o Guild Master puede enviar la invitación");
  }

  const supabase = await createClient();

  const { data: raid, error: raidError } = await supabase
    .from("raid_events")
    .select("title, scheduled_at")
    .eq("id", raidEventId)
    .single();
  if (raidError || !raid) throw new Error("Raid no encontrada");

  const { data: signups, error } = await supabase
    .from("raid_signups")
    .select("characters(name, owner_id, profiles(known_as, discord_username, discord_id))")
    .eq("raid_event_id", raidEventId)
    .not("slot_index", "is", null);

  if (error) throw new Error(error.message);

  await supabase
    .from("raid_events")
    .update({ announced_at: new Date().toISOString() })
    .eq("id", raidEventId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const raidDate = new Date(raid.scheduled_at).toLocaleString("es-ES");
  const link = `${siteUrl}/raids/${raidEventId}`;

  const byProfile = new Map<
    string,
    { name: string; discordId: string | null; characters: string[] }
  >();

  for (const signup of signups ?? []) {
    const character = signup.characters as unknown as {
      name: string;
      owner_id: string;
      profiles: { known_as: string | null; discord_username: string; discord_id: string | null } | null;
    };
    if (!character?.profiles) continue;

    const entry = byProfile.get(character.owner_id) ?? {
      name: character.profiles.known_as || character.profiles.discord_username,
      discordId: character.profiles.discord_id,
      characters: [],
    };
    entry.characters.push(character.name);
    byProfile.set(character.owner_id, entry);
  }

  const result: AnnounceRaidResult = { sent: [], failed: [] };

  for (const { name, discordId, characters } of byProfile.values()) {
    if (!discordId) {
      result.failed.push({ name, reason: "sin Discord ID" });
      continue;
    }
    try {
      await sendDiscordDM(
        discordId,
        `Fuiste convocado a **${raid.title}** (${raidDate}) con ${characters.join(", ")}. Confirma tu asistencia aquí: ${link}`,
      );
      result.sent.push(name);
    } catch (err) {
      result.failed.push({ name, reason: err instanceof Error ? err.message : "error desconocido" });
    }
  }

  revalidatePath(`/raids/${raidEventId}`);
  return result;
}
