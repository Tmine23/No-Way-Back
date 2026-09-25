import type { Enums } from "@/types/database";

export const WOW_CLASSES: Enums<"wow_class">[] = [
  "warrior",
  "paladin",
  "hunter",
  "rogue",
  "priest",
  "death_knight",
  "shaman",
  "mage",
  "warlock",
  "druid",
];

export const CLASS_LABELS: Record<Enums<"wow_class">, string> = {
  warrior: "Warrior",
  paladin: "Paladin",
  hunter: "Hunter",
  rogue: "Rogue",
  priest: "Priest",
  death_knight: "Death Knight",
  shaman: "Shaman",
  mage: "Mage",
  warlock: "Warlock",
  druid: "Druid",
};

export const CLASS_COLORS: Record<Enums<"wow_class">, string> = {
  warrior: "#C79C6E",
  paladin: "#F58CBA",
  hunter: "#ABD473",
  rogue: "#FFF569",
  priest: "#FFFFFF",
  death_knight: "#C41F3B",
  shaman: "#0070DE",
  mage: "#69CCF0",
  warlock: "#9482C9",
  druid: "#FF7D0A",
};

export const CLASS_SPECS: Record<Enums<"wow_class">, { name: string; role: Enums<"character_role"> }[]> = {
  warrior: [
    { name: "Arms", role: "dps" },
    { name: "Fury", role: "dps" },
    { name: "Protection", role: "tank" },
  ],
  paladin: [
    { name: "Holy", role: "healer" },
    { name: "Protection", role: "tank" },
    { name: "Retribution", role: "dps" },
  ],
  hunter: [
    { name: "Beast Mastery", role: "dps" },
    { name: "Marksmanship", role: "dps" },
    { name: "Survival", role: "dps" },
  ],
  rogue: [
    { name: "Assassination", role: "dps" },
    { name: "Combat", role: "dps" },
    { name: "Subtlety", role: "dps" },
  ],
  priest: [
    { name: "Discipline", role: "healer" },
    { name: "Holy", role: "healer" },
    { name: "Shadow", role: "dps" },
  ],
  death_knight: [
    { name: "Blood", role: "tank" },
    { name: "Frost", role: "dps" },
    { name: "Unholy", role: "dps" },
  ],
  shaman: [
    { name: "Elemental", role: "dps" },
    { name: "Enhancement", role: "dps" },
    { name: "Restoration", role: "healer" },
  ],
  mage: [
    { name: "Arcane", role: "dps" },
    { name: "Fire", role: "dps" },
    { name: "Frost", role: "dps" },
  ],
  warlock: [
    { name: "Affliction", role: "dps" },
    { name: "Demonology", role: "dps" },
    { name: "Destruction", role: "dps" },
  ],
  druid: [
    { name: "Balance", role: "dps" },
    { name: "Feral (Tank)", role: "tank" },
    { name: "Feral (DPS)", role: "dps" },
    { name: "Restoration", role: "healer" },
  ],
};

export const ROLE_LABELS: Record<Enums<"character_role">, string> = {
  tank: "Tank",
  healer: "Healer",
  dps: "DPS",
};

export const RSVP_LABELS: Record<Enums<"rsvp_status">, string> = {
  confirmed: "Confirmado",
  tentative: "Pendiente",
  absent: "No puede",
  bench: "Banca",
};

export const GROUP_SIZE = 5;
export const BENCH_SIZE = 5;

export const GUILD_ROLE_LABELS: Record<Enums<"guild_rank">, string> = {
  guild_master: "Guild Master",
  officer: "Oficial",
  raider: "No Way Back",
  applicant: "Aspirante",
};

export const GUILD_ROLE_ORDER: Enums<"guild_rank">[] = [
  "guild_master",
  "officer",
  "raider",
  "applicant",
];

