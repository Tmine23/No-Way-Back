"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setKnownAs(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const knownAs = (formData.get("known_as") as string)?.trim();
  if (!knownAs) return { error: "Escribe un nombre" };

  const { error } = await supabase
    .from("profiles")
    .update({ known_as: knownAs })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { error: null };
}
