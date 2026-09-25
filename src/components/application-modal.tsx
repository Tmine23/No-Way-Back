"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { submitApplication } from "@/app/(app)/actions";
import { ClassPicker, SpecPicker } from "@/components/wow-pickers";
import { CLASS_SPECS, MAX_GEARSCORE } from "@/lib/wow";
import { useClientValue } from "@/lib/use-client-value";
import type { Enums } from "@/types/database";

type ApplicantType = Enums<"applicant_type">;

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOURS = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
const ease = [0.23, 1, 0.32, 1] as const;

export function ApplicationModal() {
  const [type, setType] = useState<ApplicantType | null>(null);
  const [state, formAction, isPending] = useActionState(submitApplication, { error: null });
  const [cls, setCls] = useState<Enums<"wow_class"> | null>(null);
  const [spec, setSpec] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [from, setFrom] = useState("21:00");
  const [gearscore, setGearscore] = useState("");
  const [missing, setMissing] = useState<string | null>(null);

  const zone = useClientValue(() => Intl.DateTimeFormat().resolvedOptions().timeZone, "");

  const availability = days.length
    ? `${DAYS.filter((d) => days.includes(d)).join(", ")} · desde las ${from} (hora ${zone || "local"})`
    : "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const problem = !cls
      ? "Elige tu clase."
      : !spec
        ? "Elige tu spec."
        : days.length === 0
          ? "Marca al menos un día en el que puedas raidear."
          : null;
    setMissing(problem);
    if (problem) event.preventDefault();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:py-10">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="card w-full max-w-2xl p-6 sm:p-8"
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {type === null ? (
              <motion.div key="type" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2, ease }}>
                <h2 id="modal-title" className="display text-4xl font-bold uppercase">
                  ¿Ya jugaste con nosotros?
                </h2>
                <p className="mt-2 text-base text-[var(--text-muted)]">Así los oficiales saben cómo revisar tu solicitud.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <TypeButton title="Soy nuevo" detail="Es la primera vez que juego con esta guild." onClick={() => setType("new_player")} />
                  <TypeButton title="Ya jugué antes" detail="Estuve en la guild o vengo de otro servidor." onClick={() => setType("returning_player")} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2, ease }}>
                <button type="button" onClick={() => setType(null)} className="btn-ghost -ml-3 mb-2 min-h-11 px-3 text-base">
                  ← Volver
                </button>
                <h2 id="modal-title" className="display text-4xl font-bold uppercase">
                  {type === "new_player" ? "Cuéntanos de ti" : "Bienvenido de vuelta"}
                </h2>

                <form action={formAction} onSubmit={handleSubmit} className="mt-6 flex flex-col gap-7">
                  <input type="hidden" name="applicant_type" value={type} />
                  <input type="hidden" name="class" value={cls ?? ""} />
                  <input type="hidden" name="spec" value={spec} />
                  <input type="hidden" name="availability" value={availability} />

                  {type === "returning_player" && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="flex flex-col gap-2 text-base font-semibold">
                        ¿De qué servidor vienes?
                        <input name="previous_server" autoComplete="off" className="input min-h-12 text-base font-normal" />
                      </label>
                      <label className="flex flex-col gap-2 text-base font-semibold">
                        Guild anterior <span className="-mt-1 text-sm font-normal text-[var(--text-muted)]">Opcional</span>
                        <input name="previous_guild" autoComplete="off" className="input min-h-12 text-base font-normal" />
                      </label>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <p id="apply-class" className="text-base font-semibold">
                      ¿Qué clase juegas?
                    </p>
                    <ClassPicker
                      labelledBy="apply-class"
                      value={cls}
                      onChange={(c) => {
                        setCls(c);
                        setSpec("");
                      }}
                    />
                  </div>

                  {cls && (
                    <div className="flex flex-col gap-3">
                      <p id="apply-spec" className="text-base font-semibold">
                        ¿Qué spec?
                      </p>
                      <SpecPicker labelledBy="apply-spec" specs={CLASS_SPECS[cls]} value={spec} onChange={setSpec} />
                    </div>
                  )}

                  <label className="flex flex-col gap-2 text-base font-semibold">
                    Gearscore
                    <span className="-mt-1 text-sm font-normal text-[var(--text-muted)]">Opcional. Si no lo sabes, déjalo vacío.</span>
                    <input
                      name="gearscore"
                      value={gearscore}
                      onChange={(e) => setGearscore(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      inputMode="numeric"
                      autoComplete="off"
                      className="input tabular min-h-12 w-40 text-lg font-normal"
                      placeholder={`0 – ${MAX_GEARSCORE}`}
                    />
                  </label>

                  <fieldset className="flex flex-col gap-3">
                    <legend className="mb-3 text-base font-semibold">¿Qué días puedes raidear?</legend>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {DAYS.map((d) => {
                        const on = days.includes(d);
                        return (
                          <label
                            key={d}
                            className={`flex min-h-12 cursor-pointer items-center justify-center rounded-lg border-2 text-base font-semibold transition-[border-color,background-color] duration-150 ${
                              on ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => setDays((list) => (on ? list.filter((x) => x !== d) : [...list, d]))}
                              className="sr-only"
                            />
                            {d}
                          </label>
                        );
                      })}
                    </div>
                    <label className="mt-2 flex flex-wrap items-center gap-3 text-base font-semibold">
                      Desde las
                      <select value={from} onChange={(e) => setFrom(e.target.value)} className="input min-h-12 w-32 text-base font-normal">
                        {HOURS.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm font-normal text-[var(--text-muted)]">en tu hora</span>
                    </label>
                  </fieldset>

                  <label className="flex flex-col gap-2 text-base font-semibold">
                    {type === "new_player" ? "Cuéntanos tu experiencia raideando" : "¿Por qué vuelves? ¿Qué buscas en la guild?"}
                    <span className="-mt-1 text-sm font-normal text-[var(--text-muted)]">Opcional, pero ayuda mucho.</span>
                    <textarea name="experience" rows={3} className="input text-base font-normal" />
                  </label>

                  <details className="group rounded-lg bg-[var(--surface-2)] px-4 py-3">
                    <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 text-base font-medium text-[var(--text-muted)]">
                      <span aria-hidden className="transition-transform duration-150 group-open:rotate-90">
                        ›
                      </span>
                      Link de logs o armory (opcional)
                    </summary>
                    <input name="logs_url" type="url" className="input mt-3 min-h-12 w-full text-base" placeholder="https://…" />
                  </details>

                  <div className="flex flex-col gap-3">
                    <p role="alert" className="text-base font-medium text-[var(--danger)] empty:hidden">
                      {missing ?? state.error}
                    </p>
                    <button type="submit" disabled={isPending} className="btn-primary min-h-14 text-lg">
                      {isPending ? "Enviando…" : "Enviar solicitud"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function TypeButton({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-28 flex-col items-start justify-center gap-1 rounded-[14px] border-2 border-[var(--border-strong)] p-5 text-left transition-[border-color,background-color,transform] duration-150 hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] active:scale-[0.98]"
    >
      <span className="display text-2xl font-bold uppercase">{title}</span>
      <span className="text-base text-[var(--text-muted)]">{detail}</span>
    </button>
  );
}
