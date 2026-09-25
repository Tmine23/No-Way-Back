"use client";

import { useTransition } from "react";
import { setMemberTrial, updateMemberRole } from "@/app/(app)/members/actions";
import { GUILD_ROLE_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

export function RoleSelect({
  memberId,
  currentRole,
  assignableRoles,
  disabled,
  label,
}: {
  label: string;
  memberId: string;
  currentRole: Enums<"guild_rank">;
  assignableRoles: Enums<"guild_rank">[];
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const options = assignableRoles.includes(currentRole)
    ? assignableRoles
    : [currentRole, ...assignableRoles];

  return (
    <select
      aria-label={label}
      className="input min-h-10 text-sm"
      disabled={disabled || isPending}
      defaultValue={currentRole}
      onChange={(e) =>
        startTransition(() =>
          updateMemberRole(memberId, e.target.value as Enums<"guild_rank">),
        )
      }
    >
      {options.map((role) => (
        <option key={role} value={role}>
          {GUILD_ROLE_LABELS[role]}
        </option>
      ))}
    </select>
  );
}

export function TrialToggle({ memberId, isTrial }: { memberId: string; isTrial: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-1.5 text-sm text-[var(--text-muted)]">
      <input
        type="checkbox"
        defaultChecked={isTrial}
        disabled={isPending}
        onChange={(e) => startTransition(() => setMemberTrial(memberId, e.target.checked))}
        className="size-4 accent-[var(--accent)]"
      />
      Trial
    </label>
  );
}
