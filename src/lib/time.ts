function zoneOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - instant;
}

export function zonedToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  let utc = wall - zoneOffsetMs(wall, timeZone);
  utc = wall - zoneOffsetMs(utc, timeZone);
  return new Date(utc);
}

function zonedDateParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdays.indexOf(get("weekday")),
  };
}

export function nextWeeklyOccurrence(
  weekday: number,
  time: string,
  timeZone: string,
  from: Date = new Date(),
): Date {
  const [hour, minute] = time.split(":").map(Number);
  const today = zonedDateParts(from, timeZone);
  for (let offset = 0; offset < 8; offset++) {
    const candidateDay = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
    if ((today.weekday + offset) % 7 !== weekday) continue;
    const instant = zonedToUtc(
      candidateDay.getUTCFullYear(),
      candidateDay.getUTCMonth() + 1,
      candidateDay.getUTCDate(),
      hour,
      minute,
      timeZone,
    );
    if (instant.getTime() > from.getTime()) return instant;
  }
  throw new Error("No se pudo calcular la próxima fecha");
}

export function formatTime(instant: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("es", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(instant);
}

export function formatWeekday(instant: Date, timeZone?: string) {
  const label = new Intl.DateTimeFormat("es", { timeZone, weekday: "long" }).format(instant);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDateTime(instant: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("es", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(instant);
}
