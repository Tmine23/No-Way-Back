"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { GUILD_ROLE_LABELS } from "@/lib/wow";
import type { Tables } from "@/types/database";

const ROLE_BADGE_STYLES: Record<Tables<"profiles">["guild_role"], string> = {
  guild_master: "bg-[#3a2c0f] text-[#f1d78c] border border-[#a67c2e]",
  officer: "bg-[#0f2733] text-[#8ecbe8] border border-[#2c6c8c]",
  raider: "bg-[#132a1c] text-[#8fd6a8] border border-[#2f6b45]",
  trial: "bg-[#2a230f] text-[#e0c98a] border border-[#7a6530]",
  applicant: "bg-neutral-800 text-neutral-400 border border-neutral-700",
};

export function Nav({
  profile,
  isOfficer,
}: {
  profile: Tables<"profiles"> | null;
  isOfficer: boolean;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/roster", label: "Roster" },
    { href: "/raids", label: "Raids" },
    { href: "/loot", label: "Loot" },
    ...(isOfficer ? [{ href: "/members", label: "Miembros" }] : []),
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="" width={36} height={36} />
            <span className="font-display text-lg font-bold tracking-wide text-[var(--gold-soft)]">
              No Way Back
            </span>
          </Link>
          <nav className="flex gap-1 text-sm">
            {links.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 transition ${
                    active
                      ? "bg-[var(--bg-elevated-2)] text-[var(--frost-soft)]"
                      : "text-neutral-400 hover:text-neutral-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {profile && (
            <div className="flex items-center gap-2">
              {profile.discord_avatar_url && (
                <Image
                  src={profile.discord_avatar_url}
                  alt=""
                  width={26}
                  height={26}
                  className="rounded-full border border-[var(--border)]"
                />
              )}
              <span className="text-neutral-300">{profile.discord_username}</span>
              <span className={`badge ${ROLE_BADGE_STYLES[profile.guild_role]}`}>
                {GUILD_ROLE_LABELS[profile.guild_role]}
              </span>
            </div>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
