import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { CharacterForm } from "@/components/character-form";

export default async function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: character }, { data: servers }] = await Promise.all([
    supabase.from("characters").select("*").eq("id", id).eq("owner_id", profile!.id).maybeSingle(),
    supabase.from("servers").select("id, name").order("name"),
  ]);

  if (!character) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Editar {character.name}</h1>
      <CharacterForm servers={servers ?? []} defaultServerId={character.server_id} character={character} />
    </div>
  );
}
