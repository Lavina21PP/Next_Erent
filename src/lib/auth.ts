// src/lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export type Role = "TENANT" | "LANDLORD" | "ADMIN";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signAuthToken(payload: {
  id: number;
  email_phone: string;
  role: Role;
}, expiresIn: string = "7d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

// อ่าน cookie + verify (ใช้ได้ทั้ง API route และ Server Component)
export async function getAuth() {
  // บางโปรเจกต์ TS จะบ่นเรื่องประเภท ให้ใส่ await ถ้าจำเป็น: const jar = await cookies();
  const jar = await cookies();
  const token = jar.get("auth-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    // payload: { id, email_phone, role, iat, exp }
    return payload as { id: number; email_phone: string; role: Role };
  } catch {
    return null;
  }
}

// ใช้เช็คสิทธิ์แบบรวดเร็ว
export function allowRole(user: { role: Role } | null, roles: Role[]) {
  return !!user && roles.includes(user.role);
}
