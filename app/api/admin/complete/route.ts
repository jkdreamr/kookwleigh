import { NextResponse } from "next/server";
import { BookingStatus, GuestStatus } from "@prisma/client";
import { apiError, unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { notifyHostDinnerComplete, sendDinnerCompleteEmail } from "@/lib/email";
import { parseJsonBody } from "@/lib/utils";
import { requireAdminSession } from "@/lib/session";
import { completeGuestSchema } from "@/lib/validators";
import { getNextWaitlistPosition } from "@/lib/waitlist";

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const payload = completeGuestSchema.parse(await parseJsonBody(request));

    if (payload.requeue) {
      // Put the guest back at the end of the waitlist
      await db.$transaction(async (tx) => {
        const position = await getNextWaitlistPosition(tx);

        await tx.guest.update({
          data: {
            position,
            status: GuestStatus.WAITLISTED,
          },
          where: { id: payload.guestId },
        });
      });
    } else {
      const completed = await db.$transaction(async (tx) => {
        const guest = await tx.guest.findUnique({
          include: {
            bookings: {
              include: { slot: true },
              orderBy: { createdAt: "desc" },
              where: { status: BookingStatus.CONFIRMED },
            },
          },
          where: { id: payload.guestId },
        });

        if (!guest) {
          throw new Error("Guest not found.");
        }

        if (guest.status !== GuestStatus.SCHEDULED) {
          throw new Error("Only scheduled guests can be completed.");
        }

        const booking = guest.bookings[0] ?? null;
        const dinnerDate = booking?.slot?.date ?? booking?.requestedDate ?? null;
        const dinnerTime = booking?.slot
          ? `${booking.slot.startTime} - ${booking.slot.endTime}`
          : booking?.requestedTime ?? null;

        const dinner = await tx.completedDinner.create({
          data: {
            allergies: guest.allergies,
            dinnerDate,
            dinnerTime,
            favoriteCuisines: guest.favoriteCuisines,
            guestEmail: guest.email,
            guestName: guest.name,
            menu: payload.menu || null,
            notes: payload.notes || null,
            photoDataUrls: payload.photoDataUrls.length
              ? JSON.stringify(payload.photoDataUrls)
              : null,
          },
        });

        await tx.guest.update({
          data: { status: GuestStatus.COMPLETED },
          where: { id: payload.guestId },
        });

        return {
          dinner,
          guestEmail: guest.email,
          guestName: guest.name,
        };
      });

      // Thank-you email to the guest
      await sendDinnerCompleteEmail(completed.guestEmail);

      // Notify host too
      await notifyHostDinnerComplete({
        guestEmail: completed.guestEmail,
        guestName: completed.guestName,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
