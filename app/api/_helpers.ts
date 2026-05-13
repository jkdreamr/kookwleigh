import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? fallback },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    // In production, only surface known application errors.
    // Any error we throw deliberately (e.g. "Slot is no longer available") is safe to
    // surface. Generic/unexpected errors are logged server-side and a generic message is
    // returned so internals are not exposed.
    const isAppError =
      error.message.length < 120 &&
      !error.stack?.includes("prisma") &&
      !error.message.toLowerCase().includes("connection");

    const message =
      process.env.NODE_ENV === "production" && !isAppError
        ? fallback
        : error.message;

    console.error("[api-error]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.error("[api-error]", error);
  return NextResponse.json({ error: fallback }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}
