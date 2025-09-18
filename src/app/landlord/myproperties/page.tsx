import MyProperties from "@/components/frontend/landlord/myproperties/Myproperties";
import { manager_property } from "@/services/api";
import { cookies } from "next/headers";

async function getData() {
  // ดึง cookie ของผู้ใช้จาก request
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  // แนบ cookie ไปกับ axios
  try {
    const res = await manager_property.get_property({
      headers: { Cookie: cookieHeader },
    });

    if (!res.data.success) return null;
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Page เป็น Server Component
export default async function Page() {
  const data = await getData();
  console.log(data);

  return <div>{<MyProperties initialProperties={data.data} />}</div>;
}
