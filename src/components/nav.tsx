"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SignOutButton } from "@/components/sign-out-button";
import { displayName } from "@/lib/roles";
import { GUILD_ROLE_LABELS } from "@/lib/wow";
import type { Tables } from "@/types/database";

type IconName = "home" | "raid" | "roster" | "chars" | "loot" | "recruit" | "members" | "config" | "more";
type NavLink = { href: string; label: string; short?: string; icon: IconName };

const ROLE_BADGE_STYLES: Record<Tables<"profiles">["guild_role"], string> = {
  guild_master: "bg-[var(--accent-dim)] text-[var(--accent-soft)]",
  officer: "bg-[var(--plate)] text-[var(--text)]",
  raider: "bg-[var(--surface-2)] text-[var(--text-muted)]",
  applicant: "bg-[var(--surface-2)] text-[var(--text-faint)]",
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

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
  // The sheet belongs to the page it was opened on, so navigating closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const moreOpen = openedOn === pathname;
  const setMoreOpen = (open: boolean | ((was: boolean) => boolean)) => {
    const next = typeof open === "function" ? open(moreOpen) : open;
    setOpenedOn(next ? pathname : null);
  };

  const primary: NavLink[] = [
    { href: "/", label: "Inicio", icon: "home" },
    { href: "/raids", label: "Raids", icon: "raid" },
    { href: "/roster", label: "Roster", icon: "roster" },
    { href: "/personajes", label: "Mis personajes", short: "Personajes", icon: "chars" },
    { href: "/loot", label: "Loot", icon: "loot" },
  ];
  const staff: NavLink[] = [
    ...(isOfficer
      ? [
          { href: "/solicitudes", label: "Reclutamiento", icon: "recruit" as const },
          { href: "/members", label: "Miembros", icon: "members" as const },
        ]
      : []),
    ...(isGuildMaster ? [{ href: "/configuracion", label: "Configuración", icon: "config" as const }] : []),
  ];
  const all = [...primary, ...staff];
  const tabs = primary.slice(0, 4);
  const overflow = [...primary.slice(4), ...staff];
  const overflowActive = overflow.some((l) => isActive(pathname, l.href));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="No Way Back, inicio">
            <Image src="/logo-icon.png" alt="" width={36} height={37} priority />
            <span className="display text-[1.65rem] font-bold uppercase">No Way Back</span>
          </Link>

          <nav aria-label="Principal" className="hidden flex-1 items-center gap-0.5 text-sm lg:flex">
            {all.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-md px-3 py-2 font-medium transition-colors duration-150 ${
                    active ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-[var(--accent)]"
                      transition={{ type: "spring", stiffness: 520, damping: 42 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 text-sm">
            <Link
              href="/notificaciones"
              aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
              className="relative flex size-10 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="tabular absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            {profile && (
              <div className="flex items-center gap-2.5 pl-1">
                {profile.discord_avatar_url && (
                  <Image src={profile.discord_avatar_url} alt="" width={28} height={28} className="rounded-full" />
                )}
                <div className="hidden leading-tight sm:block">
                  <p className="font-medium text-[var(--text)]">{displayName(profile)}</p>
                  <p className="text-xs text-[var(--text-faint)]">
                    {GUILD_ROLE_LABELS[profile.guild_role]}
                    {profile.is_trial && " · Trial"}
                  </p>
                </div>
                <span className={`badge sm:hidden ${ROLE_BADGE_STYLES[profile.guild_role]}`}>
                  {GUILD_ROLE_LABELS[profile.guild_role]}
                </span>
              </div>
            )}
            <div className="hidden lg:block">
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg">
          {tabs.map((link) => (
            <li key={link.href} className="flex-1">
              <TabLink link={link} active={isActive(pathname, link.href)} />
            </li>
          ))}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-controls="nav-more"
              className={`relative flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150 ${
                overflowActive || moreOpen ? "text-[var(--text)]" : "text-[var(--text-faint)]"
              }`}
            >
              {overflowActive && <ActiveMark />}
              <NavIcon name="more" />
              Más
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            />
            <motion.div
              key="sheet"
              id="nav-more"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="fixed inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-[var(--border-strong)] bg-[var(--surface)] px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-3 lg:hidden"
            >
              <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-[var(--border-strong)]" />
              <ul className="grid gap-1">
                {overflow.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-12 items-center gap-3 rounded-lg px-3 font-medium ${
                          active ? "bg-[var(--surface-2)] text-[var(--text)]" : "text-[var(--text-muted)]"
                        }`}
                      >
                        <NavIcon name={link.icon} />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="mt-1 border-t border-[var(--border)] px-3 pt-3">
                  <SignOutButton />
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function TabLink({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150 ${
        active ? "text-[var(--text)]" : "text-[var(--text-faint)]"
      }`}
    >
      {active && <ActiveMark />}
      <NavIcon name={link.icon} />
      {link.short ?? link.label}
    </Link>
  );
}

function ActiveMark() {
  return (
    <motion.span
      layoutId="tab-active"
      className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-[var(--accent)]"
      transition={{ type: "spring", stiffness: 520, damping: 42 }}
    />
  );
}

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  raid: (
    <>
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="m13 19 6-6M16 16l4 4M19 21l2-2" />
    </>
  ),
  roster: (
    <>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </>
  ),
  chars: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  loot: (
    <>
      <path d="M3 9h18v11H3z" />
      <path d="M3 9l2-5h14l2 5M12 9v11" />
    </>
  ),
  recruit: (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M2 21a8 8 0 0 1 13-6.2M19 14v6M16 17h6" />
    </>
  ),
  members: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a7 7 0 0 1 4 6.5" />
    </>
  ),
  config: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </>
  ),
};

function NavIcon({ name }: { name: IconName }) {
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name]}
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
