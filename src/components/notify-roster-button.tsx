"use client";

import { useState, useTransition } from "react";
import { notifyRoster, type NotifyRosterResult } from "@/app/(app)/raids/actions";

export function NotifyRosterButton({ raidEventId }: { raidEventId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<NotifyRosterResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await notifyRoster(raidEventId);
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button onClick={handleClick} disabled={isPending} className="btn-secondary text-sm disabled:opacity-60">
        {isPending ? "Enviando…" : "Notificar roster por Discord"}
      </button>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      {result && (
        <div className="text-sm text-[var(--text-muted)]">
          {result.sent.length > 0 && <p>Enviado a: {result.sent.join(", ")}</p>}
          {result.failed.length > 0 && (
            <p className="text-[var(--danger)]">
              Falló para: {result.failed.map((f) => `${f.name} (${f.reason})`).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
