// This proxy runs in Edge Runtime - DO NOT import any modules that use Prisma
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Protect /readings routes (except /readings/share/* which are public)
  if (
    request.nextUrl.pathname.startsWith("/readings") &&
    !request.nextUrl.pathname.startsWith("/readings/share")
  ) {
    // Check for NextAuth session cookie directly (no Prisma/DB access in Edge Runtime)
    // NextAuth v5 uses different cookie names depending on environment
    const sessionToken =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value ||
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const signInUrl = new URL("/auth/signin", request.url);
      // Add redirect parameter to return user to the page they tried to access
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match /readings routes (except /readings/share/* which are public)
     * Exclude:
     * - api routes
     * - static files
     * - image optimization files
     * - favicon
     */
    "/readings/:path*",
  ],
};

