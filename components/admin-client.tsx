"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Check, LogOut, Send, Trash2, X } from "lucide-react";
import { FormStatus } from "@/components/form-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  if (!booking) {
    return "No confirmed booking details.";
  }

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
  const [bookings, setBookings] = useState<AdminBookingsResponse>({ pending: [] });
  const [slots, setSlots] = useState<AdminSlotsResponse>({ slots: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setError("");
    setSuccess("");
    startTransition(async () => {
      const response = await fetch(path, {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method,
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "The update failed.");
        return;
      }

      setSuccess(message);
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

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Josh and Leigh</p>
          <h1 className="font-serif text-4xl sm:text-5xl">Dinner control room</h1>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <Button disabled={isPending} onClick={logout} size="sm" variant="outline">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-white/65 px-4 py-3 shadow-sm">
              <strong className="block text-xl">{guests.waitlisted.length}</strong>
              waitlist
            </div>
            <div className="rounded-lg bg-white/65 px-4 py-3 shadow-sm">
              <strong className="block text-xl">{bookings.pending.length}</strong>
              pending
            </div>
            <div className="rounded-lg bg-white/65 px-4 py-3 shadow-sm">
              <strong className="block text-xl">{guests.activeMeals.length}</strong>
              active
            </div>
          </div>
        </div>
      </div>

      <FormStatus error={error} success={success} />

      <Tabs className="mt-6" defaultValue="waitlist">
        <TabsList>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="meals">Active Meals</TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist">
          <div className="grid gap-4">
            {guests.waitlisted.map((guest) => (
              <Card key={guest.id}>
                <CardContent className="grid gap-4 p-5 lg:grid-cols-[80px_1fr_auto] lg:items-center">
                  <div className="font-serif text-4xl text-accent">#{guest.position}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-2xl">{guest.name}</h2>
                      <Badge>{formatShortDate(new Date(guest.createdAt))}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-foreground/60">{guest.email}</p>
                    <p className="mt-3 text-sm text-foreground/70">
                      Allergies: {guest.allergies || "None listed"}
                    </p>
                    <p className="text-sm text-foreground/70">
                      Favorites: {guest.favoriteCuisines || "None listed"}
                    </p>
                  </div>
                  <Button
                    disabled={isPending}
                    onClick={() =>
                      mutate(
                        "/api/admin/invite",
                        { guestId: guest.id },
                        "POST",
                        "Invite sent.",
                      )
                    }
                  >
                    <Send className="h-4 w-4" />
                    Invite
                  </Button>
                </CardContent>
              </Card>
            ))}
            {!guests.waitlisted.length && (
              <p className="rounded-lg bg-white/55 p-6 text-sm text-foreground/60">
                No waitlisted guests yet.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="slots">
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Add slot</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={addSlot}>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" required type="date" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start</Label>
                      <Input id="startTime" name="startTime" required type="time" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endTime">End</Label>
                      <Input id="endTime" name="endTime" required type="time" />
                    </div>
                  </div>
                  <Button disabled={isPending} type="submit">
                    <CalendarPlus className="h-4 w-4" />
                    Add slot
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="grid gap-3">
              {slots.slots.map((slot) => (
                <Card key={slot.id}>
                  <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-serif text-2xl">
                        {formatDisplayDate(new Date(slot.date))}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {formatTimeRange(slot.startTime, slot.endTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>{slot.isBooked ? "Booked" : "Open"}</Badge>
                      {!slot.isBooked && (
                        <Button
                          disabled={isPending}
                          onClick={() =>
                            mutate(
                              "/api/admin/slots",
                              { slotId: slot.id },
                              "DELETE",
                              "Slot removed.",
                            )
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="grid gap-4">
            {bookings.pending.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-2xl">{booking.guest.name}</h2>
                      <Badge>{booking.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-foreground/60">{booking.guest.email}</p>
                    <p className="mt-3 text-sm font-medium">{bookingText(booking)}</p>
                    {booking.notes && (
                      <Textarea className="mt-3" readOnly value={booking.notes} />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
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
            {!bookings.pending.length && (
              <p className="rounded-lg bg-white/55 p-6 text-sm text-foreground/60">
                No pending booking requests.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="meals">
          <div className="grid gap-4">
            {guests.activeMeals.map((guest) => (
              <Card key={guest.id}>
                <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-serif text-2xl">{guest.name}</h2>
                    <p className="text-sm text-foreground/60">{guest.email}</p>
                    <p className="mt-2 text-sm font-medium">{bookingText(guest.booking)}</p>
                  </div>
                  <Button
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
              <p className="rounded-lg bg-white/55 p-6 text-sm text-foreground/60">
                No scheduled meals yet.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
