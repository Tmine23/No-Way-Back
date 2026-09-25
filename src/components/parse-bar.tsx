"use client";

import { useEffect, useState } from "react";
import { RANK_COLORS, tierForPercentile } from "@/lib/ramp";

export function ParseBar({ percentile, label }: { percentile: number; label: string }) {
  const [shown, setShown] = useState(false);
  const tier = tierForPercentile(percentile);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentile}
      className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]"
    >
      <div
        className="h-full origin-left rounded-full"
        style={{
          background: RANK_COLORS[tier],
          width: `${Math.max(percentile, 3)}%`,
          transform: shown ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 700ms var(--ease-out)",
        }}
      />
    </div>
  );
}

export function RankValue({
  value,
  percentile,
  className = "",
}: {
  value: string | number;
  percentile: number;
  className?: string;
}) {
  return (
    <span className={`tabular font-semibold ${className}`} style={{ color: RANK_COLORS[tierForPercentile(percentile)] }}>
      {value}
    </span>
  );
}
