import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export { isOfficer, isGuildMaster, isApproved, displayName } from "@/lib/roles";

export async function getCurrentProfile(): Promise<Tables<"profiles"> | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
