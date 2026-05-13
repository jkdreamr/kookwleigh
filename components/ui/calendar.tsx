"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className={cn("rounded-lg bg-white/45 p-3", className)}
      classNames={{
        button_next:
          "inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-card/80 text-foreground/70 transition hover:bg-card",
        button_previous:
          "inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-card/80 text-foreground/70 transition hover:bg-card",
        caption_label: "font-serif text-lg",
        day: "h-10 w-10 p-0 font-medium aria-selected:opacity-100",
        day_button:
          "h-10 w-10 rounded-full transition hover:bg-foreground/5 aria-selected:bg-accent aria-selected:text-white",
        disabled: "text-foreground/25",
        month: "space-y-4",
        month_caption: "flex items-center justify-between px-2",
        months: "flex flex-col gap-4",
        nav: "flex items-center gap-2",
        selected: "bg-accent text-white",
        month_grid: "w-full border-collapse",
        today: "text-accent",
        week: "mt-2 flex w-full justify-between",
        weekday:
          "w-10 text-center text-xs font-medium uppercase tracking-[0.2em] text-foreground/40",
        weekdays: "flex justify-between",
        weeks: "space-y-2",
        ...classNames,
      }}
      components={{
        Chevron: ({ className: iconClassName, orientation, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ),
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}

export { Calendar };
