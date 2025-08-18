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
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={() => router.push("/")}>
          Back Home
        </Button>
      }
    />
  );
};

export default NotFound;
