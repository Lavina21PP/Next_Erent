// app/not-found.tsx
"use client";

import React from "react";
import { Button, Result } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from "next/navigation";
const NotFound: React.FC = () => {
  const router = useRouter();

  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button type="primary" onClick={() => router.push("/")}>
          Back Home
        </Button>
      }
    />
  );
};

export default NotFound;
