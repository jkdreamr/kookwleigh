import type {
  AvailableSlot,
  Booking,
  Guest,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { BookingStatus, GuestStatus } from "@prisma/client";
import type {
  ActiveMealView,
  AdminPendingBookingView,
  BookingView,
  GuestView,
  SlotView,
} from "@/lib/types";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

type BookingWithSlot = Booking & {
  slot: AvailableSlot | null;
};

type ActiveMealWithBooking = Guest & {
  bookings: BookingWithSlot[];
};

type PendingBookingWithGuest = BookingWithSlot & {
  guest: Guest;
};

export async function getNextWaitlistPosition(client: PrismaLike) {
  const latestGuest = await client.guest.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
    where: { status: GuestStatus.WAITLISTED },
  });

  return (latestGuest?.position ?? 0) + 1;
}

export async function rebalanceWaitlistPositions(client: PrismaLike) {
  const waitlistedGuests = await client.guest.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true },
    where: { status: GuestStatus.WAITLISTED },
  });

  for (let index = 0; index < waitlistedGuests.length; index += 1) {
    const guest = waitlistedGuests[index];

    await client.guest.update({
      data: { position: index + 1 },
      where: { id: guest.id },
    });
  }
}

export function serializeSlot(slot: AvailableSlot): SlotView {
  return {
    date: slot.date.toISOString(),
    endTime: slot.endTime,
    id: slot.id,
    isBooked: slot.isBooked,
    startTime: slot.startTime,
  };
}

export function serializeGuest(guest: Guest): GuestView {
  return {
    allergies: guest.allergies,
    createdAt: guest.createdAt.toISOString(),
    email: guest.email,
    favoriteCuisines: guest.favoriteCuisines,
    id: guest.id,
    name: guest.name,
    position: guest.position,
    status: guest.status,
  };
}

export function serializeBooking(booking: BookingWithSlot): BookingView {
  return {
    createdAt: booking.createdAt.toISOString(),
    id: booking.id,
    notes: booking.notes,
    requestedDate: booking.requestedDate?.toISOString() ?? null,
    requestedTime: booking.requestedTime,
    slot: booking.slot ? serializeSlot(booking.slot) : null,
    status: booking.status,
  };
}

export function serializePendingBooking(
  booking: PendingBookingWithGuest,
): AdminPendingBookingView {
  return {
    ...serializeBooking(booking),
    guest: serializeGuest(booking.guest),
  };
}

export function serializeActiveMeal(guest: ActiveMealWithBooking): ActiveMealView {
  const latestConfirmedBooking =
    guest.bookings.find((booking) => booking.status === BookingStatus.CONFIRMED) ??
    null;

  return {
    ...serializeGuest(guest),
    booking: latestConfirmedBooking
      ? serializeBooking(latestConfirmedBooking)
      : null,
  };
}
