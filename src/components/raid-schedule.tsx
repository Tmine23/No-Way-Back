"use client";

import { useClientValue } from "@/lib/use-client-value";
import { formatTime, formatWeekday, nextWeeklyOccurrence } from "@/lib/time";
import { TIMEZONE_OPTIONS, WEEKDAY_LABELS } from "@/lib/wow";
import type { Tables } from "@/types/database";

type Row = Pick<Tables<"raid_schedule">, "id" | "weekday" | "start_time" | "end_time" | "label">;

function durationMinutes(start: string, end: string) {
  const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  return (toMinutes(end) - toMinutes(start) + 1440) % 1440 || 1440;
}

export function RaidSchedule({ rows, guildTimezone }: { rows: Row[]; guildTimezone: string }) {
  const viewerZone = useClientValue(() => Intl.DateTimeFormat().resolvedOptions().timeZone, null);

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">Todavía no hay horario de raid definido.</p>;
  }

  const guildLabel =
    TIMEZONE_OPTIONS.find((t) => t.value === guildTimezone)?.label.split(" (")[0] ?? guildTimezone;
  const sameZone = viewerZone === guildTimezone;
  const sorted = [...rows].sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time));

  return (
    <ul className="flex flex-col divide-y divide-[var(--border)]">
      {sorted.map((row) => {
        const start = nextWeeklyOccurrence(row.weekday, row.start_time.slice(0, 5), guildTimezone);
        const end = new Date(start.getTime() + durationMinutes(row.start_time, row.end_time) * 60_000);
        return (
          <li key={row.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
            <div>
              <p className="font-medium">
                {viewerZone ? formatWeekday(start, viewerZone) : WEEKDAY_LABELS[row.weekday]}
              </p>
              {row.label && <p className="text-xs text-[var(--text-faint)]">{row.label}</p>}
            </div>
            <div className="text-right">
              <p className="tabular text-sm font-medium text-[var(--text)]">
                {viewerZone
                  ? `${formatTime(start, viewerZone)} – ${formatTime(end, viewerZone)}`
                  : `${row.start_time.slice(0, 5)} – ${row.end_time.slice(0, 5)}`}
              </p>
              {viewerZone && !sameZone && (
                <p className="tabular text-xs text-[var(--text-faint)]">
                  {WEEKDAY_LABELS[row.weekday]} {row.start_time.slice(0, 5)} hora {guildLabel}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
