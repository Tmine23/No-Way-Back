"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { notifySafely } from "@/lib/notify";
import { respondToRaidAs, type RaidResponse } from "@/lib/raid-response";
import { GROUP_SIZE } from "@/lib/wow";
import { zonedToUtc } from "@/lib/time";
import type { Enums } from "@/types/database";

export type RaidFormState = { error: string | null };

export async function createRaidEvent(_prev: RaidFormState, formData: FormData): Promise<RaidFormState> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) return { error: "Solo los oficiales pueden crear raids." };

  const title = String(formData.get("title") ?? "").trim();
  const when = String(formData.get("scheduled_at") ?? "");
  if (title.length < 3) return { error: "Escribe el nombre de la raid." };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(when)) return { error: "Elige la fecha y la hora." };

  const scheduledAt = localInputToIso(when, formData.get("tz") as string | null);
  if (new Date(scheduledAt).getTime() < Date.now()) return { error: "Esa fecha ya pasó. Elige una fecha futura." };

  const { data, error } = await supabase
    .from("raid_events")
    .insert({
      title,
      scheduled_at: scheduledAt,
      raid_size: Number(formData.get("raid_size")) === 10 ? 10 : 25,
      notes: String(formData.get("notes") ?? "").trim() || null,
      created_by: profile!.id,
    })
    .select("id")
    .single();

  if (error) return { error: `No se pudo crear la raid: ${error.message}` };

  redirect(`/raids/${data.id}`);
}

export async function respondToRaid(raidEventId: string, status: RaidResponse) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await respondToRaidAs(supabase, user.id, raidEventId, status);
  if (error) throw new Error(error);

  revalidatePath(`/raids/${raidEventId}`);
  revalidatePath("/");
}

export async function assignSlot(raidEventId: string, characterId: string, slotIndex: number) {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo un Officer o Guild Master puede editar la composición");
  }

  const supabase = await createClient();

  const { data: character } = await supabase.from("characters").select("owner_id").eq("id", characterId).single();
  if (character) {
    const { data: siblings } = await supabase
      .from("characters")
      .select("id")
      .eq("owner_id", character.owner_id)
      .neq("id", characterId);
    const siblingIds = (siblings ?? []).map((c) => c.id);
    if (siblingIds.length) {
      await supabase.from("raid_signups").delete().eq("raid_event_id", raidEventId).in("character_id", siblingIds);
    }
  }

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
  push: string[];
  discord: string[];
  failed: string[];
};

export async function announceRaid(raidEventId: string): Promise<AnnounceRaidResult> {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo un Officer o Guild Master puede enviar la invitación");
  }

  const supabase = await createClient();

  const [{ data: raid, error: raidError }, { data: signups, error }, { data: settings }] = await Promise.all([
    supabase.from("raid_events").select("title, scheduled_at, raid_size").eq("id", raidEventId).single(),
    supabase
      .from("raid_signups")
      .select("slot_index, status, characters(name, owner_id, profiles(known_as, discord_username))")
      .eq("raid_event_id", raidEventId)
      .not("slot_index", "is", null),
    supabase.from("guild_settings").select("timezone").single(),
  ]);
  if (raidError || !raid) throw new Error("Raid no encontrada");
  if (error) throw new Error(error.message);

  await supabase.from("raid_events").update({ announced_at: new Date().toISOString() }).eq("id", raidEventId);

  const guildZone = settings?.timezone ?? "America/La_Paz";
  const when = new Date(raid.scheduled_at);
  const weekday = when.toLocaleDateString("es-MX", { timeZone: guildZone, weekday: "long" });
  const time = when.toLocaleTimeString("es-MX", { timeZone: guildZone, hour: "2-digit", minute: "2-digit" });

  const result: AnnounceRaidResult = { push: [], discord: [], failed: [] };

  for (const signup of signups ?? []) {
    const character = signup.characters as unknown as {
      name: string;
      owner_id: string;
      profiles: { known_as: string | null; discord_username: string } | null;
    } | null;
    // Bench slots stay private to officers: only the raid lineup gets invited.
    if (!character?.profiles || signup.slot_index === null || signup.slot_index >= raid.raid_size) continue;
    const name = character.profiles.known_as || character.profiles.discord_username;
    const group = `grupo ${Math.floor(signup.slot_index / GROUP_SIZE) + 1}`;

    const sent = await notifySafely([character.owner_id], {
      title: `${raid.title} · ${weekday}`,
      body: `Te convocaron con ${character.name} (${group}). ${time} hora de la guild. ¿Vas?`,
      url: `/raids/${raidEventId}`,
      tag: `raid-${raidEventId}`,
      actions: [
        { action: "accept", title: "Aceptar" },
        { action: "decline", title: "Rechazar" },
      ],
      data: { raidId: raidEventId },
    });

    if (!sent) throw new Error("No se pudo notificar: falta configurar SUPABASE_SECRET_KEY en el servidor.");
    if (sent.push.length) result.push.push(name);
    else if (sent.discord.length) result.discord.push(name);
    else result.failed.push(name);
  }

  revalidatePath(`/raids/${raidEventId}`);
  return result;
}

function localInputToIso(value: string, timeZone: string | null) {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  let zone = "America/La_Paz";
  try {
    if (timeZone) {
      new Intl.DateTimeFormat("en-US", { timeZone });
      zone = timeZone;
    }
  } catch {}
  return zonedToUtc(year, month, day, hour, minute, zone).toISOString();
}
