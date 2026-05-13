import { NextResponse } from "next/server";
import { BookingStatus, GuestStatus } from "@prisma/client";
import { apiError, unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { parseDateInput } from "@/lib/dates";
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
          include: { slot: true },
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
        include: { slot: true },
      });
    });

    return NextResponse.json({ booking: serializeBooking(booking) });
  } catch (error) {
    return apiError(error);
  }
}
