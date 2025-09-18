import HouseRentalDetail from "@/components/frontend/tenant/detail";
import { manager_property } from "@/services/api";
import axios from "axios";
import { cookies } from "next/headers";

async function getData(propertyId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await manager_property.get_property({
    headers: { Cookie: cookieHeader },
    params: { propertyId },
  });

  return res.data;
}

// 👈 Corrected type definition
type PageProps = {
  params: Promise<{ houseId: string }>;
};

// Page is a Server Component
export default async function Page({ params }: PageProps) {
  // 👈 Await the params object
  const { houseId } = await params;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await manager_property.get_property({
    headers: { Cookie: cookieHeader },
    params: { property_id: houseId },
  });

  const data = res.data;

  // return <HouseRentalDetail initialProperty={data.data} />;
}
