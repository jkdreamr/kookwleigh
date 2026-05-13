import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  href = "/",
  light = false,
}: {
  className?: string;
  href?: string;
  light?: boolean;
}) {
  return (
    <Link
      className={cn(
        "inline-flex flex-col gap-0.5",
        light ? "text-white" : "text-foreground",
        className,
      )}
      href={href}
    >
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.28em]",
          light ? "text-white/55" : "text-foreground/50",
        )}
      >
        Dinner Waitlist
      </span>
      <span className="font-serif text-2xl leading-none">kookwleigh</span>
    </Link>
  );
}
