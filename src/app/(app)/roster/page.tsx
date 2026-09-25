import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { displayName } from "@/lib/auth";
import { CLASS_COLORS, CLASS_LABELS, ROLE_LABELS, WOW_CLASSES } from "@/lib/wow";
import { FadeIn } from "@/components/fade-in";
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
    .eq("server_id", serverId ?? "")
    .order("is_main", { ascending: false })
    .order("name");
  const characters = (data ?? []) as CharacterWithOwner[];

  const byOwner = new Map<string, CharacterWithOwner[]>();
  for (const c of characters) {
    const owner = c.profiles ? displayName(c.profiles) : "Sin dueño";
    byOwner.set(owner, [...(byOwner.get(owner) ?? []), c]);
  }
  const groups = [...byOwner.entries()].sort(([a], [b]) => a.localeCompare(b));

  const mains = characters.filter((c) => c.is_main);
  const roleCounts = ROLES.map((r) => ({ role: r, count: mains.filter((c) => c.role === r).length }));
  const classCounts = WOW_CLASSES.map((cls) => ({
    cls,
    count: mains.filter((c) => c.class === cls).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Roster</h1>
        <div className="flex items-center gap-2">
          {servers && servers.length > 1 && (
            <div className="flex gap-1">
              {servers.map((s) => (
                <Link
                  key={s.id}
                  href={`/roster?server=${s.id}`}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    s.id === serverId
                      ? "bg-[var(--surface-2)] text-[var(--text)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
          <Link href="/personajes/nuevo" className="btn-primary text-sm">
            + Registrar personaje
          </Link>
        </div>
      </div>

      {mains.length > 0 && (
        <div className="card flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm">
          <span className="text-[var(--text-faint)]">Mains</span>
          {roleCounts.map((r) => (
            <span key={r.role}>
              {ROLE_LABELS[r.role]} <span className="font-mono text-[var(--accent-soft)]">{r.count}</span>
            </span>
          ))}
          <span className="hidden h-4 w-px bg-[var(--border)] sm:block" />
          {classCounts.map((c) => (
            <span key={c.cls} style={{ color: CLASS_COLORS[c.cls] }}>
              {CLASS_LABELS[c.cls]} <span className="font-mono">{c.count}</span>
            </span>
          ))}
        </div>
      )}

      {groups.length === 0 && (
        <p className="text-[var(--text-muted)]">Todavía no hay personajes registrados en este servidor.</p>
      )}

      {groups.length > 0 && (
        <FadeIn className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                <th className="w-36 px-4 py-3 font-medium">Jugador</th>
                <th className="px-4 py-3 font-medium">Personaje</th>
                <th className="px-4 py-3 font-medium">Clase</th>
                <th className="px-4 py-3 font-medium">Spec</th>
                <th className="px-4 py-3 font-medium">Segunda spec</th>
                <th className="px-4 py-3 text-right font-medium">GS</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(([owner, chars]) =>
                chars.map((c, i) => (
                  <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
                    {i === 0 && (
                      <td rowSpan={chars.length} className="border-r border-[var(--border)] px-4 py-3 align-top font-medium">
                        {owner}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: CLASS_COLORS[c.class] }}>
                        {c.name}
                      </span>
                      {c.is_main && (
                        <span className="badge ml-2 border border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent-soft)]">
                          Main
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{CLASS_LABELS[c.class]}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {c.spec_primary} <span className="text-[var(--text-faint)]">· {ROLE_LABELS[c.role]}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {c.spec_secondary ? (
                        <>
                          {c.spec_secondary}{" "}
                          <span className="text-[var(--text-faint)]">· {ROLE_LABELS[c.role_secondary ?? "dps"]}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--text-muted)]">{c.gearscore || "—"}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </FadeIn>
      )}
    </div>
  );
}
