"use client";
import { useParams } from "next/navigation";
import React from "react";

function Page() {
  const { houseId } = useParams();
  return <div>Page</div>;
}

export default Page;
