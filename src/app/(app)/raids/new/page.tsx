import { redirect } from "next/navigation";
import { getCurrentProfile, isOfficer } from "@/lib/auth";
import { createRaidEvent } from "@/app/(app)/raids/actions";

export default async function NewRaidPage() {
  const profile = await getCurrentProfile();
  if (!isOfficer(profile)) redirect("/raids");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nueva raid</h1>

      <form action={createRaidEvent} className="flex max-w-lg flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
          Título
          <input
            name="title"
            required
            className="input"
            placeholder="Ej. Icecrown Citadel - Noche 1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
          Fecha y hora
          <input
            name="scheduled_at"
            type="datetime-local"
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
          Tamaño de la raid
          <select name="raid_size" className="input" defaultValue="25">
            <option value="25">25 jugadores</option>
            <option value="10">10 jugadores</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
          Notas (opcional)
          <textarea
            name="notes"
            className="input"
            rows={3}
            placeholder="Bosses objetivo, requisitos, etc."
          />
        </label>

        <button type="submit" className="btn-primary mt-2">
          Crear raid
        </button>
      </form>
    </div>
  );
}
