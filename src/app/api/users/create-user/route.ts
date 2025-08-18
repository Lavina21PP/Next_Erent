import { NextRequest, NextResponse } from "next/server";
import { user_role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { JWT_SECRET } from "@/lib/env";
import { SignJWT } from "jose";

interface TypeUser {
  first_name: string;
  last_name: string;
  email_phone: string;
  role: user_role;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { first_name, last_name, email_phone, role, password }: TypeUser =
      body;

    if (!first_name || !last_name || !email_phone || !role || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const verified = await prisma.otp_verifications.findFirst({
      where: {
        contact: email_phone,
        is_verified: true,
        expires_at: { gt: new Date() }, // ต้องยังไม่หมดอายุ
      },
      orderBy: { id: "desc" },
    });

    if (!verified) {
      return NextResponse.json(
        { success: false, message: "Please Verification Otp" },
        { status: 409 }
      );
    }

    const checkUser = await prisma.user.findUnique({
      where: { email_phone },
    });

    if (checkUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    // hash password
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email_phone,
        password_hash,
        auth_key: "",
        status: 10,
        role,
        created_at: 7878,
        updated_at: 6556,
      },
    });

    const secret = new TextEncoder().encode(JWT_SECRET);

        // ✅ ตัดสินใจว่าจะ redirect ไปหน้าไหน
    let redirectUrl = "/";
    if (newUser.role === "ADMIN") redirectUrl = "/admin";
    if (newUser.role === "LANDLORD") redirectUrl = "landlord/myproperties";
    if (newUser.role === "TENANT") redirectUrl = "/tenant";

    const res = NextResponse.json(
      { success: true, message: "Create Token", redirect: redirectUrl },
      { status: 201 }
    );
    const token = await new SignJWT({
      id: newUser.id,
      email_phone: newUser.email_phone,
      role: newUser.role,
    }) //payload
      .setProtectedHeader({ alg: "HS256" }) // <-- กำหนด algorithm ให้ชัดเจน
      .setIssuedAt()
      .setExpirationTime("3h")
      .sign(secret);

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
        { status: 201, headers: res.headers }
      );
    }

    return res;

    return NextResponse.json(
      {
        success: true,
        message: "User Uegistered successfully",
        user_id: newUser.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
