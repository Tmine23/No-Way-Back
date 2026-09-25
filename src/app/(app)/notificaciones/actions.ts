"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type SerializedSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, userId: user.id };
}

export async function subscribePush(sub: SerializedSubscription) {
  const { supabase, userId } = await currentUserId();

  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  const { error } = await supabase.from("push_subscriptions").insert({
    profile_id: userId,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  });
  if (error) throw new Error(error.message);
}

export async function unsubscribePush(endpoint: string) {
  const { supabase } = await currentUserId();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

export async function markAllNotificationsRead() {
  const { supabase, userId } = await currentUserId();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", userId)
    .is("read_at", null);
  revalidatePath("/", "layout");
}
