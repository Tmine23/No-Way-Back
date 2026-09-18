"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { SignOutButton } from "@/components/sign-out-button";
import { displayName } from "@/lib/roles";
import { GUILD_ROLE_LABELS } from "@/lib/wow";
import type { Tables } from "@/types/database";

const ROLE_BADGE_STYLES: Record<Tables<"profiles">["guild_role"], string> = {
  guild_master: "bg-[var(--accent-dim)] text-[var(--accent-soft)] border border-[var(--accent)]",
  officer: "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border-strong)]",
  raider: "bg-transparent text-[var(--text-muted)] border border-[var(--border)]",
  trial: "bg-transparent text-[var(--text-faint)] border border-[var(--border)]",
  applicant: "bg-transparent text-[var(--text-faint)] border border-[var(--border)]",
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
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.svg" alt="" width={28} height={28} />
          <span className="text-[15px] font-semibold tracking-tight">No Way Back</span>
        </Link>

        <nav className="order-3 flex w-full gap-1 overflow-x-auto text-sm sm:order-none sm:w-auto sm:overflow-visible">
          {links.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative shrink-0 rounded-md px-3 py-1.5 transition-colors ${
                  active ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-md bg-[var(--surface-2)]"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-sm">
          {profile && (
            <div className="flex items-center gap-2">
              {profile.discord_avatar_url && (
                <Image
                  src={profile.discord_avatar_url}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full border border-[var(--border)]"
                />
              )}
              <span className="text-[var(--text)]">{displayName(profile)}</span>
              <span className={`badge hidden sm:inline-flex ${ROLE_BADGE_STYLES[profile.guild_role]}`}>
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
