import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, isApproved } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { NicknameModal } from "@/components/nickname-modal";
import { PendingApproval } from "@/components/pending-approval";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();

  if (profile && !profile.known_as) {
    return <NicknameModal />;
  }

  if (profile && !isApproved(profile)) {
    return <PendingApproval profile={profile} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav profile={profile} isOfficer={isOfficer(profile)} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
