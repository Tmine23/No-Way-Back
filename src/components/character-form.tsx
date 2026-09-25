"use client";

import Link from "next/link";
import { useActionState, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { saveCharacters } from "@/app/(app)/personajes/actions";
import { validateDraft, type CharacterDraft, type CharacterFormState, type DraftErrors, type DraftField } from "@/lib/character-validation";
import {
  CLASS_COLORS,
  CLASS_LABELS,
  CLASS_SPECS,
  formatCharacterName,
  isPrimaryProfession,
  MAX_GEARSCORE,
  MAX_PRIMARY_PROFESSIONS,
  PRIMARY_PROFESSIONS,
  ROLE_LABELS,
  SECONDARY_PROFESSIONS,
  WOW_CLASSES,
} from "@/lib/wow";
import { ClassPicker, SpecPicker } from "@/components/wow-pickers";
import type { Enums, Tables } from "@/types/database";

type ServerOption = Pick<Tables<"servers">, "id" | "name">;
type Draft = CharacterDraft & { key: string; legacySpec?: string };

const MAX_DRAFTS = 10;
const ease = [0.23, 1, 0.32, 1] as const;

let keySeed = 0;
function newDraft(isMain: boolean): Draft {
  keySeed += 1;
  return {
    key: `draft-${keySeed}`,
    name: "",
    class: "warrior",
    spec: "",
    spec2: "",
    gearscore: "",
    professions: [],
    armoryUrl: "",
    isMain,
  };
}

export function CharacterForm({
  servers,
  defaultServerId,
  initial,
  hasMain = false,
}: {
  servers: ServerOption[];
  defaultServerId: string | null;
  /** Present when editing an existing character. */
  initial?: Draft;
  hasMain?: boolean;
}) {
  const editing = Boolean(initial);
  const [state, formAction, isPending] = useActionState<CharacterFormState, FormData>(saveCharacters, { error: null });
  const [drafts, setDrafts] = useState<Draft[]>(() => (initial ? [initial] : [newDraft(!hasMain)]));
  const [touched, setTouched] = useState<Record<string, Partial<Record<DraftField, boolean>>>>({});
  const [serverId, setServerId] = useState(defaultServerId ?? servers[0]?.id ?? "");
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function update(key: string, patch: Partial<Draft>) {
    setDrafts((list) => list.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function touch(key: string, field: DraftField) {
    setTouched((t) => ({ ...t, [key]: { ...t[key], [field]: true } }));
  }

  function setMain(key: string) {
    setDrafts((list) => list.map((d) => ({ ...d, isMain: d.key === key ? !d.isMain : false })));
  }

  function addAlt() {
    setDrafts((list) => [...list, newDraft(false)]);
    requestAnimationFrame(() => {
      const inputs = formRef.current?.querySelectorAll<HTMLInputElement>("input[data-name-input]");
      inputs?.[inputs.length - 1]?.focus();
    });
  }

  function remove(key: string) {
    setDrafts((list) => {
      const next = list.filter((d) => d.key !== key);
      if (list.find((d) => d.key === key)?.isMain && next.length && !hasMain) next[0] = { ...next[0], isMain: true };
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const allErrors = drafts.map((d) => validateDraft(d));
    const firstBad = allErrors.findIndex((e) => Object.keys(e).length > 0);
    if (firstBad >= 0) {
      event.preventDefault();
      setTouched(
        Object.fromEntries(
          drafts.map((d) => [d.key, { name: true, spec: true, gearscore: true, professions: true, armoryUrl: true }]),
        ),
      );
      setClientError("Revisa los campos marcados en rojo.");
      const field = Object.keys(allErrors[firstBad])[0];
      const target = formRef.current?.querySelector<HTMLElement>(`#${drafts[firstBad].key}-${field}`);
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.focus({ preventScroll: true });
      return;
    }
    setClientError(null);
  }

  const payload = JSON.stringify(drafts.map(({ key: _key, legacySpec: _legacy, ...d }) => d));
  const summaryError = clientError ?? state.error;
  const submitLabel = editing
    ? "Guardar cambios"
    : drafts.length === 1
      ? "Guardar personaje"
      : `Guardar ${drafts.length} personajes`;

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
      <input type="hidden" name="characters" value={payload} />
      <input type="hidden" name="server_id" value={serverId} />

      {servers.length > 1 && (
        <label className="field max-w-sm">
          Servidor
          <select value={serverId} onChange={(e) => setServerId(e.target.value)} className="input min-h-12 text-base">
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <AnimatePresence initial={false}>
        {drafts.map((draft, i) => {
          const live = validateDraft(draft);
          const server = state.fieldErrors?.[i] ?? {};
          const shown: DraftErrors = {};
          for (const f of ["name", "spec", "gearscore", "professions", "armoryUrl"] as DraftField[]) {
            if (touched[draft.key]?.[f] && live[f]) shown[f] = live[f];
            else if (server[f]) shown[f] = server[f];
          }
          return (
            <motion.div
              key={draft.key}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease }}
            >
              <CharacterCard
                draft={draft}
                index={i}
                altNumber={drafts.slice(0, i + 1).filter((d) => !d.isMain).length}
                errors={shown}
                canRemove={!editing && drafts.length > 1}
                showMainToggle={!editing || !initial?.isMain}
                onChange={(patch) => update(draft.key, patch)}
                onTouch={(field) => touch(draft.key, field)}
                onMain={() => setMain(draft.key)}
                onRemove={() => remove(draft.key)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {!editing && (
        <button
          type="button"
          onClick={addAlt}
          disabled={drafts.length >= MAX_DRAFTS}
          className="flex min-h-16 items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-[var(--border-strong)] text-base font-semibold text-[var(--text-muted)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--text)] active:scale-[0.99] disabled:opacity-50"
        >
          <span aria-hidden className="text-2xl leading-none">+</span>
          {drafts.length >= MAX_DRAFTS ? "Máximo 10 personajes a la vez" : "Agregar un alt"}
        </button>
      )}

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-[var(--border)] bg-[var(--bg)]/95 px-4 py-4 backdrop-blur-md lg:bottom-0">
        <button type="submit" disabled={isPending} className="btn-primary min-h-12 px-6 text-base">
          {isPending ? "Guardando…" : submitLabel}
        </button>
        <Link href="/personajes" className="btn-ghost min-h-12 px-4 text-base">
          Cancelar
        </Link>
        <p role="alert" aria-live="assertive" className="text-sm font-medium text-[var(--danger)] empty:hidden">
          {summaryError}
        </p>
      </div>
    </form>
  );
}

function CharacterCard({
  draft,
  index,
  altNumber,
  errors,
  canRemove,
  showMainToggle,
  onChange,
  onTouch,
  onMain,
  onRemove,
}: {
  draft: Draft;
  index: number;
  altNumber: number;
  errors: DraftErrors;
  canRemove: boolean;
  showMainToggle: boolean;
  onChange: (patch: Partial<Draft>) => void;
  onTouch: (field: DraftField) => void;
  onMain: () => void;
  onRemove: () => void;
}) {
  const id = draft.key;
  const specs = CLASS_SPECS[draft.class];
  const primaries = draft.professions.filter(isPrimaryProfession);
  const nameValid = !errors.name && draft.name.trim().length >= 2;

  function changeClass(next: Enums<"wow_class">) {
    if (next === draft.class) return;
    onChange({ class: next, spec: "", spec2: "", legacySpec: undefined });
  }

  function toggleProfession(name: string) {
    const has = draft.professions.includes(name);
    onChange({ professions: has ? draft.professions.filter((p) => p !== name) : [...draft.professions, name] });
    onTouch("professions");
  }

  return (
    <fieldset className="card flex flex-col gap-6 p-5 sm:p-6">
      <legend className="sr-only">{draft.isMain ? "Tu main" : `Personaje ${index + 1}`}</legend>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="display text-3xl font-bold uppercase">
          {draft.name.trim() ? (
            <span style={{ color: CLASS_COLORS[draft.class] }}>{formatCharacterName(draft.name)}</span>
          ) : draft.isMain ? (
            "Tu main"
          ) : (
            `Alt ${altNumber}`
          )}
        </p>
        <div className="flex items-center gap-2">
          {showMainToggle && (
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg bg-[var(--surface-2)] px-3 text-base font-medium">
              <input type="checkbox" checked={draft.isMain} onChange={onMain} className="size-5 accent-[var(--accent)]" />
              Es mi main
            </label>
          )}
          {canRemove && (
            <button type="button" onClick={onRemove} className="btn-ghost min-h-11 px-3 text-base">
              Quitar
            </button>
          )}
        </div>
      </div>

      <Question label="¿Cómo se llama?" htmlFor={`${id}-name`} error={errors.name} hint="Tal como aparece en el juego. Solo letras.">
        <div className="relative max-w-sm">
          <input
            id={`${id}-name`}
            data-name-input
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            onBlur={() => {
              if (draft.name.trim()) onChange({ name: formatCharacterName(draft.name) });
              onTouch("name");
            }}
            maxLength={12}
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={`${id}-name-msg`}
            className="input min-h-12 w-full pr-10 text-lg"
            placeholder="Nombre…"
          />
          {nameValid && (
            <span aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[var(--accent-soft)]">
              ✓
            </span>
          )}
        </div>
      </Question>

      <Question label="¿Qué clase es?" id={`${id}-class`}>
        <ClassPicker labelledBy={`${id}-class`} value={draft.class} onChange={changeClass} />
      </Question>

      <Question
        label="¿Qué spec juegas?"
        id={`${id}-spec-label`}
        error={errors.spec}
        hint={draft.legacySpec ? `Antes tenías escrito "${draft.legacySpec}". Elige la que corresponde.` : "El rol (Tank, Healer o DPS) se pone solo."}
      >
        <SpecPicker
          id={`${id}-spec`}
          labelledBy={`${id}-spec-label`}
          specs={specs}
          value={draft.spec}
          onChange={(spec) => {
            onChange({ spec, spec2: draft.spec2 === spec ? "" : draft.spec2 });
            onTouch("spec");
          }}
        />
      </Question>

      <Question label="¿Tienes segunda spec?" id={`${id}-spec2-label`} hint="Opcional. La dual spec que usas si la raid lo necesita.">
        <SpecPicker
          id={`${id}-spec2`}
          labelledBy={`${id}-spec2-label`}
          specs={specs.filter((s) => s.name !== draft.spec)}
          value={draft.spec2}
          onChange={(spec2) => onChange({ spec2 })}
          noneLabel="No tengo"
        />
      </Question>

      <Question
        label="Gearscore"
        htmlFor={`${id}-gearscore`}
        error={errors.gearscore}
        hint="Lo ves con el addon GearScore en el juego. Si no lo sabes, déjalo vacío."
      >
        <input
          id={`${id}-gearscore`}
          value={draft.gearscore}
          onChange={(e) => onChange({ gearscore: e.target.value.replace(/\D/g, "").slice(0, 4) })}
          onBlur={() => onTouch("gearscore")}
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={Boolean(errors.gearscore)}
          aria-describedby={`${id}-gearscore-msg`}
          className="input tabular min-h-12 w-40 text-lg"
          placeholder={`0 – ${MAX_GEARSCORE}`}
        />
      </Question>

      <Question
        label="Profesiones"
        id={`${id}-professions`}
        error={errors.professions}
      >
        <div className="flex flex-col gap-4">
          <p className="-mt-1 text-sm text-[var(--text-muted)]">
            Principales: máximo {MAX_PRIMARY_PROFESSIONS}.{" "}
            <span className={`tabular font-semibold ${primaries.length === MAX_PRIMARY_PROFESSIONS ? "text-[var(--accent-soft)]" : "text-[var(--text)]"}`}>
              Llevas {primaries.length} de {MAX_PRIMARY_PROFESSIONS}
            </span>
          </p>
          <div role="group" aria-labelledby={`${id}-professions`} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PRIMARY_PROFESSIONS.map((p) => {
              const checked = draft.professions.includes(p.name);
              const full = !checked && primaries.length >= MAX_PRIMARY_PROFESSIONS;
              return (
                <ProfessionCheck
                  key={p.name}
                  name={p.name}
                  es={p.es}
                  checked={checked}
                  disabled={full}
                  onToggle={() => toggleProfession(p.name)}
                />
              );
            })}
          </div>
          <div>
            <p className="mb-2 text-sm text-[var(--text-muted)]">Secundarias (las que quieras)</p>
            <div role="group" aria-label="Profesiones secundarias" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {SECONDARY_PROFESSIONS.map((p) => (
                <ProfessionCheck
                  key={p.name}
                  name={p.name}
                  es={p.es}
                  checked={draft.professions.includes(p.name)}
                  onToggle={() => toggleProfession(p.name)}
                />
              ))}
            </div>
          </div>
        </div>
      </Question>

      <details className="group rounded-lg bg-[var(--surface-2)] px-4 py-3" open={Boolean(draft.armoryUrl || errors.armoryUrl)}>
        <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 text-base font-medium text-[var(--text-muted)]">
          <span aria-hidden className="transition-transform duration-150 group-open:rotate-90">
            ›
          </span>
          Link de armory (opcional)
        </summary>
        <div className="mt-3">
          <Question label="Pega el link de tu personaje" htmlFor={`${id}-armoryUrl`} error={errors.armoryUrl}>
            <input
              id={`${id}-armoryUrl`}
              type="url"
              value={draft.armoryUrl}
              onChange={(e) => onChange({ armoryUrl: e.target.value })}
              onBlur={() => onTouch("armoryUrl")}
              aria-invalid={Boolean(errors.armoryUrl)}
              aria-describedby={`${id}-armoryUrl-msg`}
              className="input min-h-12 w-full text-base"
              placeholder="https://…"
            />
          </Question>
        </div>
      </details>
    </fieldset>
  );
}

function Question({
  label,
  htmlFor,
  id,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  id?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const generated = useId();
  const msgId = htmlFor ? `${htmlFor}-msg` : `${id ?? generated}-msg`;
  return (
    <div className="flex flex-col gap-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-base font-semibold">
          {label}
        </label>
      ) : (
        <p id={id} className="text-base font-semibold">
          {label}
        </p>
      )}
      {children}
      <p
        id={msgId}
        className={`text-sm ${error ? "font-medium text-[var(--danger)]" : "text-[var(--text-muted)]"} empty:hidden`}
      >
        {error ?? hint}
      </p>
    </div>
  );
}

function ProfessionCheck({
  name,
  es,
  checked,
  disabled = false,
  onToggle,
}: {
  name: string;
  es: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border-2 px-3 transition-[background-color,border-color,opacity] duration-150 ${
        checked
          ? "border-[var(--accent)] bg-[var(--accent-dim)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)]"
      } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="size-5 shrink-0 accent-[var(--accent)]"
      />
      <span className="leading-tight">
        <span className="block text-base font-medium">{name}</span>
        <span className="block text-sm text-[var(--text-muted)]">{es}</span>
      </span>
    </label>
  );
}
