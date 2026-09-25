"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { respondToRaid } from "@/app/(app)/raids/actions";
import { Magnetic } from "@/components/magnetic";
import { LocalDateTime } from "@/components/local-time";
import { CLASS_COLORS, ROLE_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

type Answer = "pending" | "confirmed" | "absent";

export type InvitationCharacter = {
  name: string;
  class: Enums<"wow_class">;
  spec: string;
  role: Enums<"character_role">;
};

const ease = [0.23, 1, 0.32, 1] as const;

export function RaidInvitation({
  raidEventId,
  scheduledAt,
  character,
  group,
  status,
}: {
  raidEventId: string;
  scheduledAt: string;
  character: InvitationCharacter;
  group: number;
  status: Enums<"rsvp_status">;
}) {
  const [answer, setAnswer] = useState<Answer>(
    status === "confirmed" ? "confirmed" : status === "absent" ? "absent" : "pending",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function answerWith(next: Exclude<Answer, "pending">) {
    const previous = answer;
    setAnswer(next);
    setError(null);
    startTransition(async () => {
      try {
        await respondToRaid(raidEventId, next);
      } catch (err) {
        setAnswer(previous);
        setError(err instanceof Error ? err.message : "No se pudo guardar tu respuesta.");
      }
    });
  }

  const who = (
    <span className="font-semibold" style={{ color: CLASS_COLORS[character.class] }}>
      {character.name}
    </span>
  );

  return (
    <section
      aria-labelledby="invitation-title"
      aria-busy={isPending}
      className={`plate relative overflow-hidden p-6 transition-shadow duration-300 sm:p-8 ${
        answer === "confirmed" ? "shadow-[inset_0_0_0_1px_var(--accent)]" : ""
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {answer === "pending" && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease }}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <h2 id="invitation-title" className="display text-4xl font-bold uppercase sm:text-5xl">
                Te convocaron
              </h2>
              <p className="mt-3 text-lg">
                Con {who}{" "}
                <span className="text-[var(--text-muted)]">
                  · {character.spec} · {ROLE_LABELS[character.role]} · Grupo {group}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <Magnetic>
                <button
                  type="button"
                  onClick={() => answerWith("confirmed")}
                  className="btn-primary min-h-14 w-full px-8 text-lg sm:w-auto"
                >
                  Aceptar
                </button>
              </Magnetic>
              <button
                type="button"
                onClick={() => answerWith("absent")}
                className="btn-secondary min-h-14 px-8 text-lg"
              >
                Rechazar
              </button>
            </div>
          </motion.div>
        )}

        {answer === "confirmed" && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease }}
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <CheckMark />
              <div>
                <h2 id="invitation-title" className="display text-4xl font-bold uppercase sm:text-5xl">
                  Vas a la raid
                </h2>
                <p className="mt-2 text-[var(--text-muted)]">
                  Te esperamos con {who} en el grupo {group}, <LocalDateTime iso={scheduledAt} sentenceStart={false} className="tabular" />.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => answerWith("absent")}
              className="btn-ghost shrink-0 self-start sm:self-center"
            >
              Ya no puedo ir
            </button>
          </motion.div>
        )}

        {answer === "absent" && (
          <motion.div
            key="absent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease }}
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2
                id="invitation-title"
                className="display text-4xl font-bold uppercase text-[var(--text-muted)] sm:text-5xl"
              >
                No vas a esta raid
              </h2>
              <p className="mt-2 text-[var(--text-muted)]">Los oficiales ya saben que tu lugar quedó libre.</p>
            </div>
            <button
              type="button"
              onClick={() => answerWith("confirmed")}
              className="btn-secondary shrink-0 self-start sm:self-center"
            >
              Siempre sí voy
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p aria-live="polite" className="mt-3 text-sm text-[var(--danger)] empty:hidden">
        {error}
      </p>
    </section>
  );
}

function CheckMark() {
  return (
    <svg aria-hidden width="44" height="44" viewBox="0 0 44 44" className="mt-1 shrink-0">
      <circle cx="22" cy="22" r="21" fill="var(--accent)" />
      <motion.path
        d="M13 22.5l6 6 12-13"
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.1, ease }}
      />
    </svg>
  );
}
