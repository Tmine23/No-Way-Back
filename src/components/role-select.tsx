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
}: {
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
      className="input text-sm"
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
    <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <input
        type="checkbox"
        defaultChecked={isTrial}
        disabled={isPending}
        onChange={(e) => startTransition(() => setMemberTrial(memberId, e.target.checked))}
        className="h-3.5 w-3.5 accent-[var(--accent)]"
      />
      Trial
    </label>
  );
}
