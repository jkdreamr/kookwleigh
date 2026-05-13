import { NextResponse } from "next/server";
import { GuestStatus } from "@prisma/client";
import { apiError, unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
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
      await db.guest.update({
        data: {
          status: GuestStatus.COMPLETED,
        },
        where: { id: payload.guestId },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
