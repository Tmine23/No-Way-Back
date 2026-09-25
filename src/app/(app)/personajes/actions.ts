"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type CharacterFormState = { error: string | null };

function optional(formData: FormData, key: string) {
  const value = (formData.get(key) as string | null)?.trim();
  return value ? value : null;
}

export async function saveCharacter(
  _prev: CharacterFormState,
  formData: FormData,
): Promise<CharacterFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = optional(formData, "id");
  const serverId = formData.get("server_id") as string;
  const isMain = formData.get("is_main") === "on";
  const specSecondary = optional(formData, "spec_secondary");
  const professions = optional(formData, "professions");

  const values = {
    server_id: serverId,
    name: (formData.get("name") as string).trim(),
    class: formData.get("class") as Enums<"wow_class">,
    spec_primary: formData.get("spec_primary") as string,
    role: formData.get("role") as Enums<"character_role">,
    spec_secondary: specSecondary,
    role_secondary: specSecondary
      ? ((formData.get("role_secondary") as Enums<"character_role">) ?? null)
      : null,
    gearscore: Number(formData.get("gearscore")) || 0,
    professions: professions ? professions.split(",").map((p) => p.trim()).filter(Boolean) : [],
    armory_url: optional(formData, "armory_url"),
    is_main: isMain,
    updated_at: new Date().toISOString(),
  };

  if (isMain) {
    let query = supabase
      .from("characters")
      .update({ is_main: false })
      .eq("owner_id", user.id)
      .eq("server_id", serverId);
    if (id) query = query.neq("id", id);
    await query;
  }

  const { error } = id
    ? await supabase.from("characters").update(values).eq("id", id).eq("owner_id", user.id)
    : await supabase.from("characters").insert({ ...values, owner_id: user.id });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un personaje con ese nombre en ese servidor." };
    }
    return { error: error.message };
  }

  revalidatePath("/personajes");
  revalidatePath("/roster");
  redirect("/personajes");
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
