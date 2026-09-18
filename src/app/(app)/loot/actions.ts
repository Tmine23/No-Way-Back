"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";

export async function createLootEntry(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo los oficiales pueden registrar loot");
  }

  const supabase = await createClient();
  const wowheadId = formData.get("wowhead_item_id") as string;
  const raidEventId = formData.get("raid_event_id") as string;

  const { error } = await supabase.from("loot_items").insert({
    character_id: formData.get("character_id") as string,
    item_name: formData.get("item_name") as string,
    boss_name: (formData.get("boss_name") as string) || null,
    wowhead_item_id: wowheadId ? Number(wowheadId) : null,
    raid_event_id: raidEventId || null,
    notes: (formData.get("notes") as string) || null,
    awarded_by: profile!.id,
  });

  if (error) throw new Error(error.message);

  redirect("/loot");
}
