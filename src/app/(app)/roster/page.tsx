import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { displayName } from "@/lib/auth";
import { CLASS_COLORS, CLASS_LABELS, ROLE_LABELS } from "@/lib/wow";
import { FadeIn } from "@/components/fade-in";
import type { Tables } from "@/types/database";

type CharacterWithOwner = Tables<"characters"> & {
  profiles: { discord_username: string; known_as: string | null } | null;
};

export default async function RosterPage() {
  const supabase = await createClient();
  const { data: characters } = await supabase
    .from("characters")
    .select("*, profiles(discord_username, known_as)")
    .order("is_main", { ascending: false })
    .order("name", { ascending: true });

  const byOwner = new Map<string, CharacterWithOwner[]>();
  for (const character of (characters ?? []) as CharacterWithOwner[]) {
    const ownerName = character.profiles ? displayName(character.profiles) : "Sin dueño";
    if (!byOwner.has(ownerName)) byOwner.set(ownerName, []);
    byOwner.get(ownerName)!.push(character);
  }
  const groups = [...byOwner.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Roster</h1>
        <Link href="/roster/new" className="btn-primary text-sm">
          + Registrar personaje
        </Link>
      </div>

      {groups.length === 0 && (
        <p className="text-[var(--text-muted)]">Todavía no hay personajes registrados.</p>
      )}

      {groups.length > 0 && (
        <FadeIn className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                <th className="w-40 px-4 py-3 font-medium">Jugador</th>
                <th className="px-4 py-3 font-medium">Personaje</th>
                <th className="px-4 py-3 font-medium">Clase</th>
                <th className="px-4 py-3 font-medium">Spec</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 text-right font-medium">ilvl</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(([owner, chars]) =>
                chars.map((character, i) => (
                  <tr key={character.id} className="border-b border-[var(--border)] last:border-0">
                    {i === 0 && (
                      <td
                        rowSpan={chars.length}
                        className="border-r border-[var(--border)] px-4 py-3 align-top font-medium"
                      >
                        {owner}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span
                        className="font-medium"
                        style={{ color: CLASS_COLORS[character.class] }}
                      >
                        {character.name}
                      </span>
                      {character.is_main && (
                        <span className="badge ml-2 border border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent-soft)]">
                          Main
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {CLASS_LABELS[character.class]}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {character.spec_primary}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {ROLE_LABELS[character.role]}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--text-muted)]">
                      {character.ilvl}
                    </td>
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
