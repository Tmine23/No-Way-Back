"use client";

import { useState, useTransition } from "react";
import { announceRaid, type AnnounceRaidResult } from "@/app/(app)/raids/actions";
import { Magnetic } from "@/components/magnetic";

export function AnnounceRaidButton({
  raidEventId,
  alreadyAnnounced,
}: {
  raidEventId: string;
  alreadyAnnounced: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnnounceRaidResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await announceRaid(raidEventId);
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Magnetic>
        <button
          onClick={handleClick}
          disabled={isPending}
          className={`${alreadyAnnounced ? "btn-secondary" : "btn-primary"} min-h-11 px-5`}
        >
          {isPending ? "Enviando…" : alreadyAnnounced ? "Reenviar invitación" : "Notificar a la raid"}
        </button>
      </Magnetic>

      <div aria-live="polite" className="text-sm sm:text-right">
        {error && <p className="text-[var(--danger)]">{error}</p>}
        {result && (
          <>
            {result.push.length > 0 && (
              <p className="text-[var(--text-muted)]">Notificación en el celular: {result.push.join(", ")}</p>
            )}
            {result.discord.length > 0 && (
              <p className="text-[var(--text-muted)]">Por DM de Discord: {result.discord.join(", ")}</p>
            )}
            {result.failed.length > 0 && <p className="text-[var(--danger)]">No llegó a: {result.failed.join(", ")}</p>}
            {result.push.length + result.discord.length + result.failed.length === 0 && (
              <p className="text-[var(--text-muted)]">No hay nadie en la composición todavía.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
