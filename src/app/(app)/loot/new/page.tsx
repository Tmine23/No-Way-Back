import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, displayName } from "@/lib/auth";
import { LootForm, type LootRaidOption } from "@/components/loot-form";
import { PageHeader } from "@/components/page-header";

export default async function NewLootPage() {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) redirect("/loot");

  const supabase = await createClient();
  const [{ data: characters }, { data: raids }, { data: settings }] = await Promise.all([
    supabase.from("characters").select("id, name, class, spec_primary, profiles(known_as, discord_username)").order("name"),
    supabase
      .from("raid_events")
      .select("id, title, scheduled_at, raid_size, raid_signups(character_id, slot_index)")
      .order("scheduled_at", { ascending: false })
      .limit(15),
    supabase.from("guild_settings").select("timezone").single(),
  ]);

  const zone = settings?.timezone ?? "America/La_Paz";
  const raidOptions: LootRaidOption[] = (raids ?? []).map((r) => ({
    id: r.id,
    label: `${r.title} · ${new Date(r.scheduled_at).toLocaleDateString("es-MX", {
      timeZone: zone,
      weekday: "short",
      day: "numeric",
      month: "short",
    })}`,
    size: r.raid_size === 10 ? 10 : 25,
    characterIds: (r.raid_signups ?? [])
      .filter((s) => s.slot_index !== null && s.slot_index < r.raid_size)
      .map((s) => s.character_id),
  }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Registrar loot" description="Elige el boss, marca lo que cayó y a quién se lo dio el loot council." />
      <LootForm
        raids={raidOptions}
        characters={(characters ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          class: c.class,
          spec: c.spec_primary,
          owner: c.profiles ? displayName(c.profiles as { known_as: string | null; discord_username: string }) : "Sin dueño",
        }))}
      />
    </div>
  );
}
