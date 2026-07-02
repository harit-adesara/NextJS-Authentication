import { NextResponse } from "next/server";
// import { jwtVerify } from "jose";

export async function middleware(request) {
  try {
    const { pathname } = request.nextUrl;

    const token =
      request.cookies.get("accessToken")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (pathname === "/") {
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const authRoutes = [
      "/login",
      "/signup",
      "/forgot-password",
      "/resend-email",
      "/reset-password",
    ];

    const isAuthPage = authRoutes.some((route) => pathname.startsWith(route));

    const isProtectedPage =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/chat") ||
      pathname.startsWith("/notification");

    if (isProtectedPage && !token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (err) {
    console.log("MIDDLEWARE ERROR:", err.message);
    return NextResponse.next();
  }
}
