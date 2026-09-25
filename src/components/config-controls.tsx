"use client";

import { useTransition } from "react";
import {
  activateSeason,
  deleteScheduleRow,
  setSeasonPhase,
} from "@/app/(app)/configuracion/actions";
import { BIS_PHASE_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

export function DeleteScheduleButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteScheduleRow(id))}
      disabled={isPending}
      className="btn-ghost min-h-9 px-2 text-xs"
    >
      Quitar
    </button>
  );
}

export function ActivateSeasonButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => activateSeason(id))}
      disabled={isPending}
      className="btn-secondary min-h-9 text-xs"
    >
      Activar
    </button>
  );
}

export function PhaseSelect({ seasonId, phase }: { seasonId: string; phase: Enums<"bis_phase"> }) {
  const [isPending, startTransition] = useTransition();
  return (
    <select
      aria-label="Fase de BiS"
      className="input min-h-10 text-sm"
      disabled={isPending}
      defaultValue={phase}
      onChange={(e) =>
        startTransition(() => setSeasonPhase(seasonId, e.target.value as Enums<"bis_phase">))
      }
    >
      {(Object.keys(BIS_PHASE_LABELS) as Enums<"bis_phase">[]).map((p) => (
        <option key={p} value={p}>
          {BIS_PHASE_LABELS[p]}
        </option>
      ))}
    </select>
  );
}
