import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, displayName } from "@/lib/auth";
import { saveRecruitmentNeed } from "@/app/(app)/solicitudes/actions";
import {
  ApplicationStatusSelect,
  CommentForm,
  DeleteNeedButton,
} from "@/components/application-controls";
import {
  APPLICANT_TYPE_LABELS,
  APPLICATION_STATUS_LABELS,
  CLASS_COLORS,
  CLASS_LABELS,
  RECRUITMENT_PRIORITY_LABELS,
  WOW_CLASSES,
} from "@/lib/wow";
import type { Enums, Tables } from "@/types/database";

type ApplicationWithProfile = Tables<"applications"> & {
  profiles: Pick<Tables<"profiles">, "known_as" | "discord_username" | "discord_avatar_url">;
};
type CommentWithAuthor = Tables<"application_comments"> & {
  profiles: Pick<Tables<"profiles">, "known_as" | "discord_username">;
};

const ACTIVE: Enums<"application_status">[] = ["new", "interview", "trial"];
const CLOSED: Enums<"application_status">[] = ["accepted", "rejected"];

export default async function ApplicationsPage() {
  const viewer = await getCurrentProfile();
  if (!isOfficer(viewer)) redirect("/");

  const supabase = await createClient();
  const [{ data: applications }, { data: comments }, { data: needs }] = await Promise.all([
    supabase
      .from("applications")
      .select("*, profiles(known_as, discord_username, discord_avatar_url)")
      .order("created_at", { ascending: false }),
    supabase
      .from("application_comments")
      .select("*, profiles(known_as, discord_username)")
      .order("created_at"),
    supabase.from("recruitment_needs").select("*").order("class"),
  ]);

  const typed = (applications ?? []) as ApplicationWithProfile[];
  const commentsByApp = new Map<string, CommentWithAuthor[]>();
  for (const c of (comments ?? []) as CommentWithAuthor[]) {
    commentsByApp.set(c.application_id, [...(commentsByApp.get(c.application_id) ?? []), c]);
  }

  const active = typed.filter((a) => ACTIVE.includes(a.status));
  const closed = typed.filter((a) => CLOSED.includes(a.status));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reclutamiento</h1>
          <p className="text-[var(--text-muted)]">
            Postulaciones y clases que busca el guild.
          </p>
        </div>
        <Link href="/reclutamiento" className="btn-secondary text-sm" target="_blank">
          Ver página pública
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">
          En proceso{" "}
          <span className="font-mono text-sm text-[var(--accent-soft)]">({active.length})</span>
        </h2>
        {active.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No hay postulaciones en proceso.</p>
        )}
        {active.map((a) => (
          <ApplicationCard key={a.id} application={a} comments={commentsByApp.get(a.id) ?? []} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Qué buscamos</h2>
        <form action={saveRecruitmentNeed} className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
          <select name="class" required className="input text-sm">
            {WOW_CLASSES.map((c) => (
              <option key={c} value={c}>
                {CLASS_LABELS[c]}
              </option>
            ))}
          </select>
          <input name="spec" required className="input text-sm" placeholder="Spec (ej. Holy)" />
          <select name="priority" className="input text-sm" defaultValue="medium">
            {(Object.keys(RECRUITMENT_PRIORITY_LABELS) as Enums<"recruitment_priority">[]).map((p) => (
              <option key={p} value={p}>
                {RECRUITMENT_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <input name="note" className="input text-sm" placeholder="Nota (opcional)" />
          <button type="submit" className="btn-primary text-sm">
            Guardar
          </button>
        </form>
        {needs && needs.length > 0 && (
          <div className="card divide-y divide-[var(--border)]">
            {needs.map((n) => (
              <div key={n.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium" style={{ color: CLASS_COLORS[n.class] }}>
                    {n.spec} {CLASS_LABELS[n.class]}
                  </span>
                  <span className="text-[var(--text-muted)]">{RECRUITMENT_PRIORITY_LABELS[n.priority]}</span>
                  {n.note && <span className="text-[var(--text-faint)]">{n.note}</span>}
                </div>
                <DeleteNeedButton id={n.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {closed.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-medium">Cerradas</h2>
          <div className="card divide-y divide-[var(--border)]">
            {closed.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span>{displayName(a.profiles)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-muted)]">{APPLICATION_STATUS_LABELS[a.status]}</span>
                  <ApplicationStatusSelect applicationId={a.id} status={a.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ApplicationCard({
  application: a,
  comments,
}: {
  application: ApplicationWithProfile;
  comments: CommentWithAuthor[];
}) {
  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {a.profiles.discord_avatar_url ? (
            <Image src={a.profiles.discord_avatar_url} alt="" width={36} height={36} className="rounded-full" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-[var(--surface-2)]" />
          )}
          <div>
            <p className="font-medium">{displayName(a.profiles)}</p>
            <p className="text-xs text-[var(--text-faint)]">
              {a.profiles.discord_username} · {APPLICANT_TYPE_LABELS[a.applicant_type]} ·{" "}
              {new Date(a.created_at).toLocaleDateString("es-ES")}
            </p>
          </div>
        </div>
        <ApplicationStatusSelect applicationId={a.id} status={a.status} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[var(--border)] pt-3 text-sm sm:grid-cols-4">
        {a.class && (
          <Field label="Clase">
            <span style={{ color: CLASS_COLORS[a.class] }}>
              {a.spec} {CLASS_LABELS[a.class]}
            </span>
          </Field>
        )}
        {a.gearscore != null && <Field label="Gearscore">{a.gearscore}</Field>}
        {a.previous_server && <Field label="Server anterior">{a.previous_server}</Field>}
        {a.previous_guild && <Field label="Guild anterior">{a.previous_guild}</Field>}
        {a.availability && (
          <div className="col-span-2">
            <Field label="Disponibilidad">{a.availability}</Field>
          </div>
        )}
        {a.logs_url && (
          <div className="col-span-2">
            <Field label="Logs / armory">
              <a href={a.logs_url} target="_blank" rel="noreferrer" className="break-all text-[var(--accent-soft)] hover:underline">
                {a.logs_url}
              </a>
            </Field>
          </div>
        )}
        {a.experience && (
          <div className="col-span-full">
            <Field label="Experiencia">{a.experience}</Field>
          </div>
        )}
      </dl>

      <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3">
        {comments.map((c) => (
          <p key={c.id} className="text-sm">
            <span className="font-medium">{displayName(c.profiles)}:</span>{" "}
            <span className="text-[var(--text-muted)]">{c.body}</span>
          </p>
        ))}
        <CommentForm applicationId={a.id} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[var(--text-faint)]">{label}</dt>
      <dd className="text-[var(--text)]">{children}</dd>
    </div>
  );
}
