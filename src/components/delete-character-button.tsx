"use client";

import { useState, useTransition } from "react";
import { deleteCharacter } from "@/app/(app)/personajes/actions";

export function DeleteCharacterButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(`¿Borrar a ${name}?`)) return;
    startTransition(async () => {
      const result = await deleteCharacter(id);
      setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="text-sm text-[var(--text-faint)] hover:text-[var(--danger)] disabled:opacity-60"
      >
        Borrar
      </button>
      {error && <p className="max-w-48 text-right text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
