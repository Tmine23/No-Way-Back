"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export async function createCharacter(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const professionsRaw = formData.get("professions") as string;

  const { error } = await supabase.from("characters").insert({
    owner_id: user.id,
    name: formData.get("name") as string,
    class: formData.get("class") as Enums<"wow_class">,
    spec_primary: formData.get("spec_primary") as string,
    spec_secondary: (formData.get("spec_secondary") as string) || null,
    role: formData.get("role") as Enums<"character_role">,
    ilvl: Number(formData.get("ilvl")) || 0,
    professions: professionsRaw
      ? professionsRaw.split(",").map((p) => p.trim()).filter(Boolean)
      : [],
    is_main: formData.get("is_main") === "on",
    armory_url: (formData.get("armory_url") as string) || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/roster");
}
