import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { verifyAuth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

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

    const whereClause: any = {};

    if (userToken?.role == "Landlord") {
      // ถ้ามี userToken.id → search landlord_id
      whereClause.landlord_id = Number(userToken.id);
    } else if (property_id) {
      // ถ้ามี property_id → search id
      whereClause.id = Number(property_id);
    }

    // สร้าง options แบบ typed
    const queryOptions:
      | Prisma.propertyFindManyArgs
      | Prisma.propertyFindFirstArgs = {
      where: whereClause,
      orderBy: { id: Prisma.SortOrder.desc }, // ใช้ enum ของ Prisma
      include: {
        property_status: { select: { id: true, name: true } },
        property_type: { select: { id: true, name: true } },
        property_image: { select: { id: true, image: true, alt: true } },
        rating: { select: { id: true, score: true, comment: true } },
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email_phone: true,
          },
        },
        favorite: {
          select: {
            id: true,
            property_id: true,
          },
          where: {
            tenant_id: Number(userToken.id),
            property_id: property_id ? Number(property_id) : undefined,
          },
        },
      },
    };

    // เลือก function ตามมี property_id หรือไม่
    const properties = await (property_id
      ? prisma.property.findFirst(queryOptions as Prisma.propertyFindFirstArgs)
      : prisma.property.findMany(queryOptions as Prisma.propertyFindManyArgs));

    return NextResponse.json(
      { success: true, data: properties },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  function sanitizeFileName(name: string) {
    const nameWithoutExt = name.replace(/\.[^/.]+$/, "");
    return nameWithoutExt.replace(/[^a-zA-Z0-9-_ก-ฮ]+/g, "_");
  }

  async function saveFileAsWebp(file: File, uploadDir: string) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const fileNameWithoutExt = sanitizeFileName(file.name);
    const webpFileName = `${fileNameWithoutExt}_${timestamp}.webp`;
    const filePath = path.join(uploadDir, webpFileName);

    await sharp(buffer).webp({ quality: 80 }).toFile(filePath);

    // แค่เก็บชื่อไฟล์เท่านั้น
    return webpFileName;
  }

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

    const formData = await req.formData();

    const uuid = formData.get("uuid")?.toString() || "";
    const name = formData.get("name")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const village = formData.get("village")?.toString() || "";
    const district = formData.get("district")?.toString() || "";
    const province = formData.get("province")?.toString() || "";
    const price = Number(formData.get("price")?.toString() || 0);
    const status = formData.get("status");
    const property_type_id = Number(
      formData.get("property_type_id")?.toString() || 0
    );
    const latitude = formData.get("latitude")?.toString() || "";
    const longitude = formData.get("longitude")?.toString() || "";

    let name_cover_image_property =
      formData.get("name_cover_image_property")?.toString() || null;
    const name_image_property = formData.getAll(
      "name_image_property"
    ) as string[];

    if (name_cover_image_property === "null") name_cover_image_property = null;

    if (
      !uuid ||
      !name ||
      !description ||
      !village ||
      !district ||
      !province ||
      !price ||
      !status ||
      !property_type_id ||
      !latitude ||
      !longitude ||
      !name_cover_image_property
    ) {
      return NextResponse.json(
        { success: false, message: "ປ້ອນຂໍ້ມູນໃຫ້ຄົບ" },
        { status: 400 }
      );
    }

    if (userToken.role !== "Landlord") {
      return NextResponse.json(
        { success: false, message: "ສຳລັບຜູ້ປ່ອຍເຊົ່າເທົ່ານັ້ນ" },
        { status: 403 }
      );
    }

    const newProperty = await prisma.property.create({
      data: {
        uuid: uuid,
        landlord_id: Number(userToken.id),
        name,
        description,
        village: village,
        district: district,
        province: province,
        price,
        property_status_id: Number(status),
        property_type_id,
        latitude,
        longitude,
      },
    });

    const coverDir = path.join(
      process.cwd(),
      `public/uploads/coverImages/${newProperty.id}`
    );
    const imagesDir = path.join(
      process.cwd(),
      `public/uploads/propertyImages/${newProperty.id}`
    );

    if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

    if (name_cover_image_property) {
      await prisma.property.update({
        where: { id: newProperty.id },
        data: { coverImage: name_cover_image_property },
      });
    }

    const imageFileNames: string[] = [];
    for (const img of name_image_property) {
      imageFileNames.push(img);
    }

    if (imageFileNames.length > 0) {
      await prisma.property_image.createMany({
        data: imageFileNames.map((fileName) => ({
          property_id: newProperty.id,
          image: fileName,
          alt: newProperty.name,
        })),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "ເພີ່ມເຮືອນເຊົ່າສຳເລັດ!",
        data: newProperty,
      },
      { status: 201 }
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

    const formData = await req.formData();

    const name = formData.get("name")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const village = formData.get("village")?.toString() || "";
    const district = formData.get("district")?.toString() || "";
    const province = formData.get("province")?.toString() || "";
    const price = Number(formData.get("price")?.toString() || 0);
    const status = formData.get("status");
    const property_type_id = Number(
      formData.get("property_type_id")?.toString() || 0
    );
    const latitude = formData.get("latitude")?.toString() || "";
    const longitude = formData.get("longitude")?.toString() || "";

    let name_cover_image_property = formData.get("name_cover_image_property")?.toString() || null;
    const name_image_property = formData.getAll(
      "name_image_property"
    ) as string[];

    if (name_cover_image_property === "null") name_cover_image_property = null;

    if (
      !name ||
      !description ||
      !village ||
      !district ||
      !province ||
      !price ||
      !status ||
      !property_type_id ||
      !latitude ||
      !longitude ||
      !name_cover_image_property
    ) {
      return NextResponse.json(
        { success: false, message: "ປ້ອນຂໍ້ມູນໃຫ້ຄົບ" },
        { status: 400 }
      );
    }

    if (userToken.role !== "Landlord") {
      return NextResponse.json(
        { success: false, message: "ສຳລັບຜູ້ປ່ອຍເຊົ່າເທົ່ານັ້ນ" },
        { status: 403 }
      );
    }

    const property_id = req.nextUrl.searchParams.get("property_id");

    if (!property_id) {
      return NextResponse.json(
        { success: false, message: "property_id is required" },
        { status: 400 }
      );
    }

    const idNum = Number(property_id);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { success: false, message: "Invalid property_id" },
        { status: 400 }
      );
    }

    const check_property = await prisma.property.findUnique({
      where: {
        id: idNum,
      },
    });

    if (!check_property) {
      return NextResponse.json(
        { success: false, message: "ບໍ່ພົບເຮືອນເຊົ່າ" },
        { status: 404 }
      );
    }

    // 3️⃣ ดึง property ของ landlord จาก database
    const property = await prisma.property.update({
      where: {
        id: idNum,
      },
      data: {
        landlord_id: Number(userToken.id),
        name,
        description,
        village: village,
        district: district,
        province: province,
        price,
        property_status_id: Number(status),
        property_type_id,
        latitude,
        longitude,
      },
    });
    

    console.log(typeof(name_cover_image_property));
    

    if (name_cover_image_property) {
      console.log("aaaaa1", name_cover_image_property);
    } else {
      console.log("aaaaa2", name_cover_image_property);
    }


    if (name_cover_image_property && name_cover_image_property.trim() !== "") {
      await prisma.property.update({
        where: { id: property.id },
        data: { coverImage: name_cover_image_property },
      });
    }

    if (name_image_property.length >= 0) {
      await prisma.$transaction([
        prisma.property_image.deleteMany({
          where: {
            property_id: idNum,
          },
        }),
        prisma.property_image.createMany({
          data: name_image_property.map((fileName) => ({
            property_id: idNum,
            image: fileName,
            alt: property.name,
          })),
        }),
      ]);
    }

    return NextResponse.json(
      {
        success: true,
        message: "ແກ້ໄຂສຳເລັດ!",
        data: property,
      },
      { status: 201 }
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

    // 3️⃣ อ่านค่า property_id จาก query
    const property_id = req.nextUrl.searchParams.get("property_id");
    if (!property_id) {
      return NextResponse.json(
        { success: false, message: "Missing property_id" },
        { status: 400 }
      );
    }

    const idNum = Number(property_id);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { success: false, message: "Invalid property_id" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: idNum },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: "ບໍ່ພົບເຮືອນເຊົ່າ" },
        { status: 404 }
      );
    }

    // 4️⃣ ลบจาก DB
    const result = await prisma.property.delete({
      where: { id: idNum },
    });

    return NextResponse.json(
      { success: true, data: result, message: "ລົບເຮືອນເຊົ່າສຳເລັດ!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
