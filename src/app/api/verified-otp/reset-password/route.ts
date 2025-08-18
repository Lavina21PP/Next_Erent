import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JWT_SECRET } from "@/lib/env";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email_phone, otp_code } = body;

    if (!email_phone || !otp_code) {
      return NextResponse.json(
        { success: false, message: "Missing email or OTP" },
        { status: 400 }
      );
    }

    const checkOtp = await prisma.otp_verifications.findFirst({
      where: {
        contact: email_phone,
        otp_code,
        expires_at: { gte: new Date() },
      },
      orderBy: { created_at: "desc" },
    });

    if (!checkOtp) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    await prisma.otp_verifications.update({
      where: { id: checkOtp.id }, // ต้องระบุ unique field เช่น id
      data: {
        is_verified: true,
      },
    });

    const secret = new TextEncoder().encode(JWT_SECRET);

    const res = NextResponse.json(
      { success: true, message: "Create Token" },
      { status: 200 }
    );
    const token = await new SignJWT({ email_phone: email_phone }) //payload
      .setProtectedHeader({ alg: "HS256" }) // <-- กำหนด algorithm ให้ชัดเจน
      .setIssuedAt()
      .setExpirationTime("3m")
      .sign(secret);

    res.cookies.set("token-reset-password", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ใช้ secure เฉพาะโปรดักชัน
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 3,
    });
    // เพิ่ม token สำหรับ dev ใน body
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { ...res.body, message: "Create Token", success: true },
        { status: 200, headers: res.headers }
      );
    }

    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
