import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Next.js 16 "proxy" (formerly middleware.ts).
 * Refreshes Supabase auth cookies and guards /dashboard and /profile.
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip static assets, images and the AniList search API (no auth needed there)
    "/((?!_next/static|_next/image|favicon.ico|api/search|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
