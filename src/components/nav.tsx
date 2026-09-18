import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import type { Tables } from "@/types/database";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/roster", label: "Roster" },
  { href: "/raids", label: "Raids" },
  { href: "/loot", label: "Loot" },
];

export function Nav({ profile }: { profile: Tables<"profiles"> | null }) {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-tight">No Way Back</span>
          <nav className="flex gap-4 text-sm text-neutral-300">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {profile && (
            <span className="text-neutral-400">
              {profile.discord_username}{" "}
              <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs uppercase text-neutral-300">
                {profile.guild_role}
              </span>
            </span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
