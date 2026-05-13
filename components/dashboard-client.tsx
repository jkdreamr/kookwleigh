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

// ─── floating card ─────────────────────────────────────────────────────────

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-foreground/[0.07] bg-card px-8 py-8 shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
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
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-xs space-y-5 text-center">
          <span className="font-serif text-2xl text-foreground/60">kookwleigh</span>
          <p className="text-sm text-foreground/50">{loadError}</p>
          <a className="block text-xs text-foreground/35 transition-colors hover:text-foreground" href="/login">
            Return to login →
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <span className="font-serif text-3xl text-foreground/50">kookwleigh</span>
        <motion.p
          animate={{ opacity: [0.25, 0.6, 0.25] }}
          className="eyebrow"
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading your table
        </motion.p>
      </div>
    );
  }

  const { guest } = data;
  const label = bookingLabel(data);
  const firstName = guest.name.split(" ")[0];

  // ── render ───────────────────────────────────────────────────────────────

  return (
    // Warm parchment background — slightly deeper than the default
    <div className="min-h-screen" style={{ background: "rgb(234 226 212 / 1)" }}>

      {/* Subtle noise stays via body::before — page bg just shifts tone */}

      {/* ── Nav ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <a
          className="font-serif text-xl leading-none text-foreground/70 transition-colors hover:text-foreground"
          href="/"
        >
          kookwleigh
        </a>
        <button
          className="flex items-center gap-1.5 text-sm text-foreground/35 transition-colors hover:text-foreground disabled:opacity-30"
          disabled={isPending}
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Log out</span>
        </button>
      </header>

      {/* ── Page body ── */}
      <PageTransition>
        <div className="mx-auto max-w-2xl space-y-4 px-5 pb-20 pt-6 sm:px-8 sm:pt-8">

          {/* ── Hero card — name + status ── */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="relative overflow-hidden">

              {/* Decorative warm orb */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-[0.12]"
                style={{ background: "radial-gradient(circle, rgb(196 96 74) 0%, transparent 70%)" }}
              />

              <div className="relative">
                <p className="eyebrow mb-5">Your table</p>
                <h1 className="font-serif text-5xl leading-[0.92] tracking-tight sm:text-6xl">
                  {firstName}.
                </h1>

                <div className="mt-8 border-t border-foreground/[0.07] pt-6">
                  {/* WAITLISTED */}
                  {guest.status === "WAITLISTED" && (
                    <div className="flex items-end justify-between gap-6">
                      <div>
                        <p className="section-label mb-3">Your position</p>
                        <AnimatedCounter value={guest.position} />
                      </div>
                      <p className="mb-1 max-w-[220px] text-right text-sm leading-relaxed text-foreground/45">
                        We will reach out when it is your turn.
                      </p>
                    </div>
                  )}

                  {/* INVITED */}
                  {guest.status === "INVITED" && (
                    <div>
                      <p className="section-label mb-2">Status</p>
                      <p className="font-serif text-2xl text-foreground/80">It is your turn.</p>
                      <p className="mt-2 text-sm text-foreground/45">
                        Choose a date below or suggest your own night.
                      </p>
                    </div>
                  )}

                  {/* SCHEDULED */}
                  {guest.status === "SCHEDULED" && (
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="section-label mb-2">Status</p>
                        <p className="font-serif text-2xl text-foreground/80">See you soon.</p>
                        {label && (
                          <p className="mt-1.5 text-sm text-foreground/50">{label}</p>
                        )}
                      </div>
                      <button
                        className="mt-1 shrink-0 text-xs text-foreground/30 underline underline-offset-4 transition-colors hover:text-red-500 disabled:opacity-30"
                        disabled={isPending}
                        onClick={cancelBooking}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* COMPLETED */}
                  {guest.status === "COMPLETED" && (
                    <div className="flex items-end justify-between gap-6">
                      <div>
                        <p className="section-label mb-2">Status</p>
                        <p className="font-serif text-2xl text-foreground/80">Thank you for coming.</p>
                        <p className="mt-1.5 text-sm text-foreground/45">
                          It was a pleasure having you at our table.
                        </p>
                      </div>
                      <button
                        className="mb-0.5 flex shrink-0 items-center gap-1.5 text-xs text-foreground/35 transition-colors hover:text-foreground disabled:opacity-30"
                        disabled={isPending}
                        onClick={rejoinWaitlist}
                      >
                        Rejoin
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Logged in as */}
                <p className="mt-5 text-xs text-foreground/30">{guest.email}</p>
              </div>
            </Card>
          </motion.div>

          {/* ── Booking card (INVITED only) ── */}
          {guest.status === "INVITED" && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card>
                <div className="mb-7">
                  <p className="section-label mb-2">Schedule</p>
                  <h2 className="font-serif text-2xl">Choose a date</h2>
                </div>

                <form className="space-y-7" onSubmit={onBooking}>
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
                                  ? "border-accent/25 bg-accent/5"
                                  : "border-foreground/[0.08] bg-background/40 hover:border-foreground/15 hover:bg-background/70",
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
                              <span
                                className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all",
                                  sel ? "bg-accent" : "border border-foreground/15",
                                )}
                              >
                                {sel && <Check className="h-2.5 w-2.5 text-white" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {selectedSlot && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-foreground/[0.04] px-3 py-2 text-xs">
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
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="requestedDate">Date</Label>
                          <Input id="requestedDate" name="requestedDate" type="date" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="requestedTime">Time</Label>
                          <Input id="requestedTime" name="requestedTime" type="time" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
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
                  <div className="mt-6 rounded-xl border border-foreground/[0.07] bg-background/50 px-4 py-4">
                    <p className="section-label mb-1.5">Current request</p>
                    <p className="text-sm font-medium text-foreground/70">
                      {label ?? "Submitted — awaiting confirmation"}
                    </p>
                    {data.booking.notes && (
                      <p className="mt-1.5 text-xs italic text-foreground/40">
                        &ldquo;{data.booking.notes}&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* ── Details card ── */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{
              delay: guest.status === "INVITED" ? 0.14 : 0.08,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Card>
              <div className="mb-7">
                <p className="section-label mb-2">Account</p>
                <h2 className="font-serif text-2xl">Your details</h2>
              </div>

              <form className="space-y-6" onSubmit={onUpdate}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input defaultValue={guest.name} id="name" name="name" required />
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center justify-between">
                    Email
                    <span className="text-[11px] font-normal text-foreground/30">Cannot be changed</span>
                  </Label>
                  <Input disabled value={guest.email} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="allergies">Allergies or dietary restrictions</Label>
                  <Textarea
                    defaultValue={guest.allergies ?? ""}
                    id="allergies"
                    name="allergies"
                    placeholder="Anything we should avoid?"
                  />
                </div>

                <div className="grid gap-2">
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
            </Card>
          </motion.div>

        </div>
      </PageTransition>
    </div>
  );
}
