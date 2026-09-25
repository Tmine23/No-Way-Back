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
  applicant: "bg-transparent text-[var(--text-faint)] border border-[var(--border)]",
};

export function Nav({
  profile,
  isOfficer,
  isGuildMaster,
  unreadCount,
}: {
  profile: Tables<"profiles"> | null;
  isOfficer: boolean;
  isGuildMaster: boolean;
  unreadCount: number;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/raids", label: "Raids" },
    { href: "/roster", label: "Roster" },
    { href: "/personajes", label: "Mis personajes" },
    { href: "/loot", label: "Loot" },
    ...(isOfficer
      ? [
          { href: "/solicitudes", label: "Reclutamiento" },
          { href: "/members", label: "Miembros" },
        ]
      : []),
    ...(isGuildMaster ? [{ href: "/configuracion", label: "Configuración" }] : []),
  ];

  return (
    <header className="sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="" width={38} height={38} />
          <span className="text-xl font-bold tracking-tight">No Way Back</span>
        </Link>

        <div className="flex shrink-0 items-center gap-3 text-sm">
          <Link
            href="/notificaciones"
            aria-label="Notificaciones"
            className="relative rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 font-mono text-[10px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
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
                {profile.is_trial && " · Trial"}
              </span>
            </div>
          )}
          <SignOutButton />
        </div>
      </div>

      <nav className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-1.5 text-sm">
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
        </div>
      </nav>
    </header>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
