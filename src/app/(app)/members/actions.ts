"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { syncDiscordRole } from "@/lib/notify";
import type { Enums } from "@/types/database";

async function requireOfficer() {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo Oficiales o el Guild Master pueden cambiar rangos");
  }
}

export async function updateMemberRole(memberId: string, newRole: Enums<"guild_rank">) {
  await requireOfficer();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ guild_role: newRole })
    .eq("id", memberId);

  if (error) throw new Error(error.message);

  await syncDiscordRole(memberId).catch(() => undefined);
  revalidatePath("/members");
}

export async function setMemberTrial(memberId: string, isTrial: boolean) {
  await requireOfficer();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_trial: isTrial })
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath("/members");
}
