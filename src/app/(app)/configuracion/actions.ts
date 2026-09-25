"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isGuildMaster } from "@/lib/auth";
import type { Enums } from "@/types/database";

async function requireGuildMaster() {
  const profile = await getCurrentProfile();
  if (!isGuildMaster(profile)) throw new Error("Solo el Guild Master");
  return createClient();
}

function text(formData: FormData, key: string) {
  const value = (formData.get(key) as string | null)?.trim();
  return value ? value : null;
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveGuildSettings(formData: FormData) {
  const supabase = await requireGuildMaster();
  const { error } = await supabase
    .from("guild_settings")
    .update({
      guild_name: text(formData, "guild_name") ?? "No Way Back",
      timezone: text(formData, "timezone") ?? "America/La_Paz",
      recruitment_open: formData.get("recruitment_open") === "on",
      recruitment_message: text(formData, "recruitment_message"),
      discord_guild_id: text(formData, "discord_guild_id"),
      discord_raider_role_id: text(formData, "discord_raider_role_id"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  refresh();
}

export async function addScheduleRow(formData: FormData) {
  const supabase = await requireGuildMaster();
  const { error } = await supabase.from("raid_schedule").insert({
    weekday: Number(formData.get("weekday")),
    start_time: formData.get("start_time") as string,
    end_time: formData.get("end_time") as string,
    label: text(formData, "label"),
  });
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteScheduleRow(id: string) {
  const supabase = await requireGuildMaster();
  const { error } = await supabase.from("raid_schedule").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

export async function addServer(formData: FormData) {
  const supabase = await requireGuildMaster();
  const { error } = await supabase.from("servers").insert({
    name: text(formData, "name")!,
    uwu_server_key: text(formData, "uwu_server_key"),
  });
  if (error) throw new Error(error.message);
  refresh();
}

export async function addSeason(formData: FormData) {
  const supabase = await requireGuildMaster();
  const { data, error } = await supabase
    .from("seasons")
    .insert({
      server_id: formData.get("server_id") as string,
      name: text(formData, "name")!,
      started_on: (formData.get("started_on") as string) || undefined,
      reset_weekday: Number(formData.get("reset_weekday")),
      reset_time: formData.get("reset_time") as string,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (formData.get("activate") === "on") {
    await supabase.from("guild_settings").update({ active_season_id: data.id }).eq("id", 1);
  }
  refresh();
}

export async function activateSeason(seasonId: string) {
  const supabase = await requireGuildMaster();
  const { error } = await supabase
    .from("guild_settings")
    .update({ active_season_id: seasonId })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  refresh();
}

export async function setSeasonPhase(seasonId: string, phase: Enums<"bis_phase">) {
  const supabase = await requireGuildMaster();
  const { error } = await supabase.from("seasons").update({ bis_phase: phase }).eq("id", seasonId);
  if (error) throw new Error(error.message);
  refresh();
}
