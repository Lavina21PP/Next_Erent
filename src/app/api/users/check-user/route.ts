import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email_phone } = body;

    if (!email_phone) {
      return NextResponse.json(
        { success: false, message: "Missing email or phone" },
        { status: 400 }
      );
    }

    const checkEmailUser = await prisma.user.findFirst({
      where: { email_phone },
      orderBy: { id: "desc" },
    });

    if (!checkEmailUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User exists" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
