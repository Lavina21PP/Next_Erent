"use client";
import React, { createContext, useContext } from "react";
import { message } from "antd";

type MessageContextType = {
  showMessage: (type: "success" | "error" | "info" | "warning", text: string) => void;
};

const MsgContext = createContext<MessageContextType | null>(null);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const showMessage = (type: "success" | "error" | "info" | "warning", text: string) => {
    messageApi.open({
      type,
      content: text,
    });
  };

  return (
    <MsgContext.Provider value={{ showMessage }}>
      {contextHolder}
      {children}
    </MsgContext.Provider>
  );
};

export const useMessage = () => {
  const ctx = useContext(MsgContext);
  if (!ctx) throw new Error("useMessage must be used inside MessageProvider");
  return ctx;
};
