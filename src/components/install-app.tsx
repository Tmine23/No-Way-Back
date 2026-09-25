"use client";

import { useEffect, useState } from "react";
import { useClientValue } from "@/lib/use-client-value";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type Platform = "installed" | "ios" | "ios-other-browser" | "other";

function detectPlatform(): Platform {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "installed";
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
  if (isIOS) return /CriOS|FxiOS|EdgiOS/.test(ua) ? "ios-other-browser" : "ios";
  return "other";
}

/** Invites members to install the app on their phone: one tap on Android, short steps on iPhone. */
export function InstallApp() {
  const platform = useClientValue<Platform | null>(detectPlatform, null);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!platform || platform === "installed" || installed) return null;
  if (platform === "other" && !prompt) return null;

  return (
    <section aria-labelledby="install-title" className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl" />
        <div>
          <h2 id="install-title" className="text-lg font-semibold">
            Instala la app en tu celular
          </h2>
          {platform === "ios" && (
            <p className="mt-1 text-base text-[var(--text-muted)]">
              Toca <ShareIcon /> <strong className="text-[var(--text)]">Compartir</strong> abajo en Safari y luego{" "}
              <strong className="text-[var(--text)]">Agregar a inicio</strong>.
            </p>
          )}
          {platform === "ios-other-browser" && (
            <p className="mt-1 text-base text-[var(--text-muted)]">
              En iPhone se instala desde <strong className="text-[var(--text)]">Safari</strong>. Abre esta página en Safari y toca
              Compartir → Agregar a inicio.
            </p>
          )}
          {platform === "other" && (
            <p className="mt-1 text-base text-[var(--text-muted)]">Queda como un ícono más y te llegan los avisos de raid.</p>
          )}
        </div>
      </div>
      {platform === "other" && prompt && (
        <button
          type="button"
          onClick={async () => {
            await prompt.prompt();
            const choice = await prompt.userChoice;
            if (choice.outcome === "accepted") setInstalled(true);
            setPrompt(null);
          }}
          className="btn-primary min-h-12 shrink-0 px-6 text-base"
        >
          Instalar
        </button>
      )}
    </section>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-1 text-[var(--accent-soft)]">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
