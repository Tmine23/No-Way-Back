"use client";

import { useTransition } from "react";
import { setRosterSlot } from "@/app/(app)/raids/actions";
import { CLASS_COLORS, ROLE_LABELS } from "@/lib/wow";
import type { Enums, Tables } from "@/types/database";

type SignupWithCharacter = Tables<"raid_signups"> & {
  characters: Tables<"characters">;
};

const ROLE_ORDER: Enums<"character_role">[] = ["tank", "healer", "dps"];

export function RosterBuilder({
  raidEventId,
  confirmed,
  canEdit,
}: {
  raidEventId: string;
  confirmed: SignupWithCharacter[];
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const byRole = new Map<Enums<"character_role">, SignupWithCharacter[]>();
  for (const role of ROLE_ORDER) byRole.set(role, []);
  for (const signup of confirmed) {
    byRole.get(signup.characters.role)!.push(signup);
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">Roster final</p>
        <div className="flex gap-3 font-mono text-sm text-[var(--text-muted)]">
          {ROLE_ORDER.map((role) => (
            <span key={role}>
              {ROLE_LABELS[role]}{" "}
              <span className="text-[var(--accent-soft)]">
                {byRole.get(role)!.filter((s) => s.in_roster).length}
              </span>
            </span>
          ))}
        </div>
      </div>

      {confirmed.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          Todavía nadie ha confirmado asistencia.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {ROLE_ORDER.map((role) => (
            <div key={role}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                {ROLE_LABELS[role]}
              </p>
              <div className="flex flex-col gap-1">
                {byRole.get(role)!.map((signup) => (
                  <label
                    key={signup.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      signup.in_roster ? "bg-[var(--accent-dim)]" : "hover:bg-[var(--surface-2)]"
                    } ${!canEdit ? "cursor-default" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={signup.in_roster}
                      disabled={!canEdit || isPending}
                      onChange={(e) =>
                        startTransition(() =>
                          setRosterSlot(raidEventId, signup.id, e.target.checked),
                        )
                      }
                      className="h-3.5 w-3.5 accent-[var(--accent)]"
                    />
                    <span style={{ color: CLASS_COLORS[signup.characters.class] }}>
                      {signup.characters.name}
                    </span>
                  </label>
                ))}
                {byRole.get(role)!.length === 0 && (
                  <p className="px-2 text-sm text-[var(--text-faint)]">—</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
