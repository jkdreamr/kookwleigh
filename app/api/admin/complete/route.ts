import { NextResponse } from "next/server";
import { GuestStatus } from "@prisma/client";
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
      const guest = await db.guest.findUnique({
        where: { id: payload.guestId },
      });

      if (!guest) {
        return NextResponse.json({ error: "Guest not found." }, { status: 404 });
      }

      await db.guest.update({
        data: { status: GuestStatus.COMPLETED },
        where: { id: payload.guestId },
      });

      // Thank-you email to the guest
      await sendDinnerCompleteEmail(guest.email);

      // Notify host too
      await notifyHostDinnerComplete({
        guestEmail: guest.email,
        guestName: guest.name,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
