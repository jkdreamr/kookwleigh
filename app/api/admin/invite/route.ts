import { NextResponse } from "next/server";
import { GuestStatus } from "@prisma/client";
import { apiError, unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";
import { parseJsonBody } from "@/lib/utils";
import { requireAdminSession } from "@/lib/session";
import { inviteSchema } from "@/lib/validators";
import { rebalanceWaitlistPositions, serializeGuest } from "@/lib/waitlist";

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const payload = inviteSchema.parse(await parseJsonBody(request));
    const guest = await db.$transaction(async (tx) => {
      const updatedGuest = await tx.guest.update({
        data: { position: 0, status: GuestStatus.INVITED },
        where: { id: payload.guestId },
      });

      await rebalanceWaitlistPositions(tx);
      return updatedGuest;
    });

    await sendInviteEmail(guest.email);

    return NextResponse.json({ guest: serializeGuest(guest) });
  } catch (error) {
    return apiError(error);
  }
}
