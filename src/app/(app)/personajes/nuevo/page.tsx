import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { CharacterForm } from "@/components/character-form";
import { PageHeader } from "@/components/page-header";

export default async function NewCharacterPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const [{ data: servers }, { data: settings }] = await Promise.all([
    supabase.from("servers").select("id, name").order("name"),
    supabase.from("guild_settings").select("active_season_id, seasons(server_id)").single(),
  ]);

  const activeServerId = (settings?.seasons as { server_id: string } | null)?.server_id ?? null;
  const { count: mains } = await supabase
    .from("characters")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", profile!.id)
    .eq("server_id", activeServerId ?? "")
    .eq("is_main", true);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Registrar personajes"
        description="Llena tu personaje y, si tienes alts, agrégalos con el botón de abajo. Se guardan todos juntos."
      />
      <CharacterForm servers={servers ?? []} defaultServerId={activeServerId} hasMain={Boolean(mains)} />
    </div>
  );
}
