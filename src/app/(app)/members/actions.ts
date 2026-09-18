"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import type { Enums } from "@/types/database";

export async function updateMemberRole(
  memberId: string,
  newRole: Enums<"guild_role">,
) {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) {
    throw new Error("Solo Officers o el Guild Master pueden cambiar roles");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ guild_role: newRole })
    .eq("id", memberId);

  if (error) throw new Error(error.message);

  revalidatePath("/members");
}
