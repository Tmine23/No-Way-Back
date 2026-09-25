"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type LiveTable = {
  table: "profiles" | "applications" | "notifications" | "raid_signups";
  /** Supabase realtime filter, e.g. "id=eq.123". */
  filter?: string;
};

/**
 * Re-renders the current page when any of the watched rows change, when the app comes back to the
 * foreground, and optionally on a slow poll as a safety net if the realtime socket drops.
 */
export function LiveRefresh({ tables, pollMs }: { tables: LiveTable[]; pollMs?: number }) {
  const router = useRouter();
  const key = JSON.stringify(tables);

  useEffect(() => {
    const supabase = createClient();
    const watched = JSON.parse(key) as LiveTable[];
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 250);
    };

    const channel = supabase.channel(`live:${key}`);
    for (const t of watched) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: t.table, ...(t.filter ? { filter: t.filter } : {}) },
        refresh,
      );
    }
    // Join with the member's token, not the anonymous key, so row-level security lets their rows through.
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      channel.subscribe((status, err) => {
        if (process.env.NODE_ENV !== "production") console.debug("[live]", status, err?.message ?? "");
      });
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    const poll = pollMs ? setInterval(refresh, pollMs) : undefined;

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (poll) clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [key, pollMs, router]);

  return null;
}
