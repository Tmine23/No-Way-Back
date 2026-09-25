import { createClient } from "@/lib/supabase/server";
import { CharacterForm } from "@/components/character-form";

export default async function NewCharacterPage() {
  const supabase = await createClient();
  const [{ data: servers }, { data: settings }] = await Promise.all([
    supabase.from("servers").select("id, name").order("name"),
    supabase.from("guild_settings").select("active_season_id, seasons(server_id)").single(),
  ]);

  const activeServerId =
    (settings?.seasons as { server_id: string } | null)?.server_id ?? null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Registrar personaje</h1>
      <CharacterForm servers={servers ?? []} defaultServerId={activeServerId} />
    </div>
  );
}
