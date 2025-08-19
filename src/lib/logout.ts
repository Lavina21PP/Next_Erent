// src/lib/logout.ts
"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMessage } from "@/components/frontend/context/MessageContext";

export function useLogout() {
  const router = useRouter();
  const { showMessage } = useMessage();

  async function logout() {
    try {
      const resSignOut = await axios.post("/api/logout/", {
        headers: { "Content-Type": "application/json" },
      });
      if (resSignOut) {
        showMessage("success", "You have been signed out.");
        router.replace("/login");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data.message) {
          showMessage("error", err.response.data.message);
        }
      } else {
        console.error("Unknown error:", err);
      }
    }
  }
  return logout;
}
