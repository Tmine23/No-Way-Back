import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { GUILD_ROLE_LABELS } from "@/lib/wow";

export default async function HomePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

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

  const { count: myCharacterCount } = profile
    ? await supabase
        .from("characters")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", profile.id)
    : { count: 0 };

  const officer = isOfficer(profile);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--gold-soft)]">
          Bienvenido{profile ? `, ${profile.discord_username}` : ""}
        </h1>
        <p className="text-[var(--frost-soft)]">
          Frostmourne · parche 3.3.5 mítico · en carrera por realm first
        </p>
      </div>

      {!myCharacterCount && (
        <div className="card flex flex-col items-start gap-3 border-[var(--gold)]/40 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-elevated-2)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display font-semibold text-[var(--gold-soft)]">
              Da tu primer paso en el guild
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Registra tu personaje principal para aparecer en el roster y
              poder anotarte a las raids.
            </p>
          </div>
          <Link href="/roster/new" className="btn-primary whitespace-nowrap">
            Registrar personaje
          </Link>
        </div>
      )}

      {profile?.guild_role === "applicant" && (
        <div className="card border-l-4 border-l-[var(--gold)] p-4 text-sm text-neutral-300">
          Tu rango actual es <strong>{GUILD_ROLE_LABELS.applicant}</strong>. Un
          Officer revisará tu registro y te asignará tu rango dentro del guild.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Personajes registrados" value={characterCount ?? 0} />
        <StatCard label="Ítems en historial" value={lootCount ?? 0} />
        <Link href="/raids" className="card p-4 transition hover:border-[var(--border-strong)]">
          <p className="text-sm text-neutral-400">Próxima raid</p>
          <p className="mt-1 text-lg font-semibold text-[var(--frost-soft)]">
            {nextRaid
              ? `${nextRaid.title} — ${new Date(nextRaid.scheduled_at).toLocaleString("es-ES")}`
              : "Sin raids programadas"}
          </p>
        </Link>
      </div>

      {officer && (
        <div className="card p-5">
          <p className="font-display mb-3 font-semibold text-[var(--frost-soft)]">
            Panel de oficiales
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/raids/new" className="btn-primary text-sm">
              + Nueva raid
            </Link>
            <Link
              href="/loot/new"
              className="rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm text-neutral-200 transition hover:bg-[var(--bg-elevated-2)]"
            >
              + Registrar loot
            </Link>
            <Link
              href="/members"
              className="rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm text-neutral-200 transition hover:bg-[var(--bg-elevated-2)]"
            >
              Gestionar miembros
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--gold-soft)]">{value}</p>
    </div>
  );
}
