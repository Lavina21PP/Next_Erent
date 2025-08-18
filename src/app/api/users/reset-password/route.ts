// app/api/reset-password/route.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    const { password } = await req.json(); // ต้อง parse json ก่อน

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token-reset-password")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, secret);
    const { email_phone } = payload as { email_phone: string };

    const password_hash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email_phone },
      data: { password_hash },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reset Password Successfully!",
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
