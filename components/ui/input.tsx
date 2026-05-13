import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-12 w-full rounded-lg border border-foreground/12 bg-white/70 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-foreground/40 focus:border-accent/50 focus:bg-white/90 focus:ring-2 focus:ring-accent/15",
          className,
        )}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
