import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { message } from "antd";

export async function POST(req: NextRequest) {
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

    const { landlord_id, email_phone } = await req.json();
    const userId = Number(userToken.id);

    if(!landlord_id || !email_phone) return NextResponse.json(
      { success: false, message: 'landlord_id or email not found' },
    );;

    let conversation = null;
    let status = "existing"; // default assume เจอห้องเก่า

    // 1) หา conversation 1-1 ที่มี userId + landlord_id
    conversation = await prisma.conversations.findFirst({
      where: {
        is_group: false,
        conversation_members: {
          every: { user_id: { in: [userId, landlord_id] } },
        },
      },
      include: { conversation_members: true },
    });

    // 2) double check จำนวนสมาชิก = 2
    if (conversation && conversation.conversation_members.length !== 2) {
      conversation = null; // ป้องกันห้อง group มาปน
    }

    if (!conversation) {
      // 3) ถ้าไม่มี → สร้างห้องใหม่
      conversation = await prisma.conversations.create({
        data: {
          is_group: false,
          conversation_members: {
            create: [
              { user_id: userId }, // tenant เห็นทันที
              { user_id: landlord_id }, // landlord รอ message แรก
            ],
          },
        },
        include: { conversation_members: true },
      });
      status = "created"; // mark ว่าเป็นห้องใหม่
    }

    // 4) Return JSON พร้อม status
    return NextResponse.json(
      { success: true, status, conversation },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
