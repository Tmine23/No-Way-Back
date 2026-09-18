import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, isGuildMaster, displayName } from "@/lib/auth";
import { RoleSelect } from "@/components/role-select";
import { GUILD_ROLE_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

const OFFICER_ASSIGNABLE: Enums<"guild_role">[] = ["applicant", "trial", "raider"];
const GUILD_MASTER_ASSIGNABLE: Enums<"guild_role">[] = [
  "applicant",
  "trial",
  "raider",
  "officer",
  "guild_master",
];

export default async function MembersPage() {
  const viewer = await getCurrentProfile();
  if (!isOfficer(viewer)) redirect("/");

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("guild_role")
    .order("discord_username");

  const viewerIsGuildMaster = isGuildMaster(viewer);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Miembros</h1>
        <p className="text-[var(--text-muted)]">
          Gestiona el rol de cada miembro del guild.
          {!viewerIsGuildMaster &&
            " Solo el Guild Master puede asignar el rol de Officer."}
        </p>
      </div>

      <div className="card divide-y divide-[var(--border)]">
        {members?.map((member) => {
          const isProtectedRole =
            member.guild_role === "officer" || member.guild_role === "guild_master";
          const canEdit = viewerIsGuildMaster || !isProtectedRole;

          return (
            <div key={member.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {member.discord_avatar_url ? (
                  <Image
                    src={member.discord_avatar_url}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[var(--surface-2)]" />
                )}
                <div>
                  <p className="font-medium">{displayName(member)}</p>
                  <p className="text-xs text-[var(--text-faint)]">
                    {member.discord_username} · {GUILD_ROLE_LABELS[member.guild_role]}
                  </p>
                </div>
              </div>

              <RoleSelect
                memberId={member.id}
                currentRole={member.guild_role}
                assignableRoles={
                  viewerIsGuildMaster ? GUILD_MASTER_ASSIGNABLE : OFFICER_ASSIGNABLE
                }
                disabled={!canEdit}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
