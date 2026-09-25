"use client";

import { CLASS_COLORS, CLASS_LABELS, ROLE_LABELS, WOW_CLASSES } from "@/lib/wow";
import type { Enums } from "@/types/database";

export function ClassPicker({
  labelledBy,
  value,
  onChange,
}: {
  labelledBy: string;
  value: Enums<"wow_class"> | null;
  onChange: (cls: Enums<"wow_class">) => void;
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {WOW_CLASSES.map((c) => {
        const active = c === value;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c)}
            className={`min-h-12 rounded-lg border-2 px-2 text-base font-semibold transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] ${
              active ? "border-current bg-[var(--surface-2)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
            style={{ color: CLASS_COLORS[c] }}
          >
            {CLASS_LABELS[c]}
          </button>
        );
      })}
    </div>
  );
}

export function SpecPicker({
  id,
  labelledBy,
  specs,
  value,
  onChange,
  noneLabel,
}: {
  id?: string;
  labelledBy: string;
  specs: { name: string; role: Enums<"character_role"> }[];
  value: string;
  onChange: (spec: string) => void;
  noneLabel?: string;
}) {
  const options = [...(noneLabel ? [{ name: "", role: null }] : []), ...specs];
  return (
    <div id={id} tabIndex={-1} role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {options.map((s) => {
        const active = s.name === value;
        return (
          <button
            key={s.name || "none"}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(s.name)}
            className={`flex min-h-14 min-w-32 flex-col items-start justify-center rounded-lg border-2 px-4 py-2 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] ${
              active ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            <span className="text-base font-semibold">{s.name || noneLabel}</span>
            {s.role && <span className="text-sm text-[var(--text-muted)]">{ROLE_LABELS[s.role]}</span>}
          </button>
        );
      })}
    </div>
  );
}
