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

export type NotifyRosterResult = {
  sent: string[];
  failed: { name: string; reason: string }[];
};

export async function notifyRoster(raidEventId: string): Promise<NotifyRosterResult> {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo un Officer o Guild Master puede notificar el roster");
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
    .eq("in_roster", true);

  if (error) throw new Error(error.message);

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

  const result: NotifyRosterResult = { sent: [], failed: [] };

  for (const { name, discordId, characters } of byProfile.values()) {
    if (!discordId) {
      result.failed.push({ name, reason: "sin Discord ID" });
      continue;
    }
    try {
      await sendDiscordDM(
        discordId,
        `¡Quedaste en el roster de **${raid.title}** (${raidDate}) con ${characters.join(", ")}! Revisá los detalles acá: ${link}`,
      );
      result.sent.push(name);
    } catch (err) {
      result.failed.push({ name, reason: err instanceof Error ? err.message : "error desconocido" });
    }
  }

  return result;
}

export async function setRosterSlot(
  raidEventId: string,
  signupId: string,
  inRoster: boolean,
) {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo un Officer o Guild Master puede editar el roster final");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("raid_signups")
    .update({ in_roster: inRoster })
    .eq("id", signupId);

  if (error) throw new Error(error.message);

  revalidatePath(`/raids/${raidEventId}`);
}
