"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import type { Enums } from "@/types/database";

export async function createRaidEvent(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  if (!isOfficer(profile)) {
    throw new Error("Solo los oficiales pueden crear raids");
  }

  const { data, error } = await supabase
    .from("raid_events")
    .insert({
      title: formData.get("title") as string,
      scheduled_at: new Date(formData.get("scheduled_at") as string).toISOString(),
      notes: (formData.get("notes") as string) || null,
      created_by: profile!.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/raids/${data.id}`);
}

export async function setSignup(
  raidEventId: string,
  characterId: string,
  status: Enums<"rsvp_status">,
) {
  const supabase = await createClient();

  const { error } = await supabase.from("raid_signups").upsert(
    {
      raid_event_id: raidEventId,
      character_id: characterId,
      status,
    },
    { onConflict: "raid_event_id,character_id" },
  );

  if (error) throw new Error(error.message);

  revalidatePath(`/raids/${raidEventId}`);
}
