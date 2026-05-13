import { NextResponse } from "next/server";
import { apiError, unauthorized } from "@/app/api/_helpers";
import { db } from "@/lib/db";
import { parseJsonBody } from "@/lib/utils";
import { requireAdminSession } from "@/lib/session";
import { updateCompletedDinnerSchema } from "@/lib/validators";
import { serializeCompletedDinner } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  const completed = await db.completedDinner.findMany({
    orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    completed: completed.map(serializeCompletedDinner),
  });
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const payload = updateCompletedDinnerSchema.parse(
      await parseJsonBody(request),
    );

    const dinner = await db.completedDinner.update({
      data: {
        menu: payload.menu || null,
        notes: payload.notes || null,
        photoDataUrls: payload.photoDataUrls.length
          ? JSON.stringify(payload.photoDataUrls)
          : null,
      },
      where: { id: payload.dinnerId },
    });

    return NextResponse.json({
      dinner: serializeCompletedDinner(dinner),
    });
  } catch (error) {
    return apiError(error);
  }
}
