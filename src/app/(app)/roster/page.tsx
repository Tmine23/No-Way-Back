import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { displayName } from "@/lib/auth";
import { percentileRank } from "@/lib/ramp";
import { CLASS_COLORS, CLASS_LABELS, ROLE_LABELS, WOW_CLASSES } from "@/lib/wow";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { RosterTable, type RosterRow } from "@/components/roster-table";
import type { Enums, Tables } from "@/types/database";

type CharacterWithOwner = Tables<"characters"> & {
  profiles: { discord_username: string; known_as: string | null } | null;
};

const ROLES: Enums<"character_role">[] = ["tank", "healer", "dps"];

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{ server?: string }>;
}) {
  const { server } = await searchParams;
  const supabase = await createClient();

  const [{ data: servers }, { data: settings }] = await Promise.all([
    supabase.from("servers").select("id, name").order("name"),
    supabase.from("guild_settings").select("seasons(server_id)").single(),
  ]);
  const activeServerId = (settings?.seasons as { server_id: string } | null)?.server_id;
  const serverId = server ?? activeServerId ?? servers?.[0]?.id;

  const { data } = await supabase
    .from("characters")
    .select("*, profiles(discord_username, known_as)")
    .eq("server_id", serverId ?? "");
  const characters = (data ?? []) as CharacterWithOwner[];

  const scores = characters.map((c) => c.gearscore);
  const rows: RosterRow[] = characters.map((c) => ({
    id: c.id,
    name: c.name,
    owner: c.profiles ? displayName(c.profiles) : "Sin dueño",
    class: c.class,
    spec: c.spec_primary,
    role: c.role,
    spec2: c.spec_secondary,
    role2: c.role_secondary,
    gearscore: c.gearscore,
    percentile: percentileRank(scores, c.gearscore),
    isMain: c.is_main,
  }));

  const mains = characters.filter((c) => c.is_main);
  const roleCounts = ROLES.map((r) => ({ role: r, count: mains.filter((c) => c.role === r).length }));
  const classCounts = WOW_CLASSES.map((cls) => ({
    cls,
    count: mains.filter((c) => c.class === cls).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <PageHeader
          title="Roster"
          description="Todos los personajes de la guild. El color del gearscore marca el percentil dentro de la guild."
          actions={
            <Link href="/personajes/nuevo" className="btn-primary">
              Registrar personaje
            </Link>
          }
        />
      </FadeIn>

      {servers && servers.length > 1 && (
        <nav aria-label="Servidor" className="flex flex-wrap gap-1">
          {servers.map((s) => (
            <Link
              key={s.id}
              href={`/roster?server=${s.id}`}
              aria-current={s.id === serverId ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                s.id === serverId
                  ? "bg-[var(--plate)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {s.name}
            </Link>
          ))}
        </nav>
      )}

      {mains.length > 0 && (
        <FadeIn delay={0.05} className="grid gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-[auto_1fr]">
          <div className="flex gap-6 bg-[var(--surface)] px-5 py-4">
            {roleCounts.map((r) => (
              <div key={r.role}>
                <p className="display tabular text-4xl font-bold">{r.count}</p>
                <p className="text-sm text-[var(--text-muted)]">{ROLE_LABELS[r.role]}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap content-center gap-x-5 gap-y-2 bg-[var(--surface)] px-5 py-4 text-sm">
            {classCounts.map((c) => (
              <span key={c.cls} className="flex items-baseline gap-1.5">
                <span className="font-medium" style={{ color: CLASS_COLORS[c.cls] }}>
                  {CLASS_LABELS[c.cls]}
                </span>
                <span className="tabular text-[var(--text-muted)]">{c.count}</span>
              </span>
            ))}
          </div>
        </FadeIn>
      )}

      {rows.length === 0 ? (
        <div className="card flex flex-col items-start gap-3 p-6">
          <p className="font-medium">Todavía no hay personajes en este servidor.</p>
          <Link href="/personajes/nuevo" className="btn-secondary">
            Registrar el primero
          </Link>
        </div>
      ) : (
        <FadeIn delay={0.1}>
          <RosterTable rows={rows} />
        </FadeIn>
      )}
    </div>
  );
}
