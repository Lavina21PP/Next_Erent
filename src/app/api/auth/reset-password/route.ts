import { NextResponse } from "next/server";
import { generateNumber } from "@/components/backend/models/random_number";
import { sendEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  const startimeOut = 60;

  try {
    const { email_phone } = await req.json();

    if (!email_phone) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์" },
        { status: 400 }
      );
    }

    // สร้าง OTP 6 หลัก
    const otp = generateNumber(6);

    const user = await prisma.user.findMany({
      where: { email_phone: email_phone },
    });

    if (user.length < 1) {
      return NextResponse.json(
        { success: false, message: "ยังไม่มีผู้ใช้นี้ในระบบ" },
        { status: 409 }
      );
    }

    //หา OTP ล่าสุด
    const lastOtp = await prisma.otp_verifications.findFirst({
      where: { contact: email_phone, is_verified: false },
      orderBy: { created_at: "desc" },
    });

    if (lastOtp?.created_at) {
      const now = new Date();
      const diffSec = (now.getTime() - lastOtp.created_at.getTime()) / 1000;

      if (diffSec < startimeOut) {
        return NextResponse.json(
          { success: true, timeoutOtp: Math.ceil(startimeOut - diffSec) },
          { status: 201 }
        );
      }
    }

    try {
      await sendEmail({
        to: email_phone,
        subject: "Your OTP Code",
        text: `Your OTP code for reset password is ${otp}`,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { success: false, message: "ไม่สามารถส่งอีเมลได้" },
        { status: 500 }
      );
    }

    await prisma.otp_verifications.deleteMany({
      where: {
        contact: email_phone,
        is_verified: false,
      },
    });

    const expiresAt = new Date(Date.now() + 1000 * 30);
    await prisma.otp_verifications.create({
      data: {
        contact: email_phone,
        otp_code: otp,
        expires_at: expiresAt,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Send Otp Successfully",
        otp,
        startimeOut,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดที่ server" },
      { status: 500 }
    );
  }
}
