"use client";

import { useTransition } from "react";
import { setSignup } from "@/app/(app)/raids/actions";
import { RSVP_LABELS } from "@/lib/wow";
import type { Enums, Tables } from "@/types/database";

const STATUSES: Enums<"rsvp_status">[] = ["confirmed", "tentative", "absent"];

export function RsvpControls({
  raidEventId,
  characters,
  currentStatuses,
}: {
  raidEventId: string;
  characters: Tables<"characters">[];
  currentStatuses: Record<string, Enums<"rsvp_status">>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      {characters.map((character) => (
        <div
          key={character.id}
          className="flex items-center justify-between rounded-md bg-[var(--surface-2)] px-3 py-2"
        >
          <span className="font-medium">{character.name}</span>
          <select
            className="input"
            disabled={isPending}
            defaultValue={currentStatuses[character.id] ?? "tentative"}
            onChange={(e) =>
              startTransition(() =>
                setSignup(
                  raidEventId,
                  character.id,
                  e.target.value as Enums<"rsvp_status">,
                ),
              )
            }
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {RSVP_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
