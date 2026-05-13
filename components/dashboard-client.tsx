"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Check, LogOut, Pencil, Send } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { PageTransition } from "@/components/page-transition";
import { showToast } from "@/components/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatDisplayDate,
  formatShortDate,
  formatTimeLabel,
  formatTimeRange,
} from "@/lib/dates";
import type { DashboardResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

function bookingLabel(data: DashboardResponse) {
  const booking = data.booking;

  if (!booking) return "No booking request yet.";

  if (booking.slot) {
    return `${formatDisplayDate(new Date(booking.slot.date))}, ${formatTimeRange(
      booking.slot.startTime,
      booking.slot.endTime,
    )}`;
  }

  if (booking.requestedDate && booking.requestedTime) {
    return `${formatDisplayDate(new Date(booking.requestedDate))}, ${formatTimeLabel(
      booking.requestedTime,
    )}`;
  }

  return "Requested time pending.";
}

export function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadDashboard() {
    const response = await fetch("/api/guest/me", { cache: "no-store" });

    if (!response.ok) {
      setLoadError("This session could not be loaded. Please log in again.");
      return;
    }

    setData((await response.json()) as DashboardResponse);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const selectedSlot = useMemo(
    () => data?.availableSlots.find((slot) => slot.id === selectedSlotId),
    [data?.availableSlots, selectedSlotId],
  );

  const slotDates = useMemo(
    () => data?.availableSlots.map((slot) => new Date(slot.date)) ?? [],
    [data?.availableSlots],
  );

  function toggleSlot(slotId: string) {
    setSelectedSlotId((prev) => (prev === slotId ? "" : slotId));
  }

  function onUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      allergies: String(formData.get("allergies") ?? ""),
      favoriteCuisines: String(formData.get("favoriteCuisines") ?? ""),
      name: String(formData.get("name") ?? ""),
    };

    startTransition(async () => {
      const response = await fetch("/api/guest/me", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        showToast(result.error ?? "Could not update your details.", "error");
        return;
      }

      showToast("Notes saved.");
      await loadDashboard();
    });
  }

  function onBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = selectedSlotId
      ? {
          notes: String(formData.get("notes") ?? ""),
          slotId: selectedSlotId,
        }
      : {
          notes: String(formData.get("notes") ?? ""),
          requestedDate: String(formData.get("requestedDate") ?? ""),
          requestedTime: String(formData.get("requestedTime") ?? ""),
        };

    startTransition(async () => {
      const response = await fetch("/api/guest/booking", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        showToast(result.error ?? "Could not request that booking.", "error");
        return;
      }

      showToast("Request sent to Josh and Leigh.");
      await loadDashboard();
    });
  }

  function logout() {
    startTransition(async () => {
      await fetch("/api/guest/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    });
  }

  function rejoinWaitlist() {
    startTransition(async () => {
      const response = await fetch("/api/guest/rejoin", { method: "POST" });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        showToast(result.error ?? "Could not rejoin the waitlist.", "error");
        return;
      }

      showToast("You are back on the waitlist.");
      await loadDashboard();
    });
  }

  if (loadError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-5">
        <p className="text-sm text-red-700">{loadError}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-5">
        <p className="eyebrow animate-pulse">Loading your table</p>
      </main>
    );
  }

  const { guest } = data;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Guest dashboard</p>
          <h1 className="mt-1 font-serif text-4xl sm:text-5xl">Hi, {guest.name.split(" ")[0]}.</h1>
        </div>
        <Button disabled={isPending} onClick={logout} size="sm" variant="outline">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Status panel */}
        <PageTransition>
          <section className="section-frame flex flex-col">
            <div className="mb-6">
              <Badge>{guest.status.toLowerCase()}</Badge>
            </div>

            {guest.status === "WAITLISTED" && (
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-widest text-foreground/50">your position</p>
                <AnimatedCounter value={guest.position} />
                <p className="subtitle mt-1">
                  Josh and Leigh will contact you soon.
                </p>
              </div>
            )}

            {guest.status === "INVITED" && (
              <div className="flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-butter/60">
                  <CalendarDays className="h-5 w-5 text-foreground/70" />
                </div>
                <h2 className="font-serif text-4xl leading-tight">It is your turn.</h2>
                <p className="subtitle">
                  Pick one of the open seats below, or send a softer request for another night.
                </p>
              </div>
            )}

            {guest.status === "SCHEDULED" && (
              <div className="flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/30">
                  <Check className="h-5 w-5 text-foreground/70" />
                </div>
                <h2 className="font-serif text-4xl leading-tight">See you soon.</h2>
                <p className="subtitle">{bookingLabel(data)}</p>
              </div>
            )}

            {guest.status === "COMPLETED" && (
              <div className="flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-powder">
                  <Check className="h-5 w-5 text-foreground/70" />
                </div>
                <h2 className="font-serif text-4xl leading-tight">Dinner complete.</h2>
                <p className="subtitle">
                  Hope you enjoyed it. Join the waitlist again whenever you&apos;d like.
                </p>
                <Button
                  className="mt-2 w-full sm:w-auto"
                  disabled={isPending}
                  onClick={rejoinWaitlist}
                >
                  {isPending ? "Joining..." : "Rejoin waitlist"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </section>
        </PageTransition>

        {/* Action panel */}
        <PageTransition delay={0.08}>
          <section className="section-frame">
            {guest.status === "INVITED" ? (
              <form className="space-y-6" onSubmit={onBooking}>
                <div>
                  <h2 className="font-serif text-3xl">Choose a dinner window</h2>
                  <p className="mt-1.5 text-sm text-foreground/55">
                    Available days are softly highlighted.
                  </p>
                </div>

                <Calendar
                  modifiers={{ available: slotDates }}
                  modifiersClassNames={{ available: "bg-sage/20 rounded-full" }}
                />

                {data.availableSlots.length > 0 && (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {data.availableSlots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <button
                          className={cn(
                            "group relative rounded-xl border p-4 text-left text-sm transition-all duration-150",
                            isSelected
                              ? "border-accent bg-accent/8 shadow-sm"
                              : "border-foreground/10 bg-white/50 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm",
                          )}
                          key={slot.id}
                          onClick={() => toggleSlot(slot.id)}
                          type="button"
                        >
                          {isSelected && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                              <Check className="h-3 w-3 text-white" />
                            </span>
                          )}
                          <span className="block font-medium">
                            {formatShortDate(new Date(slot.date))}
                          </span>
                          <span className="mt-0.5 block text-foreground/55">
                            {formatTimeRange(slot.startTime, slot.endTime)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!data.availableSlots.length && (
                  <p className="text-sm text-foreground/55">No open slots yet.</p>
                )}

                {selectedSlot ? (
                  <div className="flex items-center gap-2.5 rounded-xl bg-sage/15 px-4 py-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-foreground/60" />
                    <span>
                      {formatShortDate(new Date(selectedSlot.date))},{" "}
                      {formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}
                    </span>
                    <button
                      className="ml-auto text-xs text-foreground/40 underline-offset-2 hover:text-foreground hover:underline"
                      onClick={() => setSelectedSlotId("")}
                      type="button"
                    >
                      clear
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="requestedDate">Request another date</Label>
                      <Input id="requestedDate" name="requestedDate" type="date" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="requestedTime">Time</Label>
                      <Input id="requestedTime" name="requestedTime" type="time" />
                    </div>
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="notes">Note</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any date notes or preferences?"
                  />
                </div>

                <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
                  <Send className="h-4 w-4" />
                  {isPending ? "Sending..." : "Send request"}
                </Button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={onUpdate}>
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-accent" />
                  <h2 className="font-serif text-3xl">Your notes</h2>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input defaultValue={guest.name} id="name" name="name" required />
                </div>

                <div className="grid gap-1.5">
                  <Label>Email</Label>
                  <Input disabled value={guest.email} />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    defaultValue={guest.allergies ?? ""}
                    id="allergies"
                    name="allergies"
                    placeholder="Anything we should avoid?"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="favoriteCuisines">Favorite cuisines or foods</Label>
                  <Textarea
                    defaultValue={guest.favoriteCuisines ?? ""}
                    id="favoriteCuisines"
                    name="favoriteCuisines"
                    placeholder="Noodles, handmade pasta, crispy rice..."
                  />
                </div>

                {data.booking && (
                  <Card className="bg-sage/10 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <CalendarDays className="h-4 w-4 text-foreground/60" />
                        Current booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/70">{bookingLabel(data)}</p>
                    </CardContent>
                  </Card>
                )}

                <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
                  {isPending ? "Saving..." : "Save notes"}
                </Button>
              </form>
            )}
          </section>
        </PageTransition>
      </div>
    </main>
  );
}
