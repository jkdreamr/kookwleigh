import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readSessionFromRequest } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = await readSessionFromRequest(request);

  if (pathname.startsWith("/admin") && !session?.isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (pathname.startsWith("/dashboard") && !session?.guestId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
