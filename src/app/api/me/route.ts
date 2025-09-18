// /app/api/me/route.ts
import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token)
    return NextResponse.json(
      {
        id: null,
        role: null,
        first_name: null,
        last_name: null,
        email_phone: null,
      },
      { status: 401 }
    );

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const user = await prisma.user.findUnique({
      where: {
        id: Number(payload.id),
      },
      include: {
        role_user_roleTorole: {
          // ใช้ชื่อ relation field ที่อยู่ใน schema
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if(!user) return;

    return NextResponse.json({
      id: user.id ?? null,
      role: user.role_user_roleTorole?.name ?? null,
      email_phone: user.email_phone ?? null,
      first_name: user.first_name ?? null,
      last_name: user.last_name ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      {
        id: null,
        role: null,
        first_name: null,
        last_name: null,
        email_phone: null,
      },
      { status: 401 }
    );
  }
}
