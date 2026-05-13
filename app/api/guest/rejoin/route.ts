import { NextResponse } from "next/server";
import { GuestStatus } from "@prisma/client";
import { unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { requireGuestSession } from "@/lib/session";
import { getNextWaitlistPosition } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await requireGuestSession();

  if (!session) {
    return unauthorized();
  }

  await db.$transaction(async (tx) => {
      const position = await getNextWaitlistPosition(tx);

      await tx.guest.update({
        data: {
          position,
          status: GuestStatus.WAITLISTED,
        },
        where: { id: session.guestId },
      });
    });

    return NextResponse.json({ ok: true });
}