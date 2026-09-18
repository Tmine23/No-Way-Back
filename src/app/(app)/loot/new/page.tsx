import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { createLootEntry } from "@/app/(app)/loot/actions";

export default async function NewLootPage() {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) redirect("/loot");

  const supabase = await createClient();
  const [{ data: characters }, { data: raids }] = await Promise.all([
    supabase.from("characters").select("id, name").order("name"),
    supabase
      .from("raid_events")
      .select("id, title")
      .order("scheduled_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-[var(--gold-soft)]">
        Registrar ítem
      </h1>

      <form action={createLootEntry} className="flex max-w-lg flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Nombre del ítem
          <input
            name="item_name"
            required
            className="input"
            placeholder="Ej. Death's Verdict"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Wowhead item ID (opcional)
          <input
            name="wowhead_item_id"
            type="number"
            className="input"
            placeholder="Ej. 50783"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Personaje ganador
          <select name="character_id" required className="input">
            {characters?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Raid (opcional)
          <select name="raid_event_id" className="input" defaultValue="">
            <option value="">— Sin asociar —</option>
            {raids?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Boss (opcional)
          <input name="boss_name" className="input" placeholder="Ej. The Lich King" />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Notas (opcional)
          <textarea name="notes" className="input" rows={3} />
        </label>

        <button type="submit" className="btn-primary mt-2">
          Registrar
        </button>
      </form>
    </div>
  );
}
