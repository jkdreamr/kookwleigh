import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-11 w-full border-0 border-b border-foreground/15 bg-transparent px-0 py-2 text-sm text-foreground outline-none transition-all placeholder:text-foreground/30 focus:border-foreground/50 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-40",
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
