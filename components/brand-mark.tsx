import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link className={cn("inline-flex flex-col gap-1", className)} href={href}>
      <span className="eyebrow">Dinner Waitlist</span>
      <span className="font-serif text-3xl">kookwleigh</span>
    </Link>
  );
}
