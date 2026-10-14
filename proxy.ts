import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  const isLoggedIn = !!session?.user;

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const isAdminRoute = pathname.startsWith("/admin");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/evaluation") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/reports") ||
    isAdminRoute;

  // User is not logged in and tries to access a protected page
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // User is already logged in and tries to access login/register
  if (isLoggedIn && isAuthPage) {
    if (session.user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Logged-in non-admin user tries to access admin
  if (isAdminRoute && isLoggedIn && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/evaluation/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/reports/:path*",
    "/admin/:path*",
  ],
};
