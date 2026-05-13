import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

export const signupSchema = z.object({
  allergies: z.string().trim().max(500).optional().default(""),
  email: emailSchema,
  favoriteCuisines: z.string().trim().max(500).optional().default(""),
  name: z.string().trim().min(2, "Name is required.").max(120),
});

export const loginSchema = z.object({
  email: emailSchema,
});

export const updateGuestSchema = z.object({
  allergies: z.string().trim().max(500).optional().default(""),
  favoriteCuisines: z.string().trim().max(500).optional().default(""),
  name: z.string().trim().min(2, "Name is required.").max(120),
});

export const bookingRequestSchema = z
  .object({
    notes: z.string().trim().max(500).optional().default(""),
    requestedDate: z.string().trim().optional(),
    requestedTime: z
      .string()
      .trim()
      .regex(timePattern, "Use HH:MM time format.")
      .optional(),
    slotId: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.slotId) {
      return;
    }

    if (!value.requestedDate || !value.requestedTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Choose an available slot or provide both a requested date and time.",
        path: ["requestedDate"],
      });
    }
  });

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

export const inviteSchema = z.object({
  guestId: z.string().trim().min(1),
});

export const slotSchema = z.object({
  date: z.string().trim().min(1, "Date is required."),
  endTime: z
    .string()
    .trim()
    .regex(timePattern, "Use HH:MM time format for the end time."),
  startTime: z
    .string()
    .trim()
    .regex(timePattern, "Use HH:MM time format for the start time."),
});

export const deleteSlotSchema = z.object({
  slotId: z.string().trim().min(1),
});

export const adminBookingSchema = z.object({
  action: z.enum(["approve", "decline", "cancel"]),
  bookingId: z.string().trim().min(1),
});

export const completeGuestSchema = z.object({
  guestId: z.string().trim().min(1),
  requeue: z.boolean().optional().default(false),
});
