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
import { RaidSchedule } from "@/components/raid-schedule";
import { TIMEZONE_OPTIONS, WEEKDAY_LABELS } from "@/lib/wow";

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-[var(--text-muted)]">Solo el Guild Master ve esta sección.</p>
      </div>

      <Section title="Guild" description="Datos generales e integración con Discord.">
        <form action={saveGuildSettings} className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field label="Nombre del guild">
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
            <input name="discord_guild_id" defaultValue={settings.discord_guild_id ?? ""} className="input font-mono" />
          </Field>
          <Field label="ID del rol «No Way Back» en Discord">
            <input name="discord_raider_role_id" defaultValue={settings.discord_raider_role_id ?? ""} className="input font-mono" />
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
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <input type="checkbox" name="recruitment_open" defaultChecked={settings.recruitment_open} className="h-4 w-4 accent-[var(--accent)]" />
            Reclutamiento abierto
          </label>
          <div className="sm:text-right">
            <button type="submit" className="btn-primary text-sm">
              Guardar
            </button>
          </div>
        </form>
      </Section>

      <Section
        title="Horario de raid"
        description="Lo defines en la zona horaria del guild; cada miembro lo ve convertido a su hora local."
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
          <select name="weekday" className="input text-sm" defaultValue="3">
            {WEEKDAY_LABELS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input name="start_time" type="time" required defaultValue="21:00" className="input text-sm" />
          <input name="end_time" type="time" required defaultValue="00:00" className="input text-sm" />
          <input name="label" className="input text-sm" placeholder="Ej. Naxx 25 main" />
          <button type="submit" className="btn-primary text-sm">
            Agregar
          </button>
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
                      <span className="badge ml-2 border border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent-soft)]">
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
            <p className="text-sm font-medium">Nueva temporada</p>
            <select name="server_id" required className="input text-sm">
              {(servers ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input name="name" required className="input text-sm" placeholder="Ej. Frostmourne 2027" />
            <div className="grid grid-cols-3 gap-2">
              <input name="started_on" type="date" className="input text-sm" />
              <select name="reset_weekday" className="input text-sm" defaultValue="3">
                {WEEKDAY_LABELS.map((d, i) => (
                  <option key={d} value={i}>
                    Reset {d}
                  </option>
                ))}
              </select>
              <input name="reset_time" type="time" defaultValue="05:00" className="input text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <input type="checkbox" name="activate" className="h-4 w-4 accent-[var(--accent)]" />
              Activarla ahora
            </label>
            <button type="submit" className="btn-primary text-sm">
              Crear temporada
            </button>
          </form>

          <form action={addServer} className="card flex flex-col gap-3 p-4">
            <p className="text-sm font-medium">Nuevo servidor</p>
            <input name="name" required className="input text-sm" placeholder="Ej. Warmane - Icecrown" />
            <input name="uwu_server_key" className="input text-sm" placeholder="Nombre en UwU Logs (opcional)" />
            <button type="submit" className="btn-secondary text-sm">
              Agregar servidor
            </button>
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
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
      {label}
      {children}
    </label>
  );
}
