import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { CLASS_COLORS } from "@/lib/wow";
import type { Tables } from "@/types/database";

type LootWithCharacter = Tables<"loot_items"> & {
  characters: Tables<"characters">;
};

export default async function LootPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: loot } = await supabase
    .from("loot_items")
    .select("*, characters(*)")
    .order("awarded_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Historial de loot</h1>
        {isOfficer(profile) && (
          <Link href="/loot/new" className="btn-primary text-sm">
            + Registrar ítem
          </Link>
        )}
      </div>

      {(!loot || loot.length === 0) && (
        <p className="text-[var(--text-muted)]">Todavía no hay ítems registrados.</p>
      )}

      {loot && loot.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                <th className="px-4 py-3 font-medium">Ítem</th>
                <th className="px-4 py-3 font-medium">Personaje</th>
                <th className="px-4 py-3 font-medium">Boss</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(loot as LootWithCharacter[]).map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    {item.wowhead_item_id ? (
                      <a
                        href={`https://www.wowhead.com/wotlk/item=${item.wowhead_item_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--accent-soft)] hover:underline"
                      >
                        {item.item_name}
                      </a>
                    ) : (
                      item.item_name
                    )}
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: CLASS_COLORS[item.characters.class] }}
                  >
                    {item.characters.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {item.boss_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--text-muted)]">
                    {new Date(item.awarded_at).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
