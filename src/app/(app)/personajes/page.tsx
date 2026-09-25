import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { percentileRank } from "@/lib/ramp";
import { DeleteCharacterButton } from "@/components/delete-character-button";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { ParseBar, RankValue } from "@/components/parse-bar";
import { CLASS_COLORS, CLASS_LABELS, normalizeProfessions, PRIMARY_PROFESSIONS, ROLE_LABELS, SECONDARY_PROFESSIONS } from "@/lib/wow";
import type { Tables } from "@/types/database";

type CharacterWithServer = Tables<"characters"> & { servers: { name: string } | null };

export default async function MyCharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ guardado?: string }>;
}) {
  const { guardado } = await searchParams;
  const savedCount = Number(guardado) || 0;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [{ data }, { data: allScores }] = await Promise.all([
    supabase
      .from("characters")
      .select("*, servers(name)")
      .eq("owner_id", profile!.id)
      .order("is_main", { ascending: false })
      .order("gearscore", { ascending: false }),
    supabase.from("characters").select("server_id, gearscore"),
  ]);

  const characters = (data ?? []) as CharacterWithServer[];
  const scoresFor = (serverId: string) =>
    (allScores ?? []).filter((c) => c.server_id === serverId).map((c) => c.gearscore);

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <PageHeader
          title="Mis personajes"
          description="Tu main y tus alts. El gearscore se compara con el resto de la guild en el mismo servidor."
          actions={
            <Link href="/personajes/nuevo" className="btn-primary min-h-12 px-5 text-base">
              Registrar personajes
            </Link>
          }
        />
      </FadeIn>

      {savedCount > 0 && (
        <div role="status" className="card flex items-center gap-3 border-[var(--accent)] bg-[var(--accent-dim)] p-4 text-base">
          <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white">
            ✓
          </span>
          {savedCount === 1 ? "Listo, se guardó tu personaje." : `Listo, se guardaron tus ${savedCount} personajes.`}
        </div>
      )}

      {characters.length === 0 && (
        <div className="card flex flex-col items-start gap-2 p-6">
          <p className="font-medium">Todavía no registraste personajes.</p>
          <p className="text-sm text-[var(--text-muted)]">
            Registra tu main para que los oficiales puedan convocarte a las raids.
          </p>
        </div>
      )}

      {characters.length > 0 && (
        <FadeIn delay={0.05} className="grid gap-3 md:grid-cols-2">
          {characters.map((c) => {
            const pct = percentileRank(scoresFor(c.server_id), c.gearscore);
            return (
              <article key={c.id} className="card flex flex-col gap-5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="display truncate text-3xl font-bold uppercase" style={{ color: CLASS_COLORS[c.class] }}>
                      {c.name}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      {CLASS_LABELS[c.class]} · {c.servers?.name}
                    </p>
                  </div>
                  {c.is_main && <span className="badge bg-[var(--accent-dim)] text-[var(--accent-soft)]">Main</span>}
                </div>

                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-[var(--text-faint)]">Spec principal</dt>
                    <dd className="font-medium">
                      {c.spec_primary} <span className="text-[var(--text-muted)]">· {ROLE_LABELS[c.role]}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-faint)]">Segunda spec</dt>
                    <dd className="font-medium">
                      {c.spec_secondary ? (
                        <>
                          {c.spec_secondary}{" "}
                          <span className="text-[var(--text-muted)]">· {ROLE_LABELS[c.role_secondary ?? "dps"]}</span>
                        </>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <div>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-[var(--text-faint)]">Gearscore</span>
                    {c.gearscore > 0 ? (
                      <span>
                        <RankValue value={c.gearscore} percentile={pct} className="display text-2xl" />
                        <span className="tabular ml-2 text-[var(--text-faint)]">percentil {pct}</span>
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">Sin registrar</span>
                    )}
                  </div>
                  <div className="mt-2">
                    <ParseBar percentile={c.gearscore > 0 ? pct : 0} label={`Percentil de gearscore de ${c.name}`} />
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-[var(--text-faint)]">Profesiones</p>
                  <p className="font-medium">
                    {normalizeProfessions(c.professions)
                      .map((name) => {
                        const p = [...PRIMARY_PROFESSIONS, ...SECONDARY_PROFESSIONS].find((x) => x.name === name);
                        return p ? `${p.name} (${p.es})` : name;
                      })
                      .join(" · ") || <span className="text-[var(--text-muted)]">Sin registrar</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t border-[var(--border)] pt-4">
                  <Link href={`/personajes/${c.id}`} className="btn-secondary min-h-11 px-4 text-base">
                    Editar
                  </Link>
                  <DeleteCharacterButton id={c.id} name={c.name} />
                </div>
              </article>
            );
          })}
        </FadeIn>
      )}
    </div>
  );
}
