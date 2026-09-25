import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DiscordSignInButton } from "@/components/discord-sign-in";
import { RaidSchedule } from "@/components/raid-schedule";
import { CLASS_COLORS, CLASS_LABELS, RECRUITMENT_PRIORITY_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

export const metadata: Metadata = {
  title: "Reclutamiento · No Way Back",
  description: "Únete a No Way Back, hardcore guild.",
};

const PRIORITIES: Enums<"recruitment_priority">[] = ["high", "medium"];

export default async function RecruitmentPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: schedule }, { data: needs }] = await Promise.all([
    supabase.from("guild_settings").select("*, seasons(name, servers(name))").single(),
    supabase.from("raid_schedule").select("*"),
    supabase.from("recruitment_needs").select("*").neq("priority", "closed").order("class"),
  ]);

  const season = settings?.seasons as { name: string; servers: { name: string } | null } | null;
  const open = settings?.recruitment_open ?? false;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-soft)]">
            Hardcore Guild · {open ? "Reclutamiento abierto" : "Reclutamiento cerrado"}
          </span>
        </div>
        <h1 className="flex items-center gap-4 text-5xl font-bold tracking-tight">
          <Image src="/logo-icon.png" alt="" width={52} height={52} priority />
          {settings?.guild_name ?? "No Way Back"}
        </h1>
        {season && (
          <p className="text-[var(--text-muted)]">
            Jugando ahora: {season.servers?.name} · {season.name}
          </p>
        )}
        {settings?.recruitment_message && (
          <p className="whitespace-pre-line text-[var(--text)]">{settings.recruitment_message}</p>
        )}
      </header>

      {open && needs && needs.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-medium">Qué buscamos</h2>
          {PRIORITIES.map((priority) => {
            const list = needs.filter((n) => n.priority === priority);
            if (list.length === 0) return null;
            return (
              <div key={priority} className="card p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                  {RECRUITMENT_PRIORITY_LABELS[priority]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {list.map((n) => (
                    <span key={n.id} className="rounded-md bg-[var(--surface-2)] px-3 py-1.5 text-sm" title={n.note ?? undefined}>
                      <span style={{ color: CLASS_COLORS[n.class] }}>
                        {n.spec} {CLASS_LABELS[n.class]}
                      </span>
                      {n.note && <span className="ml-1.5 text-[var(--text-faint)]">· {n.note}</span>}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Horario de raid</h2>
        <div className="card p-4">
          <RaidSchedule rows={schedule ?? []} guildTimezone={settings?.timezone ?? "America/La_Paz"} />
        </div>
      </section>

      <section className="card flex flex-col items-start gap-3 p-6">
        {open ? (
          <>
            <p className="font-medium">¿Te interesa?</p>
            <p className="text-sm text-[var(--text-muted)]">
              Entra con tu cuenta de Discord y completa la postulación. Los oficiales la revisan y te
              avisamos del resultado.
            </p>
            <DiscordSignInButton label="Postular con Discord" />
          </>
        ) : (
          <>
            <p className="font-medium">El reclutamiento está cerrado por ahora</p>
            <p className="text-sm text-[var(--text-muted)]">Vuelve a revisar más adelante.</p>
          </>
        )}
      </section>

      <p className="text-sm text-[var(--text-faint)]">
        ¿Ya eres parte del guild?{" "}
        <Link href="/login" className="text-[var(--accent-soft)] hover:underline">
          Entra aquí
        </Link>
      </p>
    </div>
  );
}
