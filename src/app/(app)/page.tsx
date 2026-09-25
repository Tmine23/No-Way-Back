import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, displayName } from "@/lib/auth";
import { percentileRank } from "@/lib/ramp";
import { FadeIn } from "@/components/fade-in";
import { Magnetic } from "@/components/magnetic";
import { InstallApp } from "@/components/install-app";
import { PushToggle } from "@/components/push-toggle";
import { RaidSchedule } from "@/components/raid-schedule";
import { Countdown, LocalDateTime } from "@/components/local-time";
import { RosterTable, type RosterRow } from "@/components/roster-table";

export default async function HomePage() {
  const supabase = await createClient();
  const profile = (await getCurrentProfile())!;
  const officer = isOfficer(profile);

  const [
    { data: characters },
    { data: nextRaid },
    { count: lootCount },
    { data: settings },
    { data: schedule },
    { count: newApplications },
    { count: memberCount },
  ] = await Promise.all([
    supabase.from("characters").select("*"),
    supabase
      .from("raid_events")
      .select("*, raid_signups(slot_index, characters(owner_id))")
      .eq("status", "scheduled")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase.from("loot_items").select("id", { count: "exact", head: true }),
    supabase.from("guild_settings").select("timezone, seasons(server_id)").single(),
    supabase.from("raid_schedule").select("*"),
    officer
      ? supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "new")
      : Promise.resolve({ count: 0 }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).neq("guild_role", "applicant"),
  ]);

  const all = characters ?? [];
  const activeServerId = (settings?.seasons as { server_id: string } | null)?.server_id;
  const serverChars = all.filter((c) => !activeServerId || c.server_id === activeServerId);
  const scores = serverChars.map((c) => c.gearscore);
  const mine: RosterRow[] = serverChars
    .filter((c) => c.owner_id === profile.id)
    .map((c) => ({
      id: c.id,
      name: c.name,
      owner: displayName(profile),
      class: c.class,
      spec: c.spec_primary,
      role: c.role,
      spec2: c.spec_secondary,
      role2: c.role_secondary,
      gearscore: c.gearscore,
      percentile: percentileRank(scores, c.gearscore),
      isMain: c.is_main,
    }));

  const signups = (nextRaid?.raid_signups ?? []) as { slot_index: number | null; characters: { owner_id: string } | null }[];
  const inRoster = signups.filter((s) => s.slot_index !== null && s.slot_index < (nextRaid?.raid_size ?? 25));
  const imIn = inRoster.some((s) => s.characters?.owner_id === profile.id);
  const fill = nextRaid ? Math.round((inRoster.length / nextRaid.raid_size) * 100) : 0;

  return (
    <div className="flex flex-col gap-10">
      <FadeIn>
        <h1 className="display text-5xl font-bold uppercase sm:text-6xl">Hola, {displayName(profile)}</h1>
      </FadeIn>

      <InstallApp />
      <PushToggle compact />

      <FadeIn delay={0.05} className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section aria-labelledby="next-raid" className="plate relative flex flex-col overflow-hidden p-6 sm:p-8 lg:col-span-3">
          <h2 id="next-raid" className="text-sm font-medium text-[var(--text-muted)]">
            Próxima raid
          </h2>
          {nextRaid ? (
            <>
              <p className="display mt-3 text-4xl font-bold uppercase sm:text-5xl">{nextRaid.title}</p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <LocalDateTime iso={nextRaid.scheduled_at} className="tabular font-medium" />
                <Countdown iso={nextRaid.scheduled_at} className="tabular text-sm text-[var(--accent-soft)]" />
              </p>

              <div className="mt-8">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Composición</span>
                  <span className="tabular font-semibold">
                    {inRoster.length}
                    <span className="text-[var(--text-faint)]"> / {nextRaid.raid_size}</span>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg)]">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${fill}%` }} />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Magnetic>
                  <Link href={`/raids/${nextRaid.id}`} className="btn-primary min-h-11 px-5">
                    Ver raid
                  </Link>
                </Magnetic>
                <p className="text-sm text-[var(--text-muted)]">
                  {imIn ? "Estás en la composición." : "Todavía no estás en la composición."}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="display mt-3 text-4xl font-bold uppercase text-[var(--text-muted)]">Sin raids programadas</p>
              {officer && (
                <Link href="/raids/new" className="btn-primary mt-6 w-fit">
                  Crear raid
                </Link>
              )}
            </>
          )}
        </section>

        <section aria-labelledby="schedule" className="card p-6 lg:col-span-2">
          <h2 id="schedule" className="mb-4 text-sm font-medium text-[var(--text-muted)]">
            Horario de raid, en tu hora
          </h2>
          <RaidSchedule rows={schedule ?? []} guildTimezone={settings?.timezone ?? "America/La_Paz"} />
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section aria-labelledby="my-chars" className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <h2 id="my-chars" className="display text-3xl font-bold uppercase">
              Tus personajes
            </h2>
            <Link href="/personajes" className="text-sm font-medium text-[var(--accent-soft)] hover:underline">
              Administrar
            </Link>
          </div>
          {mine.length > 0 ? (
            <RosterTable rows={mine} compact />
          ) : (
            <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Registra tu main</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Sin personajes registrados los oficiales no pueden convocarte a las raids.
                </p>
              </div>
              <Magnetic>
                <Link href="/personajes/nuevo" className="btn-primary whitespace-nowrap">
                  Registrar personaje
                </Link>
              </Magnetic>
            </div>
          )}
        </section>
      </FadeIn>

      <FadeIn delay={0.15}>
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)]">
          <Stat label="Miembros" value={memberCount ?? 0} />
          <Stat label="Personajes" value={serverChars.length} />
          <Stat label="Ítems repartidos" value={lootCount ?? 0} />
        </dl>
      </FadeIn>

      {officer && (
        <FadeIn delay={0.2}>
          <section aria-labelledby="officers" className="flex flex-col gap-4">
            <h2 id="officers" className="display text-3xl font-bold uppercase">
              Oficiales
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/raids/new" className="btn-primary">
                Nueva raid
              </Link>
              <Link href="/solicitudes" className="btn-secondary">
                Solicitudes
                {!!newApplications && (
                  <span className="tabular rounded-full bg-[var(--accent)] px-1.5 text-xs text-white">{newApplications}</span>
                )}
              </Link>
              <Link href="/loot/new" className="btn-secondary">
                Registrar loot
              </Link>
              <Link href="/members" className="btn-secondary">
                Miembros
              </Link>
            </div>
          </section>
        </FadeIn>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse bg-[var(--surface)] px-5 py-4">
      <dt className="mt-1 text-sm text-[var(--text-muted)]">{label}</dt>
      <dd className="display tabular text-4xl font-bold">{value}</dd>
    </div>
  );
}
