import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { RAID_STATUS_LABELS } from "@/lib/wow";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { DateBlock, LocalTimeOnly } from "@/components/local-time";
import type { Tables } from "@/types/database";

type RaidRow = Tables<"raid_events"> & { raid_signups: { slot_index: number | null }[] };

export default async function RaidsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data } = await supabase
    .from("raid_events")
    .select("*, raid_signups(slot_index)")
    .order("scheduled_at", { ascending: true });
  const raids = (data ?? []) as RaidRow[];

  // Server component rendered per request: reading the clock here is intentional.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const upcoming = raids.filter((r) => r.status === "scheduled" && new Date(r.scheduled_at).getTime() >= now - 6 * 3600_000);
  const past = raids.filter((r) => !upcoming.includes(r)).reverse();

  return (
    <div className="flex flex-col gap-10">
      <FadeIn>
        <PageHeader
          title="Raids"
          actions={
            isOfficer(profile) && (
              <Link href="/raids/new" className="btn-primary">
                Nueva raid
              </Link>
            )
          }
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <RaidList title="Próximas" raids={upcoming} empty="No hay raids programadas todavía." />
      </FadeIn>

      {past.length > 0 && (
        <FadeIn delay={0.1}>
          <RaidList title="Anteriores" raids={past} muted />
        </FadeIn>
      )}
    </div>
  );
}

function RaidList({ title, raids, empty, muted = false }: { title: string; raids: RaidRow[]; empty?: string; muted?: boolean }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="display text-3xl font-bold uppercase">{title}</h2>
      {raids.length === 0 ? (
        <p className="text-[var(--text-muted)]">{empty}</p>
      ) : (
        <ul className="card divide-y divide-[var(--border)] overflow-hidden">
          {raids.map((raid) => {
            const assigned = raid.raid_signups.filter((s) => s.slot_index !== null && s.slot_index < raid.raid_size).length;
            const fill = Math.round((assigned / raid.raid_size) * 100);
            return (
              <li key={raid.id}>
                <Link
                  href={`/raids/${raid.id}`}
                  className={`flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-[var(--surface-2)] ${
                    muted ? "opacity-75" : ""
                  }`}
                >
                  <DateBlock iso={raid.scheduled_at} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{raid.title}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      <LocalTimeOnly iso={raid.scheduled_at} className="tabular" /> · {raid.raid_size} jugadores ·{" "}
                      {RAID_STATUS_LABELS[raid.status]}
                      {raid.announced_at && raid.status === "scheduled" && " · Notificada"}
                    </p>
                  </div>
                  <div className="hidden w-40 shrink-0 sm:block">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-faint)]">Composición</span>
                      <span className="tabular font-semibold">
                        {assigned}/{raid.raid_size}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--bg)]">
                      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${fill}%` }} />
                    </div>
                  </div>
                  <span className="tabular text-sm font-semibold sm:hidden">
                    {assigned}/{raid.raid_size}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
