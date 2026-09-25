import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { RaidForm } from "@/components/raid-form";

export default async function NewRaidPage() {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) redirect("/raids");

  const supabase = await createClient();
  const [{ data: schedule }, { data: settings }] = await Promise.all([
    supabase.from("raid_schedule").select("id, weekday, start_time, label"),
    supabase.from("guild_settings").select("timezone").single(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Nueva raid" description="Después de crearla armas la composición y notificas a la guild." />
      <RaidForm schedule={schedule ?? []} guildTimezone={settings?.timezone ?? "America/La_Paz"} />
    </div>
  );
}
