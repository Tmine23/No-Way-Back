"use client";

import { useFormStatus } from "react-dom";

/** Submit button that locks while its form is sending, so a double click can't save twice. */
export function SubmitButton({
  children,
  pendingLabel = "Guardando…",
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${variant === "primary" ? "btn-primary" : "btn-secondary"} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
