"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Check, LogOut, Pencil, Send } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { FormStatus } from "@/components/form-status";
import { PageTransition } from "@/components/page-transition";
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

  if (!booking) {
    return "No booking request yet.";
  }

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadDashboard() {
    const response = await fetch("/api/guest/me", { cache: "no-store" });

    if (!response.ok) {
      setError("This session could not be loaded. Please log in again.");
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

  function onUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

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
        setError(result.error ?? "Could not update your details.");
        return;
      }

      setSuccess("Saved.");
      await loadDashboard();
    });
  }

  function onBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

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
        setError(result.error ?? "Could not request that booking.");
        return;
      }

      setSuccess("Request sent to Josh and Leigh.");
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
    setError("");
    setSuccess("");
    startTransition(async () => {
      const response = await fetch("/api/guest/rejoin", {
        method: "POST",
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "Could not rejoin the waitlist.");
        return;
      }

      setSuccess("Rejoined the waitlist!");
      await loadDashboard();
    });
  }

  if (!data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-5">
        <p className="eyebrow">Loading table notes</p>
      </main>
    );
  }

  const { guest } = data;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Guest dashboard</p>
          <h1 className="font-serif text-4xl sm:text-5xl">Hi, {guest.name}</h1>
        </div>
        <Button disabled={isPending} onClick={logout} size="sm" variant="outline">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <FormStatus error={error} success={success} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <PageTransition>
          <section className="section-frame">
            <Badge>{guest.status}</Badge>
            {guest.status === "WAITLISTED" && (
              <div className="mt-7">
                <p className="text-sm text-foreground/60">You are</p>
                <AnimatedCounter value={guest.position} />
                <p className="subtitle">on the waitlist. Tiny dinner, careful notes, good snacks.</p>
              </div>
            )}
            {guest.status === "INVITED" && (
              <div className="mt-7 space-y-5">
                <h2 className="font-serif text-5xl">It is your turn.</h2>
                <p className="subtitle">
                  Pick one of the open seats or send a softer request for another night.
                </p>
              </div>
            )}
            {guest.status === "SCHEDULED" && (
              <div className="mt-7 space-y-5">
                <Check className="h-10 w-10 text-sage" />
                <h2 className="font-serif text-5xl">See you soon.</h2>
                <p className="subtitle">{bookingLabel(data)}</p>
              </div>
            )}
            {guest.status === "COMPLETED" && (
              <div className="mt-7 space-y-5">
                <h2 className="font-serif text-5xl">Dinner complete.</h2>
                <p className="subtitle">Hope you enjoyed it! Join the waitlist again whenever you&apos;d like.</p>
                <Button
                  disabled={isPending}
                  onClick={rejoinWaitlist}
                  className="w-full sm:w-auto"
                >
                  {isPending ? "Joining..." : "Rejoin Waitlist"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </section>
        </PageTransition>

        <PageTransition delay={0.08}>
          <section className="section-frame">
            {guest.status === "INVITED" ? (
              <form className="space-y-5" onSubmit={onBooking}>
                <div>
                  <h2 className="font-serif text-3xl">Choose a dinner window</h2>
                  <p className="mt-2 text-sm text-foreground/60">
                    Available days are softly highlighted.
                  </p>
                </div>
                <Calendar
                  modifiers={{ available: slotDates }}
                  modifiersClassNames={{ available: "bg-sage/20 rounded-full" }}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.availableSlots.length ? (
                    data.availableSlots.map((slot) => (
                      <button
                        className={cn(
                          "rounded-lg border border-foreground/10 bg-white/60 p-4 text-left text-sm transition hover:-translate-y-0.5 hover:bg-white",
                          selectedSlotId === slot.id && "border-accent bg-accent/10",
                        )}
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        type="button"
                      >
                        <span className="block font-medium">
                          {formatShortDate(new Date(slot.date))}
                        </span>
                        <span className="text-foreground/60">
                          {formatTimeRange(slot.startTime, slot.endTime)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-foreground/60">No open slots yet.</p>
                  )}
                </div>
                {selectedSlot ? (
                  <p className="rounded-lg bg-sage/15 px-4 py-3 text-sm">
                    Selected: {formatShortDate(new Date(selectedSlot.date))} at{" "}
                    {formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="requestedDate">Request another date</Label>
                      <Input id="requestedDate" name="requestedDate" type="date" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="requestedTime">Time</Label>
                      <Input id="requestedTime" name="requestedTime" type="time" />
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Note</Label>
                  <Textarea id="notes" name="notes" placeholder="Any date notes or preferences?" />
                </div>
                <Button disabled={isPending} type="submit">
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
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input defaultValue={guest.name} id="name" name="name" required />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input disabled value={guest.email} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea defaultValue={guest.allergies ?? ""} id="allergies" name="allergies" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="favoriteCuisines">Favorite cuisines or foods</Label>
                  <Textarea
                    defaultValue={guest.favoriteCuisines ?? ""}
                    id="favoriteCuisines"
                    name="favoriteCuisines"
                  />
                </div>
                {data.booking && (
                  <Card className="bg-sage/10 shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <CalendarDays className="h-4 w-4" />
                        Current booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/70">{bookingLabel(data)}</p>
                    </CardContent>
                  </Card>
                )}
                <Button disabled={isPending} type="submit">
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
