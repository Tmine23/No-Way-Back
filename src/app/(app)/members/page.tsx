import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, isGuildMaster, displayName } from "@/lib/auth";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { RoleSelect, TrialToggle } from "@/components/role-select";
import { GUILD_ROLE_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

const OFFICER_ASSIGNABLE: Enums<"guild_rank">[] = ["raider", "applicant"];
const GUILD_MASTER_ASSIGNABLE: Enums<"guild_rank">[] = ["guild_master", "officer", "raider", "applicant"];
const SECTIONS: { rank: Enums<"guild_rank">; title: string }[] = [
  { rank: "guild_master", title: "Guild Master" },
  { rank: "officer", title: "Oficiales" },
  { rank: "raider", title: "No Way Back" },
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

  return (
    <div className="flex flex-col gap-10">
      <FadeIn>
        <PageHeader
          title="Miembros"
          description={
            <>
              Pasar a alguien a Aspirante le quita el acceso.
              {!viewerIsGuildMaster && " Solo el Guild Master puede nombrar Oficiales."}
            </>
          }
        />
      </FadeIn>

      {SECTIONS.map((section, i) => {
        const list = (members ?? []).filter((m) => m.guild_role === section.rank);
        if (list.length === 0) return null;
        return (
          <FadeIn key={section.rank} delay={0.05 * (i + 1)}>
            <section className="flex flex-col gap-3">
              <h2 className="display flex items-baseline gap-3 text-3xl font-bold uppercase">
                {section.title}
                <span className="tabular text-xl text-[var(--text-faint)]">{list.length}</span>
              </h2>
              <ul className="card divide-y divide-[var(--border)]">
                {list.map((member) => {
                  const isProtectedRole = member.guild_role === "officer" || member.guild_role === "guild_master";
                  const canEdit = viewerIsGuildMaster || !isProtectedRole;
                  const name = displayName(member);
                  return (
                    <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {member.discord_avatar_url ? (
                          <Image src={member.discord_avatar_url} alt="" width={36} height={36} className="rounded-full" />
                        ) : (
                          <div className="size-9 rounded-full bg-[var(--surface-2)]" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {name}
                            {member.is_trial && (
                              <span className="badge ml-2 bg-[var(--surface-2)] text-[var(--text-muted)]">Trial</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-[var(--text-faint)]">
                            {member.discord_username} · {GUILD_ROLE_LABELS[member.guild_role]}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {member.guild_role === "raider" && <TrialToggle memberId={member.id} isTrial={member.is_trial} />}
                        <RoleSelect
                          label={`Rango de ${name}`}
                          memberId={member.id}
                          currentRole={member.guild_role}
                          assignableRoles={assignableRoles}
                          disabled={!canEdit}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </FadeIn>
        );
      })}
    </div>
  );
}
