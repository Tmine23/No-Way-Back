import {
  characterNameError,
  isPrimaryProfession,
  MAX_GEARSCORE,
  MAX_PRIMARY_PROFESSIONS,
  PRIMARY_PROFESSIONS,
  SECONDARY_PROFESSIONS,
  specRole,
  WOW_CLASSES,
} from "@/lib/wow";
import type { Enums } from "@/types/database";

export type CharacterDraft = {
  id?: string;
  name: string;
  class: Enums<"wow_class">;
  spec: string;
  spec2: string;
  gearscore: string;
  professions: string[];
  armoryUrl: string;
  isMain: boolean;
};

export type DraftField = "name" | "spec" | "gearscore" | "professions" | "armoryUrl";
export type DraftErrors = Partial<Record<DraftField, string>>;

export type CharacterFormState = {
  error: string | null;
  fieldErrors?: Record<number, DraftErrors>;
};

const KNOWN_PROFESSIONS = new Set<string>([...PRIMARY_PROFESSIONS, ...SECONDARY_PROFESSIONS].map((p) => p.name));

/** Shared by the form (live feedback) and the server (final say). */
export function validateDraft(draft: CharacterDraft): DraftErrors {
  const errors: DraftErrors = {};
  const nameError = characterNameError(draft.name);
  if (nameError) errors.name = nameError;
  if (!WOW_CLASSES.includes(draft.class) || !specRole(draft.class, draft.spec)) {
    errors.spec = "Elige la spec principal.";
  }
  const gs = draft.gearscore.trim() === "" ? 0 : Number(draft.gearscore);
  if (!Number.isInteger(gs) || gs < 0 || gs > MAX_GEARSCORE) {
    errors.gearscore = `Escribe un número entre 0 y ${MAX_GEARSCORE}.`;
  }
  if (draft.professions.some((p) => !KNOWN_PROFESSIONS.has(p))) {
    errors.professions = "Hay una profesión que no existe.";
  } else if (draft.professions.filter(isPrimaryProfession).length > MAX_PRIMARY_PROFESSIONS) {
    errors.professions = `Máximo ${MAX_PRIMARY_PROFESSIONS} profesiones principales.`;
  }
  if (draft.armoryUrl.trim() && !/^https?:\/\/\S+$/i.test(draft.armoryUrl.trim())) {
    errors.armoryUrl = "El link debe empezar con https://";
  }
  return errors;
}
