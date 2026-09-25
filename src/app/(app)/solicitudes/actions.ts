"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { notify, syncDiscordRole } from "@/lib/notify";
import type { Enums } from "@/types/database";

const APPLICANT_MESSAGES: Record<Enums<"application_status">, { title: string; body: string } | null> = {
  new: null,
  interview: {
    title: "Tu postulación avanzó",
    body: "Estás en etapa de entrevista. Un Oficial te va a contactar por Discord.",
  },
  trial: {
    title: "¡Bienvenido a No Way Back!",
    body: "Entraste como trial. Ya tienes acceso al guild hub: registra tus personajes.",
  },
  accepted: {
    title: "¡Bienvenido a No Way Back!",
    body: "Tu postulación fue aceptada. Ya tienes acceso al guild hub: registra tus personajes.",
  },
  rejected: {
    title: "Resultado de tu postulación",
    body: "Esta vez tu postulación no fue aceptada. Gracias por tu interés en la guild.",
  },
};

async function requireOfficer() {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) throw new Error("Solo Oficiales o el Guild Master");
  return profile!;
}

export async function setApplicationStatus(
  applicationId: string,
  status: Enums<"application_status">,
) {
  await requireOfficer();
  const supabase = await createClient();

  const { data: application, error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .select("profile_id")
    .single();
  if (error) throw new Error(error.message);

  const joined = status === "trial" || status === "accepted";
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      guild_role: joined ? "raider" : "applicant",
      is_trial: status === "trial",
    })
    .eq("id", application.profile_id);
  if (profileError) throw new Error(profileError.message);

  await syncDiscordRole(application.profile_id).catch(() => undefined);

  const message = APPLICANT_MESSAGES[status];
  if (message) {
    await notify([application.profile_id], { ...message, url: "/" }).catch(() => undefined);
  }

  revalidatePath("/solicitudes");
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
