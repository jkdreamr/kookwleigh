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
}: Omit<EmailTemplate, "subject" | "to">) {
  const detailMarkup = details
    .map(
      (detail) =>
        `<li style="margin:0 0 10px;color:#3f3a35;line-height:1.7;">${detail}</li>`,
    )
    .join("");

  const ctaMarkup =
    ctaHref && ctaLabel
      ? `<a href="${ctaHref}" style="display:inline-block;margin-top:24px;padding:13px 20px;border-radius:999px;background:#5f7f6f;color:#fffaf1;text-decoration:none;font-weight:650;">${ctaLabel}</a>`
      : "";

  return `
  <div style="background:#f7f1e6;padding:40px 20px;font-family:Inter,Arial,sans-serif;color:#181713;">
    <div style="max-width:620px;margin:0 auto;background:rgba(255,250,241,0.9);border:1px solid rgba(24,23,19,0.08);border-radius:22px;padding:38px 32px;box-shadow:0 24px 70px -42px rgba(24,23,19,0.45);">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#716b61;">kookwleigh</p>
      <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:34px;line-height:1.08;letter-spacing:0;">${headline}</h1>
      <p style="margin:0;color:#47423d;line-height:1.8;">${preview}</p>
      ${detailMarkup ? `<ul style="margin:24px 0 0 18px;padding:0;">${detailMarkup}</ul>` : ""}
      ${ctaMarkup}
      <p style="margin:28px 0 0;color:#716b61;font-size:14px;line-height:1.7;">${text}</p>
    </div>
  </div>`;
}

async function sendEmail(template: EmailTemplate) {
  const html = renderEmailTemplate(template);

  if (!resend) {
    console.log("[email-fallback]", {
      html,
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
    console.error("Failed to send email with Resend:", error);
  }
}

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
      `${name}, you are officially on the dinner list.`,
      `Your current place in line is #${position}.`,
    ],
    headline: "Welcome to the kookwleigh table.",
    preview: `You are #${position} in line for a future dinner with Josh and Leigh.`,
    subject: "Welcome to the kookwleigh table",
    text: `You are #${position} in line. We will let you know when it is time to book.`,
    to: email,
  });
}

export async function sendInviteEmail(email: string) {
  await sendEmail({
    ctaHref: `${env.appUrl}/login`,
    ctaLabel: "Pick a date",
    details: [
      "Josh and Leigh are ready to host you.",
      `Log in at ${env.appUrl}/login with this email to claim a dinner slot.`,
    ],
    headline: "It is your turn to book.",
    preview: "Josh and Leigh are ready to host you.",
    subject: "It is your turn to book with kookwleigh",
    text: `Josh and Leigh are ready to host you. Log in at ${env.appUrl}/login with this email to pick a date.`,
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
    details: [`Dinner date: ${dateLabel}`, `Dinner time: ${timeLabel}`],
    headline: "Your dinner is set.",
    preview: `See you on ${dateLabel} at ${timeLabel}.`,
    subject: "Your kookwleigh dinner is confirmed",
    text: `Your dinner is set for ${dateLabel} at ${timeLabel}. See you soon.`,
    to: email,
  });
}

export async function sendBookingDeclinedEmail(email: string) {
  await sendEmail({
    ctaHref: `${env.appUrl}/dashboard`,
    ctaLabel: "Choose another time",
    details: [
      "That request does not work on our side.",
      "Please log back in and choose another available slot or suggest a new time.",
    ],
    headline: "Let us find another time.",
    preview: "That request does not work. Please choose another.",
    subject: "Please choose another kookwleigh dinner time",
    text: "That time does not work. Please pick another.",
    to: email,
  });
}

export async function sendBookingCancelledEmail({
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
    ctaLabel: "Rejoin waitlist",
    details: [
      `Your scheduled dinner on ${dateLabel} at ${timeLabel} has been cancelled.`,
      "We apologize for the inconvenience. You can rejoin the waitlist from your dashboard.",
    ],
    headline: "Your dinner has been cancelled.",
    preview: `Your dinner on ${dateLabel} at ${timeLabel} has been cancelled.`,
    subject: "Your kookwleigh dinner has been cancelled",
    text: `Your scheduled dinner has been cancelled. We apologize for the inconvenience.`,
    to: email,
  });
}

export async function sendGuestCancelledEmail({
  guestEmail,
  guestName,
}: {
  guestEmail: string;
  guestName: string;
}) {
  await sendEmail({
    ctaHref: `${env.appUrl}/admin`,
    ctaLabel: "Open admin",
    details: [
      `${guestName} (${guestEmail}) has cancelled their confirmed booking.`,
      "The slot has been freed up automatically.",
      "They have been moved back to invited status and can rebook.",
    ],
    headline: "A guest cancelled their booking.",
    preview: `${guestName} cancelled their dinner.`,
    subject: `Booking cancelled — ${guestName}`,
    text: `${guestName} (${guestEmail}) cancelled their confirmed booking. The slot is now open again.`,
    to: hostEmail,
  });
}

export async function sendWaitlistRemovedEmail(email: string) {
  await sendEmail({
    ctaHref: `${env.appUrl}/login`,
    ctaLabel: "Rejoin waitlist",
    details: [
      "You have been removed from the waitlist.",
      "You can rejoin the waitlist at any time from your dashboard.",
    ],
    headline: "Removed from waitlist.",
    preview: "You have been removed from the waitlist.",
    subject: "Removed from kookwleigh waitlist",
    text: "You have been removed from the waitlist. You can rejoin at any time.",
    to: email,
  });
}
