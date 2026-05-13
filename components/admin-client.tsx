"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Check, LogOut, Send, Trash2, X } from "lucide-react";
import { showToast } from "@/components/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDisplayDate,
  formatShortDate,
  formatTimeLabel,
  formatTimeRange,
} from "@/lib/dates";
import type {
  AdminBookingsResponse,
  AdminGuestsResponse,
  AdminSlotsResponse,
  BookingView,
} from "@/lib/types";

function bookingText(booking: BookingView | null) {
  if (!booking) return "No confirmed booking details.";

  if (booking.slot) {
    return `${formatShortDate(new Date(booking.slot.date))}, ${formatTimeRange(
      booking.slot.startTime,
      booking.slot.endTime,
    )}`;
  }

  if (booking.requestedDate && booking.requestedTime) {
    return `${formatShortDate(new Date(booking.requestedDate))}, ${formatTimeLabel(
      booking.requestedTime,
    )}`;
  }

  return "Custom request";
}

export function AdminClient() {
  const router = useRouter();
  const [guests, setGuests] = useState<AdminGuestsResponse>({
    activeMeals: [],
    waitlisted: [],
  });
  const [bookings, setBookings] = useState<AdminBookingsResponse>({
    confirmed: [],
    pending: [],
  });
  const [slots, setSlots] = useState<AdminSlotsResponse>({ slots: [] });
  const [isPending, startTransition] = useTransition();

  async function loadAll() {
    const [guestsResponse, bookingsResponse, slotsResponse] = await Promise.all([
      fetch("/api/admin/guests", { cache: "no-store" }),
      fetch("/api/admin/bookings", { cache: "no-store" }),
      fetch("/api/admin/slots", { cache: "no-store" }),
    ]);

    if (guestsResponse.ok) {
      setGuests((await guestsResponse.json()) as AdminGuestsResponse);
    }
    if (bookingsResponse.ok) {
      setBookings((await bookingsResponse.json()) as AdminBookingsResponse);
    }
    if (slotsResponse.ok) {
      setSlots((await slotsResponse.json()) as AdminSlotsResponse);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  function mutate(
    path: string,
    body: Record<string, unknown>,
    method: "DELETE" | "PATCH" | "POST" = "POST",
    message = "Updated.",
  ) {
    startTransition(async () => {
      const response = await fetch(path, {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method,
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        showToast(result.error ?? "The update failed.", "error");
        return;
      }

      showToast(message);
      await loadAll();
    });
  }

  function addSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    mutate(
      "/api/admin/slots",
      {
        date: String(formData.get("date") ?? ""),
        endTime: String(formData.get("endTime") ?? ""),
        startTime: String(formData.get("startTime") ?? ""),
      },
      "POST",
      "Slot added.",
    );
    event.currentTarget.reset();
  }

  function logout() {
    startTransition(async () => {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    });
  }

  const totalActive = guests.activeMeals.length;
  const totalPending = bookings.pending.length;
  const totalWaitlist = guests.waitlisted.length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Josh and Leigh</p>
          <h1 className="mt-1 font-serif text-4xl sm:text-5xl">Dinner control room</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats — compact chips */}
          <div className="hidden gap-2 sm:flex">
            {[
              { label: "waitlist", value: totalWaitlist },
              { label: "pending", value: totalPending },
              { label: "active", value: totalActive },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-xl border border-foreground/8 bg-white/65 px-4 py-2.5 text-center shadow-sm"
              >
                <strong className="block text-xl leading-none">{value}</strong>
                <span className="mt-0.5 text-xs text-foreground/50">{label}</span>
              </div>
            ))}
          </div>
          <Button disabled={isPending} onClick={logout} size="sm" variant="outline">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile stats */}
      <div className="mb-6 flex gap-2 sm:hidden">
        {[
          { label: "waitlist", value: totalWaitlist },
          { label: "pending", value: totalPending },
          { label: "active", value: totalActive },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-1 flex-col items-center rounded-xl border border-foreground/8 bg-white/65 px-2 py-2.5 text-center shadow-sm"
          >
            <strong className="block text-lg leading-none">{value}</strong>
            <span className="mt-0.5 text-xs text-foreground/50">{label}</span>
          </div>
        ))}
      </div>

      <Tabs defaultValue="waitlist">
        <TabsList>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="meals">Active Meals</TabsTrigger>
        </TabsList>

        {/* ── Waitlist ── */}
        <TabsContent value="waitlist">
          <div className="grid gap-3">
            {guests.waitlisted.map((guest) => (
              <Card key={guest.id}>
                <CardContent className="grid gap-4 p-5 lg:grid-cols-[72px_1fr_auto] lg:items-center">
                  <div className="font-serif text-4xl leading-none text-accent">
                    #{guest.position}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h2 className="font-serif text-xl">{guest.name}</h2>
                      <Badge className="text-[10px]">{formatShortDate(new Date(guest.createdAt))}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground/55">{guest.email}</p>
                    <div className="mt-3 space-y-0.5 text-sm text-foreground/65">
                      <p>Allergies: {guest.allergies || "None listed"}</p>
                      <p>Favorites: {guest.favoriteCuisines || "None listed"}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isPending}
                    onClick={() =>
                      mutate("/api/admin/invite", { guestId: guest.id }, "POST", "Invite sent.")
                    }
                  >
                    <Send className="h-4 w-4" />
                    Invite
                  </Button>
                </CardContent>
              </Card>
            ))}
            {!guests.waitlisted.length && (
              <p className="rounded-xl bg-white/55 p-6 text-sm text-foreground/55">
                No waitlisted guests yet.
              </p>
            )}
          </div>
        </TabsContent>

        {/* ── Slots ── */}
        <TabsContent value="slots">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Add a slot</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={addSlot}>
                  <div className="grid gap-1.5">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" required type="date" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="startTime">Start</Label>
                      <Input id="startTime" name="startTime" required type="time" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="endTime">End</Label>
                      <Input id="endTime" name="endTime" required type="time" />
                    </div>
                  </div>
                  <Button className="w-full" disabled={isPending} type="submit">
                    <CalendarPlus className="h-4 w-4" />
                    Add slot
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid auto-rows-min gap-3">
              {slots.slots.map((slot) => (
                <Card key={slot.id}>
                  <CardContent className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-serif text-xl">
                        {formatDisplayDate(new Date(slot.date))}
                      </h3>
                      <p className="mt-0.5 text-sm text-foreground/55">
                        {formatTimeRange(slot.startTime, slot.endTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>{slot.isBooked ? "Booked" : "Open"}</Badge>
                      {!slot.isBooked && (
                        <Button
                          disabled={isPending}
                          onClick={() =>
                            mutate("/api/admin/slots", { slotId: slot.id }, "DELETE", "Slot removed.")
                          }
                          size="icon"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!slots.slots.length && (
                <p className="rounded-xl bg-white/55 p-6 text-sm text-foreground/55">
                  No slots added yet.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Bookings ── */}
        <TabsContent value="bookings">
          <div className="grid gap-4">
            {/* Confirmed */}
            {bookings.confirmed.length > 0 && (
              <div className="grid gap-3">
                <h3 className="font-serif text-xl text-foreground/70">Confirmed</h3>
                {bookings.confirmed.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h2 className="font-serif text-xl">{booking.guest.name}</h2>
                          <Badge>{booking.status}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-foreground/55">{booking.guest.email}</p>
                        <p className="mt-2 text-sm font-medium">{bookingText(booking)}</p>
                        {booking.notes && (
                          <p className="mt-2 text-sm text-foreground/60 italic">
                            &ldquo;{booking.notes}&rdquo;
                          </p>
                        )}
                      </div>
                      <Button
                        className="w-full sm:w-auto"
                        disabled={isPending}
                        onClick={() =>
                          mutate(
                            "/api/admin/bookings",
                            { action: "cancel", bookingId: booking.id },
                            "PATCH",
                            "Booking cancelled.",
                          )
                        }
                        variant="outline"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pending */}
            {bookings.pending.length > 0 && (
              <div className="grid gap-3">
                <h3 className={`font-serif text-xl text-foreground/70 ${bookings.confirmed.length ? "mt-4" : ""}`}>
                  Pending requests
                </h3>
                {bookings.pending.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h2 className="font-serif text-xl">{booking.guest.name}</h2>
                          <Badge>{booking.status}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-foreground/55">{booking.guest.email}</p>
                        <p className="mt-2 text-sm font-medium">{bookingText(booking)}</p>
                        {booking.notes && (
                          <p className="mt-2 text-sm text-foreground/60 italic">
                            &ldquo;{booking.notes}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          className="w-full sm:w-auto"
                          disabled={isPending}
                          onClick={() =>
                            mutate(
                              "/api/admin/bookings",
                              { action: "approve", bookingId: booking.id },
                              "PATCH",
                              "Booking confirmed.",
                            )
                          }
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          className="w-full sm:w-auto"
                          disabled={isPending}
                          onClick={() =>
                            mutate(
                              "/api/admin/bookings",
                              { action: "decline", bookingId: booking.id },
                              "PATCH",
                              "Booking declined.",
                            )
                          }
                          variant="outline"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!bookings.confirmed.length && !bookings.pending.length && (
              <p className="rounded-xl bg-white/55 p-6 text-sm text-foreground/55">
                No bookings yet.
              </p>
            )}
          </div>
        </TabsContent>

        {/* ── Active Meals ── */}
        <TabsContent value="meals">
          <div className="grid gap-3">
            {guests.activeMeals.map((guest) => (
              <Card key={guest.id}>
                <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-serif text-xl">{guest.name}</h2>
                    <p className="mt-0.5 text-sm text-foreground/55">{guest.email}</p>
                    <p className="mt-2 text-sm font-medium text-foreground/70">
                      {bookingText(guest.booking)}
                    </p>
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isPending}
                    onClick={() =>
                      mutate(
                        "/api/admin/complete",
                        { guestId: guest.id },
                        "POST",
                        "Guest marked as completed.",
                      )
                    }
                    variant="secondary"
                  >
                    <Check className="h-4 w-4" />
                    Mark completed
                  </Button>
                </CardContent>
              </Card>
            ))}
            {!guests.activeMeals.length && (
              <p className="rounded-xl bg-white/55 p-6 text-sm text-foreground/55">
                No scheduled meals yet.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
