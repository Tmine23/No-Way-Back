"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { DiscordSignInButton } from "@/components/discord-sign-in";
import { InstallApp } from "@/components/install-app";
import { Magnetic } from "@/components/magnetic";

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 + i * 0.07, ease: [0.23, 1, 0.32, 1] as const },
  }),
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col justify-center px-6 py-14 sm:px-12 lg:px-20">
        <motion.div initial="hidden" animate="show" custom={0} variants={rise}>
          <Image src="/logo-icon.png" alt="Emblema de No Way Back" width={72} height={74} priority />
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          custom={1}
          variants={rise}
          className="display mt-6 text-[clamp(4rem,13vw,9.5rem)] font-bold uppercase"
        >
          No Way
          <br />
          Back
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          custom={2}
          variants={rise}
          className="display mt-3 text-2xl font-medium uppercase tracking-[0.04em] text-[var(--text-muted)] sm:text-3xl"
        >
          Hardcore guild
        </motion.p>

        <motion.div initial="hidden" animate="show" custom={3} variants={rise} className="mt-10">
          <Magnetic>
            <DiscordSignInButton className="min-h-12 px-6 text-base" />
          </Magnetic>
        </motion.div>

        <motion.p
          initial="hidden"
          animate="show"
          custom={4}
          variants={rise}
          className="mt-6 max-w-sm text-sm text-[var(--text-muted)]"
        >
          ¿Quieres unirte?{" "}
          <Link href="/reclutamiento" className="font-medium text-[var(--accent-soft)] underline-offset-4 hover:underline">
            Mira qué estamos buscando
          </Link>
        </motion.p>
        <div className="mt-10 max-w-xl">
          <InstallApp />
        </div>
      </main>

    </div>
  );
}
