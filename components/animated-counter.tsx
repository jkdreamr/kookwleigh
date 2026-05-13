"use client";

import { useEffect, useState } from "react";

export function AnimatedCounter({
  value,
  prefix = "#",
}: {
  value: number;
  prefix?: string;
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
    <span className="font-serif text-7xl leading-none text-accent sm:text-8xl lg:text-9xl">
      {prefix}
      {display}
    </span>
  );
}
