"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { createRaidEvent, type RaidFormState } from "@/app/(app)/raids/actions";
import { SubmitButton } from "@/components/submit-button";
import { formatTime, nextWeeklyOccurrence } from "@/lib/time";
import { useClientValue } from "@/lib/use-client-value";
import type { Tables } from "@/types/database";

const TITLE_PRESETS = [
  { title: "Naxxramas 25 mítico", size: 25 },
  { title: "Naxxramas 10 mítico", size: 10 },
  { title: "Sartharion 25", size: 25 },
  { title: "Malygos 25", size: 25 },
];

type ScheduleRow = Pick<Tables<"raid_schedule">, "id" | "weekday" | "start_time" | "label">;
type DateOption = { value: string; label: string };

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const chip = (active: boolean) =>
  `min-h-11 rounded-lg border-2 px-4 text-base font-medium transition-[border-color,background-color,transform] duration-150 active:scale-[0.97] ${
    active ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
  }`;

export function RaidForm({ schedule, guildTimezone }: { schedule: ScheduleRow[]; guildTimezone: string }) {
  const [state, formAction] = useActionState<RaidFormState, FormData>(createRaidEvent, { error: null });
  const [title, setTitle] = useState("");
  const [size, setSize] = useState("25");
  const [when, setWhen] = useState("");
  const zone = useClientValue(() => Intl.DateTimeFormat().resolvedOptions().timeZone, "");
  const dateOptions = useMemo<DateOption[]>(
    () =>
      zone
        ? schedule
            .map((row) => nextWeeklyOccurrence(row.weekday, row.start_time.slice(0, 5), guildTimezone))
            .sort((a, b) => a.getTime() - b.getTime())
            .map((date) => {
              const day = date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" });
              return {
                value: toLocalInput(date),
                label: `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${formatTime(date)}`,
              };
            })
        : [],
    [zone, schedule, guildTimezone],
  );

  return (
    <form action={formAction} className="card flex max-w-2xl flex-col gap-7 p-6">
      <input type="hidden" name="tz" value={zone} />

      <div className="flex flex-col gap-3">
        <label htmlFor="raid-title" className="text-base font-semibold">
          ¿Qué raid?
        </label>
        <div className="flex flex-wrap gap-2">
          {TITLE_PRESETS.map((p) => (
            <button
              key={p.title}
              type="button"
              aria-pressed={title === p.title}
              onClick={() => {
                setTitle(p.title);
                setSize(String(p.size));
              }}
              className={chip(title === p.title)}
            >
              {p.title}
            </button>
          ))}
        </div>
        <input
          id="raid-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={60}
          autoComplete="off"
          className="input min-h-12 text-lg"
          placeholder="O escribe otro nombre…"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="raid-when" className="text-base font-semibold">
          ¿Cuándo? <span className="font-normal text-[var(--text-muted)]">(en tu hora)</span>
        </label>
        {dateOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dateOptions.map((d) => (
              <button
                key={d.value}
                type="button"
                aria-pressed={when === d.value}
                onClick={() => setWhen(d.value)}
                className={chip(when === d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
        <input
          id="raid-when"
          name="scheduled_at"
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          required
          className="input min-h-12 w-fit text-lg"
        />
        {dateOptions.length > 0 && (
          <p className="text-sm text-[var(--text-muted)]">Los botones usan el horario de raid de la guild.</p>
        )}
      </div>

      <fieldset>
        <legend className="mb-3 text-base font-semibold">Tamaño</legend>
        <div className="flex gap-2">
          {["25", "10"].map((s) => (
            <label key={s} className={`flex cursor-pointer items-center ${chip(size === s)} font-semibold`}>
              <input
                type="radio"
                name="raid_size"
                value={s}
                checked={size === s}
                onChange={() => setSize(s)}
                className="sr-only"
              />
              {s} jugadores
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor="raid-notes" className="flex flex-col gap-2 text-base font-semibold">
        Notas
        <span className="-mt-1 text-sm font-normal text-[var(--text-muted)]">Opcional: bosses, requisitos, consumibles…</span>
        <textarea id="raid-notes" name="notes" rows={3} className="input text-base font-normal" />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Creando…" className="min-h-12 px-6 text-base">
          Crear raid
        </SubmitButton>
        <Link href="/raids" className="btn-ghost min-h-12 px-4 text-base">
          Cancelar
        </Link>
        <p role="alert" className="text-sm font-medium text-[var(--danger)] empty:hidden">
          {state.error}
        </p>
      </div>
    </form>
  );
}
