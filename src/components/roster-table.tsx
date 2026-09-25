"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ParseBar, RankValue } from "@/components/parse-bar";
import { CLASS_COLORS, CLASS_LABELS, ROLE_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

export type RosterRow = {
  id: string;
  name: string;
  owner: string;
  class: Enums<"wow_class">;
  spec: string;
  role: Enums<"character_role">;
  spec2: string | null;
  role2: Enums<"character_role"> | null;
  gearscore: number;
  percentile: number;
  isMain: boolean;
};

type SortKey = "gearscore" | "name" | "class" | "owner";
type RoleFilter = "all" | Enums<"character_role">;

const SORTS: { key: SortKey; label: string }[] = [
  { key: "gearscore", label: "GS" },
  { key: "name", label: "Personaje" },
  { key: "class", label: "Clase" },
  { key: "owner", label: "Jugador" },
];

const ROLE_FILTERS: { key: RoleFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "tank", label: ROLE_LABELS.tank },
  { key: "healer", label: ROLE_LABELS.healer },
  { key: "dps", label: ROLE_LABELS.dps },
];

export function RosterTable({ rows, compact = false }: { rows: RosterRow[]; compact?: boolean }) {
  const reduce = useReducedMotion();
  const [sort, setSort] = useState<SortKey>("gearscore");
  const [role, setRole] = useState<RoleFilter>("all");
  const [mainsOnly, setMainsOnly] = useState(false);

  const visible = useMemo(() => {
    const filtered = rows.filter(
      (r) => (role === "all" || r.role === role || r.role2 === role) && (!mainsOnly || r.isMain),
    );
    return filtered.sort((a, b) => {
      if (sort === "gearscore") return b.gearscore - a.gearscore || a.name.localeCompare(b.name);
      if (sort === "class") return CLASS_LABELS[a.class].localeCompare(CLASS_LABELS[b.class]) || b.gearscore - a.gearscore;
      if (sort === "owner") return a.owner.localeCompare(b.owner) || Number(b.isMain) - Number(a.isMain);
      return a.name.localeCompare(b.name);
    });
  }, [rows, sort, role, mainsOnly]);

  return (
    <div className="flex flex-col gap-3">
      {!compact && (
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filtrar por rol" className="flex rounded-lg bg-[var(--surface)] p-1">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={role === f.key}
                onClick={() => setRole(f.key)}
                className={`relative min-h-9 rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
                  role === f.key ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {role === f.key && (
                  <motion.span
                    layoutId="role-filter"
                    className="absolute inset-0 rounded-md bg-[var(--plate)]"
                    transition={{ type: "spring", stiffness: 520, damping: 42 }}
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            ))}
          </div>
          <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={mainsOnly}
              onChange={(e) => setMainsOnly(e.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Solo mains
          </label>
          <span className="tabular ml-auto text-sm text-[var(--text-faint)]">
            {visible.length} {visible.length === 1 ? "personaje" : "personajes"}
          </span>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="table min-w-[640px] text-sm">
          <thead>
            <tr>
              <th scope="col" className="w-12">
                #
              </th>
              {SORTS.map((s) => (
                <th
                  key={s.key}
                  scope="col"
                  aria-sort={sort === s.key ? (s.key === "gearscore" ? "descending" : "ascending") : undefined}
                  className={s.key === "gearscore" ? "w-48 text-right" : ""}
                >
                  {compact ? (
                    s.label
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSort(s.key)}
                      className={`inline-flex items-center gap-1 rounded transition-colors duration-150 hover:text-[var(--text)] ${
                        sort === s.key ? "text-[var(--text)]" : ""
                      }`}
                    >
                      {s.label}
                      <span aria-hidden className={sort === s.key ? "opacity-100" : "opacity-0"}>
                        {s.key === "gearscore" ? "↓" : "↑"}
                      </span>
                    </button>
                  )}
                </th>
              ))}
              <th scope="col">Spec</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <motion.tr
                key={r.id}
                layout={reduce ? false : "position"}
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
              >
                <td className="tabular text-[var(--text-faint)]">{i + 1}</td>
                <td className="text-right">
                  <div className="ml-auto flex max-w-44 items-center gap-3">
                    <ParseBar percentile={r.percentile} label={`${r.name}: percentil ${r.percentile} de gearscore en la guild`} />
                    {r.gearscore > 0 ? (
                      <RankValue value={r.gearscore} percentile={r.percentile} className="w-12 shrink-0 text-right" />
                    ) : (
                      <span className="w-12 shrink-0 text-right text-[var(--text-faint)]">—</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="font-semibold" style={{ color: CLASS_COLORS[r.class] }}>
                    {r.name}
                  </span>
                  {r.isMain && <span className="badge ml-2 bg-[var(--accent-dim)] text-[var(--accent-soft)]">Main</span>}
                </td>
                <td className="text-[var(--text-muted)]">{CLASS_LABELS[r.class]}</td>
                <td className="text-[var(--text-muted)]">{r.owner}</td>
                <td className="text-[var(--text-muted)]">
                  {r.spec} <span className="text-[var(--text-faint)]">· {ROLE_LABELS[r.role]}</span>
                  {r.spec2 && (
                    <span className="block text-xs text-[var(--text-faint)]">
                      {r.spec2} · {ROLE_LABELS[r.role2 ?? "dps"]}
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">Nadie coincide con este filtro.</p>
        )}
      </div>
    </div>
  );
}
