import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { CLASS_COLORS } from "@/lib/wow";
import { FadeIn } from "@/components/fade-in";
import { LocalDate } from "@/components/local-time";
import { PageHeader } from "@/components/page-header";
import { ItemIcon } from "@/components/item-icon";
import { lootItem, QUALITY_COLORS } from "@/lib/loot-data";
import type { Tables } from "@/types/database";

type LootWithCharacter = Tables<"loot_items"> & {
  characters: Tables<"characters">;
};

export default async function LootPage({ searchParams }: { searchParams: Promise<{ registrados?: string }> }) {
  const { registrados } = await searchParams;
  const saved = Number(registrados) || 0;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data } = await supabase
    .from("loot_items")
    .select("*, characters(*)")
    .order("awarded_at", { ascending: false });
  const loot = (data ?? []) as LootWithCharacter[];

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <PageHeader
          title="Loot"
          description="Todo lo que ha repartido el loot council, del más reciente al más antiguo."
          actions={
            isOfficer(profile) && (
              <Link href="/loot/new" className="btn-primary min-h-12 px-5 text-base">
                Registrar loot
              </Link>
            )
          }
        />
      </FadeIn>

      {saved > 0 && (
        <div role="status" className="card flex items-center gap-3 border-[var(--accent)] bg-[var(--accent-dim)] p-4 text-base">
          <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white">
            ✓
          </span>
          {saved === 1 ? "Listo, se registró el ítem." : `Listo, se registraron ${saved} ítems.`}
        </div>
      )}

      {loot.length === 0 ? (
        <p className="text-[var(--text-muted)]">Todavía no hay ítems registrados.</p>
      ) : (
        <FadeIn delay={0.05} className="card overflow-x-auto">
          <table className="table min-w-[600px] text-base">
            <thead>
              <tr>
                <th scope="col">Ítem</th>
                <th scope="col">Personaje</th>
                <th scope="col">Boss</th>
                <th scope="col" className="text-right">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {loot.map((item) => (
                <tr key={item.id}>
                  <td>
                    <ItemCell id={item.wowhead_item_id} name={item.item_name} />
                  </td>
                  <td className="font-medium" style={{ color: CLASS_COLORS[item.characters.class] }}>
                    {item.characters.name}
                  </td>
                  <td className="text-[var(--text-muted)]">{item.boss_name ?? "—"}</td>
                  <td className="text-right text-[var(--text-muted)]">
                    <LocalDate iso={item.awarded_at} className="tabular" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FadeIn>
      )}
    </div>
  );
}

function ItemCell({ id, name }: { id: number | null; name: string }) {
  const known = lootItem(id);
  const label = (
    <span className="flex items-center gap-3">
      <ItemIcon icon={known?.icon ?? null} quality={known?.quality ?? 4} size={32} />
      <span className="leading-tight">
        <span className="block font-semibold" style={{ color: QUALITY_COLORS[known?.quality ?? 4] }}>
          {name}
        </span>
        {known && (
          <span className="block text-sm text-[var(--text-muted)]">
            {[known.slot, known.type, known.ilvl && `ilvl ${known.ilvl}`].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
    </span>
  );
  return id ? (
    <a href={`https://www.wowhead.com/wotlk/es/item=${id}`} target="_blank" rel="noreferrer" className="hover:underline">
      {label}
    </a>
  ) : (
    label
  );
}
