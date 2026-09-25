"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { setKnownAs } from "@/app/(app)/actions";

export function NicknameModal() {
  const [state, formAction, isPending] = useActionState(setKnownAs, { error: null });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/85 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          role="dialog" aria-modal="true" aria-labelledby="modal-title" className="card w-full max-w-sm p-7"
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        >
          <h2 id="modal-title" className="display text-3xl font-bold uppercase">¿Cómo te conocen en el juego?</h2>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            No es tu usuario de Discord: es el nombre por el que la guild te
            reconoce en el juego.
          </p>

          <form action={formAction} className="mt-5 flex flex-col gap-3">
            <input
              name="known_as"
              required
              autoFocus
              maxLength={24}
              aria-label="Tu nombre en el juego"
              autoComplete="off"
              spellCheck={false}
              placeholder="Tu nombre en el juego…"
              className="input"
            />
            {state.error && (
              <p role="alert" className="text-sm text-[var(--danger)]">{state.error}</p>
            )}
            <button type="submit" disabled={isPending} className="btn-primary ">
              {isPending ? "Guardando…" : "Continuar"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
