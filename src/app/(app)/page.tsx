import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ count: characterCount }, { data: nextRaid }, { count: lootCount }] =
    await Promise.all([
      supabase.from("characters").select("*", { count: "exact", head: true }),
      supabase
        .from("raid_events")
        .select("*")
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from("loot_items").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="text-neutral-400">
          Frostmourne · parche 3.3.5 mítico · en carrera por realm first
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Personajes registrados" value={characterCount ?? 0} />
        <StatCard label="Ítems en historial" value={lootCount ?? 0} />
        <Link
          href="/raids"
          className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition hover:border-neutral-700"
        >
          <p className="text-sm text-neutral-400">Próxima raid</p>
          <p className="mt-1 text-lg font-semibold">
            {nextRaid
              ? `${nextRaid.title} — ${new Date(nextRaid.scheduled_at).toLocaleString("es-ES")}`
              : "Sin raids programadas"}
          </p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
