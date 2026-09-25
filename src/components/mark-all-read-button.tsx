"use client";

import { useTransition } from "react";
import { markAllNotificationsRead } from "@/app/(app)/notificaciones/actions";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => markAllNotificationsRead())}
      disabled={isPending}
      className="btn-secondary text-sm disabled:opacity-60"
    >
      Marcar todo como leído
    </button>
  );
}
