"use client";

import { useRef, useState, useTransition } from "react";
import {
  addApplicationComment,
  decideApplication,
  deleteRecruitmentNeed,
} from "@/app/(app)/solicitudes/actions";

export function ApplicationDecision({ applicationId, name }: { applicationId: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<"accept" | "reject" | null>(null);

  function decide(decision: "accept" | "reject") {
    startTransition(async () => {
      await decideApplication(applicationId, decision);
      setConfirming(null);
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--surface-2)] p-3">
        <p className="text-base font-medium">
          {confirming === "accept" ? `¿Aceptar a ${name} como Trial?` : `¿Rechazar a ${name}?`}
        </p>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => setConfirming(null)} disabled={isPending} className="btn-ghost min-h-11 px-4 text-base">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => decide(confirming)}
            disabled={isPending}
            className={`${confirming === "accept" ? "btn-primary" : "btn-danger"} min-h-11 px-5 text-base`}
          >
            {isPending ? "Guardando…" : confirming === "accept" ? "Sí, aceptar" : "Sí, rechazar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex">
      <button type="button" onClick={() => setConfirming("accept")} className="btn-primary min-h-12 px-6 text-base">
        Aceptar
      </button>
      <button type="button" onClick={() => setConfirming("reject")} className="btn-secondary min-h-12 px-6 text-base">
        Rechazar
      </button>
    </div>
  );
}

export function ReopenApplicationButton({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => decideApplication(applicationId, "reopen"))}
      disabled={isPending}
      className="btn-ghost min-h-10 px-3 text-sm"
    >
      {isPending ? "Reabriendo…" : "Reabrir"}
    </button>
  );
}

export function CommentForm({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const body = inputRef.current?.value ?? "";
        startTransition(async () => {
          await addApplicationComment(applicationId, body);
          if (inputRef.current) inputRef.current.value = "";
        });
      }}
    >
      <input
        ref={inputRef}
        aria-label="Comentario interno"
        autoComplete="off"
        className="input flex-1 text-sm"
        placeholder="Comentario interno para oficiales…"
        disabled={isPending}
      />
      <button type="submit" disabled={isPending} className="btn-secondary text-sm">
        Comentar
      </button>
    </form>
  );
}

export function DeleteNeedButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteRecruitmentNeed(id))}
      disabled={isPending}
      className="btn-ghost min-h-9 px-2 text-xs"
    >
      Quitar
    </button>
  );
}
