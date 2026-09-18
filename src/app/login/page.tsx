"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  { title: "Roster de personajes", desc: "Registra tu main y todos tus alts en un solo lugar." },
  { title: "Calendario de raids", desc: "Confirma tu asistencia por personaje, sin depender de Discord." },
  { title: "Historial de loot", desc: "Cada ítem ganado queda registrado con boss y fecha." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp} className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="" width={32} height={32} priority />
          <span className="text-sm font-medium text-[var(--text-muted)]">No Way Back</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          custom={1}
          variants={fadeUp}
          className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Tu guild,
          <br />
          <span className="text-[var(--accent-soft)]">en un solo lugar</span>.
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          custom={2}
          variants={fadeUp}
          className="mt-4 max-w-md text-[var(--text-muted)]"
        >
          Roster, raids y loot de No Way Back — nada de coordinarse a ciegas
          por Discord.
        </motion.p>

        <motion.button
          initial="hidden"
          animate="show"
          custom={3}
          variants={fadeUp}
          onClick={signInWithDiscord}
          className="btn-primary mt-8 flex w-fit items-center gap-2"
        >
          <DiscordIcon />
          Entrar con Discord
        </motion.button>

        <motion.p
          initial="hidden"
          animate="show"
          custom={4}
          variants={fadeUp}
          className="mt-6 max-w-sm text-xs text-[var(--text-faint)]"
        >
          Tu cuenta se registra automáticamente, pero queda pendiente de
          aprobación hasta que un Officer o el Guild Master te confirme.
        </motion.p>
      </div>

      <div className="hidden border-l border-[var(--border)] bg-[var(--surface)] lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="flex flex-col divide-y divide-[var(--border)]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-4 py-6 first:pt-0 last:pb-0"
            >
              <span className="mt-0.5 font-mono text-sm text-[var(--accent-soft)]">
                0{i + 1}
              </span>
              <div>
                <p className="font-medium">{f.title}</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
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
