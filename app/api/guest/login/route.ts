import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { parseJsonBody } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await parseJsonBody(request));
    const guest = await db.guest.findUnique({
      where: { email: payload.email },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "We could not find that email on the waitlist." },
        { status: 404 },
      );
    }

    const session = await getSession();
    session.guestId = guest.id;
    session.email = guest.email;
    session.isAdmin = false;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
