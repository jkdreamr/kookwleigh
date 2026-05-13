"use client";

import { useEffect, useState } from "react";

export function AnimatedCounter({
  value,
  prefix = "#",
  light = false,
}: {
  value: number;
  prefix?: string;
  light?: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(value / 26));
    const interval = window.setInterval(() => {
      current = Math.min(value, current + step);
      setDisplay(current);

      if (current >= value) {
        window.clearInterval(interval);
      }
    }, 28);

    return () => window.clearInterval(interval);
  }, [value]);

  return (
    <div className="flex items-baseline gap-1 leading-none">
      <span className={`font-serif text-[5rem] leading-none tracking-tight sm:text-[7rem] lg:text-[9rem] ${light ? "text-white" : "text-foreground"}`}>
        {prefix}{display}
      </span>
    </div>
  );
}
