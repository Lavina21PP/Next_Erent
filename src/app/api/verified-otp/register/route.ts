import { NextRequest, NextResponse } from "next/server";
import { user_role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

    // 4. สร้าง Response + set cookie HttpOnly
    return NextResponse.json(
      { success: true, message: "OTP verified" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
