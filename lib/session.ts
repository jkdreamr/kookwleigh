import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getIronSession, type SessionOptions, unsealData } from "iron-session";
import { env } from "@/lib/env";

export type AppSession = {
  email?: string;
  guestId?: string;
  isAdmin?: boolean;
};

export const sessionOptions: SessionOptions = {
  cookieName: "kookwleigh_session",
  password: env.sessionPassword,
  ttl: 60 * 60 * 24 * 7,
  cookieOptions: {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: env.nodeEnv === "production",
  },
};

export async function getSession() {
  return getIronSession<AppSession>(cookies(), sessionOptions);
}

export async function readSessionFromRequest(request: NextRequest) {
  const cookie = request.cookies.get(sessionOptions.cookieName)?.value;

  if (!cookie) {
    return null;
  }

  try {
    return await unsealData<AppSession>(cookie, {
      password: sessionOptions.password,
      ttl: sessionOptions.ttl,
    });
  } catch {
    return null;
  }
}

export async function requireGuestSession() {
  const session = await getSession();

  if (!session.guestId || !session.email) {
    return null;
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getSession();

  if (!session.isAdmin) {
    return null;
  }

  return session;
}
