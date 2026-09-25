"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createLootEntries, type LootEntryDraft, type LootFormState } from "@/app/(app)/loot/actions";
import { ItemIcon } from "@/components/item-icon";
import { WinnerPicker, type PickableCharacter } from "@/components/winner-picker";
import { bossLoot, LOOT_RAIDS, NAXX_WINGS, QUALITY_COLORS, type LootBoss, type LootItem } from "@/lib/loot-data";

export type LootRaidOption = { id: string; label: string; size: 10 | 25; characterIds: string[] };
type Extra = { key: string; name: string; winner: string | null };

const ease = [0.23, 1, 0.32, 1] as const;
let extraSeed = 0;

const chip = (active: boolean) =>
  `min-h-12 rounded-lg border-2 px-4 text-base font-semibold transition-[border-color,background-color,transform] duration-150 active:scale-[0.97] ${
    active ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
  }`;

export function LootForm({
  raids,
  characters,
}: {
  raids: LootRaidOption[];
  characters: Omit<PickableCharacter, "inRaid">[];
}) {
  const [state, formAction, isPending] = useActionState<LootFormState, FormData>(createLootEntries, { error: null });
  const [raidId, setRaidId] = useState(raids[0]?.id ?? "");
  const raid = raids.find((r) => r.id === raidId) ?? null;
  const [sizeOverride, setSizeOverride] = useState<10 | 25 | null>(null);
  const size: 10 | 25 = sizeOverride ?? raid?.size ?? 25;
  const [instanceKey, setInstanceKey] = useState(LOOT_RAIDS[0].key);
  const instance = LOOT_RAIDS.find((r) => r.key === instanceKey)!;
  const [bossKey, setBossKey] = useState<string | null>(null);
  const boss = instance.bosses.find((b) => b.key === bossKey) ?? null;
  const [picked, setPicked] = useState<Record<number, string | null>>({});
  const [extras, setExtras] = useState<Extra[]>([]);
  const [filter, setFilter] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const inRaid = new Set(raid?.characterIds ?? []);
  const pickable: PickableCharacter[] = characters.map((c) => ({ ...c, inRaid: inRaid.has(c.id) }));
  const items = boss ? bossLoot(boss, size) : [];
  const visibleItems = filter.trim()
    ? items.filter((i) =>
        `${i.name} ${i.nameEs ?? ""} ${i.slot ?? ""} ${i.type ?? ""}`.toLowerCase().includes(filter.trim().toLowerCase()),
      )
    : items;

  const pickedIds = Object.keys(picked).map(Number);
  const entries: LootEntryDraft[] = [
    ...pickedIds.map((id) => ({ itemId: id, itemName: "", characterId: picked[id] ?? "" })),
    ...extras.map((x) => ({ itemId: null, itemName: x.name, characterId: x.winner ?? "" })),
  ];
  const missingWinners = entries.filter((e) => !e.characterId).length;

  function chooseBoss(next: LootBoss) {
    setBossKey(next.key);
    setPicked({});
    setFilter("");
  }

  function toggleItem(item: LootItem) {
    setPicked((current) => {
      const next = { ...current };
      if (item.id in next) delete next[item.id];
      else next[item.id] = null;
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const problem = !boss
      ? "Elige el boss."
      : entries.length === 0
        ? "Marca al menos un ítem de la lista."
        : extras.some((x) => x.name.trim().length < 2)
          ? "Escribe el nombre del ítem que agregaste a mano."
          : missingWinners
            ? `Falta elegir ganador en ${missingWinners === 1 ? "1 ítem" : `${missingWinners} ítems`}.`
            : null;
    setClientError(problem);
    if (problem) event.preventDefault();
  }

  const wings = instance.key === "naxxramas" ? NAXX_WINGS : [{ name: "", bosses: instance.bosses.map((b) => b.key) }];

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-8">
      <input type="hidden" name="entries" value={JSON.stringify(entries)} />
      <input type="hidden" name="raid_event_id" value={raidId} />
      <input type="hidden" name="boss_name" value={boss?.name ?? ""} />

      <section className="card flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="text-base font-semibold">1. ¿De qué raid?</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Raid"
            value={raidId}
            onChange={(e) => {
              setRaidId(e.target.value);
              setSizeOverride(null);
            }}
            className="input min-h-12 min-w-64 flex-1 text-base"
          >
            {raids.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
            <option value="">Sin raid registrada</option>
          </select>
          <div role="radiogroup" aria-label="Tamaño" className="flex gap-2">
            {([25, 10] as const).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={size === s} onClick={() => setSizeOverride(s)} className={chip(size === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card flex flex-col gap-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold">2. ¿Qué boss?</h2>
        <div role="tablist" aria-label="Instancia" className="flex flex-wrap gap-2">
          {LOOT_RAIDS.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={r.key === instanceKey}
              onClick={() => {
                setInstanceKey(r.key);
                setBossKey(null);
                setPicked({});
              }}
              className={`min-h-11 rounded-full px-4 text-base font-medium transition-colors duration-150 ${
                r.key === instanceKey ? "bg-[var(--plate)] text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {wings.map((wing) => (
            <div key={wing.name || "all"} className="flex flex-col gap-2">
              {wing.name && <p className="text-sm text-[var(--text-muted)]">{wing.name}</p>}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {wing.bosses.map((key) => {
                  const b = instance.bosses.find((x) => x.key === key);
                  if (!b) return null;
                  return (
                    <button key={b.key} type="button" aria-pressed={b.key === bossKey} onClick={() => chooseBoss(b)} className={`${chip(b.key === bossKey)} text-left`}>
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence initial={false}>
        {boss && (
          <motion.section
            key={`${boss.key}-${size}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="card flex flex-col gap-4 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">3. ¿Qué soltó {boss.name}?</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Marca lo que cayó y elige quién se lo llevó. {items.length} ítems posibles en {size}.
                </p>
              </div>
              {items.length > 10 && (
                <input
                  type="search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label="Filtrar ítems"
                  className="input min-h-11 w-full text-base sm:w-60"
                  placeholder="Filtrar: capa, placas…"
                />
              )}
            </div>

            <ul className="flex flex-col gap-2">
              {visibleItems.map((item) => {
                const checked = item.id in picked;
                return (
                  <li
                    key={item.id}
                    className={`rounded-lg border-2 transition-colors duration-150 ${
                      checked ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--border)]"
                    }`}
                  >
                    <label className="flex min-h-16 cursor-pointer items-center gap-3 px-3 py-2">
                      <input type="checkbox" checked={checked} onChange={() => toggleItem(item)} className="size-5 shrink-0 accent-[var(--accent)]" />
                      <ItemIcon icon={item.icon} quality={item.quality} size={40} />
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block text-base font-semibold" style={{ color: QUALITY_COLORS[item.quality] }}>
                          {item.name}
                        </span>
                        <span className="block text-sm text-[var(--text-muted)]">
                          {[item.slot, item.type, item.ilvl && `ilvl ${item.ilvl}`].filter(Boolean).join(" · ")}
                          {item.nameEs && <span className="text-[var(--text-faint)]"> · {item.nameEs}</span>}
                        </span>
                      </span>
                    </label>
                    {checked && (
                      <div className="px-3 pb-3 pl-11">
                        <WinnerPicker
                          label={`Ganador de ${item.name}`}
                          characters={pickable}
                          value={picked[item.id]}
                          onChange={(id) => setPicked((p) => ({ ...p, [item.id]: id }))}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
              {visibleItems.length === 0 && <li className="py-4 text-base text-[var(--text-muted)]">Ningún ítem coincide con el filtro.</li>}
            </ul>

            {extras.map((x) => (
              <div key={x.key} className="flex flex-col gap-3 rounded-lg border-2 border-[var(--accent)] bg-[var(--accent-dim)] p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={x.name}
                    onChange={(e) => setExtras((list) => list.map((y) => (y.key === x.key ? { ...y, name: e.target.value } : y)))}
                    aria-label="Nombre del ítem"
                    autoComplete="off"
                    className="input min-h-12 flex-1 text-base"
                    placeholder="Nombre del ítem…"
                  />
                  <button type="button" onClick={() => setExtras((list) => list.filter((y) => y.key !== x.key))} className="btn-ghost min-h-12 px-3 text-base">
                    Quitar
                  </button>
                </div>
                <WinnerPicker
                  label={`Ganador de ${x.name || "ítem agregado"}`}
                  characters={pickable}
                  value={x.winner}
                  onChange={(id) => setExtras((list) => list.map((y) => (y.key === x.key ? { ...y, winner: id } : y)))}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setExtras((list) => [...list, { key: `extra-${++extraSeed}`, name: "", winner: null }])}
              className="flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-strong)] text-base font-medium text-[var(--text-muted)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--text)]"
            >
              + Cayó algo que no está en la lista
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-[var(--border)] bg-[var(--bg)]/95 px-4 py-4 backdrop-blur-md lg:bottom-0">
        <button type="submit" disabled={isPending} className="btn-primary min-h-12 px-6 text-base">
          {isPending
            ? "Registrando…"
            : entries.length > 1
              ? `Registrar ${entries.length} ítems`
              : "Registrar ítem"}
        </button>
        <Link href="/loot" className="btn-ghost min-h-12 px-4 text-base">
          Cancelar
        </Link>
        <p role="alert" className="text-sm font-medium text-[var(--danger)] empty:hidden">
          {clientError ?? state.error}
        </p>
      </div>
    </form>
  );
}
