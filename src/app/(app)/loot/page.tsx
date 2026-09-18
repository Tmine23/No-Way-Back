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
        <h1 className="text-2xl font-bold">Historial de loot</h1>
        {isOfficer(profile) && (
          <Link
            href="/loot/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
          >
            + Registrar ítem
          </Link>
        )}
      </div>

      {(!loot || loot.length === 0) && (
        <p className="text-neutral-400">Todavía no hay ítems registrados.</p>
      )}

      <div className="overflow-hidden rounded-lg border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">Ítem</th>
              <th className="px-3 py-2 text-left">Personaje</th>
              <th className="px-3 py-2 text-left">Boss</th>
              <th className="px-3 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {(loot as LootWithCharacter[] | null)?.map((item) => (
              <tr key={item.id} className="border-t border-neutral-800">
                <td className="px-3 py-2">
                  {item.wowhead_item_id ? (
                    <a
                      href={`https://www.wowhead.com/wotlk/item=${item.wowhead_item_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline"
                    >
                      {item.item_name}
                    </a>
                  ) : (
                    item.item_name
                  )}
                </td>
                <td
                  className="px-3 py-2 font-medium"
                  style={{ color: CLASS_COLORS[item.characters.class] }}
                >
                  {item.characters.name}
                </td>
                <td className="px-3 py-2 text-neutral-300">
                  {item.boss_name ?? "—"}
                </td>
                <td className="px-3 py-2 text-neutral-400">
                  {new Date(item.awarded_at).toLocaleDateString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
