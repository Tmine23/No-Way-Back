"use client";

import { useRef, useTransition } from "react";
import {
  addApplicationComment,
  deleteRecruitmentNeed,
  setApplicationStatus,
} from "@/app/(app)/solicitudes/actions";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_ORDER } from "@/lib/wow";
import type { Enums } from "@/types/database";

export function ApplicationStatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: Enums<"application_status">;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <select
      aria-label="Estado de la postulación"
      className="input min-h-10 text-sm"
      disabled={isPending}
      defaultValue={status}
      onChange={(e) =>
        startTransition(() =>
          setApplicationStatus(applicationId, e.target.value as Enums<"application_status">),
        )
      }
    >
      {APPLICATION_STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {APPLICATION_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
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
