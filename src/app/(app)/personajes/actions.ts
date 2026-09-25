"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatCharacterName, specRole } from "@/lib/wow";
import {
  validateDraft,
  type CharacterDraft,
  type CharacterFormState,
  type DraftErrors,
} from "@/lib/character-validation";

export async function saveCharacters(_prev: CharacterFormState, formData: FormData): Promise<CharacterFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let drafts: CharacterDraft[];
  try {
    drafts = JSON.parse(String(formData.get("characters")));
  } catch {
    return { error: "No se pudo leer el formulario. Recarga la página e intenta de nuevo." };
  }
  const serverId = String(formData.get("server_id") ?? "");
  if (!serverId) return { error: "Elige el servidor." };
  if (!Array.isArray(drafts) || drafts.length === 0) return { error: "Agrega al menos un personaje." };
  if (drafts.length > 10) return { error: "Puedes registrar hasta 10 personajes a la vez." };

  const fieldErrors: Record<number, DraftErrors> = {};
  const seen = new Map<string, number>();
  for (const [i, draft] of drafts.entries()) {
    const errors = validateDraft(draft);
    const key = formatCharacterName(draft.name).toLowerCase();
    if (!errors.name && seen.has(key)) errors.name = "Repetiste este nombre en el formulario.";
    seen.set(key, i);
    if (Object.keys(errors).length) fieldErrors[i] = errors;
  }
  if (Object.keys(fieldErrors).length) {
    return { error: "Revisa los campos marcados en rojo.", fieldErrors };
  }

  const names = drafts.map((d) => formatCharacterName(d.name));
  const { data: taken } = await supabase
    .from("characters")
    .select("name, owner_id, id")
    .eq("server_id", serverId)
    .in("name", names);
  for (const t of taken ?? []) {
    const i = names.indexOf(t.name);
    if (i >= 0 && t.id !== drafts[i].id) {
      fieldErrors[i] = {
        name: t.owner_id === user.id ? "Ya tienes un personaje con este nombre." : "Otro jugador ya registró este nombre.",
      };
    }
  }
  if (Object.keys(fieldErrors).length) {
    return { error: "Revisa los campos marcados en rojo.", fieldErrors };
  }

  const mainIndex = drafts.findIndex((d) => d.isMain);
  if (mainIndex >= 0) {
    const keepId = drafts[mainIndex].id;
    let query = supabase.from("characters").update({ is_main: false }).eq("owner_id", user.id).eq("server_id", serverId);
    if (keepId) query = query.neq("id", keepId);
    await query;
  }

  for (const [i, draft] of drafts.entries()) {
    const values = {
      server_id: serverId,
      name: names[i],
      class: draft.class,
      spec_primary: draft.spec,
      role: specRole(draft.class, draft.spec)!,
      spec_secondary: draft.spec2 || null,
      role_secondary: draft.spec2 ? specRole(draft.class, draft.spec2) : null,
      gearscore: draft.gearscore.trim() ? Number(draft.gearscore) : 0,
      professions: draft.professions,
      armory_url: draft.armoryUrl.trim() || null,
      is_main: i === mainIndex,
      updated_at: new Date().toISOString(),
    };
    const { error } = draft.id
      ? await supabase.from("characters").update(values).eq("id", draft.id).eq("owner_id", user.id)
      : await supabase.from("characters").insert({ ...values, owner_id: user.id });
    if (error) {
      if (error.code === "23505") return { error: null, fieldErrors: { [i]: { name: "Otro jugador ya registró este nombre." } } };
      return { error: `No se pudo guardar ${names[i]}: ${error.message}` };
    }
  }

  revalidatePath("/personajes");
  revalidatePath("/roster");
  revalidatePath("/");
  redirect("/personajes?guardado=" + drafts.length);
}

export async function deleteCharacter(id: string): Promise<CharacterFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count } = await supabase
    .from("loot_items")
    .select("id", { count: "exact", head: true })
    .eq("character_id", id);
  if (count) {
    return { error: "Este personaje tiene historial de loot y no se puede borrar." };
  }

  const { error } = await supabase.from("characters").delete().eq("id", id).eq("owner_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/personajes");
  revalidatePath("/roster");
  return { error: null };
}
