import HouseRentalDetail from "@/components/frontend/tenant/detail";
import { manager_property } from "@/services/api";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{ property_id: string }>;
}

async function getData(property_id: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await manager_property.get_property({
    headers: { Cookie: cookieHeader },
    params: { property_id },
  });

  return res.data;
}

async function getReview(property_id: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await manager_property.get_review_property({
    headers: { Cookie: cookieHeader },
    params: { property_id },
  });

  return res.data;
}

export default async function Page({ params }: PageProps) {
  const { property_id } = await params;
  const data = await getData(property_id);
  const dataReview = await getReview(property_id);
  console.log("data: ", data.data);
  console.log("dataReview: ", dataReview.data);

  return (
    <div>
      <HouseRentalDetail
        initialProperty={data.data}
        initialReview={dataReview.data}
      />
    </div>
  );
}
