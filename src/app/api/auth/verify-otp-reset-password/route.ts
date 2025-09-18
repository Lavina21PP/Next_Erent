import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { create_token_reset_password, createAuthResponse } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email_phone, otp } = await req.json();

    if (!email_phone || !otp ) {
      return NextResponse.json(
        { success: false, message: "กรอกข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    const checkUser = await prisma.user.findFirst({
      where: { email_phone: email_phone },
    });

    if (!checkUser) {
      return NextResponse.json(
        { success: false, message: "ไม่มีผู้ใช้นี้ในระบบ" },
        { status: 409 }
      );
    }

    const verified = await prisma.otp_verifications.findFirst({
      where: {
        contact: email_phone,
        otp_code: otp,
        is_verified: false,
        expires_at: { gt: new Date() }, // ต้องยังไม่หมดอายุ
      },
      orderBy: { id: "desc" },
    });

    if (!verified) {
      return NextResponse.json(
        { success: false, message: "OTP ไม่ถูกต้องหรือหมดอายุ" },
        { status: 400 }
      );
    }

    await prisma.otp_verifications.updateMany({
      where: { contact: email_phone },
      data: { is_verified: true },
    });

    return create_token_reset_password({email_phone, message: "Verification Successfully"});
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดที่ server" },
      { status: 500 }
    );
  }
}
