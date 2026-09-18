import { createCharacter } from "@/app/(app)/roster/actions";
import { WOW_CLASSES, CLASS_LABELS } from "@/lib/wow";

export default function NewCharacterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Registrar personaje</h1>

      <form action={createCharacter} className="flex max-w-lg flex-col gap-4">
        <Field label="Nombre del personaje">
          <input
            name="name"
            required
            className="input"
            placeholder="Ej. Frostbane"
          />
        </Field>

        <Field label="Clase">
          <select name="class" required className="input">
            {WOW_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {CLASS_LABELS[cls]}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Spec principal">
            <input
              name="spec_primary"
              required
              className="input"
              placeholder="Ej. Fury"
            />
          </Field>
          <Field label="Spec secundaria (opcional)">
            <input name="spec_secondary" className="input" placeholder="Ej. Protection" />
          </Field>
        </div>

        <Field label="Rol">
          <select name="role" required className="input">
            <option value="tank">Tank</option>
            <option value="healer">Healer</option>
            <option value="dps">DPS</option>
          </select>
        </Field>

        <Field label="Item level">
          <input
            name="ilvl"
            type="number"
            min={0}
            className="input"
            placeholder="0"
          />
        </Field>

        <Field label="Profesiones (separadas por coma)">
          <input
            name="professions"
            className="input"
            placeholder="Ej. Blacksmithing, Mining"
          />
        </Field>

        <Field label="Link de armory (opcional)">
          <input name="armory_url" className="input" placeholder="https://..." />
        </Field>

        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" name="is_main" className="h-4 w-4" />
          Este es mi personaje principal
        </label>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium transition hover:bg-indigo-500"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-neutral-300">
      {label}
      {children}
    </label>
  );
}
