import Image from "next/image";
import { iconUrl, QUALITY_COLORS } from "@/lib/loot-data";

export function ItemIcon({ icon, quality = 4, size = 36 }: { icon: string | null; quality?: number; size?: number }) {
  const src = iconUrl(icon, size > 40 ? "large" : "medium");
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden rounded-md border-2 bg-[var(--bg)]"
      style={{ width: size, height: size, borderColor: QUALITY_COLORS[quality] ?? "var(--border-strong)" }}
    >
      {src && <Image src={src} alt="" width={size} height={size} unoptimized className="size-full object-cover" />}
    </span>
  );
}
