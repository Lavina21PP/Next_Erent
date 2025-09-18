import Message from "@/components/frontend/message/message";
import axios from "axios";
import { cookies } from "next/headers";


async function getData() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await axios.get(
    `http://localhost:3000/api/conversations/get`,
    {
      headers: { Cookie: cookieHeader },
    }
  );

  return res.data;
}

// Page เป็น Server Component
export default async function Page() {
  const data = await getData();
  console.log("message: ", data.data);
  return <div>
    <Message initialChat={data.data} />
  </div>;
}
