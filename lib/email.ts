import { Resend } from "resend";
import { env } from "@/lib/env";

type EmailTemplate = {
  ctaHref?: string;
  ctaLabel?: string;
  details?: string[];
  headline: string;
  preview: string;
  subject: string;
  text: string;
  to: string;
  isHostEmail?: boolean;
};

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;
// NOTE: Change this to your verified Resend domain, e.g. "kookwleigh <hello@kookwleigh.com>"
// The onboarding@resend.dev address only works for testing to your own Resend account email.
const fromAddress = "kookwleigh <onboarding@resend.dev>";
const hostEmail = "joskoo@stanford.edu";

function renderEmailTemplate({
  ctaHref,
  ctaLabel,
  details = [],
  headline,
  preview,
  text,
  isHostEmail = false,
}: Omit<EmailTemplate, "subject" | "to">) {
  const detailMarkup = details
    .map(
      (detail) =>
        `<li style="margin:0 0 10px;color:#3f3a35;line-height:1.7;">${detail}</li>`,
    )
    .join("");

  const ctaMarkup =
    ctaHref && ctaLabel
      ? `<a href="${ctaHref}" style="display:inline-block;margin-top:24px;padding:13px 24px;border-radius:999px;background:#5f7f6f;color:#fffaf1;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.01em;">${ctaLabel}</a>`
      : "";

  const signOff = isHostEmail
    ? ""
    : `<p style="margin:32px 0 0;color:#716b61;font-size:14px;line-height:1.8;border-top:1px solid rgba(24,23,19,0.08);padding-top:24px;">Warmly,<br/><strong style="color:#181713;">Josh and Leigh</strong></p>`;

  return `
  <div style="background:#f7f1e6;padding:48px 20px;font-family:Inter,Arial,sans-serif;color:#181713;">
    <div style="max-width:600px;margin:0 auto;background:#fffaf1;border:1px solid rgba(24,23,19,0.08);border-radius:20px;padding:40px 36px;box-shadow:0 20px 60px -30px rgba(24,23,19,0.35);">
      <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#a09890;">kookwleigh</p>
      <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:32px;line-height:1.1;color:#181713;">${headline}</h1>
      <p style="margin:0;color:#47423d;font-size:15px;line-height:1.9;">${preview}</p>
      ${detailMarkup ? `<ul style="margin:24px 0 0 0;padding:0 0 0 18px;">${detailMarkup}</ul>` : ""}
      ${ctaMarkup}
      <p style="margin:28px 0 0;color:#716b61;font-size:14px;line-height:1.8;">${text}</p>
      ${signOff}
    </div>
  </div>`;
}

