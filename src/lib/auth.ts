import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { message } from "antd";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!; // ตรวจสอบว่ามีค่า

export async function createAuthResponse(user: {
  id: string | number | null;
  message: string;
}) {
  if (!user.id)
    return NextResponse.json(
      { success: false, message: "User ID missing" },
      { status: 400 }
    );

  const secret = new TextEncoder().encode(JWT_SECRET);

  const userDB = await prisma.user.findFirst({
    where: { id: Number(user.id) },
    orderBy: { id: "desc" },
    include: {
      role_user_roleTorole: {
        select: { id: true, name: true },
      },
    },
  });

  if (!userDB)
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );

  const roleName = userDB.role_user_roleTorole?.name;

  // กำหนด redirect ตาม role
  let redirectUrl = "/";
  if (roleName === "Admin") redirectUrl = "/admin";
  if (roleName === "Landlord") redirectUrl = "/landlord/myproperties";
  if (roleName === "Tenant") redirectUrl = "/tenant/properties";

  // สร้าง token
  const token = await new SignJWT({
    id: user.id,
    email_phone: userDB.email_phone,
    first_name: userDB.first_name,
    last_name: userDB.last_name,
    role: roleName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("3h")
    .sign(secret);

  // สร้าง response
  const res = NextResponse.json(
    {
      success: true,
      token,
      message: user.message || "Verify Successfully",
      redirect: redirectUrl,
    },
    { status: 201 }
  );

  // set cookie
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 3,
  });

  return res;
}

export async function create_token_reset_password(user: {
  email_phone: string | null;
  message: string;
}) {
  const secret = new TextEncoder().encode(JWT_SECRET);

  // กำหนด redirect ตาม role
  let redirectUrl = "/reset-password";
  // สร้าง token
  const token = await new SignJWT({
    email_phone: user.email_phone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("3m")
    .sign(secret);

  // สร้าง response
  const res = NextResponse.json(
    {
      success: true,
      token,
      message: user.message || "Verify Successfully",
      redirect: redirectUrl,
    },
    { status: 201 }
  );

  // set cookie
  res.cookies.set("token-reset-password", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 3,
  });

  return res;
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyAuth(req: Request) {
  // 1️⃣ อ่าน token จาก cookie
  const token = (req as any).cookies?.get("token")?.value;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  // 2️⃣ ตรวจสอบ token
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return { success: true, payload };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      ),
    };
  }
}

export async function verify_token_reset_password(req: Request) {
  // 1️⃣ อ่าน token จาก cookie
  const token = (req as any).cookies?.get("token-reset-password")?.value;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  // 2️⃣ ตรวจสอบ token
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return { success: true, payload };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "Invalid token-reset-password" },
        { status: 401 }
      ),
    };
  }
}
