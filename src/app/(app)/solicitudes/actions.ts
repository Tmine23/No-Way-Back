"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { notifySafely, syncDiscordRole } from "@/lib/notify";
import type { Enums } from "@/types/database";

async function requireOfficer() {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) throw new Error("Solo Oficiales o el Guild Master");
  return profile!;
}

/**
 * Accepting lets the player in right away as a Trial (raider rank, trial flag on).
 * Officers later confirm them as No Way Back from Miembros.
 */
export async function decideApplication(applicationId: string, decision: "accept" | "reject" | "reopen") {
  await requireOfficer();
  const supabase = await createClient();

  const status = decision === "accept" ? "accepted" : decision === "reject" ? "rejected" : "new";
  const { data: application, error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .select("profile_id")
    .single();
  if (error) throw new Error(error.message);

  const { error: profileError } = await supabase
    .from("profiles")
    .update(decision === "accept" ? { guild_role: "raider", is_trial: true } : { guild_role: "applicant", is_trial: false })
    .eq("id", application.profile_id);
  if (profileError) throw new Error(profileError.message);

  await syncDiscordRole(application.profile_id).catch(() => undefined);

  if (decision === "accept") {
    await notifySafely([application.profile_id], {
      title: "¡Bienvenido a No Way Back!",
      body: "Entraste como Trial. Ya puedes usar la app: registra tus personajes.",
      url: "/personajes/nuevo",
    });
  } else if (decision === "reject") {
    await notifySafely([application.profile_id], {
      title: "Resultado de tu postulación",
      body: "Esta vez tu postulación no fue aceptada. Gracias por tu interés en la guild.",
      url: "/",
    });
  }

  revalidatePath("/solicitudes");
  revalidatePath("/members");
}

export async function addApplicationComment(applicationId: string, body: string) {
  const profile = await requireOfficer();
  const text = body.trim();
  if (!text) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("application_comments")
    .insert({ application_id: applicationId, author_id: profile.id, body: text });
  if (error) throw new Error(error.message);

  revalidatePath("/solicitudes");
}

export async function saveRecruitmentNeed(formData: FormData) {
  await requireOfficer();
  const supabase = await createClient();

  const { error } = await supabase.from("recruitment_needs").upsert(
    {
      class: formData.get("class") as Enums<"wow_class">,
      spec: (formData.get("spec") as string).trim(),
      priority: formData.get("priority") as Enums<"recruitment_priority">,
      note: (formData.get("note") as string) || null,
    },
    { onConflict: "class,spec" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/solicitudes");
  revalidatePath("/reclutamiento");
}

export async function deleteRecruitmentNeed(id: string) {
  await requireOfficer();
  const supabase = await createClient();
  const { error } = await supabase.from("recruitment_needs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/solicitudes");
  revalidatePath("/reclutamiento");
}
