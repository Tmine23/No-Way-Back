import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isOfficer } from "@/lib/auth";

export default async function RaidsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: raids } = await supabase
    .from("raid_events")
    .select("*, raid_signups(status)")
    .order("scheduled_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Raids</h1>
        {isOfficer(profile) && (
          <Link
            href="/raids/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
          >
            + Nueva raid
          </Link>
        )}
      </div>

      {(!raids || raids.length === 0) && (
        <p className="text-neutral-400">No hay raids programadas todavía.</p>
      )}

      <div className="flex flex-col gap-3">
        {raids?.map((raid) => {
          const confirmed = raid.raid_signups.filter(
            (s) => s.status === "confirmed",
          ).length;
          return (
            <Link
              key={raid.id}
              href={`/raids/${raid.id}`}
              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition hover:border-neutral-700"
            >
              <div>
                <p className="font-semibold">{raid.title}</p>
                <p className="text-sm text-neutral-400">
                  {new Date(raid.scheduled_at).toLocaleString("es-ES")}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-neutral-300">{confirmed} confirmados</p>
                <p className="capitalize text-neutral-500">{raid.status}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
