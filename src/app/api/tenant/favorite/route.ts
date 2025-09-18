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

    // if (userToken.role !== "TENANT") {
    //   return NextResponse.json(
    //     { success: false, message: "This endpoint is for tenants only" },
    //     { status: 403 }
    //   );
    // }
    const property_id = req.nextUrl.searchParams.get("property_id");

    console.log("pp", property_id);
    if (!property_id) {
      return NextResponse.json(
        { success: false, message: "Missing property_id" },
        { status: 400 }
      );
    }

    const propertyId = Number(property_id);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { success: false, message: "Invalid property_id" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        tenant_id: Number(userToken.id),
        property_id: propertyId,
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      return NextResponse.json(
        {
          success: true,
          message: "Property removed from favorites",
          data: false,
        },
        { status: 200 }
      );
    } else {
      await prisma.favorite.create({
        data: {
          tenant_id: Number(userToken.id),
          property_id: propertyId,
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Property added to favorites", data: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
