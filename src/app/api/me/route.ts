// /app/api/me/route.ts
import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/env";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.json({ role: null }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });

    return NextResponse.json({ role: payload.role });
  } catch (err) {
    return NextResponse.json({ role: null }, { status: 401 });
  }
}
