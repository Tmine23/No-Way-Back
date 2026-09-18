import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, isGuildMaster, displayName } from "@/lib/auth";
import { RoleSelect } from "@/components/role-select";
import { APPLICANT_TYPE_LABELS, CLASS_LABELS, GUILD_ROLE_LABELS } from "@/lib/wow";
import type { Enums, Tables } from "@/types/database";

const OFFICER_ASSIGNABLE: Enums<"guild_role">[] = ["applicant", "trial", "raider"];
const GUILD_MASTER_ASSIGNABLE: Enums<"guild_role">[] = [
  "applicant",
  "trial",
  "raider",
  "officer",
  "guild_master",
];

type ApplicationRow = Tables<"applications">;

export default async function MembersPage() {
  const viewer = await getCurrentProfile();
  if (!isOfficer(viewer)) redirect("/");

  const supabase = await createClient();
  const [{ data: members }, { data: applications }] = await Promise.all([
    supabase.from("profiles").select("*").order("guild_role").order("discord_username"),
    supabase.from("applications").select("*"),
  ]);

  const applicationByProfile = new Map<string, ApplicationRow>(
    (applications ?? []).map((a) => [a.profile_id, a]),
  );

  const viewerIsGuildMaster = isGuildMaster(viewer);
  const assignableRoles = viewerIsGuildMaster ? GUILD_MASTER_ASSIGNABLE : OFFICER_ASSIGNABLE;

  const pending = (members ?? []).filter((m) => m.guild_role === "applicant");
  const rest = (members ?? []).filter((m) => m.guild_role !== "applicant");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Miembros</h1>
        <p className="text-[var(--text-muted)]">
          Gestiona el rol de cada miembro del guild.
          {!viewerIsGuildMaster &&
            " Solo el Guild Master puede asignar el rol de Officer."}
        </p>
      </div>

      {pending.length > 0 && (
        <div>
          <p className="mb-2 font-medium">
            Solicitudes pendientes{" "}
            <span className="font-mono text-sm text-[var(--accent-soft)]">
              ({pending.length})
            </span>
          </p>
          <div className="flex flex-col gap-3">
            {pending.map((member) => {
              const application = applicationByProfile.get(member.id);
              return (
                <div key={member.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
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
                          {member.discord_username}
                        </p>
                      </div>
                    </div>
                    <RoleSelect
                      memberId={member.id}
                      currentRole={member.guild_role}
                      assignableRoles={assignableRoles}
                      disabled={false}
                    />
                  </div>

                  {application ? (
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[var(--border)] pt-3 text-sm sm:grid-cols-4">
                      <Field label="Tipo" value={APPLICANT_TYPE_LABELS[application.applicant_type]} />
                      {application.previous_server && (
                        <Field label="Server anterior" value={application.previous_server} />
                      )}
                      {application.previous_guild && (
                        <Field label="Guild anterior" value={application.previous_guild} />
                      )}
                      {application.class && (
                        <Field label="Clase" value={CLASS_LABELS[application.class]} />
                      )}
                      {application.spec && <Field label="Spec" value={application.spec} />}
                      {application.gearscore != null && (
                        <Field label="Gearscore" value={String(application.gearscore)} />
                      )}
                      {application.experience && (
                        <div className="col-span-full">
                          <p className="text-[var(--text-faint)]">Notas</p>
                          <p className="mt-0.5 text-[var(--text)]">{application.experience}</p>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm text-[var(--text-faint)]">
                      No completó la solicitud todavía.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        {pending.length > 0 && <p className="mb-2 font-medium">Roster</p>}
        <div className="card divide-y divide-[var(--border)]">
          {rest.map((member) => {
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
                  assignableRoles={assignableRoles}
                  disabled={!canEdit}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[var(--text-faint)]">{label}</p>
      <p className="text-[var(--text)]">{value}</p>
    </div>
  );
}
