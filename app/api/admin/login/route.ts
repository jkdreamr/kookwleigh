import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_helpers";
import { env } from "@/lib/env";
import { parseJsonBody } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = adminLoginSchema.parse(await parseJsonBody(request));

    if (payload.password !== env.adminPassword) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const session = await getSession();
    session.isAdmin = true;
    session.guestId = undefined;
    session.email = undefined;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE() {
  const session = await getSession();
  await session.destroy();

  return NextResponse.json({ ok: true });
}