async function sendEmail(template: EmailTemplate) {
  const html = renderEmailTemplate(template);

  if (!resend) {
    console.log("[email-fallback]", {
      subject: template.subject,
      text: template.text,
      to: template.to,
    });
    return;
  }

  try {
    await resend.emails.send({
      from: fromAddress,
      html,
      subject: template.subject,
      text: template.text,
      to: template.to,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

// ─────────────────────────────────────────────────────────────
// HOST NOTIFICATION HELPERS
// ─────────────────────────────────────────────────────────────

async function notifyHost({
  ctaHref,
  ctaLabel,
  details,
  headline,
  preview,
  subject,
  text,
}: Omit<EmailTemplate, "to" | "isHostEmail">) {
  await sendEmail({
    ctaHref,
    ctaLabel,
    details,
    headline,
    isHostEmail: true,
    preview,
    subject,
    text,
    to: hostEmail,
  });
}

// ─────────────────────────────────────────────────────────────
// GUEST EMAILS
// ─────────────────────────────────────────────────────────────

export async function sendWaitlistConfirmationEmail({
  email,
  name,
  position,
}: {
  email: string;
  name: string;
  position: number;
}) {
  await sendEmail({
    details: [
      `You are #${position} in line.`,
      "We will reach out personally when it is your turn to book.",
    ],
    headline: "You are on the list.",
    preview: `Welcome, ${name}. We cannot wait to have you at our table.`,
    subject: "You are on the kookwleigh waitlist",
    text: "We look forward to hosting you soon.",
    to: email,
  });
}

export async function sendInviteEmail(email: string) {
  await sendEmail({
    ctaHref: `${env.appUrl}/dashboard`,
    ctaLabel: "Choose a date",
    details: [
      "Log in with this email to see available dates and request a booking.",
      "If none of the open slots work, you can suggest your own night.",
    ],
    headline: "It is your turn to book.",
    preview: "We are ready to host you — pick a date and we will confirm shortly.",
    subject: "Your kookwleigh invitation is ready",
    text: "We look forward to seeing you soon.",
    to: email,
  });
}

export async function sendBookingConfirmedEmail({
  dateLabel,
  email,
  timeLabel,
}: {
  dateLabel: string;
  email: string;
  timeLabel: string;
}) {
  await sendEmail({
    ctaHref: `${env.appUrl}/dashboard`,
    ctaLabel: "View your dinner",
    details: [
      `<strong>Date:</strong> ${dateLabel}`,
      `<strong>Time:</strong> ${timeLabel}`,
      "If anything changes on your end, you can cancel from your dashboard and we will follow up.",
    ],
    headline: "Your dinner is confirmed.",
    preview: `We are looking forward to having you on ${dateLabel} at ${timeLabel}.`,
    subject: "Your kookwleigh dinner is confirmed",
    text: `We are so excited to have you. See you on ${dateLabel} at ${timeLabel}.`,
    to: email,
  });
}

export async function sendBookingDeclinedEmail(email: string) {
  await sendEmail({
    ctaHref: `${env.appUrl}/dashboard`,
    ctaLabel: "Choose another time",
    details: [
      "That particular window did not quite work on our end.",
      "Head back to your dashboard to pick from the available slots or suggest a different night.",
    ],
    headline: "Let us find another time.",
    preview: "That request did not work out, but we would still love to have you.",
    subject: "Let us find another kookwleigh dinner time",
    text: "Please choose another date and we will confirm as soon as possible.",
    to: email,
  });
}

export async function sendHostCancelledEmail({
  dateLabel,
  email,
  timeLabel,
}: {
  dateLabel: string;
  email: string;
  timeLabel: string;
}) {
  await sendEmail({
    ctaHref: `${env.appUrl}/dashboard`,
    ctaLabel: "Return to your dashboard",
    details: [
      `We have had to cancel your dinner on ${dateLabel} at ${timeLabel}.`,
      "We are so sorry for the inconvenience.",
      "We have moved you to the front of the waitlist — you will be the first we reach out to for the next available dinner.",
    ],
    headline: "We had to cancel — we are sorry.",
    preview: "Something came up on our end and we have had to cancel your dinner. We are truly sorry.",
    subject: "Your kookwleigh dinner has been cancelled",
    text: "We apologise for the short notice and will be in touch very soon to reschedule.",
    to: email,
  });
}

export async function sendGuestCancelledGuestEmail(email: string) {
  await sendEmail({
    ctaHref: `${env.appUrl}/dashboard`,
    ctaLabel: "Rebook a date",
    details: [
      "Your cancellation has been noted and your slot has been freed up.",
      "You are still on our list as an invited guest — head back to your dashboard to choose a new date whenever you are ready.",
    ],
    headline: "Booking cancelled.",
    preview: "No worries at all — life happens. We would still love to have you over.",
    subject: "Your kookwleigh booking has been cancelled",
    text: "We hope to see you soon. Come back and book a new date whenever you are ready.",
    to: email,
  });
}

export async function sendDinnerCompleteEmail(email: string) {
  await sendEmail({
    details: [
      "It was such a pleasure having you at our table.",
      "We hope you enjoyed everything.",
      "If you would ever like to come again, you are always welcome to rejoin the waitlist from your dashboard.",
    ],
    headline: "Thank you for joining us.",
    preview: "It was a wonderful evening — we hope you had as much fun as we did.",
    subject: "Thank you for dinner",
    text: "We hope to see you again soon.",
    to: email,
  });
}

// ─────────────────────────────────────────────────────────────
// HOST NOTIFICATION EMAILS
// ─────────────────────────────────────────────────────────────

export async function notifyHostNewSignup({
  name,
  email,
  position,
}: {
  name: string;
  email: string;
  position: number;
}) {
  await notifyHost({
    ctaHref: `${env.appUrl}/admin`,
    ctaLabel: "Open admin",
    details: [`Name: ${name}`, `Email: ${email}`, `Waitlist position: #${position}`],
    headline: "New guest on the waitlist.",
    preview: `${name} just joined the kookwleigh waitlist.`,
    subject: `New signup — ${name}`,
    text: `${name} (${email}) is now #${position} on the waitlist.`,
  });
}

export async function notifyHostBookingRequested({
  guestName,
  guestEmail,
  dateLabel,
  timeLabel,
  notes,
}: {
  guestName: string;
  guestEmail: string;
  dateLabel: string;
  timeLabel: string;
  notes?: string | null;
}) {
  await notifyHost({
    ctaHref: `${env.appUrl}/admin`,
    ctaLabel: "Review in admin",
    details: [
      `Guest: ${guestName} (${guestEmail})`,
      `Requested: ${dateLabel} at ${timeLabel}`,
      notes ? `Note: "${notes}"` : "No additional notes.",
    ],
    headline: "A guest has requested a booking.",
    preview: `${guestName} has submitted a booking request.`,
    subject: `Booking request — ${guestName}`,
    text: `${guestName} (${guestEmail}) has requested a dinner on ${dateLabel} at ${timeLabel}. Head to the admin panel to confirm or decline.`,
  });
}

export async function notifyHostBookingConfirmed({
  guestName,
  guestEmail,
  dateLabel,
  timeLabel,
}: {
  guestName: string;
  guestEmail: string;
  dateLabel: string;
  timeLabel: string;
}) {
  await notifyHost({
    ctaHref: `${env.appUrl}/admin`,
    ctaLabel: "View in admin",
    details: [
      `Guest: ${guestName} (${guestEmail})`,
      `Date: ${dateLabel}`,
      `Time: ${timeLabel}`,
    ],
    headline: "Booking confirmed.",
    preview: `You confirmed ${guestName}'s dinner — all set.`,
    subject: `Booking confirmed — ${guestName}`,
    text: `${guestName} (${guestEmail}) is now scheduled for ${dateLabel} at ${timeLabel}.`,
  });
}

export async function notifyHostGuestCancelled({
  guestName,
  guestEmail,
  dateLabel,
  timeLabel,
}: {
  guestName: string;
  guestEmail: string;
  dateLabel: string;
  timeLabel: string;
}) {
  await notifyHost({
    ctaHref: `${env.appUrl}/admin`,
    ctaLabel: "Open admin",
    details: [
      `${guestName} (${guestEmail}) cancelled their confirmed booking.`,
      `The slot on ${dateLabel} at ${timeLabel} has been freed up.`,
      "They are back in the invited pool and can rebook.",
    ],
    headline: "A guest cancelled their booking.",
    preview: `${guestName} cancelled their upcoming dinner.`,
    subject: `Booking cancelled by guest — ${guestName}`,
    text: `${guestName} (${guestEmail}) cancelled their booking for ${dateLabel} at ${timeLabel}.`,
  });
}

export async function notifyHostDinnerComplete({
  guestName,
  guestEmail,
}: {
  guestName: string;
  guestEmail: string;
}) {
  await notifyHost({
    ctaHref: `${env.appUrl}/admin`,
    ctaLabel: "Open admin",
    details: [`Guest: ${guestName} (${guestEmail})`],
    headline: "Dinner marked complete.",
    preview: `You marked ${guestName}'s dinner as complete.`,
    subject: `Dinner complete — ${guestName}`,
    text: `${guestName} (${guestEmail})'s dinner has been marked complete.`,
  });
}

/** @deprecated use notifyHostGuestCancelled */
export async function sendBookingCancelledEmail({
  dateLabel,
  email,
  timeLabel,
}: {
  dateLabel: string;
  email: string;
  timeLabel: string;
}) {
  // Keeping for backwards compat — routes now call sendHostCancelledEmail directly
  await sendHostCancelledEmail({ dateLabel, email, timeLabel });
}

/** @deprecated kept for backwards compat */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendWaitlistRemovedEmail(_email: string) {
  // No-op: replaced by sendDinnerCompleteEmail and sendHostCancelledEmail
}

/** @deprecated kept for backwards compat */
export async function sendGuestCancelledEmail({
  guestEmail,
  guestName,
}: {
  guestEmail: string;
  guestName: string;
}) {
  // Handled via notifyHostGuestCancelled now — this shim avoids breaking old callers
  await notifyHostGuestCancelled({
    dateLabel: "their scheduled dinner",
    guestEmail,
    guestName,
    timeLabel: "",
  });
}
