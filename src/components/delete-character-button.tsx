"use client";

import { useState, useTransition } from "react";
import { deleteCharacter } from "@/app/(app)/personajes/actions";

export function DeleteCharacterButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCharacter(id);
      setError(result.error);
      setConfirming(false);
    });
  }

  return (
    <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
      {confirming ? (
        <>
          <span className="text-sm text-[var(--text-muted)]">¿Borrar a {name}?</span>
          <button onClick={() => setConfirming(false)} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={isPending} className="btn-danger">
            {isPending ? "Borrando…" : "Borrar"}
          </button>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} className="btn-ghost">
          Borrar
        </button>
      )}
      {error && (
        <p role="alert" className="w-full text-right text-xs text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
