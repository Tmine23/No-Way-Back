"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyOfficers } from "@/lib/notify";
import type { Enums } from "@/types/database";

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

export async function submitApplication(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const applicantType = formData.get("applicant_type") as Enums<"applicant_type">;
  const gearscoreRaw = formData.get("gearscore") as string;

  const { error } = await supabase.from("applications").insert({
    profile_id: user.id,
    applicant_type: applicantType,
    previous_server: (formData.get("previous_server") as string) || null,
    previous_guild: (formData.get("previous_guild") as string) || null,
    class: (formData.get("class") as Enums<"wow_class">) || null,
    spec: (formData.get("spec") as string) || null,
    gearscore: gearscoreRaw ? Number(gearscoreRaw) : null,
    experience: (formData.get("experience") as string) || null,
    availability: (formData.get("availability") as string) || null,
    logs_url: (formData.get("logs_url") as string) || null,
  });

  if (error) return { error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("known_as, discord_username")
    .eq("id", user.id)
    .single();
  const name = profile?.known_as || profile?.discord_username || "Alguien";

  await notifyOfficers({
    title: "Nueva postulación",
    body: `${name} quiere unirse al guild.`,
    url: "/solicitudes",
  }).catch(() => undefined);

  revalidatePath("/", "layout");
  return { error: null };
}
