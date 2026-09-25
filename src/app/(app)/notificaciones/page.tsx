import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FadeIn } from "@/components/fade-in";
import { LocalDate } from "@/components/local-time";
import { PageHeader } from "@/components/page-header";
import { PushToggle } from "@/components/push-toggle";
import { MarkAllReadButton } from "@/components/mark-all-read-button";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const hasUnread = (notifications ?? []).some((n) => !n.read_at);

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <PageHeader title="Notificaciones" actions={hasUnread && <MarkAllReadButton />} />
      </FadeIn>

      <PushToggle />

      {(!notifications || notifications.length === 0) && (
        <p className="text-[var(--text-muted)]">No tienes notificaciones todavía.</p>
      )}

      {notifications && notifications.length > 0 && (
        <FadeIn delay={0.05}>
          <ul className="card divide-y divide-[var(--border)] overflow-hidden">
            {notifications.map((n) => {
              const content = (
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span
                    aria-hidden
                    className={`mt-2 size-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-[var(--accent)]"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={n.read_at ? "font-medium text-[var(--text-muted)]" : "font-semibold"}>
                      {!n.read_at && <span className="sr-only">Sin leer: </span>}
                      {n.title}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{n.body}</p>
                  </div>
                  <LocalDate iso={n.created_at} withTime className="tabular shrink-0 text-xs text-[var(--text-faint)]" />
                </div>
              );
              return (
                <li key={n.id}>
                  {n.url ? (
                    <Link href={n.url} className="block transition-colors duration-150 hover:bg-[var(--surface-2)]">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </FadeIn>
      )}
    </div>
  );
}
