"use client";

import { useTransition } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { assignSlot, unassignSlot } from "@/app/(app)/raids/actions";
import { displayName } from "@/lib/roles";
import { CLASS_COLORS, ROLE_LABELS, RSVP_LABELS, GROUP_SIZE, BENCH_SIZE } from "@/lib/wow";
import type { Enums, Tables } from "@/types/database";

type CharacterWithOwner = Tables<"characters"> & {
  profiles: { known_as: string | null; discord_username: string } | null;
};
type SignupWithCharacter = Tables<"raid_signups"> & { characters: CharacterWithOwner };

const STATUS_COLOR: Record<Enums<"rsvp_status">, string> = {
  confirmed: "var(--accent-soft)",
  tentative: "var(--text-faint)",
  absent: "var(--danger)",
  bench: "var(--text-faint)",
};

export function RaidComposition({
  raidEventId,
  raidSize,
  allCharacters,
  signups,
  canEdit,
  showStatus,
}: {
  raidEventId: string;
  raidSize: number;
  allCharacters: CharacterWithOwner[];
  signups: SignupWithCharacter[];
  canEdit: boolean;
  showStatus: boolean;
}) {
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const placedSignups = signups.filter((s) => s.slot_index !== null);
  const placedCharacterIds = new Set(placedSignups.map((s) => s.character_id));
  const assignedBySlot = new Map(placedSignups.map((s) => [s.slot_index as number, s]));
  const poolCharacters = allCharacters.filter((c) => !placedCharacterIds.has(c.id));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const characterId = String(active.id);

    if (over.id === "pool") {
      if (placedCharacterIds.has(characterId)) {
        startTransition(() => unassignSlot(raidEventId, characterId));
      }
      return;
    }

    const slotIndex = Number(String(over.id).replace("slot-", ""));
    startTransition(() => assignSlot(raidEventId, characterId, slotIndex));
  }

  const groupCount = raidSize / GROUP_SIZE;

  return (
    <DndContext id="raid-composition" sensors={sensors} onDragEnd={handleDragEnd}>
      {canEdit && (
        <div className="card p-4">
          <p className="mb-3 text-sm font-medium text-[var(--text-muted)]">
            Roster del guild (arrastra a un grupo)
          </p>
          <Pool>
            {poolCharacters.map((c) => (
              <Chip key={c.id} character={c} draggable />
            ))}
            {poolCharacters.length === 0 && (
              <p className="text-sm text-[var(--text-faint)]">
                Todos los personajes ya están asignados.
              </p>
            )}
          </Pool>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: groupCount }).map((_, g) => (
          <GroupCard key={g} label={`Grupo ${g + 1}`}>
            {Array.from({ length: GROUP_SIZE }).map((_, i) => {
              const slotIndex = g * GROUP_SIZE + i;
              return (
                <Slot
                  key={slotIndex}
                  slotIndex={slotIndex}
                  signup={assignedBySlot.get(slotIndex)}
                  canEdit={canEdit}
                  showStatus={showStatus}
                />
              );
            })}
          </GroupCard>
        ))}

        <GroupCard label="Banca">
          {Array.from({ length: BENCH_SIZE }).map((_, i) => {
            const slotIndex = raidSize + i;
            return (
              <Slot
                key={slotIndex}
                slotIndex={slotIndex}
                signup={assignedBySlot.get(slotIndex)}
                canEdit={canEdit}
                showStatus={showStatus}
              />
            );
          })}
        </GroupCard>
      </div>
    </DndContext>
  );
}

function Pool({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-wrap gap-2 rounded-lg p-2 transition-colors ${
        isOver ? "bg-[var(--accent-dim)]" : ""
      }`}
    >
      {children}
    </div>
  );
}

function GroupCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
        {label}
      </p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function Slot({
  slotIndex,
  signup,
  canEdit,
  showStatus,
}: {
  slotIndex: number;
  signup?: SignupWithCharacter;
  canEdit: boolean;
  showStatus: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${slotIndex}` });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-10 items-center rounded-md border border-dashed border-[var(--border)] px-1.5 transition-colors ${
        isOver ? "border-[var(--accent)] bg-[var(--accent-dim)]" : ""
      }`}
    >
      {signup ? (
        <Chip
          character={signup.characters}
          draggable={canEdit}
          status={showStatus ? signup.status : undefined}
        />
      ) : (
        <span className="text-xs text-[var(--text-faint)]">Vacío</span>
      )}
    </div>
  );
}

function Chip({
  character,
  draggable,
  status,
}: {
  character: CharacterWithOwner;
  draggable: boolean;
  status?: Enums<"rsvp_status">;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: character.id,
    disabled: !draggable,
  });

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`flex min-w-0 items-center gap-1.5 rounded-md bg-[var(--surface-2)] px-2 py-1 text-sm ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      title={ROLE_LABELS[character.role]}
    >
      {status && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: STATUS_COLOR[status] }}
          title={RSVP_LABELS[status]}
        />
      )}
      <span className="truncate font-medium" style={{ color: CLASS_COLORS[character.class] }}>
        {character.name}
      </span>
      <span className="shrink-0 truncate text-xs text-[var(--text-faint)]">
        {character.profiles ? displayName(character.profiles) : ""}
      </span>
    </div>
  );
}
