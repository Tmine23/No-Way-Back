"use client";

import { useTransition } from "react";
import { updateMemberRank, type MemberRank } from "@/app/(app)/members/actions";

const RANK_LABELS: Record<MemberRank, string> = {
  guild_master: "Guild Master",
  officer: "Oficial",
  raider: "No Way Back",
  trial: "Trial",
  applicant: "Sin acceso (Aspirante)",
};

export function RoleSelect({
  memberId,
  currentRank,
  assignableRanks,
  disabled,
  label,
}: {
  label: string;
  memberId: string;
  currentRank: MemberRank;
  assignableRanks: MemberRank[];
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const options = assignableRanks.includes(currentRank) ? assignableRanks : [currentRank, ...assignableRanks];

  return (
    <select
      aria-label={label}
      className="input min-h-11 text-base"
      disabled={disabled || isPending}
      value={currentRank}
      onChange={(e) => startTransition(() => updateMemberRank(memberId, e.target.value as MemberRank))}
    >
      {options.map((rank) => (
        <option key={rank} value={rank}>
          {RANK_LABELS[rank]}
        </option>
      ))}
    </select>
  );
}

export function ConfirmTrialButton({ memberId, name }: { memberId: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => updateMemberRank(memberId, "raider"))}
      disabled={isPending}
      aria-label={`Confirmar a ${name} como No Way Back`}
      className="btn-primary min-h-11 px-4 text-base"
    >
      {isPending ? "Guardando…" : "Ya es No Way Back"}
    </button>
  );
}
