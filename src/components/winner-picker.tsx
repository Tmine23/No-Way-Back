"use client";

import { useId, useMemo, useRef, useState } from "react";
import { CLASS_COLORS, CLASS_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

export type PickableCharacter = {
  id: string;
  name: string;
  class: Enums<"wow_class">;
  spec: string;
  owner: string;
  inRaid: boolean;
};

const MAX_RESULTS = 8;

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function WinnerPicker({
  characters,
  value,
  onChange,
  label,
}: {
  characters: PickableCharacter[];
  value: string | null;
  onChange: (id: string | null) => void;
  label: string;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = characters.find((c) => c.id === value) ?? null;

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const matches = characters.filter(
      (c) => !q || normalize(c.name).includes(q) || normalize(c.owner).includes(q),
    );
    // People in this raid first, then names that start with what was typed.
    return matches
      .sort(
        (a, b) =>
          Number(b.inRaid) - Number(a.inRaid) ||
          Number(normalize(b.name).startsWith(q)) - Number(normalize(a.name).startsWith(q)) ||
          a.name.localeCompare(b.name),
      )
      .slice(0, MAX_RESULTS);
  }, [characters, query]);

  function choose(character: PickableCharacter) {
    onChange(character.id);
    setQuery("");
    setOpen(false);
  }

  if (selected) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-[var(--surface-2)] px-3 py-2">
        <span className="text-sm text-[var(--text-muted)]">Ganador:</span>
        <span className="text-base font-semibold" style={{ color: CLASS_COLORS[selected.class] }}>
          {selected.name}
        </span>
        <span className="text-sm text-[var(--text-muted)]">{selected.owner}</span>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="btn-ghost ml-auto min-h-10 px-3 text-sm"
        >
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${listId}-${results[active].id}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (results[active]) choose(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        autoComplete="off"
        spellCheck={false}
        className="input min-h-12 w-full text-base"
        placeholder="¿Quién ganó? Escribe su nombre…"
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        >
          {results.length === 0 && <li className="px-3 py-3 text-base text-[var(--text-muted)]">Nadie se llama así.</li>}
          {results.map((c, i) => (
            <li
              key={c.id}
              id={`${listId}-${c.id}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(c)}
              onMouseEnter={() => setActive(i)}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md px-3 ${
                i === active ? "bg-[var(--surface-2)]" : ""
              }`}
            >
              <span className="text-base font-semibold" style={{ color: CLASS_COLORS[c.class] }}>
                {c.name}
              </span>
              <span className="truncate text-sm text-[var(--text-muted)]">
                {c.spec} {CLASS_LABELS[c.class]} · {c.owner}
              </span>
              {c.inRaid && (
                <span className="badge ml-auto shrink-0 bg-[var(--accent-dim)] text-[var(--accent-soft)]">En la raid</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
