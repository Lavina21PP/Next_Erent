"use client";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRole } from "../context/RoleContext";

import { io, Socket } from "socket.io-client";
let socket: Socket;

interface Message {
  id: number;
  content: string;
  sender_id: number;
  conversation_id: number;
}

// get flash (แล้วลบทันที)
const getFlash = (key: string) => {
  const value = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  return value;
};

const Message = ({ initialChat }: { initialChat?: any }) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const conversation_id = getFlash("conversation_id");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [contact, setContact] = useState<any>(initialChat);
  const [chat, setChat] = useState<any>();
  const { id } = useRole();

  // const member = initialChat.conversation_members.find((m: any) => m.user.id === id);

  const refreshMessage = async () => {
    try {
      const res = await axios.get("/api/conversations/get", {
        withCredentials: true,
      });
      if (res.data.success) {
        setContact(res.data.data);
        return res.data.data;
      }
    } catch (error) {
      console.error("Error refreshing messages:", error);
    }
  };

  const handleChat = async (id: number) => {
    const updatedContact = await refreshMessage();
    setSelectedChat(id);
    const chat = updatedContact?.find((c: any) => c.id === id);
    setChat(chat);
    console.log('chat', chat)
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  //ฟังก์ชันเช็คว่าอยู่ล่างสุดไหม
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 50; // +50 margin
    setIsAtBottom(atBottom);
  };

useEffect(() => {
  if (isAtBottom && messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }
}, [chat]); 

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("send-message", {
      content: inputMessage,
      conversation_id: selectedChat,
    });

    setInputMessage("");
  };

  useEffect(() => {
    if (conversation_id && contact?.length > 0) {
      handleChat(Number(conversation_id));
    }
  }, [conversation_id, contact]);

  useEffect(() => {
    // connect to server
    socket = io("http://localhost:4000", {
      withCredentials: true, // ส่ง cookie (JWT) ไปด้วย
    });
    // join room conversation
    socket.emit("join-room", selectedChat);

    // รับข้อความใหม่
    socket.on("message", (msg: Message) => {
      if (msg.conversation_id === selectedChat) {
        setContact((prev: any) =>
          prev.map((conversation: any) => {
            if (conversation.id === msg.conversation_id) {
              return {
                ...conversation,
                messages: [...conversation.messages, msg],
              };
            }
            return conversation;
          })
        );

        setChat((prev: any) => ({
          ...prev,
          messages: [...prev.messages, msg],
        }));
      }
    });

    // รับ notification (จาก server สำหรับ badge)
    socket.on("new-message-notification", (msg: Message) => {
      if (msg.conversation_id !== selectedChat) {
        setContact((prev: any) =>
          prev.map((conversation: any) => {
            if (conversation.id === msg.conversation_id) {
              return {
                ...conversation,
                messages: [...conversation.messages, msg],
              };
            }
            return conversation;
          })
        );
      }
    });

    return () => {
      socket.off("message");
      socket.off("new-message-notification");
    };
  }, [selectedChat]);

  // useEffect(() => {
  //   socket = io("http://localhost:4000", {
  //     withCredentials: true,
  //   }); // connect กับ server แยก
  //   socket.on("connect", () => {
  //     console.log("connect socket successfully");
  //   });

  //   socket.on("message", (msg: string) => {
  //     console.log(msg);
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  return (
    <div>
      <div className="bg-gradient-to-br from-blue-100 to-gray-300 md:px-6">
        <div className="flex gap-4 h-[calc(100vh-64px)]">
          {/* ฝั่งซ้าย - รายชื่อ Contact List */}
          <div
            className={`${
              selectedChat == null ? "flex" : "hidden"
            } md:flex flex-col w-full md:w-[600px] gap-2 h-full overflow-y-auto py-3 px-4 md:px-1`}
          >
            <div
              className="bg-white rounded-lg p-3 shadow-sm"
              onClick={() => setSelectedChat(null)}
            >
              <h2 className="font-bold text-lg mb">Contacts</h2>
            </div>

            {contact &&
              contact.map((chat: any, index: number) => {
                return (
                  <div
                    key={index}
                    onClick={() => handleChat(chat.id)}
                    className={`flex gap-2.5 bg-white shadow-md py-2.5 px-2.5 rounded-[6px] cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat === chat.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div>
                      <img
                        className="h-14 w-14 min-w-14 rounded-[6px] border"
                        src="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"
                        alt=""
                      />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between">
                        <div className="font-bold">
                          {" "}
                          {
                            chat.conversation_members.find(
                              (m: any) => m.user.id !== id
                            ).user.email_phone
                          }{" "}
                        </div>
                        <div className="text-sm text-gray-500">12:15</div>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {chat.messages[chat.messages.length - 1]?.content ? (
                          chat.messages[chat.messages.length - 1].content
                        ) : (
                          <span className="text-gray-400">No message</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div
            className={`${
              selectedChat == null ? "hidden" : "flex"
            } md:flex flex-col w-full bg-white md:rounded-lg shadow-md md:my-3`}
          >
            {selectedChat !== null && chat ? (
              <>
                <div className="border-b px-4 py-2">
                  <div className="flex items-center gap-2">
                    <ArrowLeft
                      size={20}
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden"
                    />
                    <img
                      className="h-10 w-10 rounded-full border"
                      src="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"
                      alt=""
                    />
                    <div>
                      <h3 className="font-bold">
                        {" "}
                        {
                          chat.conversation_members.find(
                            (m: any) => m.user.id !== id
                          ).user.email_phone
                        }{" "}
                      </h3>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 pt-3 pr-3 pl-3 overflow-y-auto">
                  <div className="space-y-3">
                    {!chat.messages || chat.messages.length !== 0 ? (
                      chat.messages.map((msg: any, index: number) => (
                        <div
                          key={index}
                          className={`flex ${
                            msg.sender_id === id ? "justify-end" : ""
                          } `}
                        >
                          <div
                            className={`${
                              msg.sender_id === id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100"
                            } p-3 rounded-lg max-w-xs`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <span
                              className={`text-xs ${
                                msg.sender_id === id
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {msg.created_at}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">
                        ເລີ່ມຕົ້ນສົນທະນາໃໝ່
                      </p>
                    )}
                  </div>
                  <div ref={messagesEndRef} className="h-[1px] pb-3" />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage}>
                  <div className="border-t p-4 bg-white/50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg">Select a conversation</p>
                  <p className="text-sm">Choose a contact to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
