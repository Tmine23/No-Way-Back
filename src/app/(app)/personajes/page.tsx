import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { DeleteCharacterButton } from "@/components/delete-character-button";
import { CLASS_COLORS, CLASS_LABELS, ROLE_LABELS } from "@/lib/wow";
import type { Tables } from "@/types/database";

type CharacterWithServer = Tables<"characters"> & { servers: { name: string } | null };

export default async function MyCharactersPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("characters")
    .select("*, servers(name)")
    .eq("owner_id", profile!.id)
    .order("is_main", { ascending: false })
    .order("name");

  const characters = (data ?? []) as CharacterWithServer[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis personajes</h1>
          <p className="text-[var(--text-muted)]">Tu main y tus alts, por servidor.</p>
        </div>
        <Link href="/personajes/nuevo" className="btn-primary text-sm">
          + Registrar personaje
        </Link>
      </div>

      {characters.length === 0 && (
        <div className="card p-6 text-center">
          <p className="font-medium">Todavía no registraste personajes</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Registra tu main para que los oficiales puedan convocarte a las raids.
          </p>
        </div>
      )}

      {characters.length > 0 && (
        <div className="card divide-y divide-[var(--border)]">
          {characters.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium" style={{ color: CLASS_COLORS[c.class] }}>
                  {c.name}
                  {c.is_main && (
                    <span className="badge ml-2 border border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent-soft)]">
                      Main
                    </span>
                  )}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {CLASS_LABELS[c.class]} · {c.spec_primary} ({ROLE_LABELS[c.role]})
                  {c.spec_secondary && ` / ${c.spec_secondary} (${ROLE_LABELS[c.role_secondary ?? "dps"]})`}
                </p>
                <p className="text-xs text-[var(--text-faint)]">
                  {c.servers?.name} · GS <span className="font-mono">{c.gearscore || "—"}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/personajes/${c.id}`} className="btn-secondary text-sm">
                  Editar
                </Link>
                <DeleteCharacterButton id={c.id} name={c.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
