import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);

    if (!auth.success) {
      return auth.response; // Unauthorized / Invalid token
    }

    // TypeScript รู้ว่า payload ต้องมีค่าเพราะ success === true
    const userToken = auth.payload; // ✅ ไม่มี error

    if (!userToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let conversations;

    if (userToken.role === "Tenant") {
      // tenant เห็นหมด แม้ยังไม่มี message
      conversations = await prisma.conversations.findMany({
        where: {
          conversation_members: { some: { user_id: Number(userToken.id) } },
        },
        include: {
          messages: { orderBy: { id: "asc" } },
          conversation_members: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  email_phone: true,
                },
              },
            },
          },
        },
      });
    } else if (userToken.role === "Landlord") {
      // landlord เห็นเฉพาะห้องที่มีข้อความแล้ว
      conversations = await prisma.conversations.findMany({
        where: {
          conversation_members: { some: { user_id: Number(userToken.id) } },
          messages: { some: {} },
        },
        include: {
          messages: { orderBy: { id: "asc" } },
          conversation_members: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  email_phone: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(
      { success: true, data: conversations },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
