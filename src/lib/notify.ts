import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDiscordDM, setGuildMemberRole } from "@/lib/discord";

export type NotificationPayload = {
  title: string;
  body: string;
  url?: string;
};

let vapidConfigured = false;

function configureVapid() {
  if (vapidConfigured) return;
  webpush.setVapidDetails(
    "mailto:admin@no-way-back.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  vapidConfigured = true;
}

export async function notify(profileIds: string[], payload: NotificationPayload) {
  const ids = [...new Set(profileIds)];
  if (ids.length === 0) return;

  const admin = createAdminClient();
  configureVapid();

  await admin.from("notifications").insert(
    ids.map((profile_id) => ({
      profile_id,
      title: payload.title,
      body: payload.body,
      url: payload.url ?? null,
    })),
  );

  const [{ data: subscriptions }, { data: profiles }] = await Promise.all([
    admin.from("push_subscriptions").select("*").in("profile_id", ids),
    admin.from("profiles").select("id, discord_id").in("id", ids),
  ]);

  const delivered = new Set<string>();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const body = JSON.stringify({ ...payload, url: payload.url ?? "/" });

  await Promise.all(
    (subscriptions ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
        delivered.add(sub.profile_id);
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }),
  );

  const link = payload.url ? `\n${siteUrl}${payload.url}` : "";
  await Promise.all(
    (profiles ?? [])
      .filter((p) => !delivered.has(p.id) && p.discord_id)
      .map((p) =>
        sendDiscordDM(p.discord_id!, `**${payload.title}**\n${payload.body}${link}`).catch(
          () => undefined,
        ),
      ),
  );
}

export async function notifyOfficers(payload: NotificationPayload) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .in("guild_role", ["officer", "guild_master"]);
  await notify((data ?? []).map((p) => p.id), payload);
}

export async function syncDiscordRole(profileId: string) {
  const admin = createAdminClient();
  const [{ data: settings }, { data: profile }] = await Promise.all([
    admin.from("guild_settings").select("discord_guild_id, discord_raider_role_id").single(),
    admin.from("profiles").select("discord_id, guild_role").eq("id", profileId).single(),
  ]);

  if (!settings?.discord_guild_id || !settings.discord_raider_role_id || !profile?.discord_id) {
    return;
  }

  await setGuildMemberRole(
    settings.discord_guild_id,
    profile.discord_id,
    settings.discord_raider_role_id,
    profile.guild_role !== "applicant",
  );
}
