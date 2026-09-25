"use client";

import { formatDateTime } from "@/lib/time";
import { useClientValue } from "@/lib/use-client-value";

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function LocalDateTime({
  iso,
  className,
  sentenceStart = true,
}: {
  iso: string;
  className?: string;
  sentenceStart?: boolean;
}) {
  const text = useClientValue(() => {
    const formatted = formatDateTime(new Date(iso));
    return sentenceStart ? capitalize(formatted) : formatted;
  }, null);

  return <span className={className}>{text ?? " "}</span>;
}

export function LocalDate({ iso, className, withTime = false }: { iso: string; className?: string; withTime?: boolean }) {
  const text = useClientValue(
    () =>
      new Date(iso).toLocaleString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      }),
    null,
  );

  return <span className={className}>{text ?? " "}</span>;
}

export function DateBlock({ iso }: { iso: string }) {
  const weekday = useClientValue(() => new Date(iso).toLocaleDateString("es-MX", { weekday: "short" }).replace(".", ""), null);
  const day = useClientValue(() => new Date(iso).toLocaleDateString("es-MX", { day: "numeric" }), null);
  const month = useClientValue(() => new Date(iso).toLocaleDateString("es-MX", { month: "short" }).replace(".", ""), null);

  return (
    <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-[var(--bg)] py-1.5 text-center">
      <span className="text-xs font-medium uppercase text-[var(--text-faint)]">{weekday ?? " "}</span>
      <span className="display tabular text-3xl font-bold leading-none">{day ?? " "}</span>
      <span className="text-xs font-medium uppercase text-[var(--text-muted)]">{month ?? " "}</span>
    </div>
  );
}

export function LocalTimeOnly({ iso, className }: { iso: string; className?: string }) {
  const text = useClientValue(
    () => new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    null,
  );

  return <span className={className}>{text ?? " "}</span>;
}

function relative(ms: number) {
  if (ms <= 0) return "en curso";
  const minutes = Math.floor(ms / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `en ${days} d ${hours} h`;
  if (hours > 0) return `en ${hours} h ${mins} min`;
  return `en ${mins} min`;
}

function everyHalfMinute(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
}

export function Countdown({ iso, className }: { iso: string; className?: string }) {
  const text = useClientValue(() => relative(new Date(iso).getTime() - Date.now()), null, everyHalfMinute);

  return <span className={className}>{text ?? " "}</span>;
}
