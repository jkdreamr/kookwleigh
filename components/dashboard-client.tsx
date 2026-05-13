"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Check, LogOut, Pencil, Send } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { PageTransition } from "@/components/page-transition";
import { showToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
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
  if (!booking) return null;

  if (booking.slot) {
    return `${formatDisplayDate(new Date(booking.slot.date))} · ${formatTimeRange(
      booking.slot.startTime,
      booking.slot.endTime,
    )}`;
  }

  if (booking.requestedDate && booking.requestedTime) {
    return `${formatDisplayDate(new Date(booking.requestedDate))} · ${formatTimeLabel(
      booking.requestedTime,
    )}`;
  }

  return "Requested — awaiting confirmation";
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

  useEffect(() => { void loadDashboard(); }, []);

  const selectedSlot = useMemo(
    () => data?.availableSlots.find((s) => s.id === selectedSlotId),
    [data?.availableSlots, selectedSlotId],
  );

  const slotDates = useMemo(
    () => data?.availableSlots.map((s) => new Date(s.date)) ?? [],
    [data?.availableSlots],
  );

  function toggleSlot(id: string) {
    setSelectedSlotId((prev) => (prev === id ? "" : id));
  }

  function onUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      const res = await fetch("/api/guest/me", {
        body: JSON.stringify({
          allergies: String(fd.get("allergies") ?? ""),
          favoriteCuisines: String(fd.get("favoriteCuisines") ?? ""),
          name: String(fd.get("name") ?? ""),
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!res.ok) {
        const r = (await res.json()) as { error?: string };
        showToast(r.error ?? "Could not update your details.", "error");
        return;
      }
      showToast("Notes saved.");
      await loadDashboard();
    });
  }

  function onBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = selectedSlotId
      ? { notes: String(fd.get("notes") ?? ""), slotId: selectedSlotId }
      : {
          notes: String(fd.get("notes") ?? ""),
          requestedDate: String(fd.get("requestedDate") ?? ""),
          requestedTime: String(fd.get("requestedTime") ?? ""),
        };

    startTransition(async () => {
      const res = await fetch("/api/guest/booking", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!res.ok) {
        const r = (await res.json()) as { error?: string };
        showToast(r.error ?? "Could not request that booking.", "error");
        return;
      }
      showToast("Request sent to Josh and Leigh.");
      await loadDashboard();
    });
  }

  function cancelBooking() {
    startTransition(async () => {
      const res = await fetch("/api/guest/booking", { method: "DELETE" });
      if (!res.ok) {
        const r = (await res.json()) as { error?: string };
        showToast(r.error ?? "Could not cancel your booking.", "error");
        return;
      }
      showToast("Booking cancelled. You can now rebook.");
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
      const res = await fetch("/api/guest/rejoin", { method: "POST" });
      if (!res.ok) {
        const r = (await res.json()) as { error?: string };
        showToast(r.error ?? "Could not rejoin the waitlist.", "error");
        return;
      }
      showToast("You are back on the waitlist.");
      await loadDashboard();
    });
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-red-700">{loadError}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <p className="eyebrow animate-pulse">Loading your table</p>
      </main>
    );
  }

  const { guest } = data;
  const label = bookingLabel(data);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 lg:py-14">

      {/* ── Page header ── */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-2">Your table</p>
          <h1 className="font-serif text-[2.6rem] leading-none sm:text-5xl">
            {guest.name.split(" ")[0]}.
          </h1>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-full border border-foreground/10 bg-card/80 px-3.5 py-2 text-sm text-foreground/55 backdrop-blur transition hover:text-foreground"
          disabled={isPending}
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>

      {/* ── Status strip ── */}
      <PageTransition>
        <div className="mb-8 rounded-2xl border border-foreground/8 bg-card/70 px-6 py-5 backdrop-blur sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">{guest.status.toLowerCase()}</p>

              {guest.status === "WAITLISTED" && (
                <div>
                  <p className="mb-1 text-xs text-foreground/40 uppercase tracking-widest">position</p>
                  <AnimatedCounter value={guest.position} />
                  <p className="mt-2 text-sm text-foreground/55 leading-relaxed">
                    Josh and Leigh will contact you soon.
                  </p>
                </div>
              )}

              {guest.status === "INVITED" && (
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl">It is your turn.</h2>
                  <p className="mt-2 text-sm text-foreground/55 leading-relaxed">
                    Choose an open date below, or suggest another night.
                  </p>
                </div>
              )}

              {guest.status === "SCHEDULED" && (
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl">See you soon.</h2>
                  {label && (
                    <p className="mt-2 text-sm font-medium text-foreground/70">{label}</p>
                  )}
                </div>
              )}

              {guest.status === "COMPLETED" && (
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl">Dinner complete.</h2>
                  <p className="mt-2 text-sm text-foreground/55 leading-relaxed">
                    Hope you enjoyed it. Join the waitlist again whenever you&apos;d like.
                  </p>
                </div>
              )}
            </div>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2">
              {guest.status === "SCHEDULED" && (
                <button
                  className="rounded-full border border-foreground/10 bg-white/60 px-4 py-2 text-sm text-foreground/55 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  disabled={isPending}
                  onClick={cancelBooking}
                >
                  Cancel booking
                </button>
              )}
              {guest.status === "COMPLETED" && (
                <Button disabled={isPending} onClick={rejoinWaitlist} size="sm">
                  Rejoin waitlist
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </PageTransition>

      {/* ── Two column content ── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Left: booking form (invited) or notes form */}
        <PageTransition delay={0.06}>
          <div className="rounded-2xl border border-foreground/8 bg-card/70 px-6 py-6 backdrop-blur sm:px-8 sm:py-7">
            {guest.status === "INVITED" ? (
              <form className="space-y-6" onSubmit={onBooking}>
                <div>
                  <h2 className="font-serif text-2xl">Choose a window</h2>
                  <p className="mt-1 text-sm text-foreground/45">Available days are softly highlighted.</p>
                </div>

                <Calendar
                  modifiers={{ available: slotDates }}
                  modifiersClassNames={{ available: "bg-sage/20 rounded-full" }}
                />

                {data.availableSlots.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {data.availableSlots.map((slot) => {
                      const sel = selectedSlotId === slot.id;
                      return (
                        <button
                          className={cn(
                            "relative rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
                            sel
                              ? "border-accent/40 bg-accent/6 shadow-sm"
                              : "border-foreground/8 bg-white/40 hover:bg-white/70",
                          )}
                          key={slot.id}
                          onClick={() => toggleSlot(slot.id)}
                          type="button"
                        >
                          {sel && (
                            <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </span>
                          )}
                          <span className="block font-medium">{formatShortDate(new Date(slot.date))}</span>
                          <span className="mt-0.5 block text-foreground/45">{formatTimeRange(slot.startTime, slot.endTime)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!data.availableSlots.length && (
                  <p className="text-sm text-foreground/40">No open slots yet.</p>
                )}

                {selectedSlot ? (
                  <div className="flex items-center gap-2 rounded-xl bg-sage/10 px-4 py-2.5 text-sm">
                    <Check className="h-3.5 w-3.5 shrink-0 text-foreground/50" />
                    <span className="text-foreground/70">
                      {formatShortDate(new Date(selectedSlot.date))} · {formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}
                    </span>
                    <button
                      className="ml-auto text-xs text-foreground/35 hover:text-foreground"
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
                  <Textarea id="notes" name="notes" placeholder="Any preferences or notes?" />
                </div>

                <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
                  <Send className="h-3.5 w-3.5" />
                  {isPending ? "Sending..." : "Send request"}
                </Button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={onUpdate}>
                <div className="flex items-center gap-2 pb-1">
                  <Pencil className="h-3.5 w-3.5 text-foreground/40" />
                  <h2 className="font-serif text-2xl">Your notes</h2>
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
                  <Label htmlFor="favoriteCuisines">Favorite cuisines</Label>
                  <Textarea
                    defaultValue={guest.favoriteCuisines ?? ""}
                    id="favoriteCuisines"
                    name="favoriteCuisines"
                    placeholder="Noodles, handmade pasta, crispy rice..."
                  />
                </div>

                <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
                  {isPending ? "Saving..." : "Save notes"}
                </Button>
              </form>
            )}
          </div>
        </PageTransition>

        {/* Right: current booking info (non-invited) or empty state */}
        <PageTransition delay={0.1}>
          <div className="rounded-2xl border border-foreground/8 bg-card/70 px-6 py-6 backdrop-blur sm:px-8 sm:py-7">
            <div className="flex items-center gap-2 pb-5">
              <CalendarDays className="h-3.5 w-3.5 text-foreground/40" />
              <h2 className="font-serif text-2xl">Booking</h2>
            </div>

            {data.booking ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-white/50 px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-foreground/40 mb-1">
                    {data.booking.status.toLowerCase()}
                  </p>
                  <p className="font-medium text-foreground/80">
                    {label ?? "Awaiting details"}
                  </p>
                  {data.booking.notes && (
                    <p className="mt-2 text-sm text-foreground/50 italic">
                      &ldquo;{data.booking.notes}&rdquo;
                    </p>
                  )}
                </div>

                {guest.status === "INVITED" && data.booking.status === "PENDING" && (
                  <p className="text-xs text-foreground/40 px-1">
                    Josh and Leigh will confirm your request shortly.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-xl bg-white/30 px-5 py-8">
                <p className="text-sm text-foreground/40">No booking yet.</p>
                {guest.status === "INVITED" && (
                  <p className="text-sm text-foreground/40">
                    Choose a date on the left to get started.
                  </p>
                )}
              </div>
            )}
          </div>
        </PageTransition>
      </div>
    </main>
  );
}
