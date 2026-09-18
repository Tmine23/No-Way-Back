"use client";

import { useTransition } from "react";
import { updateMemberRole } from "@/app/(app)/members/actions";
import { GUILD_ROLE_LABELS } from "@/lib/wow";
import type { Enums } from "@/types/database";

export function RoleSelect({
  memberId,
  currentRole,
  assignableRoles,
  disabled,
}: {
  memberId: string;
  currentRole: Enums<"guild_role">;
  assignableRoles: Enums<"guild_role">[];
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="input"
      disabled={disabled || isPending}
      defaultValue={currentRole}
      onChange={(e) =>
        startTransition(() =>
          updateMemberRole(memberId, e.target.value as Enums<"guild_role">),
        )
      }
    >
      {assignableRoles.map((role) => (
        <option key={role} value={role}>
          {GUILD_ROLE_LABELS[role]}
        </option>
      ))}
    </select>
  );
}
