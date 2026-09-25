import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { CharacterForm } from "@/components/character-form";
import { PageHeader } from "@/components/page-header";
import { normalizeProfessions, specRole } from "@/lib/wow";

export default async function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: character }, { data: servers }] = await Promise.all([
    supabase.from("characters").select("*").eq("id", id).eq("owner_id", profile!.id).maybeSingle(),
    supabase.from("servers").select("id, name").order("name"),
  ]);

  if (!character) notFound();

  const knownSpec = specRole(character.class, character.spec_primary) ? character.spec_primary : "";
  const knownSpec2 =
    character.spec_secondary && specRole(character.class, character.spec_secondary) ? character.spec_secondary : "";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`Editar ${character.name}`} />
      <CharacterForm
        servers={servers ?? []}
        defaultServerId={character.server_id}
        initial={{
          key: character.id,
          id: character.id,
          name: character.name,
          class: character.class,
          spec: knownSpec,
          spec2: knownSpec2,
          gearscore: character.gearscore ? String(character.gearscore) : "",
          professions: normalizeProfessions(character.professions),
          armoryUrl: character.armory_url ?? "",
          isMain: character.is_main,
          legacySpec: knownSpec ? undefined : character.spec_primary,
        }}
      />
    </div>
  );
}
