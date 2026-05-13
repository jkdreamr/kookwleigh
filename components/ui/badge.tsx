import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-foreground/10 bg-white/65 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/65",
        className,
      )}
    >
      {children}
    </span>
  );
}
