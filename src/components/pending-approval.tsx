import Image from "next/image";
import { SignOutButton } from "@/components/sign-out-button";
import { InstallApp } from "@/components/install-app";
import { LiveRefresh } from "@/components/live-refresh";
import { PushToggle } from "@/components/push-toggle";
import { displayName } from "@/lib/roles";
import type { Enums, Tables } from "@/types/database";

export function PendingApproval({
  profile,
  status,
}: {
  profile: Tables<"profiles">;
  status: Enums<"application_status">;
}) {
  const rejected = status === "rejected";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-8 px-6 py-16">
      <LiveRefresh
        tables={[
          { table: "profiles", filter: `id=eq.${profile.id}` },
          { table: "applications", filter: `profile_id=eq.${profile.id}` },
        ]}
        pollMs={20_000}
      />
      <Image src="/logo-icon.png" alt="Emblema de No Way Back" width={56} height={57} />
      <div>
        <h1 className="display text-5xl font-bold uppercase sm:text-6xl">Hola, {displayName(profile)}</h1>
        <p className="mt-3 text-lg text-[var(--text-muted)]">
          {rejected
            ? "Esta vez tu postulación no fue aceptada. Gracias por tu interés en la guild."
            : "Recibimos tu postulación. Un Oficial o el Guild Master la va a revisar."}
        </p>
      </div>

      {!rejected && (
        <div role="status" className="card flex items-center gap-4 p-5">
          <span aria-hidden className="relative flex size-3 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--accent)] opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-3 rounded-full bg-[var(--accent)]" />
          </span>
          <p className="text-base">
            <span className="font-semibold">Esperando respuesta.</span>{" "}
            <span className="text-[var(--text-muted)]">
              No necesitas recargar: cuando te acepten, esta pantalla se abre sola.
            </span>
          </p>
        </div>
      )}

      {!rejected && <InstallApp />}
      {!rejected && <PushToggle />}

      <div>
        <SignOutButton />
      </div>
    </div>
  );
}
