"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  { title: "Roster de personajes", desc: "Registra tu main y todos tus alts en un solo lugar." },
  { title: "Calendario de raids", desc: "Confirma tu asistencia por personaje, sin depender de Discord." },
  { title: "Historial de loot", desc: "Cada ítem ganado queda registrado con boss y fecha." },
];

export default function LoginPage() {
  const supabase = createClient();

  async function signInWithDiscord() {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image src="/logo.svg" alt="No Way Back" width={140} height={140} priority />
        <div>
          <h1 className="font-display text-4xl font-bold tracking-wide text-[var(--gold-soft)]">
            No Way Back
          </h1>
          <p className="mt-2 text-[var(--frost-soft)]">
            Frostmourne · Parche 3.3.5 Mítico
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            En carrera por el Realm First
          </p>
        </div>
      </div>

      <button onClick={signInWithDiscord} className="btn-primary flex items-center gap-2">
        <DiscordIcon />
        Entrar con Discord
      </button>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-4 text-center">
            <p className="font-display text-sm font-semibold text-[var(--frost-soft)]">
              {f.title}
            </p>
            <p className="mt-1 text-sm text-neutral-400">{f.desc}</p>
          </div>
        ))}
      </div>

      <p className="max-w-md text-center text-xs text-neutral-600">
        Tu cuenta se registra automáticamente al entrar. Un Officer revisará tu
        solicitud y te asignará tu rango dentro del guild.
      </p>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.197.373.291a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.106c.36.698.772 1.362 1.225 1.994a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.057c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}
