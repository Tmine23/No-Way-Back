"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribePush, unsubscribePush } from "@/app/(app)/notificaciones/actions";
import { useClientValue } from "@/lib/use-client-value";

type State = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function PushToggle({ compact = false }: { compact?: boolean }) {
  // What the browser supports is known synchronously; whether we're subscribed needs a promise.
  const support = useClientValue<State | "check">(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return isIOS && !isStandalone ? "ios-install" : "unsupported";
    }
    return Notification.permission === "denied" ? "denied" : "check";
  }, "loading");
  const [subscription, setState] = useState<State | null>(null);
  const [isPending, startTransition] = useTransition();
  const state: State = support !== "check" ? support : (subscription ?? "loading");

  useEffect(() => {
    if (support !== "check") return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => setState("unsupported"));
  }, [support]);

  function enable() {
    startTransition(async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      await subscribePush(JSON.parse(JSON.stringify(sub)));
      setState("on");
    });
  }

  function disable() {
    startTransition(async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    });
  }

  if (state === "loading") return null;
  if (compact && state === "on") return null;

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">Notificaciones en tu celular</p>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          {state === "on" && "Activadas. Te avisaremos de raids y cambios importantes."}
          {state === "off" &&
            "Actívalas para enterarte de invitaciones a raids al instante. Si no, te avisamos por DM en Discord."}
          {state === "denied" &&
            "Las bloqueaste en este navegador. Habilítalas desde la configuración del sitio para recibirlas."}
          {state === "ios-install" &&
            "En iPhone primero instala la app: toca Compartir y luego \"Agregar a pantalla de inicio\". Después ábrela desde el ícono."}
          {state === "unsupported" &&
            "Este navegador no soporta notificaciones. Te avisaremos por DM en Discord."}
        </p>
      </div>
      {state === "off" && (
        <button onClick={enable} disabled={isPending} className="btn-primary shrink-0 text-sm disabled:opacity-60">
          {isPending ? "Activando…" : "Activar"}
        </button>
      )}
      {state === "on" && !compact && (
        <button onClick={disable} disabled={isPending} className="btn-secondary shrink-0 text-sm disabled:opacity-60">
          Desactivar
        </button>
      )}
    </div>
  );
}
