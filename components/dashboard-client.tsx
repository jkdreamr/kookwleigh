"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  LogOut,
  Send,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
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
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-xs space-y-5 text-center">
          <span className="font-serif text-2xl text-foreground/70">kookwleigh</span>
          <p className="text-sm text-foreground/50">{loadError}</p>
          <a className="block text-xs text-foreground/35 transition-colors hover:text-foreground" href="/login">
            Return to login →
          </a>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <span className="font-serif text-3xl text-foreground/60">kookwleigh</span>
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="eyebrow text-foreground/30">Loading your table</p>
        </motion.div>
      </main>
    );
  }

  const { guest } = data;
  const label = bookingLabel(data);
  const firstName = guest.name.split(" ")[0];

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top nav bar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-foreground/8 bg-background/90 px-6 py-4 backdrop-blur sm:px-10">
        <a className="font-serif text-xl leading-none text-foreground/80 hover:text-foreground transition-colors" href="/">
          kookwleigh
        </a>
        <button
          className="flex items-center gap-1.5 text-sm text-foreground/40 transition-colors hover:text-foreground disabled:opacity-40"
          disabled={isPending}
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Log out</span>
        </button>
      </header>

      {/* ── Main two-column layout ── */}
      <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-[1fr_400px]">

        {/* ══ LEFT — Status hero column ══ */}
        <PageTransition>
          <div className="border-b border-foreground/8 px-6 py-12 sm:px-10 sm:py-16 lg:border-b-0 lg:border-r lg:py-20 lg:px-14">

            {/* Guest name */}
            <div className="mb-14">
              <p className="eyebrow mb-3">Your table</p>
              <h1 className="font-serif text-5xl leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
                {firstName}.
              </h1>
            </div>

            {/* ── WAITLISTED ── */}
            {guest.status === "WAITLISTED" && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 12 }}
                transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="section-label mb-6">Your position</p>
                <AnimatedCounter value={guest.position} />
                <div className="mt-8 max-w-xs">
                  <div className="h-px w-8 bg-foreground/12 mb-6" />
                  <p className="text-sm leading-relaxed text-foreground/45">
                    You will be notified when it is your turn.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── INVITED ── */}
            {guest.status === "INVITED" && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 12 }}
                transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6 h-px w-10 bg-accent/40" />
                <p className="section-label mb-5">Status</p>
                <h2 className="font-serif text-5xl leading-[0.93] sm:text-6xl">
                  It is your turn.
                </h2>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-foreground/45">
                  Pick a date below or suggest your own night.
                </p>
              </motion.div>
            )}

            {/* ── SCHEDULED ── */}
            {guest.status === "SCHEDULED" && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 12 }}
                transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="section-label mb-5">Status</p>
                <h2 className="font-serif text-5xl leading-[0.93] sm:text-6xl">See you soon.</h2>
                {label && (
                  <div className="mt-8 inline-block rounded-xl border border-foreground/10 bg-card px-5 py-3">
                    <p className="section-label mb-1">Your dinner</p>
                    <p className="text-sm font-medium text-foreground/80">{label}</p>
                  </div>
                )}
                <div className="mt-8">
                  <p className="mb-3 text-sm text-foreground/40">Something come up?</p>
                  <button
                    className="text-sm text-foreground/40 underline underline-offset-4 transition-colors hover:text-red-600 disabled:opacity-40"
                    disabled={isPending}
                    onClick={cancelBooking}
                  >
                    Cancel my booking
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── COMPLETED ── */}
            {guest.status === "COMPLETED" && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 12 }}
                transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6 h-px w-10 bg-butter/50" />
                <p className="section-label mb-5">Status</p>
                <h2 className="font-serif text-5xl leading-[0.93] sm:text-6xl">
                  Thank you for coming.
                </h2>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-foreground/45">
                  It was a pleasure having you at our table. We hope to see you again.
                </p>
                <Button className="mt-8" disabled={isPending} onClick={rejoinWaitlist} size="sm">
                  Rejoin the waitlist
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}

            {/* Guest meta — email chip */}
            <div className="mt-16 border-t border-foreground/8 pt-8">
              <p className="section-label mb-2">Logged in as</p>
              <p className="text-sm text-foreground/45">{guest.email}</p>
            </div>
          </div>
        </PageTransition>

        {/* ══ RIGHT — Forms column ══ */}
        <div className="divide-y divide-foreground/8">

          {/* ── Booking form (INVITED only) ── */}
          {guest.status === "INVITED" && (
            <PageTransition delay={0.1}>
              <div className="px-6 py-10 sm:px-8">
                <div className="mb-7">
                  <p className="section-label mb-2">Schedule</p>
                  <h2 className="font-serif text-2xl">Choose a date</h2>
                </div>

                <form className="space-y-6" onSubmit={onBooking}>
                  {/* Available slots */}
                  {data.availableSlots.length > 0 && (
                    <div>
                      <p className="section-label mb-3">Open slots</p>
                      <div className="space-y-2">
                        {data.availableSlots.map((slot) => {
                          const sel = selectedSlotId === slot.id;
                          return (
                            <button
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-150",
                                sel
                                  ? "border-accent/35 bg-accent/5"
                                  : "border-foreground/8 bg-card/60 hover:border-foreground/15 hover:bg-card",
                              )}
                              key={slot.id}
                              onClick={() => toggleSlot(slot.id)}
                              type="button"
                            >
                              <div>
                                <span className="block font-medium text-foreground/80">
                                  {formatShortDate(new Date(slot.date))}
                                </span>
                                <span className="mt-0.5 block text-xs text-foreground/40">
                                  {formatTimeRange(slot.startTime, slot.endTime)}
                                </span>
                              </div>
                              {sel && (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent">
                                  <Check className="h-2.5 w-2.5 text-white" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {selectedSlot && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-foreground/4 px-3 py-2 text-xs">
                          <Check className="h-3 w-3 shrink-0 text-foreground/35" />
                          <span className="text-foreground/55">
                            {formatShortDate(new Date(selectedSlot.date))} ·{" "}
                            {formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}
                          </span>
                          <button
                            className="ml-auto text-foreground/30 hover:text-foreground"
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
                      <p className="section-label mb-3">
                        {data.availableSlots.length > 0
                          ? "Or suggest a different night"
                          : "Suggest a night that works for you"}
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

                  <Button className="w-full" disabled={isPending} type="submit">
                    <Send className="h-3.5 w-3.5" />
                    {isPending ? "Sending..." : "Send request"}
                  </Button>
                </form>

                {/* Current pending request */}
                {data.booking && (
                  <div className="mt-6 rounded-xl border border-foreground/8 bg-card/50 px-4 py-4">
                    <p className="section-label mb-2">Current request</p>
                    <p className="text-sm font-medium text-foreground/70">
                      {label ?? "Submitted — awaiting confirmation"}
                    </p>
                    {data.booking.notes && (
                      <p className="mt-1 text-xs italic text-foreground/40">
                        &ldquo;{data.booking.notes}&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </div>
            </PageTransition>
          )}

          {/* ── Edit details ── */}
          <PageTransition delay={guest.status === "INVITED" ? 0.15 : 0.1}>
            <div className="px-6 py-10 sm:px-8">
              <div className="mb-7">
                <p className="section-label mb-2">Account</p>
                <h2 className="font-serif text-2xl">Your details</h2>
              </div>

              <form className="space-y-5" onSubmit={onUpdate}>
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input defaultValue={guest.name} id="name" name="name" required />
                </div>

                <div className="grid gap-1.5">
                  <Label className="flex items-center justify-between">
                    Email
                    <span className="text-[11px] font-normal text-foreground/30">Cannot be changed</span>
                  </Label>
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

                <Button className="w-full" disabled={isPending} type="submit">
                  {isPending ? "Saving..." : "Save details"}
                </Button>
              </form>
            </div>
          </PageTransition>

        </div>{/* end right column */}
      </div>{/* end two-col grid */}
    </div>
  );
}
