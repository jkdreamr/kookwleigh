import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-lg border border-foreground/12 bg-white/70 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-foreground/40 focus:border-accent/50 focus:bg-white/90 focus:ring-2 focus:ring-accent/15",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
