import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer, isGuildMaster, isApproved } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { NicknameModal } from "@/components/nickname-modal";
import { ApplicationModal } from "@/components/application-modal";
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
    const { data: application } = await supabase
      .from("applications")
      .select("status")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!application) {
      return <ApplicationModal />;
    }

    return <PendingApproval profile={profile} status={application.status} />;
  }

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav
        profile={profile}
        isOfficer={isOfficer(profile)}
        isGuildMaster={isGuildMaster(profile)}
        unreadCount={unreadCount ?? 0}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
