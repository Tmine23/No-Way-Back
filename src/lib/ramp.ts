export type RankTier = "gray" | "green" | "blue" | "purple" | "orange" | "pink" | "gold";

export const RANK_COLORS: Record<RankTier, string> = {
  gray: "var(--rank-gray)",
  green: "var(--rank-green)",
  blue: "var(--rank-blue)",
  purple: "var(--rank-purple)",
  orange: "var(--rank-orange)",
  pink: "var(--rank-pink)",
  gold: "var(--rank-gold)",
};

export const RANK_HEX: Record<RankTier, string> = {
  gray: "#7c8595",
  green: "#1eff00",
  blue: "#3d8bff",
  purple: "#a335ee",
  orange: "#ff8000",
  pink: "#e268a8",
  gold: "#e5cc80",
};

export const RANK_ORDER: RankTier[] = ["gray", "green", "blue", "purple", "orange", "pink", "gold"];

export function tierForPercentile(p: number): RankTier {
  if (p >= 100) return "gold";
  if (p >= 99) return "pink";
  if (p >= 95) return "orange";
  if (p >= 75) return "purple";
  if (p >= 50) return "blue";
  if (p >= 25) return "green";
  return "gray";
}

export function percentileRank(values: number[], value: number): number {
  const scored = values.filter((v) => v > 0);
  if (value <= 0 || scored.length === 0) return 0;
  if (scored.length === 1) return 100;
  const below = scored.filter((v) => v < value).length;
  const equal = scored.filter((v) => v === value).length;
  return Math.round(((below + (equal - 1) / 2) / (scored.length - 1)) * 100);
}
