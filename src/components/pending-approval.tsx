import Image from "next/image";
import { SignOutButton } from "@/components/sign-out-button";
import { InstallApp } from "@/components/install-app";
import { PushToggle } from "@/components/push-toggle";
import { displayName } from "@/lib/roles";
import type { Enums, Tables } from "@/types/database";

const STATUS_MESSAGE: Record<Enums<"application_status">, string> = {
  new: "Recibimos tu postulación. Un Oficial o el Guild Master la va a revisar.",
  interview: "Tu postulación está en entrevista. Un Oficial te va a contactar por Discord.",
  trial: "Quedaste en trial. En breve se habilita tu acceso.",
  accepted: "Fuiste aceptado. En breve se habilita tu acceso.",
  rejected: "Esta vez tu postulación no fue aceptada. Gracias por tu interés en la guild.",
};

const STEPS: { status: Enums<"application_status">; label: string }[] = [
  { status: "new", label: "Recibida" },
  { status: "interview", label: "Entrevista" },
  { status: "trial", label: "Trial" },
  { status: "accepted", label: "Aceptado" },
];

export function PendingApproval({
  profile,
  status,
}: {
  profile: Tables<"profiles">;
  status: Enums<"application_status">;
}) {
  const current = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-8 px-6 py-16">
      <Image src="/logo-icon.png" alt="Emblema de No Way Back" width={56} height={57} />
      <div>
        <h1 className="display text-5xl font-bold uppercase sm:text-6xl">Hola, {displayName(profile)}</h1>
        <p className="mt-3 text-lg text-[var(--text-muted)]">{STATUS_MESSAGE[status]}</p>
      </div>

      {status !== "rejected" && (
        <ol aria-label="Estado de tu postulación" className="grid grid-cols-4 gap-2">
          {STEPS.map((step, i) => {
            const done = i <= current;
            return (
              <li key={step.status} aria-current={i === current ? "step" : undefined}>
                <span className={`block h-1.5 rounded-full ${done ? "bg-[var(--accent)]" : "bg-[var(--surface-2)]"}`} />
                <span className={`mt-2 block text-sm ${done ? "font-semibold text-[var(--text)]" : "text-[var(--text-faint)]"}`}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {status !== "rejected" && <InstallApp />}
      {status !== "rejected" && <PushToggle />}

      <div>
        <SignOutButton />
      </div>
    </div>
  );
}
