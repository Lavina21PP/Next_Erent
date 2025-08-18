import { NextRequest, NextResponse } from "next/server";
import { user_role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

interface TypeUser {
  first_name: string;
  last_name: string;
  email_phone: string;
  role: user_role;
  password: string;
}
const generateOTP = (length = 6) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

export async function POST(req: NextRequest) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // เช่น smtp.gmail.com
    port: 465, // 465 สำหรับ SSL, 587 สำหรับ TLS
    secure: true, // true = ใช้ SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const body = await req.json();

    const { email_phone }: TypeUser =
      body;
    const otp = generateOTP(6);
    const startimeOut = 60;

    if ( !email_phone ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const checkUser = await prisma.user.findFirst({
      where: { email_phone },
      orderBy: { id: "desc" },
    });

    if (checkUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    //หา OTP ล่าสุด
    const lastOtp = await prisma.otp_verifications.findFirst({
      where: { contact: email_phone },
      orderBy: { created_at: "desc" },
    });

    if (lastOtp?.created_at) {
      const now = new Date();
      const diffSec = (now.getTime() - lastOtp.created_at.getTime()) / 1000;

      if (diffSec < startimeOut) {
        return NextResponse.json(
          { timeoutOtp: Math.ceil(startimeOut - diffSec) },
          { status: 429 }
        );
      }
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // หมดอายุใน 5 นาที
    const createOtp = await prisma.otp_verifications.create({
      data: {
        contact: email_phone,
        otp_code: otp,
        expires_at: expiresAt,
      },
    });
    if (createOtp) {
      //send-otp
      await transporter.sendMail({
        from: `<${process.env.SMTP_USER}>`,
        to: email_phone,
        subject: "Next Erent",
        text: `Your Otp: ${otp}`,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Send Otp Successfully", startimeOut }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
