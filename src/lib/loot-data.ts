import raw from "@/data/loot-t7.json";

export type LootItem = {
  id: number;
  name: string;
  nameEs: string | null;
  quality: number;
  slot: string | null;
  type: string | null;
  icon: string | null;
  ilvl: number | null;
};

export type LootBoss = { key: string; name: string; loot: { "10": number[]; "25": number[] } };
export type LootRaid = { key: string; name: string; bosses: LootBoss[] };

type RawItem = Omit<LootItem, "id">;

const data = raw as { raids: LootRaid[]; items: Record<string, RawItem> };

export const LOOT_RAIDS: LootRaid[] = data.raids;

export function lootItem(id: number | null | undefined): LootItem | null {
  if (!id) return null;
  const item = data.items[String(id)];
  return item ? { id, ...item } : null;
}

export function bossLoot(boss: LootBoss, size: 10 | 25): LootItem[] {
  return boss.loot[size === 10 ? "10" : "25"].map((id) => lootItem(id)!).filter(Boolean);
}

export function iconUrl(icon: string | null, size: "small" | "medium" | "large" = "medium") {
  return icon ? `https://wow.zamimg.com/images/wow/icons/${size}/${icon}.jpg` : null;
}

export const QUALITY_COLORS: Record<number, string> = {
  3: "#0070dd",
  4: "#a335ee",
  5: "#ff8000",
};

/** Which Naxxramas wing each boss belongs to, so the picker can group them like the instance. */
export const NAXX_WINGS: { name: string; bosses: string[] }[] = [
  { name: "Arácnido", bosses: ["anubrekhan", "faerlina", "maexxna"] },
  { name: "Peste", bosses: ["noth", "heigan", "loatheb"] },
  { name: "Militar", bosses: ["razuvious", "gothik", "four-horsemen"] },
  { name: "Abominación", bosses: ["patchwerk", "grobbulus", "gluth", "thaddius"] },
  { name: "Guarida de Escarcha", bosses: ["sapphiron", "kelthuzad"] },
  { name: "Otros", bosses: ["trash"] },
];
