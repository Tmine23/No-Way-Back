import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, isGuildMaster, displayName } from "@/lib/auth";
import type { MemberRank } from "@/app/(app)/members/actions";
import { FadeIn } from "@/components/fade-in";
import { LiveRefresh } from "@/components/live-refresh";
import { PageHeader } from "@/components/page-header";
import { ConfirmTrialButton, RoleSelect } from "@/components/role-select";
import type { Tables } from "@/types/database";

const OFFICER_ASSIGNABLE: MemberRank[] = ["raider", "trial", "applicant"];
const GUILD_MASTER_ASSIGNABLE: MemberRank[] = ["guild_master", "officer", "raider", "trial", "applicant"];
const SECTIONS: { rank: MemberRank; title: string; hint?: string }[] = [
  { rank: "guild_master", title: "Guild Master" },
  { rank: "officer", title: "Oficiales" },
  { rank: "raider", title: "No Way Back" },
  { rank: "trial", title: "Trial", hint: "Recién aceptados. Cuando demuestren que sirven, confírmalos como No Way Back." },
];

function rankOf(member: Tables<"profiles">): MemberRank {
  return member.guild_role === "raider" && member.is_trial ? "trial" : member.guild_role;
}

export default async function MembersPage() {
  const viewer = await getCurrentProfile();
  if (!isOfficer(viewer)) redirect("/");

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .neq("guild_role", "applicant")
    .order("known_as");

  const viewerIsGuildMaster = isGuildMaster(viewer);
  const assignable = viewerIsGuildMaster ? GUILD_MASTER_ASSIGNABLE : OFFICER_ASSIGNABLE;

  return (
    <div className="flex flex-col gap-10">
      <LiveRefresh tables={[{ table: "profiles" }]} />
      <FadeIn>
        <PageHeader
          title="Miembros"
          description={
            <>
              Cambia el rango con el selector de cada persona. &quot;Sin acceso&quot; le quita la entrada a la app.
              {!viewerIsGuildMaster && " Solo el Guild Master puede nombrar Oficiales."}
            </>
          }
        />
      </FadeIn>

      {SECTIONS.map((section, i) => {
        const list = (members ?? []).filter((m) => rankOf(m) === section.rank);
        if (list.length === 0) return null;
        return (
          <FadeIn key={section.rank} delay={0.05 * (i + 1)}>
            <section className="flex flex-col gap-3">
              <div>
                <h2 className="display flex items-baseline gap-3 text-3xl font-bold uppercase">
                  {section.title}
                  <span className="tabular text-xl text-[var(--text-faint)]">{list.length}</span>
                </h2>
                {section.hint && <p className="mt-1 text-base text-[var(--text-muted)]">{section.hint}</p>}
              </div>
              <ul className="card divide-y divide-[var(--border)]">
                {list.map((member) => {
                  const rank = rankOf(member);
                  const isProtected = rank === "officer" || rank === "guild_master";
                  const canEdit = viewerIsGuildMaster || !isProtected;
                  const name = displayName(member);
                  return (
                    <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {member.discord_avatar_url ? (
                          <Image src={member.discord_avatar_url} alt="" width={40} height={40} className="rounded-full" />
                        ) : (
                          <div className="size-10 rounded-full bg-[var(--surface-2)]" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold">{name}</p>
                          <p className="truncate text-sm text-[var(--text-muted)]">{member.discord_username}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {rank === "trial" && <ConfirmTrialButton memberId={member.id} name={name} />}
                        <RoleSelect
                          label={`Rango de ${name}`}
                          memberId={member.id}
                          currentRank={rank}
                          assignableRanks={assignable}
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
