import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, displayName } from "@/lib/auth";
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
      <FadeIn className="flex items-center gap-3">
        <span className="h-8 w-1 rounded-full bg-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenido{profile ? `, ${displayName(profile)}` : ""}
        </h1>
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

      <FadeIn delay={0.1}>
        <Link
          href="/raids"
          className="card relative flex flex-col overflow-hidden p-8 transition-colors hover:border-[var(--border-strong)]"
        >
          <Image
            src="/logo-icon.png"
            alt=""
            width={180}
            height={180}
            className="pointer-events-none absolute -right-8 -top-8 opacity-[0.06]"
          />
          <p className="text-sm text-[var(--text-muted)]">Próxima raid</p>
          <p className="relative mt-2 text-3xl font-semibold tracking-tight">
            {nextRaid ? nextRaid.title : "Sin raids programadas"}
          </p>
          {nextRaid && (
            <p className="relative mt-2 font-mono text-sm text-[var(--accent-soft)]">
              {new Date(nextRaid.scheduled_at).toLocaleString("es-ES")}
            </p>
          )}
        </Link>
      </FadeIn>

      <FadeIn delay={0.15} className="grid grid-cols-2 gap-4">
        <StatTile label="Personajes registrados" value={characterCount ?? 0} />
        <StatTile label="Ítems en historial" value={lootCount ?? 0} />
      </FadeIn>

      {officer && (
        <FadeIn delay={0.2} className="card p-5">
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

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="font-mono text-4xl font-semibold text-[var(--accent-soft)]">
        {value}
      </p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
