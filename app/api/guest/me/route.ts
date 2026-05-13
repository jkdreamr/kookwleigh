import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { requireGuestSession } from "@/lib/session";
import {
  serializeBooking,
  serializeGuest,
  serializeSlot,
} from "@/lib/waitlist";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireGuestSession();

  if (!session) {
    return unauthorized();
  }

  const guest = await db.guest.findUnique({
    where: { id: session.guestId },
  });

  if (!guest) {
    return NextResponse.json(
      { error: "This guest record no longer exists." },
      { status: 404 },
    );
  }

  const [booking, availableSlots] = await Promise.all([
    db.booking.findFirst({
      include: { slot: true },
      orderBy: { createdAt: "desc" },
      where: {
        guestId: guest.id,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
    }),
    db.availableSlot.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      where: { isBooked: false },
    }),
  ]);

  return NextResponse.json({
    availableSlots: availableSlots.map(serializeSlot),
    booking: booking ? serializeBooking(booking) : null,
    guest: serializeGuest(guest),
  });
}

export async function PATCH(request: Request) {
  const session = await requireGuestSession();

  if (!session) {
    return unauthorized();
  }

  const { updateGuestSchema } = await import("@/lib/validators");
  const { parseJsonBody } = await import("@/lib/utils");
  const payload = updateGuestSchema.parse(await parseJsonBody(request));

  const guest = await db.guest.update({
    data: {
      allergies: payload.allergies || null,
      favoriteCuisines: payload.favoriteCuisines || null,
      name: payload.name,
    },
    where: { id: session.guestId },
  });

  return NextResponse.json({ guest: serializeGuest(guest) });
}
