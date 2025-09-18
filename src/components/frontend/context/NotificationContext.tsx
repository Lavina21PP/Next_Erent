'use client'
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

interface Message {
  id: number;
  content: string;
  conversation_id: number;
  sender_id: number;
  detail_sender: any;
}

interface NotificationContextType {
  notifications: Message[];
  clearNotification: (conversationId: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Message[]>([]);
  const socket = getSocket();

  useEffect(() => {
    const handleNotification = (msg: Message) => {
      setNotifications([msg]);
    };

    socket.on("new-message-notification", handleNotification);

    return () => {
      socket.off("new-message-notification", handleNotification);
    };
  }, [socket]);

  const clearNotification = (conversationId: number) => {
    setNotifications((prev) => prev.filter((msg) => msg.conversation_id !== conversationId));
  };

  return (
    <NotificationContext.Provider value={{ notifications, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
