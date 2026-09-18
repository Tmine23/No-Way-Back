import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CLASS_COLORS, CLASS_LABELS, ROLE_LABELS } from "@/lib/wow";
import type { Tables } from "@/types/database";

type CharacterWithOwner = Tables<"characters"> & {
  profiles: { discord_username: string } | null;
};

export default async function RosterPage() {
  const supabase = await createClient();
  const { data: characters } = await supabase
    .from("characters")
    .select("*, profiles(discord_username)")
    .order("is_main", { ascending: false })
    .order("name", { ascending: true });

  const byOwner = new Map<string, CharacterWithOwner[]>();
  for (const character of (characters ?? []) as CharacterWithOwner[]) {
    const ownerName = character.profiles?.discord_username ?? "Sin dueño";
    if (!byOwner.has(ownerName)) byOwner.set(ownerName, []);
    byOwner.get(ownerName)!.push(character);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roster</h1>
        <Link
          href="/roster/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
        >
          + Registrar personaje
        </Link>
      </div>

      {byOwner.size === 0 && (
        <p className="text-neutral-400">Todavía no hay personajes registrados.</p>
      )}

      <div className="flex flex-col gap-4">
        {[...byOwner.entries()].map(([owner, chars]) => (
          <div
            key={owner}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
          >
            <p className="mb-3 text-sm font-medium text-neutral-400">{owner}</p>
            <div className="flex flex-col gap-2">
              {chars.map((character) => (
                <div
                  key={character.id}
                  className="flex items-center justify-between rounded-md bg-neutral-950 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="font-semibold"
                      style={{ color: CLASS_COLORS[character.class] }}
                    >
                      {character.name}
                    </span>
                    {character.is_main && (
                      <span className="rounded bg-indigo-950 px-2 py-0.5 text-xs text-indigo-300">
                        Main
                      </span>
                    )}
                    <span className="text-sm text-neutral-400">
                      {CLASS_LABELS[character.class]} · {character.spec_primary} ·{" "}
                      {ROLE_LABELS[character.role]}
                    </span>
                  </div>
                  <span className="text-sm text-neutral-400">
                    ilvl {character.ilvl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
