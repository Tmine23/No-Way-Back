"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { DiscordSignInButton } from "@/components/discord-sign-in";

const FEATURES = [
  { title: "Raids", desc: "Invitación directa a tu celular: aceptas o rechazas con un toque." },
  { title: "Personajes", desc: "Tu main y tus alts, con doble spec y gearscore, en cada servidor." },
  { title: "Loot y progreso", desc: "Historial de loot, tiempos de kill y rankings del servidor." },
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
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-soft)]">
            Hardcore Guild
          </span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          custom={1}
          variants={fadeUp}
          className="mt-4 flex items-center gap-4 text-5xl font-bold tracking-tight sm:text-6xl"
        >
          <Image src="/logo-icon.png" alt="" width={56} height={56} priority />
          No Way Back
        </motion.h1>

        <motion.p initial="hidden" animate="show" custom={2} variants={fadeUp} className="mt-5 max-w-md text-[var(--text-muted)]">
          Roster, raids y loot del guild.
        </motion.p>

        <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp} className="mt-8">
          <DiscordSignInButton />
        </motion.div>

        <motion.p initial="hidden" animate="show" custom={4} variants={fadeUp} className="mt-6 max-w-sm text-sm text-[var(--text-muted)]">
          ¿Quieres unirte?{" "}
          <Link href="/reclutamiento" className="text-[var(--accent-soft)] hover:underline">
            Mira qué estamos buscando
          </Link>
          .
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
              <span className="mt-0.5 font-mono text-sm text-[var(--accent-soft)]">0{i + 1}</span>
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
