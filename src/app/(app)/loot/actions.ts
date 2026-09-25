"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { lootItem } from "@/lib/loot-data";

export type LootFormState = { error: string | null };
export type LootEntryDraft = { itemId: number | null; itemName: string; characterId: string };

const MAX_ENTRIES = 20;

export async function createLootEntries(_prev: LootFormState, formData: FormData): Promise<LootFormState> {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) return { error: "Solo los oficiales pueden registrar loot." };

  let entries: LootEntryDraft[];
  try {
    entries = JSON.parse(String(formData.get("entries")));
  } catch {
    return { error: "No se pudo leer el formulario. Recarga la página e intenta de nuevo." };
  }
  if (!Array.isArray(entries) || entries.length === 0) return { error: "Marca al menos un ítem." };
  if (entries.length > MAX_ENTRIES) return { error: `Máximo ${MAX_ENTRIES} ítems a la vez.` };

  const rows = [];
  for (const entry of entries) {
    const known = lootItem(entry.itemId);
    const name = known?.name ?? String(entry.itemName ?? "").trim();
    if (name.length < 2) return { error: "Hay un ítem sin nombre." };
    if (!entry.characterId) return { error: `Falta elegir quién ganó ${name}.` };
    rows.push({ name, itemId: known?.id ?? null, characterId: entry.characterId });
  }

  const supabase = await createClient();
  const ids = [...new Set(rows.map((r) => r.characterId))];
  const { data: found } = await supabase.from("characters").select("id").in("id", ids);
  if ((found ?? []).length !== ids.length) return { error: "Uno de los personajes ya no existe. Recarga la página." };

  const raidEventId = String(formData.get("raid_event_id") ?? "") || null;
  const bossName = String(formData.get("boss_name") ?? "").trim() || null;

  const { error } = await supabase.from("loot_items").insert(
    rows.map((r) => ({
      character_id: r.characterId,
      item_name: r.name,
      wowhead_item_id: r.itemId,
      boss_name: bossName,
      raid_event_id: raidEventId,
      awarded_by: profile!.id,
    })),
  );
  if (error) return { error: `No se pudo registrar: ${error.message}` };

  revalidatePath("/loot");
  redirect(`/loot?registrados=${rows.length}`);
}
