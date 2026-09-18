"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { setKnownAs } from "@/app/(app)/actions";

export function NicknameModal() {
  const [state, formAction, isPending] = useActionState(setKnownAs, { error: null });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="card w-full max-w-sm p-6"
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-lg font-semibold">¿Cómo te conocen en Whitemane?</h2>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            No es tu usuario de Discord — es el nombre por el que el guild te
            reconoce en el juego. Podrás cambiarlo después desde tu perfil.
          </p>

          <form action={formAction} className="mt-5 flex flex-col gap-3">
            <input
              name="known_as"
              required
              autoFocus
              maxLength={24}
              placeholder="Ej. Mine"
              className="input"
            />
            {state.error && (
              <p className="text-sm text-[var(--danger)]">{state.error}</p>
            )}
            <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60">
              {isPending ? "Guardando…" : "Continuar"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
