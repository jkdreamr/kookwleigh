import { NextResponse } from "next/server";
import { BookingStatus, GuestStatus } from "@prisma/client";
import { apiError, unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { formatDisplayDate, formatTimeLabel, formatTimeRange, parseDateInput } from "@/lib/dates";
import {
  notifyHostBookingRequested,
  notifyHostGuestCancelled,
  sendGuestCancelledGuestEmail,
} from "@/lib/email";
import { parseJsonBody } from "@/lib/utils";
import { requireGuestSession } from "@/lib/session";
import { bookingRequestSchema } from "@/lib/validators";
import { serializeBooking } from "@/lib/waitlist";

export async function POST(request: Request) {
  const session = await requireGuestSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const payload = bookingRequestSchema.parse(await parseJsonBody(request));
    const booking = await db.$transaction(async (tx) => {
      const guest = await tx.guest.findUnique({
        where: { id: session.guestId },
      });

      if (!guest || guest.status !== GuestStatus.INVITED) {
        throw new Error("Only invited guests can request a booking.");
      }

      // Cancel any previous pending request
      await tx.booking.updateMany({
        data: { status: BookingStatus.CANCELLED },
        where: { guestId: guest.id, status: BookingStatus.PENDING },
      });

      if (payload.slotId) {
        const slot = await tx.availableSlot.findUnique({
          where: { id: payload.slotId },
        });

        if (!slot || slot.isBooked) {
          throw new Error("That slot is no longer available.");
        }

        return tx.booking.create({
          data: {
            guestId: guest.id,
            notes: payload.notes || null,
            slotId: slot.id,
          },
          include: { guest: true, slot: true },
        });
      }

      return tx.booking.create({
        data: {
          guestId: guest.id,
          notes: payload.notes || null,
          requestedDate: payload.requestedDate
            ? parseDateInput(payload.requestedDate)
            : null,
          requestedTime: payload.requestedTime ?? null,
        },
        include: { guest: true, slot: true },
      });
    });

    // Build readable labels for the host notification
    const dateLabel = booking.slot
      ? formatDisplayDate(booking.slot.date)
      : booking.requestedDate
        ? formatDisplayDate(booking.requestedDate)
        : "a date TBD";
    const timeLabel = booking.slot
      ? formatTimeRange(booking.slot.startTime, booking.slot.endTime)
      : booking.requestedTime
        ? formatTimeLabel(booking.requestedTime)
        : "a time TBD";

    // Notify the host a booking request has come in
    await notifyHostBookingRequested({
      dateLabel,
      guestEmail: booking.guest.email,
      guestName: booking.guest.name,
      notes: booking.notes,
      timeLabel,
    });

    return NextResponse.json({ booking: serializeBooking(booking) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE() {
  const session = await requireGuestSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const guest = await tx.guest.findUnique({
        where: { id: session.guestId },
      });

      if (!guest) {
        throw new Error("Guest not found.");
      }

      if (guest.status !== GuestStatus.SCHEDULED) {
        throw new Error("Only scheduled guests can cancel a booking.");
      }

      const booking = await tx.booking.findFirst({
        include: { slot: true },
        where: {
          guestId: guest.id,
          status: BookingStatus.CONFIRMED,
        },
      });

      if (!booking) {
        throw new Error("No confirmed booking found.");
      }

      // Free the slot back up
      if (booking.slotId) {
        await tx.availableSlot.update({
          data: { isBooked: false },
          where: { id: booking.slotId },
        });
      }

      await tx.booking.update({
        data: { status: BookingStatus.CANCELLED },
        where: { id: booking.id },
      });

      // Move guest back to INVITED so they can rebook without losing their spot
      await tx.guest.update({
        data: { status: GuestStatus.INVITED },
        where: { id: guest.id },
      });

      return { booking, guest };
    });

    const { booking, guest } = result;

    const dateLabel = booking.slot
      ? formatDisplayDate(booking.slot.date)
      : booking.requestedDate
        ? formatDisplayDate(booking.requestedDate)
        : "their upcoming dinner";
    const timeLabel = booking.slot
      ? formatTimeRange(booking.slot.startTime, booking.slot.endTime)
      : booking.requestedTime
        ? formatTimeLabel(booking.requestedTime)
        : "";

    // Email the guest confirming their cancellation and inviting them to rebook
    await sendGuestCancelledGuestEmail(guest.email);

    // Notify host with full details
    await notifyHostGuestCancelled({
      dateLabel,
      guestEmail: guest.email,
      guestName: guest.name,
      timeLabel,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
