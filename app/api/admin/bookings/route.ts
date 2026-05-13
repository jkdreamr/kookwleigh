import { NextResponse } from "next/server";
import { BookingStatus, GuestStatus } from "@prisma/client";
import { apiError, unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import {
  formatDisplayDate,
  formatTimeLabel,
  formatTimeRange,
} from "@/lib/dates";
import {
  sendBookingConfirmedEmail,
  sendBookingDeclinedEmail,
} from "@/lib/email";
import { parseJsonBody } from "@/lib/utils";
import { requireAdminSession } from "@/lib/session";
import { adminBookingSchema } from "@/lib/validators";
import { serializePendingBooking } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  const pending = await db.booking.findMany({
    include: { guest: true, slot: true },
    orderBy: { createdAt: "asc" },
    where: { status: BookingStatus.PENDING },
  });

  return NextResponse.json({ pending: pending.map(serializePendingBooking) });
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const payload = adminBookingSchema.parse(await parseJsonBody(request));
    const booking = await db.booking.findUnique({
      include: { guest: true, slot: true },
      where: { id: payload.bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (payload.action === "decline") {
      const declined = await db.booking.update({
        data: { status: BookingStatus.CANCELLED },
        include: { guest: true, slot: true },
        where: { id: booking.id },
      });

      await sendBookingDeclinedEmail(declined.guest.email);

      return NextResponse.json({ booking: serializePendingBooking(declined) });
    }

    const confirmed = await db.$transaction(async (tx) => {
      if (booking.slotId) {
        const slot = await tx.availableSlot.findUnique({
          where: { id: booking.slotId },
        });

        if (!slot || slot.isBooked) {
          throw new Error("That slot is no longer available.");
        }

        await tx.availableSlot.update({
          data: { isBooked: true },
          where: { id: slot.id },
        });
      }

      await tx.booking.updateMany({
        data: { status: BookingStatus.CANCELLED },
        where: {
          guestId: booking.guestId,
          id: { not: booking.id },
          status: BookingStatus.PENDING,
        },
      });

      await tx.guest.update({
        data: { status: GuestStatus.SCHEDULED },
        where: { id: booking.guestId },
      });

      return tx.booking.update({
        data: { status: BookingStatus.CONFIRMED },
        include: { guest: true, slot: true },
        where: { id: booking.id },
      });
    });

    const dateLabel = confirmed.slot
      ? formatDisplayDate(confirmed.slot.date)
      : confirmed.requestedDate
        ? formatDisplayDate(confirmed.requestedDate)
        : "the selected date";
    const timeLabel = confirmed.slot
      ? formatTimeRange(confirmed.slot.startTime, confirmed.slot.endTime)
      : confirmed.requestedTime
        ? formatTimeLabel(confirmed.requestedTime)
        : "the selected time";

    await sendBookingConfirmedEmail({
      dateLabel,
      email: confirmed.guest.email,
      timeLabel,
    });

    return NextResponse.json({ booking: serializePendingBooking(confirmed) });
  } catch (error) {
    return apiError(error);
  }
}