export const APPLICATION_STATUS_LABELS: Record<Enums<"application_status">, string> = {
  new: "Nuevo",
  interview: "Entrevista",
  trial: "Trial",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

export const APPLICATION_STATUS_ORDER: Enums<"application_status">[] = [
  "new",
  "interview",
  "trial",
  "accepted",
  "rejected",
];

export const RECRUITMENT_PRIORITY_LABELS: Record<Enums<"recruitment_priority">, string> = {
  high: "Prioridad alta",
  medium: "Buscamos",
  closed: "Cerrado",
};

export const BIS_PHASE_LABELS: Record<Enums<"bis_phase">, string> = {
  pre_raid: "Pre-raid",
  t7: "T7 · Naxxramas",
  t8: "T8 · Ulduar",
  t9: "T9 · Prueba del Cruzado",
  t10: "T10 · Ciudadela de la Corona de Hielo",
};

export const WEEKDAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const TIMEZONE_OPTIONS = [
  { value: "America/La_Paz", label: "Bolivia (La Paz)" },
  { value: "America/Bogota", label: "Colombia (Bogotá)" },
  { value: "America/Lima", label: "Perú (Lima)" },
  { value: "America/Santiago", label: "Chile (Santiago)" },
  { value: "America/Havana", label: "Cuba (La Habana)" },
  { value: "America/Mexico_City", label: "México (CDMX)" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina (Buenos Aires)" },
  { value: "America/Caracas", label: "Venezuela (Caracas)" },
  { value: "Europe/Madrid", label: "España (Madrid)" },
];

export const RAID_STATUS_LABELS: Record<Enums<"raid_event_status">, string> = {
  scheduled: "Programada",
  completed: "Completada",
  cancelled: "Cancelada",
};

export const APPLICANT_TYPE_LABELS: Record<Enums<"applicant_type">, string> = {
  new_player: "Jugador nuevo",
  returning_player: "Jugador antiguo",
};

/** Profession names as the game client shows them; the Spanish name helps players who play in Spanish. */
export const PRIMARY_PROFESSIONS = [
  { name: "Alchemy", es: "Alquimia" },
  { name: "Blacksmithing", es: "Herrería" },
  { name: "Enchanting", es: "Encantamiento" },
  { name: "Engineering", es: "Ingeniería" },
  { name: "Herbalism", es: "Herboristería" },
  { name: "Inscription", es: "Inscripción" },
  { name: "Jewelcrafting", es: "Joyería" },
  { name: "Leatherworking", es: "Peletería" },
  { name: "Mining", es: "Minería" },
  { name: "Skinning", es: "Desuello" },
  { name: "Tailoring", es: "Sastrería" },
] as const;

export const SECONDARY_PROFESSIONS = [
  { name: "Cooking", es: "Cocina" },
  { name: "First Aid", es: "Primeros auxilios" },
  { name: "Fishing", es: "Pesca" },
] as const;

export const MAX_PRIMARY_PROFESSIONS = 2;
export const MAX_GEARSCORE = 7000;

export function isPrimaryProfession(name: string) {
  return PRIMARY_PROFESSIONS.some((p) => p.name === name);
}

/** Maps free-text professions saved before the checklist existed onto the canonical names. */
export function normalizeProfessions(values: string[]) {
  const all = [...PRIMARY_PROFESSIONS, ...SECONDARY_PROFESSIONS];
  const found = values
    .map((v) => v.trim().toLowerCase())
    .map((v) => all.find((p) => p.name.toLowerCase() === v || p.es.toLowerCase() === v)?.name)
    .filter((v): v is (typeof all)[number]["name"] => Boolean(v));
  return [...new Set(found)];
}

/** WoW names: letters only, 2 to 12 characters, first letter uppercase and the rest lowercase. */
export function formatCharacterName(value: string) {
  const trimmed = value.trim();
  return trimmed.charAt(0).toLocaleUpperCase("es") + trimmed.slice(1).toLocaleLowerCase("es");
}

export function characterNameError(value: string) {
  const name = value.trim();
  if (!name) return "Escribe el nombre del personaje.";
  if (/\s/.test(name)) return "El nombre no puede tener espacios.";
  if (!/^\p{L}+$/u.test(name)) return "Solo letras, sin números ni símbolos.";
  if (name.length < 2) return "Muy corto: mínimo 2 letras.";
  if (name.length > 12) return "Muy largo: máximo 12 letras.";
  return null;
}

export function specRole(cls: Enums<"wow_class">, spec: string) {
  return CLASS_SPECS[cls].find((s) => s.name === spec)?.role ?? null;
}
