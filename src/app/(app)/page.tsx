import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, displayName } from "@/lib/auth";
import { FadeIn } from "@/components/fade-in";
import { PushToggle } from "@/components/push-toggle";
import { RaidSchedule } from "@/components/raid-schedule";
import { LocalDateTime } from "@/components/local-time";

export default async function HomePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const officer = isOfficer(profile);

  const [
    { count: characterCount },
    { data: nextRaid },
    { count: lootCount },
    { count: myCharacterCount },
    { data: settings },
    { data: schedule },
    { count: newApplications },
  ] = await Promise.all([
    supabase.from("characters").select("id", { count: "exact", head: true }),
    supabase
      .from("raid_events")
      .select("*")
      .eq("status", "scheduled")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase.from("loot_items").select("id", { count: "exact", head: true }),
    supabase.from("characters").select("id", { count: "exact", head: true }).eq("owner_id", profile!.id),
    supabase.from("guild_settings").select("timezone").single(),
    supabase.from("raid_schedule").select("*"),
    officer
      ? supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "new")
      : Promise.resolve({ count: 0 }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <FadeIn className="flex items-center gap-3">
        <span className="h-8 w-1 rounded-full bg-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenido, {displayName(profile!)}
        </h1>
      </FadeIn>

      <PushToggle compact />

      {!myCharacterCount && (
        <FadeIn delay={0.05}>
          <div className="card flex flex-col items-start gap-3 border-[var(--accent)]/30 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Registra tu main</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Sin personajes registrados los oficiales no pueden convocarte a las raids.
              </p>
            </div>
            <Link href="/personajes/nuevo" className="btn-primary whitespace-nowrap">
              Registrar personaje
            </Link>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.1} className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Link
          href="/raids"
          className="card relative flex flex-col overflow-hidden p-8 transition-colors hover:border-[var(--border-strong)] lg:col-span-3"
        >
          <Image
            src="/logo-icon.png"
            alt=""
            width={180}
            height={180}
            className="pointer-events-none absolute -right-8 -top-8 opacity-[0.06]"
          />
          <p className="text-sm text-[var(--text-muted)]">Próxima raid</p>
          <p className="relative mt-2 text-3xl font-semibold tracking-tight">
            {nextRaid ? nextRaid.title : "Sin raids programadas"}
          </p>
          {nextRaid && (
            <LocalDateTime
              iso={nextRaid.scheduled_at}
              className="relative mt-2 font-mono text-sm text-[var(--accent-soft)]"
            />
          )}
        </Link>

        <div className="card p-5 lg:col-span-2">
          <p className="mb-3 text-sm text-[var(--text-muted)]">Horario de raid (tu hora)</p>
          <RaidSchedule rows={schedule ?? []} guildTimezone={settings?.timezone ?? "America/La_Paz"} />
        </div>
      </FadeIn>

      <FadeIn delay={0.15} className="grid grid-cols-2 gap-4">
        <StatTile label="Personajes registrados" value={characterCount ?? 0} />
        <StatTile label="Ítems en historial" value={lootCount ?? 0} />
      </FadeIn>

      {officer && (
        <FadeIn delay={0.2} className="card p-5">
          <p className="mb-3 font-medium">Panel de oficiales</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/raids/new" className="btn-primary text-sm">
              + Nueva raid
            </Link>
            <Link href="/solicitudes" className="btn-secondary text-sm">
              Reclutamiento
              {!!newApplications && (
                <span className="ml-2 rounded-full bg-[var(--accent)] px-1.5 font-mono text-xs text-white">
                  {newApplications}
                </span>
              )}
            </Link>
            <Link href="/loot/new" className="btn-secondary text-sm">
              + Registrar loot
            </Link>
            <Link href="/members" className="btn-secondary text-sm">
              Miembros
            </Link>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="font-mono text-4xl font-semibold text-[var(--accent-soft)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
