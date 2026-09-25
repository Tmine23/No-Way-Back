"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { notifySafely, syncDiscordRole } from "@/lib/notify";
import type { Enums } from "@/types/database";

/** What officers pick in Miembros: the guild ranks plus Trial, which is a raider still being evaluated. */
export type MemberRank = Enums<"guild_rank"> | "trial";

async function requireOfficer() {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo Oficiales o el Guild Master pueden cambiar rangos");
  }
}

export async function updateMemberRank(memberId: string, rank: MemberRank) {
  await requireOfficer();

  const supabase = await createClient();
  const { data: before } = await supabase.from("profiles").select("is_trial, guild_role").eq("id", memberId).single();
  const { error } = await supabase
    .from("profiles")
    .update(rank === "trial" ? { guild_role: "raider", is_trial: true } : { guild_role: rank, is_trial: false })
    .eq("id", memberId);
  if (error) throw new Error(error.message);

  await syncDiscordRole(memberId).catch(() => undefined);

  if (before?.is_trial && rank === "raider") {
    await notifySafely([memberId], {
      title: "¡Ya eres No Way Back!",
      body: "Terminaste tu Trial. Bienvenido oficialmente a la guild.",
      url: "/",
    });
  }

  revalidatePath("/members");
  revalidatePath("/", "layout");
}
