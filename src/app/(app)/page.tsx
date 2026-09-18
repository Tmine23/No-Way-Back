import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, displayName } from "@/lib/auth";
import { GUILD_ROLE_LABELS } from "@/lib/wow";
import { FadeIn } from "@/components/fade-in";

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
      <FadeIn>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenido{profile ? `, ${displayName(profile)}` : ""}
        </h1>
        <p className="text-[var(--text-muted)]">
          Frostmourne · parche 3.3.5 mítico · en carrera por realm first
        </p>
      </FadeIn>

      {!myCharacterCount && (
        <FadeIn delay={0.05}>
          <div className="card flex flex-col items-start gap-3 border-[var(--accent)]/30 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Da tu primer paso en el guild</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Registra tu personaje principal para aparecer en el roster y
                poder anotarte a las raids.
              </p>
            </div>
            <Link href="/roster/new" className="btn-primary whitespace-nowrap">
              Registrar personaje
            </Link>
          </div>
        </FadeIn>
      )}

      {profile?.guild_role === "applicant" && (
        <FadeIn delay={0.08}>
          <div className="card border-l-2 border-l-[var(--accent)] p-4 text-sm text-[var(--text-muted)]">
            Tu rango actual es{" "}
            <strong className="text-[var(--text)]">{GUILD_ROLE_LABELS.applicant}</strong>.
            Un Officer revisará tu registro y te asignará tu rango dentro del
            guild.
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.1} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Link
          href="/raids"
          className="card flex flex-col justify-between p-6 transition-colors hover:border-[var(--border-strong)] lg:col-span-2"
        >
          <p className="text-sm text-[var(--text-muted)]">Próxima raid</p>
          <p className="mt-2 text-xl font-medium">
            {nextRaid ? nextRaid.title : "Sin raids programadas"}
          </p>
          {nextRaid && (
            <p className="mt-1 font-mono text-sm text-[var(--accent-soft)]">
              {new Date(nextRaid.scheduled_at).toLocaleString("es-ES")}
            </p>
          )}
        </Link>

        <div className="flex flex-col divide-y divide-[var(--border)] card">
          <StatRow label="Personajes registrados" value={characterCount ?? 0} />
          <StatRow label="Ítems en historial" value={lootCount ?? 0} />
        </div>
      </FadeIn>

      {officer && (
        <FadeIn delay={0.15} className="card p-5">
          <p className="mb-3 font-medium">Panel de oficiales</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/raids/new" className="btn-primary text-sm">
              + Nueva raid
            </Link>
            <Link href="/loot/new" className="btn-secondary text-sm">
              + Registrar loot
            </Link>
            <Link href="/members" className="btn-secondary text-sm">
              Gestionar miembros
            </Link>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="font-mono text-xl font-medium">{value}</p>
    </div>
  );
}
