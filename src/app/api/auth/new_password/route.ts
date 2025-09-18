import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
  create_token_reset_password,
  createAuthResponse,
  verify_token_reset_password,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const auth = await verify_token_reset_password(req);

    if (!auth.success) {
      return auth.response; // Unauthorized / Invalid token
    }

    // TypeScript รู้ว่า payload ต้องมีค่าเพราะ success === true
    const email_token = auth.payload; // ✅ ไม่มี error

    if (!email_token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: "กรอกข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    const checkUser = await prisma.user.findUnique({
      where: { email_phone: String(email_token.email_phone) },
    });

    if (!checkUser) {
      return NextResponse.json(
        { success: false, message: "ไม่มีผู้ใช้นี้ในระบบ" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: checkUser.id },
      data: { password_hash: hashedPassword },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ເກີດຂໍ້ຜິດພາດຝັ່ງ server" },
        { status: 500 }
      );
    }

    return createAuthResponse({ ...user, message: "ປ່ຽນລະຫັດຜ່ານສຳເລັດ" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "ເກີດຂໍ້ຜິດພາດຝັ່ງ server" },
      { status: 500 }
    );
  }
}
