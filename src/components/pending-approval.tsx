import Image from "next/image";
import { SignOutButton } from "@/components/sign-out-button";
import { PushToggle } from "@/components/push-toggle";
import { displayName } from "@/lib/roles";
import type { Enums, Tables } from "@/types/database";

const STATUS_MESSAGE: Record<Enums<"application_status">, string> = {
  new: "Recibimos tu postulación. Un Oficial o el Guild Master la va a revisar.",
  interview: "Tu postulación está en entrevista. Un Oficial te va a contactar por Discord.",
  trial: "Quedaste en trial. En breve se habilita tu acceso.",
  accepted: "Fuiste aceptado. En breve se habilita tu acceso.",
  rejected: "Esta vez tu postulación no fue aceptada. Gracias por tu interés en el guild.",
};

export function PendingApproval({
  profile,
  status,
}: {
  profile: Tables<"profiles">;
  status: Enums<"application_status">;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Image src="/logo-icon.png" alt="" width={40} height={40} />
      <h1 className="text-xl font-semibold">Hola, {displayName(profile)}</h1>
      <p className="max-w-sm text-[var(--text-muted)]">{STATUS_MESSAGE[status]}</p>
      {status !== "rejected" && (
        <div className="w-full max-w-md text-left">
          <PushToggle />
        </div>
      )}
      <SignOutButton />
    </div>
  );
}
