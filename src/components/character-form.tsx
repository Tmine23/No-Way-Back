"use client";

import { useActionState, useState } from "react";
import { saveCharacter } from "@/app/(app)/personajes/actions";
import { CLASS_LABELS, CLASS_SPECS, ROLE_LABELS, WOW_CLASSES } from "@/lib/wow";
import type { Enums, Tables } from "@/types/database";

type ServerOption = Pick<Tables<"servers">, "id" | "name">;
type Role = Enums<"character_role">;

function roleFor(cls: Enums<"wow_class">, spec: string): Role {
  return CLASS_SPECS[cls].find((s) => s.name === spec)?.role ?? "dps";
}

export function CharacterForm({
  servers,
  defaultServerId,
  character,
}: {
  servers: ServerOption[];
  defaultServerId: string | null;
  character?: Tables<"characters">;
}) {
  const [state, formAction, isPending] = useActionState(saveCharacter, { error: null });
  const [cls, setCls] = useState<Enums<"wow_class">>(character?.class ?? "warrior");
  const [spec1, setSpec1] = useState(character?.spec_primary ?? CLASS_SPECS[cls][0].name);
  const [role1, setRole1] = useState<Role>(character?.role ?? roleFor(cls, spec1));
  const [spec2, setSpec2] = useState(character?.spec_secondary ?? "");
  const [role2, setRole2] = useState<Role>(character?.role_secondary ?? "dps");

  const specs = [...CLASS_SPECS[cls]];
  for (const legacy of [spec1, spec2]) {
    if (legacy && !specs.some((s) => s.name === legacy)) {
      specs.push({ name: legacy, role: "dps" });
    }
  }

  function changeClass(next: Enums<"wow_class">) {
    setCls(next);
    const first = CLASS_SPECS[next][0];
    setSpec1(first.name);
    setRole1(first.role);
    setSpec2("");
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {character && <input type="hidden" name="id" value={character.id} />}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre del personaje">
          <input name="name" required defaultValue={character?.name} className="input" />
        </Field>
        <Field label="Servidor">
          <select name="server_id" required defaultValue={character?.server_id ?? defaultServerId ?? undefined} className="input">
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Clase">
        <select name="class" value={cls} onChange={(e) => changeClass(e.target.value as Enums<"wow_class">)} className="input">
          {WOW_CLASSES.map((c) => (
            <option key={c} value={c}>
              {CLASS_LABELS[c]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Spec principal">
          <select
            name="spec_primary"
            value={spec1}
            onChange={(e) => {
              setSpec1(e.target.value);
              setRole1(roleFor(cls, e.target.value));
            }}
            className="input"
          >
            {specs.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rol principal">
          <RoleSelect name="role" value={role1} onChange={setRole1} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Segunda spec (opcional)">
          <select
            name="spec_secondary"
            value={spec2}
            onChange={(e) => {
              setSpec2(e.target.value);
              if (e.target.value) setRole2(roleFor(cls, e.target.value));
            }}
            className="input"
          >
            <option value="">Sin segunda spec</option>
            {specs.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        {spec2 && (
          <Field label="Rol de la segunda spec">
            <RoleSelect name="role_secondary" value={role2} onChange={setRole2} />
          </Field>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Gearscore">
          <input name="gearscore" type="number" min={0} defaultValue={character?.gearscore || undefined} className="input" />
        </Field>
        <Field label="Profesiones (separadas por coma)">
          <input name="professions" defaultValue={character?.professions.join(", ")} className="input" placeholder="Ej. Blacksmithing, Mining" />
        </Field>
      </div>

      <Field label="Link de armory (opcional)">
        <input name="armory_url" type="url" defaultValue={character?.armory_url ?? ""} className="input" placeholder="https://" />
      </Field>

      <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <input type="checkbox" name="is_main" defaultChecked={character?.is_main} className="h-4 w-4 accent-[var(--accent)]" />
        Es mi main en este servidor
      </label>

      {state.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}

      <button type="submit" disabled={isPending} className="btn-primary mt-2 disabled:opacity-60">
        {isPending ? "Guardando…" : character ? "Guardar cambios" : "Registrar personaje"}
      </button>
    </form>
  );
}

function RoleSelect({ name, value, onChange }: { name: string; value: Role; onChange: (r: Role) => void }) {
  return (
    <select name={name} value={value} onChange={(e) => onChange(e.target.value as Role)} className="input">
      {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r]}
        </option>
      ))}
    </select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
      {label}
      {children}
    </label>
  );
}
