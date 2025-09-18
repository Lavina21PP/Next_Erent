import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createAuthResponse } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { first_name, last_name, email_phone, password, role, otp } =
      await req.json();

    if (!first_name || !last_name || !email_phone || !password || !role || !otp) {
      return NextResponse.json(
        { success: false, message: "กรอกข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    const checkUser = await prisma.user.findMany({
      where: { email_phone: email_phone },
    });

    if (checkUser.length > 0) {
      return NextResponse.json(
        { success: false, message: "มีผู้ใช้นี้แล้ว" },
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        auth_key: "111",
        email_phone,
        role: role,
        password_hash: hashedPassword,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "เกิดข้อผิดพลาดที่ server" },
        { status: 500 }
      );
    }

    await prisma.otp_verifications.updateMany({
      where: { contact: email_phone },
      data: { is_verified: true },
    });

    return createAuthResponse({...user, message: "Register Successfully"});
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดที่ server" },
      { status: 500 }
    );
  }
}
