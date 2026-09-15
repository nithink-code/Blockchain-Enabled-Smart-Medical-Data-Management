import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protect dashboard and hospital workspace routes
  if (!isLoggedIn) {
    if (pathname.startsWith("/dashboard") || (pathname.startsWith("/hospital") && !pathname.startsWith("/hospital/login"))) {
      const signInUrl = new URL("/sign-in", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/hospital/:path*",
  ],
};
