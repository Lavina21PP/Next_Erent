import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ อ่าน token จาก cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    let decoded: any;
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      decoded = payload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
    const property_status = await prisma.property_status.findMany();

    return NextResponse.json(
      { success: true, data: property_status },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
