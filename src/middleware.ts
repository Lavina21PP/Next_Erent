// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { JWT_SECRET } from "@/lib/env";
import { jwtVerify } from "jose";

export const config = {
  matcher: [
    "/",
    "/reset-password",
    "/admin/:path*",
    "/landlord/:path*",
    "/tenant/:path*"
  ],
};

async function checkAuth(token: string | undefined, req: NextRequest) {
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });

    const role = payload.role as string | undefined;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/admin") && role !== "Admin") {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    if (pathname.startsWith("/landlord") && role !== "Landlord") {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    if (pathname.startsWith("/tenant") && role !== "Tenant") {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

async function checkReset(token: string | undefined, req: NextRequest) {
  if (!token) {
    return NextResponse.redirect(new URL("/forgot-password", req.url));
  }
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/forgot-password", req.url));
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/reset-password")) {
    return checkReset(req.cookies.get("token-reset-password")?.value, req);
  }

  return checkAuth(req.cookies.get("token")?.value, req);
}
