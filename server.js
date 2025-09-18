// server.ts
import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import { jwtVerify } from "jose";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: "http://localhost:3000", credentials: true },
});

app.use(cookieParser());
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// JWT middleware
io.use(async (socket, next) => {
  const token = socket.handshake.headers.cookie
    ?.split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return next(new Error("No token"));

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    socket.data.user = payload;
    next();
  } catch (err) {
    console.error("JWT verify failed:", err);
    next(new Error("Invalid token"));
  }
});

io.on("connection", async (socket) => {
  console.log("New client:", socket.id, socket.data.user);

  const userId = Number(socket.data.user.id);

  // --- ให้ user join ทุก conversation ที่เขาอยู่ ---
  const userConversations = await prisma.conversation_members.findMany({
    where: { user_id: userId },
    select: { conversation_id: true },
  });

  userConversations.forEach((c) => {
    socket.join(c.conversation_id.toString());
  });

  console.log(
    `User ${userId} joined rooms: ${userConversations
      .map((c) => c.conversation_id)
      .join(", ")}`
  );

  // ส่งข้อความ
  socket.on("send-message", async (msg) => {
    try {
      if (!msg.content || !msg.conversation_id) {
        return socket.emit("error", "ข้อมูลไม่ครบ");
      }

      const saved = await prisma.messages.create({
        data: {
          content: msg.content,
          conversation_id: msg.conversation_id,
          sender_id: userId,
        },
      });

      // broadcast message ไปทุกคนใน room
      io.to(msg.conversation_id.toString()).emit("message", saved);

      // --- ส่ง notification แยก user (ถ้าอยากทำ badge) ---
      const members = await prisma.conversation_members.findMany({
        where: {
          conversation_id: msg.conversation_id,
          user_id: { not: userId },
        },
        select: { user_id: true },
      });

      members.forEach((m) => {
        io.to(`user-${m.user_id}`).emit("new-message-notification", {
          ...saved,
          detail_sender: socket.data.user,
        });
      });
    } catch (err) {
      console.error(err);
      socket.emit("error", "ไม่สามารถส่งข้อความได้");
    }
  });

  // --- join room เฉพาะ user id สำหรับ notification ---
  socket.join(`user-${userId}`);

  // disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(4000, () => {
  console.log("Socket.IO server running on port 4000");
});
