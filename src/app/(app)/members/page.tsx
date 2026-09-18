import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, isGuildMaster } from "@/lib/auth";
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
        <h1 className="font-display text-2xl font-bold text-[var(--gold-soft)]">
          Miembros
        </h1>
        <p className="text-neutral-400">
          Gestiona el rol de cada miembro del guild.
          {!viewerIsGuildMaster &&
            " Solo el Guild Master puede asignar el rol de Officer."}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {members?.map((member) => {
          const isProtectedRole =
            member.guild_role === "officer" || member.guild_role === "guild_master";
          const canEdit = viewerIsGuildMaster || !isProtectedRole;

          return (
            <div
              key={member.id}
              className="card flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-3">
                {member.discord_avatar_url ? (
                  <Image
                    src={member.discord_avatar_url}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-neutral-800" />
                )}
                <div>
                  <p className="font-medium">{member.discord_username}</p>
                  <p className="text-xs text-neutral-500">
                    {GUILD_ROLE_LABELS[member.guild_role]}
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
