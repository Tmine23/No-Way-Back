import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, isGuildMaster, displayName } from "@/lib/auth";
import { RoleSelect, TrialToggle } from "@/components/role-select";
import { GUILD_ROLE_LABELS, GUILD_ROLE_ORDER } from "@/lib/wow";
import type { Enums } from "@/types/database";

const OFFICER_ASSIGNABLE: Enums<"guild_rank">[] = ["raider", "applicant"];
const GUILD_MASTER_ASSIGNABLE: Enums<"guild_rank">[] = [
  "guild_master",
  "officer",
  "raider",
  "applicant",
];

export default async function MembersPage() {
  const viewer = await getCurrentProfile();
  if (!isOfficer(viewer)) redirect("/");

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .neq("guild_role", "applicant")
    .order("discord_username");

  const viewerIsGuildMaster = isGuildMaster(viewer);
  const assignableRoles = viewerIsGuildMaster ? GUILD_MASTER_ASSIGNABLE : OFFICER_ASSIGNABLE;
  const sorted = [...(members ?? [])].sort(
    (a, b) => GUILD_ROLE_ORDER.indexOf(a.guild_role) - GUILD_ROLE_ORDER.indexOf(b.guild_role),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Miembros</h1>
        <p className="text-[var(--text-muted)]">
          Rangos del guild. Pasar a alguien a Aspirante le quita el acceso.
          {!viewerIsGuildMaster && " Solo el Guild Master puede nombrar Oficiales."}
        </p>
      </div>

      <div className="card divide-y divide-[var(--border)]">
        {sorted.map((member) => {
          const isProtectedRole =
            member.guild_role === "officer" || member.guild_role === "guild_master";
          const canEdit = viewerIsGuildMaster || !isProtectedRole;

          return (
            <div key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                {member.discord_avatar_url ? (
                  <Image src={member.discord_avatar_url} alt="" width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[var(--surface-2)]" />
                )}
                <div>
                  <p className="font-medium">{displayName(member)}</p>
                  <p className="text-xs text-[var(--text-faint)]">
                    {member.discord_username} · {GUILD_ROLE_LABELS[member.guild_role]}
                    {member.is_trial && " · Trial"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {member.guild_role === "raider" && (
                  <TrialToggle memberId={member.id} isTrial={member.is_trial} />
                )}
                <RoleSelect
                  memberId={member.id}
                  currentRole={member.guild_role}
                  assignableRoles={assignableRoles}
                  disabled={!canEdit}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
