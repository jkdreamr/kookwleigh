import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { apiError } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { notifyHostNewSignup, sendWaitlistConfirmationEmail } from "@/lib/email";
import { parseJsonBody } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { signupSchema } from "@/lib/validators";
import { getNextWaitlistPosition, serializeGuest } from "@/lib/waitlist";

export async function POST(request: Request) {
  try {
    const payload = signupSchema.parse(await parseJsonBody(request));
    const guest = await db.$transaction(async (tx) => {
      const position = await getNextWaitlistPosition(tx);

      return tx.guest.create({
        data: {
          allergies: payload.allergies || null,
          email: payload.email,
          favoriteCuisines: payload.favoriteCuisines || null,
          name: payload.name,
          position,
        },
      });
    });

    const session = await getSession();
    session.guestId = guest.id;
    session.email = guest.email;
    session.isAdmin = false;
    await session.save();

    // Email the guest their waitlist confirmation
    await sendWaitlistConfirmationEmail({
      email: guest.email,
      name: guest.name,
      position: guest.position,
    });

    // Notify the host of the new signup
    await notifyHostNewSignup({
      email: guest.email,
      name: guest.name,
      position: guest.position,
    });

    return NextResponse.json({ guest: serializeGuest(guest) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That email is already on the waitlist. Log in instead." },
        { status: 409 },
      );
    }

    return apiError(error);
  }
}
