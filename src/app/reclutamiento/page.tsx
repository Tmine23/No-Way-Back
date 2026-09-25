import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DiscordSignInButton } from "@/components/discord-sign-in";
import { FadeIn } from "@/components/fade-in";
import { Magnetic } from "@/components/magnetic";
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
    supabase.from("guild_settings").select("*").single(),
    supabase.from("raid_schedule").select("*"),
    supabase.from("recruitment_needs").select("*").neq("priority", "closed").order("class"),
  ]);

  const open = settings?.recruitment_open ?? false;

  return (
    <div className="min-h-dvh">
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16">
        <div className="flex max-w-3xl flex-col gap-14">
          <FadeIn>
            <header className="flex flex-col gap-4">
              <Image src="/logo-icon.png" alt="Emblema de No Way Back" width={60} height={61} priority />
              <h1 className="display text-[clamp(3.5rem,11vw,7rem)] font-bold uppercase">
                {settings?.guild_name ?? "No Way Back"}
              </h1>
              <p className="display text-2xl font-medium uppercase tracking-[0.04em] text-[var(--text-muted)]">
                Hardcore guild ·{" "}
                <span className={open ? "text-[var(--accent-soft)]" : ""}>
                  {open ? "Reclutamiento abierto" : "Reclutamiento cerrado"}
                </span>
              </p>
              {settings?.recruitment_message && (
                <p className="mt-2 max-w-2xl whitespace-pre-line text-lg text-[var(--text)]">
                  {settings.recruitment_message}
                </p>
              )}
            </header>
          </FadeIn>

          {open && needs && needs.length > 0 && (
            <FadeIn delay={0.05}>
              <section className="flex flex-col gap-4">
                <h2 className="display text-3xl font-bold uppercase">Qué buscamos</h2>
                {PRIORITIES.map((priority) => {
                  const list = needs.filter((n) => n.priority === priority);
                  if (list.length === 0) return null;
                  return (
                    <div key={priority} className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-[var(--text-muted)]">
                        {RECRUITMENT_PRIORITY_LABELS[priority]}
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {list.map((n) => (
                          <li key={n.id} className="card px-4 py-2.5">
                            <span className="font-semibold" style={{ color: CLASS_COLORS[n.class] }}>
                              {n.spec} {CLASS_LABELS[n.class]}
                            </span>
                            {n.note && <span className="ml-2 text-sm text-[var(--text-muted)]">{n.note}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </section>
            </FadeIn>
          )}

          <FadeIn delay={0.1}>
            <section className="flex flex-col gap-4">
              <h2 className="display text-3xl font-bold uppercase">Horario de raid</h2>
              <p className="-mt-2 text-sm text-[var(--text-muted)]">Convertido a tu hora local.</p>
              <div className="card p-5">
                <RaidSchedule rows={schedule ?? []} guildTimezone={settings?.timezone ?? "America/La_Paz"} />
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.15}>
            <section className="plate flex flex-col items-start gap-4 p-6 sm:p-8">
              {open ? (
                <>
                  <h2 className="display text-3xl font-bold uppercase">¿Te interesa?</h2>
                  <p className="max-w-lg text-[var(--text-muted)]">
                    Entra con tu cuenta de Discord y completa la postulación. Los oficiales la revisan y te avisamos del
                    resultado.
                  </p>
                  <Magnetic>
                    <DiscordSignInButton label="Postular con Discord" className="min-h-12 px-6 text-base" />
                  </Magnetic>
                </>
              ) : (
                <>
                  <h2 className="display text-3xl font-bold uppercase">Reclutamiento cerrado</h2>
                  <p className="text-[var(--text-muted)]">Vuelve a revisar más adelante.</p>
                </>
              )}
            </section>
          </FadeIn>

          <p className="text-sm text-[var(--text-muted)]">
            ¿Ya eres parte de la guild?{" "}
            <Link href="/login" className="font-medium text-[var(--accent-soft)] hover:underline">
              Entra aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
