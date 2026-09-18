import Image from "next/image";
import { SignOutButton } from "@/components/sign-out-button";
import { displayName } from "@/lib/roles";
import type { Tables } from "@/types/database";

export function PendingApproval({ profile }: { profile: Tables<"profiles"> }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Image src="/logo-icon.png" alt="" width={40} height={40} />
      <h1 className="text-xl font-semibold">
        Hola, {displayName(profile)}
      </h1>
      <p className="max-w-sm text-[var(--text-muted)]">
        Tu cuenta está pendiente de aprobación. Un Officer o el Guild Master
        tiene que confirmarte antes de que puedas entrar al guild hub.
      </p>
      <SignOutButton />
    </div>
  );
}
