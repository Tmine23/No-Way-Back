import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Notificaciones</h1>
        {hasUnread && <MarkAllReadButton />}
      </div>

      <PushToggle />

      {(!notifications || notifications.length === 0) && (
        <p className="text-[var(--text-muted)]">No tienes notificaciones todavía.</p>
      )}

      {notifications && notifications.length > 0 && (
        <div className="card divide-y divide-[var(--border)]">
          {notifications.map((n) => {
            const content = (
              <div className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                    n.read_at ? "bg-transparent" : "bg-[var(--accent)]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-[var(--text-muted)]">{n.body}</p>
                  <p className="mt-1 font-mono text-xs text-[var(--text-faint)]">
                    {new Date(n.created_at).toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            );
            return n.url ? (
              <Link key={n.id} href={n.url} className="block transition-colors hover:bg-[var(--surface-2)]">
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
