import { redirect } from "next/navigation";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { createRaidEvent } from "@/app/(app)/raids/actions";

export default async function NewRaidPage() {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) redirect("/raids");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nueva raid</h1>

      <form action={createRaidEvent} className="flex max-w-lg flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Título
          <input
            name="title"
            required
            className="input"
            placeholder="Ej. Icecrown Citadel - Noche 1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Fecha y hora
          <input
            name="scheduled_at"
            type="datetime-local"
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Notas (opcional)
          <textarea
            name="notes"
            className="input"
            rows={3}
            placeholder="Bosses objetivo, requisitos, etc."
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium transition hover:bg-indigo-500"
        >
          Crear raid
        </button>
      </form>
    </div>
  );
}
