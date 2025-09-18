import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createAuthResponse } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email_phone, password } = await req.json();

    if (!email_phone || !password) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกอีเมล/เบอร์โทร และรหัสผ่าน" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email_phone },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    return createAuthResponse({...user, message: "Login Successfully"});
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดที่ server" },
      { status: 500 }
    );
  }
}
