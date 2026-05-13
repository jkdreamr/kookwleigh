import { BookingStatus, GuestStatus } from "@prisma/client";
import { unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/session";
import {
  serializeActiveMeal,
  serializeGuest,
} from "@/lib/waitlist";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  const [waitlisted, invited, activeMeals] = await Promise.all([
    db.guest.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      where: { status: GuestStatus.WAITLISTED },
    }),
    db.guest.findMany({
      orderBy: { createdAt: "asc" },
      where: { status: GuestStatus.INVITED },
    }),
    db.guest.findMany({
      include: {
        bookings: {
          include: { slot: true },
          orderBy: { createdAt: "desc" },
          where: { status: BookingStatus.CONFIRMED },
        },
      },
      orderBy: { createdAt: "asc" },
      where: { status: GuestStatus.SCHEDULED },
    }),
  ]);

  return Response.json({
    activeMeals: activeMeals.map(serializeActiveMeal),
    invited: invited.map(serializeGuest),
    waitlisted: waitlisted.map(serializeGuest),
  });
}
