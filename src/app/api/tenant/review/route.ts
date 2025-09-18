import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify, SignJWT } from "jose";
import { verifyAuth } from "@/lib/auth";
import { message } from "antd";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

interface TypeReview {
  score: number;
  comment: string;
  property_id: number;
}

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

    const { score, comment }: TypeReview = await req.json();
    const property_id = req.nextUrl.searchParams.get("property_id");

    if (!score || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newRating = await prisma.rating.create({
      data: {
        property_id: Number(property_id),
        tenant_id: Number(userToken.id),
        score,
        comment,
      },
    });
    return NextResponse.json(
      { success: true, data: newRating, message: "Create Successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

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

    const property_id = req.nextUrl.searchParams.get("property_id");

    const dataRating = await prisma.rating.findMany({
      where: {
        property_id: Number(property_id),
      },
      orderBy: {
        id: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email_phone: true,
          },
        },
      },
    });
    return NextResponse.json(
      { success: true, data: dataRating, message: "Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

    const { score, comment }: TypeReview = await req.json();
    const property_id = req.nextUrl.searchParams.get("property_id");

    if (!score || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const getRating = await prisma.rating.findFirst({
      where: {
        property_id: Number(property_id),
        tenant_id: Number(userToken.id),
      },
    });

    if (!getRating) {
      return NextResponse.json(
        { success: false, message: "Rating not found" },
        { status: 404 }
      );
    }

    const editRating = await prisma.rating.update({
      where: {
        id: getRating.id,
      },
      data: {
        score,
        comment,
      },
    });

    return NextResponse.json(
      { success: true, data: editRating, message: "Edit Successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const property_id = req.nextUrl.searchParams.get("property_id");

    if (!property_id) {
      return NextResponse.json(
        { success: false, message: "Property NotFound" },
        { status: 401 }
      );
    }

    const getRating = await prisma.rating.findFirst({
      where: {
        property_id: Number(property_id),
        tenant_id: Number(userToken.id),
      },
    });

    if (!getRating) {
      return NextResponse.json(
        { success: false, message: "Rating not found" },
        { status: 404 }
      );
    }

    const editRating = await prisma.rating.delete({
      where: {
        id: getRating.id,
      },
    });

    return NextResponse.json(
      { success: true, data: editRating, message: "Delete Successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
