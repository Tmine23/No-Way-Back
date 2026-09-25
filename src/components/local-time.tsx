"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/time";

export function LocalDateTime({ iso, className }: { iso: string; className?: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(formatDateTime(new Date(iso)));
  }, [iso]);

  return <span className={className}>{text ?? " "}</span>;
}
