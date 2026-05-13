import { NextResponse } from "next/server";
import { apiError, unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { parseDateInput } from "@/lib/dates";
import { parseJsonBody } from "@/lib/utils";
import { requireAdminSession } from "@/lib/session";
import { deleteSlotSchema, slotSchema } from "@/lib/validators";
import { serializeSlot } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  const slots = await db.availableSlot.findMany({
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ slots: slots.map(serializeSlot) });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const payload = slotSchema.parse(await parseJsonBody(request));
    const slot = await db.availableSlot.create({
      data: {
        date: parseDateInput(payload.date),
        endTime: payload.endTime,
        startTime: payload.startTime,
      },
    });

    return NextResponse.json({ slot: serializeSlot(slot) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const payload = deleteSlotSchema.parse(await parseJsonBody(request));
    const slot = await db.availableSlot.findUnique({
      where: { id: payload.slotId },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found." }, { status: 404 });
    }

    if (slot.isBooked) {
      return NextResponse.json(
        { error: "Booked slots cannot be removed." },
        { status: 409 },
      );
    }

    await db.availableSlot.delete({ where: { id: slot.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
