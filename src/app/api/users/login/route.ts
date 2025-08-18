// app/api/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { JWT_SECRET } from "@/lib/env";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    const { email_phone, password } = await req.json();

    if (!email_phone || !password) {
      return NextResponse.json(
        { success: false, message: "Email/Phone and Password are required" },
        { status: 400 }
      );
    }

    // หา user จาก DB
    const user = await prisma.user.findUnique({
      where: { email_phone },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // เช็ครหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(JWT_SECRET);

    // ✅ ตัดสินใจว่าจะ redirect ไปหน้าไหน
    let redirectUrl = "/";
    if (user.role === "ADMIN") redirectUrl = "/admin";
    if (user.role === "LANDLORD") redirectUrl = "landlord/myproperties";
    if (user.role === "TENANT") redirectUrl = "/tenant";

    const token = await new SignJWT({
      id: user.id,
      email_phone: user.email_phone,
      role: user.role,
    }) //payload
      .setProtectedHeader({ alg: "HS256" }) // <-- กำหนด algorithm ให้ชัดเจน
      .setIssuedAt()
      .setExpirationTime("3h")
      .sign(secret);

    const res = NextResponse.json(
      { success: true, message: "Create Token", redirect: redirectUrl },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ใช้ secure เฉพาะโปรดักชัน
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 3,
    });
    // เพิ่ม token สำหรับ dev ใน body
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { ...res.body, success: true, message: "Create Token", redirect: redirectUrl },
        { status: 200, headers: res.headers }
      );
    }

    return res;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
