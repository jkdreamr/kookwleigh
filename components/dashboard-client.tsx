"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  LogOut,
  Pencil,
  Send,
  X,
} from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { PageTransition } from "@/components/page-transition";
import { showToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
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

// ─── helpers ───────────────────────────────────────────────────────────────

function bookingLabel(data: DashboardResponse): string | null {
  const { booking } = data;
  if (!booking) return null;
  if (booking.slot)
    return `${formatDisplayDate(new Date(booking.slot.date))} · ${formatTimeRange(
      booking.slot.startTime,
      booking.slot.endTime,
    )}`;
  if (booking.requestedDate && booking.requestedTime)
    return `${formatDisplayDate(new Date(booking.requestedDate))} · ${formatTimeLabel(
      booking.requestedTime,
    )}`;
  return "Request submitted — awaiting confirmation";
}

// ─── component ─────────────────────────────────────────────────────────────

export function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadDashboard() {
    const res = await fetch("/api/guest/me", { cache: "no-store" });
    if (!res.ok) {
      setLoadError("Session could not be loaded. Please log in again.");
      return;
    }
    setData((await res.json()) as DashboardResponse);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const selectedSlot = useMemo(
    () => data?.availableSlots.find((s) => s.id === selectedSlotId),
    [data?.availableSlots, selectedSlotId],
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
        showToast(((await res.json()) as { error?: string }).error ?? "Could not save.", "error");
        return;
      }
      showToast("Details saved.");
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
        showToast(((await res.json()) as { error?: string }).error ?? "Could not send request.", "error");
        return;
      }
      showToast("Request sent to Josh and Leigh.");
      setSelectedSlotId("");
      await loadDashboard();
    });
  }

  function cancelBooking() {
    startTransition(async () => {
      const res = await fetch("/api/guest/booking", { method: "DELETE" });
      if (!res.ok) {
        showToast(((await res.json()) as { error?: string }).error ?? "Could not cancel.", "error");
        return;
      }
      showToast("Booking cancelled. You can now choose a new date.");
      await loadDashboard();
    });
  }

  function rejoinWaitlist() {
    startTransition(async () => {
      const res = await fetch("/api/guest/rejoin", { method: "POST" });
      if (!res.ok) {
        showToast(((await res.json()) as { error?: string }).error ?? "Could not rejoin.", "error");
        return;
      }
      showToast("You are back on the waitlist.");
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

  // ── loading / error states ───────────────────────────────────────────────

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
  const firstName = guest.name.split(" ")[0];

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 lg:py-16">

      {/* ── Page header ── */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-2">kookwleigh</p>
          <h1 className="font-serif text-[2.8rem] leading-none tracking-tight sm:text-5xl">
            {firstName}.
          </h1>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white/70 px-3.5 py-2 text-sm text-foreground/50 backdrop-blur transition hover:text-foreground"
          disabled={isPending}
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>

      {/* ── Status card ── */}
      <PageTransition>
        <div className="mb-6 rounded-2xl border border-foreground/8 bg-white/60 px-7 py-6 backdrop-blur">

          {/* Status label pill */}
          <span className="inline-flex items-center rounded-full bg-foreground/6 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/50">
            {guest.status.toLowerCase()}
          </span>

          {/* WAITLISTED */}
          {guest.status === "WAITLISTED" && (
            <div className="mt-4">
              <p className="mb-1 text-xs uppercase tracking-widest text-foreground/35">
                Your position
              </p>
              <AnimatedCounter value={guest.position} />
              <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                Josh and Leigh will reach out personally when it is your turn.
              </p>
            </div>
          )}

          {/* INVITED */}
          {guest.status === "INVITED" && (
            <div className="mt-4">
              <h2 className="font-serif text-3xl sm:text-4xl">It is your turn.</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/55">
                Pick a date below or suggest your own night.
              </p>
            </div>
          )}

          {/* SCHEDULED */}
          {guest.status === "SCHEDULED" && (
            <div className="mt-4">
              <h2 className="font-serif text-3xl sm:text-4xl">See you soon.</h2>
              {label && (
                <p className="mt-2 text-sm font-medium text-foreground/65">{label}</p>
              )}
              <p className="mt-2 text-sm text-foreground/45">
                Something come up? You can cancel below and we will free the slot.
              </p>
              <button
                className="mt-4 rounded-full border border-foreground/12 bg-white/50 px-4 py-2 text-sm text-foreground/55 transition hover:border-red-200/80 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                disabled={isPending}
                onClick={cancelBooking}
              >
                Cancel my booking
              </button>
            </div>
          )}

          {/* COMPLETED — dinner truly done, host marked it complete */}
          {guest.status === "COMPLETED" && (
            <div className="mt-4">
              <h2 className="font-serif text-3xl sm:text-4xl">Thank you for coming.</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/55">
                It was a pleasure having you at our table. We hope to see you again soon.
              </p>
              <Button
                className="mt-5"
                disabled={isPending}
                onClick={rejoinWaitlist}
                size="sm"
              >
                Rejoin the waitlist
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </PageTransition>

      {/* ── Booking form (INVITED only) ── */}
      {guest.status === "INVITED" && (
        <PageTransition delay={0.06}>
          <div className="mb-6 rounded-2xl border border-foreground/8 bg-white/60 px-7 py-6 backdrop-blur">
            <div className="mb-5 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-foreground/35" />
              <h2 className="font-serif text-2xl">Choose a date</h2>
            </div>

            <form className="space-y-5" onSubmit={onBooking}>
              {/* Available slots */}
              {data.availableSlots.length > 0 && (
                <div>
                  <p className="mb-1 text-xs uppercase tracking-widest text-foreground/40">
                    Open slots
                  </p>
                  <p className="mb-3 text-xs text-foreground/40">
                    Select one, or scroll down to suggest your own date.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {data.availableSlots.map((slot) => {
                      const sel = selectedSlotId === slot.id;
                      return (
                        <button
                          className={cn(
                            "relative rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
                            sel
                              ? "border-accent/50 bg-accent/5 shadow-sm"
                              : "border-foreground/8 bg-white/40 hover:bg-white/80",
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
                          <span className="block font-medium leading-snug">
                            {formatShortDate(new Date(slot.date))}
                          </span>
                          <span className="mt-0.5 block text-foreground/45">
                            {formatTimeRange(slot.startTime, slot.endTime)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedSlot && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-foreground/4 px-3 py-2 text-sm">
                      <Check className="h-3 w-3 shrink-0 text-foreground/40" />
                      <span className="text-foreground/60">
                        {formatShortDate(new Date(selectedSlot.date))} ·{" "}
                        {formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}
                      </span>
                      <button
                        className="ml-auto text-xs text-foreground/35 hover:text-foreground"
                        onClick={() => setSelectedSlotId("")}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Custom date / time */}
              {!selectedSlotId && (
                <div>
                  <p className="mb-3 text-xs uppercase tracking-widest text-foreground/40">
                    {data.availableSlots.length > 0 ? "Or suggest a different night" : "Suggest a night that works for you"}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="requestedDate">Date</Label>
                      <Input id="requestedDate" name="requestedDate" type="date" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="requestedTime">Time</Label>
                      <Input id="requestedTime" name="requestedTime" type="time" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-1.5">
                <Label htmlFor="notes">Note to Josh and Leigh</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any preferences or things we should know?"
                />
              </div>

              <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
                <Send className="h-3.5 w-3.5" />
                {isPending ? "Sending..." : "Send request"}
              </Button>
            </form>
          </div>

          {/* Current pending request summary */}
          {data.booking && (
            <div className="mb-6 rounded-2xl border border-foreground/8 bg-white/40 px-7 py-5 backdrop-blur">
              <p className="text-xs uppercase tracking-widest text-foreground/35 mb-2">
                Current request
              </p>
              <p className="text-sm font-medium text-foreground/70">
                {label ?? "Submitted — awaiting confirmation"}
              </p>
              {data.booking.notes && (
                <p className="mt-1.5 text-sm italic text-foreground/45">
                  &ldquo;{data.booking.notes}&rdquo;
                </p>
              )}
            </div>
          )}
        </PageTransition>
      )}

      {/* ── Edit details ── */}
      <PageTransition delay={0.1}>
        <div className="rounded-2xl border border-foreground/8 bg-white/60 px-7 py-6 backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <Pencil className="h-4 w-4 text-foreground/35" />
            <h2 className="font-serif text-2xl">Your details</h2>
          </div>

          <form className="space-y-4" onSubmit={onUpdate}>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input defaultValue={guest.name} id="name" name="name" required />
            </div>

            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input disabled value={guest.email} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="allergies">Allergies or dietary restrictions</Label>
              <Textarea
                defaultValue={guest.allergies ?? ""}
                id="allergies"
                name="allergies"
                placeholder="Anything we should avoid?"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="favoriteCuisines">Favourite cuisines</Label>
              <Textarea
                defaultValue={guest.favoriteCuisines ?? ""}
                id="favoriteCuisines"
                name="favoriteCuisines"
                placeholder="What cuisines do you love most?"
              />
            </div>

            <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save details"}
            </Button>
          </form>
        </div>
      </PageTransition>
    </main>
  );
}
