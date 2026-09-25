import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isGuildMaster } from "@/lib/auth";
import {
  addScheduleRow,
  addSeason,
  addServer,
  saveGuildSettings,
} from "@/app/(app)/configuracion/actions";
import {
  ActivateSeasonButton,
  DeleteScheduleButton,
  PhaseSelect,
} from "@/components/config-controls";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { RaidSchedule } from "@/components/raid-schedule";
import { TIMEZONE_OPTIONS, WEEKDAY_LABELS } from "@/lib/wow";
import { SubmitButton } from "@/components/submit-button";

export default async function ConfigPage() {
  const viewer = await getCurrentProfile();
  if (!isGuildMaster(viewer)) redirect("/");

  const supabase = await createClient();
  const [{ data: settings }, { data: schedule }, { data: servers }, { data: seasons }] =
    await Promise.all([
      supabase.from("guild_settings").select("*").single(),
      supabase.from("raid_schedule").select("*").order("weekday"),
      supabase.from("servers").select("*").order("name"),
      supabase.from("seasons").select("*, servers(name)").order("started_on", { ascending: false }),
    ]);

  if (!settings) return null;

  return (
    <div className="flex flex-col gap-10">
      <FadeIn>
        <PageHeader title="Configuración" description="Solo el Guild Master ve esta sección." />
      </FadeIn>

      <Section title="Guild" description="Datos generales e integración con Discord.">
        <form action={saveGuildSettings} className="card grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          <Field label="Nombre de la guild">
            <input name="guild_name" defaultValue={settings.guild_name} className="input" />
          </Field>
          <Field label="Zona horaria del horario de raid">
            <select name="timezone" defaultValue={settings.timezone} className="input">
              {TIMEZONE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ID del servidor de Discord">
            <input name="discord_guild_id" defaultValue={settings.discord_guild_id ?? ""} inputMode="numeric" spellCheck={false} className="input tabular" />
          </Field>
          <Field label="ID del rol «No Way Back» en Discord">
            <input name="discord_raider_role_id" defaultValue={settings.discord_raider_role_id ?? ""} inputMode="numeric" spellCheck={false} className="input tabular" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Mensaje de reclutamiento (página pública)">
              <textarea
                name="recruitment_message"
                rows={3}
                defaultValue={settings.recruitment_message ?? ""}
                className="input"
                placeholder="Quiénes somos, qué buscamos, requisitos…"
              />
            </Field>
          </div>
          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" name="recruitment_open" defaultChecked={settings.recruitment_open} className="h-4 w-4 accent-[var(--accent)]" />
            Reclutamiento abierto
          </label>
          <div className="sm:text-right">
            <SubmitButton>
              Guardar
            </SubmitButton>
          </div>
        </form>
      </Section>

      <Section
        title="Horario de raid"
        description="Lo defines en la zona horaria de la guild; cada miembro lo ve convertido a su hora local."
      >
        <div className="card p-5">
          <RaidSchedule rows={schedule ?? []} guildTimezone={settings.timezone} />
          {schedule && schedule.length > 0 && (
            <div className="mt-4 flex flex-col gap-1 border-t border-[var(--border)] pt-3">
              {schedule.map((row) => (
                <div key={row.id} className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>
                    {WEEKDAY_LABELS[row.weekday]} {row.start_time.slice(0, 5)}–{row.end_time.slice(0, 5)}
                    {row.label && ` · ${row.label}`}
                  </span>
                  <DeleteScheduleButton id={row.id} />
                </div>
              ))}
            </div>
          )}
        </div>
        <form action={addScheduleRow} className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
          <select name="weekday" aria-label="Día" className="input text-sm" defaultValue="3">
            {WEEKDAY_LABELS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input name="start_time" aria-label="Inicio" type="time" required defaultValue="21:00" className="input text-sm" />
          <input name="end_time" aria-label="Fin" type="time" required defaultValue="00:00" className="input text-sm" />
          <input name="label" aria-label="Etiqueta" autoComplete="off" className="input text-sm" placeholder="Naxx 25 main…" />
          <SubmitButton>
            Agregar
          </SubmitButton>
        </form>
      </Section>

      <Section
        title="Servidores y temporadas"
        description="Cada temporada es un servidor con su día de reset y su fase de BiS. La activa define dónde se registran personajes y raids."
      >
        <div className="card divide-y divide-[var(--border)]">
          {(seasons ?? []).map((s) => {
            const active = s.id === settings.active_season_id;
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">
                    {s.name}
                    {active && (
                      <span className="badge ml-2 bg-[var(--accent-dim)] text-[var(--accent-soft)]">
                        Activa
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-faint)]">
                    {(s.servers as { name: string } | null)?.name} · reset {WEEKDAY_LABELS[s.reset_weekday]}{" "}
                    {s.reset_time.slice(0, 5)} · desde {s.started_on}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PhaseSelect seasonId={s.id} phase={s.bis_phase} />
                  {!active && <ActivateSeasonButton id={s.id} />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form action={addSeason} className="card flex flex-col gap-3 p-4">
            <p className="font-semibold">Nueva temporada</p>
            <select name="server_id" aria-label="Servidor" required className="input text-sm">
              {(servers ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input name="name" aria-label="Nombre de la temporada" required autoComplete="off" className="input text-sm" placeholder="Nombre: Temporada 2027…" />
            <div className="grid grid-cols-3 gap-2">
              <input name="started_on" aria-label="Inicio de temporada" type="date" className="input text-sm" />
              <select name="reset_weekday" aria-label="Día de reset" className="input text-sm" defaultValue="3">
                {WEEKDAY_LABELS.map((d, i) => (
                  <option key={d} value={i}>
                    Reset {d}
                  </option>
                ))}
              </select>
              <input name="reset_time" aria-label="Hora de reset" type="time" defaultValue="05:00" className="input text-sm" />
            </div>
            <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" name="activate" className="h-4 w-4 accent-[var(--accent)]" />
              Activarla ahora
            </label>
            <SubmitButton className="w-fit">
              Crear temporada
            </SubmitButton>
          </form>

          <form action={addServer} className="card flex flex-col gap-3 p-4">
            <p className="font-semibold">Nuevo servidor</p>
            <input name="name" aria-label="Nombre del servidor" required autoComplete="off" className="input text-sm" placeholder="Reino - Servidor…" />
            <input name="uwu_server_key" aria-label="Nombre en UwU Logs" autoComplete="off" className="input text-sm" placeholder="Nombre en UwU Logs (opcional)" />
            <SubmitButton variant="secondary" className="w-fit">
              Agregar servidor
            </SubmitButton>
          </form>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="display text-3xl font-bold uppercase">{title}</h2>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
    </label>
  );
}
