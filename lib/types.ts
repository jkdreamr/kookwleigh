export type GuestStatus = "WAITLISTED" | "INVITED" | "SCHEDULED" | "COMPLETED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type SlotView = {
  date: string;
  endTime: string;
  id: string;
  isBooked: boolean;
  startTime: string;
};

export type BookingView = {
  createdAt: string;
  id: string;
  notes: string | null;
  requestedDate: string | null;
  requestedTime: string | null;
  slot: SlotView | null;
  status: BookingStatus;
};

export type GuestView = {
  allergies: string | null;
  createdAt: string;
  email: string;
  favoriteCuisines: string | null;
  id: string;
  name: string;
  position: number;
  status: GuestStatus;
};

export type DashboardResponse = {
  availableSlots: SlotView[];
  booking: BookingView | null;
  guest: GuestView;
};

export type ActiveMealView = GuestView & {
  booking: BookingView | null;
};

export type AdminGuestsResponse = {
  activeMeals: ActiveMealView[];
  waitlisted: GuestView[];
};

export type AdminPendingBookingView = BookingView & {
  guest: GuestView;
};

export type AdminBookingsResponse = {
  pending: AdminPendingBookingView[];
};

export type AdminSlotsResponse = {
  slots: SlotView[];
};
