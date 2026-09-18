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

export const ROLE_LABELS: Record<Enums<"character_role">, string> = {
  tank: "Tank",
  healer: "Healer",
  dps: "DPS",
};

export const RSVP_LABELS: Record<Enums<"rsvp_status">, string> = {
  confirmed: "Confirmado",
  tentative: "Tentativo",
  absent: "Ausente",
  bench: "Banca",
};

export const GUILD_ROLE_LABELS: Record<Enums<"guild_role">, string> = {
  guild_master: "Guild Master",
  officer: "Officer",
  raider: "Raider",
  trial: "Trial",
  applicant: "Applicant",
};

export const GUILD_ROLE_ORDER: Enums<"guild_role">[] = [
  "guild_master",
  "officer",
  "raider",
  "trial",
  "applicant",
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
