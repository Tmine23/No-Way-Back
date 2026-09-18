import type { Tables } from "@/types/database";

export function isOfficer(profile: Tables<"profiles"> | null): boolean {
  return profile?.guild_role === "officer" || profile?.guild_role === "guild_master";
}

export function isGuildMaster(profile: Tables<"profiles"> | null): boolean {
  return profile?.guild_role === "guild_master";
}

export function isApproved(profile: Tables<"profiles"> | null): boolean {
  return profile !== null && profile.guild_role !== "applicant";
}

export function displayName(profile: Pick<Tables<"profiles">, "known_as" | "discord_username">): string {
  return profile.known_as || profile.discord_username;
}
