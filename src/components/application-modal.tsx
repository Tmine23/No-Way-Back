"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { submitApplication } from "@/app/(app)/actions";
import { WOW_CLASSES, CLASS_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

type ApplicantType = Enums<"applicant_type">;

export function ApplicationModal() {
  const [type, setType] = useState<ApplicantType | null>(null);
  const [state, formAction, isPending] = useActionState(submitApplication, {
    error: null,
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="card w-full max-w-md p-6"
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {type === null ? (
            <>
              <h2 className="text-lg font-semibold">¿Eres jugador nuevo o antiguo?</h2>
              <p className="mt-1.5 text-sm text-[var(--text-muted)]">
                Esto ayuda a los oficiales a revisar tu solicitud de ingreso.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  onClick={() => setType("new_player")}
                  className="btn-secondary text-left"
                >
                  <span className="font-medium">Jugador nuevo</span>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Primera vez que juego con este guild.
                  </p>
                </button>
                <button
                  onClick={() => setType("returning_player")}
                  className="btn-secondary text-left"
                >
                  <span className="font-medium">Jugador antiguo</span>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Ya jugué con el guild o vengo de otro server.
                  </p>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setType(null)}
                className="mb-3 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ← Cambiar
              </button>
              <h2 className="text-lg font-semibold">
                {type === "new_player" ? "Cuéntanos de ti" : "Bienvenido de vuelta"}
              </h2>

              <form action={formAction} className="mt-4 flex flex-col gap-3">
                <input type="hidden" name="applicant_type" value={type} />

                {type === "returning_player" && (
                  <>
                    <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                      ¿De qué server vienes?
                      <input name="previous_server" className="input" placeholder="Ej. Warmane" />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                      Guild anterior (opcional)
                      <input name="previous_guild" className="input" />
                    </label>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                    Clase principal
                    <select name="class" required className="input">
                      {WOW_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {CLASS_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                    Spec principal
                    <input name="spec" required className="input" placeholder="Ej. Fury" />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                  Gearscore aproximado (opcional)
                  <input name="gearscore" type="number" min={0} className="input" />
                </label>

                <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                  {type === "new_player"
                    ? "Cuéntanos tu experiencia raideando"
                    : "¿Por qué vuelves / qué buscas en el guild?"}
                  <textarea name="experience" rows={3} className="input" />
                </label>

                {state.error && (
                  <p className="text-sm text-[var(--danger)]">{state.error}</p>
                )}

                <button type="submit" disabled={isPending} className="btn-primary mt-1 disabled:opacity-60">
                  {isPending ? "Enviando…" : "Enviar solicitud"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
