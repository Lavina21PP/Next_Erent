import axios from "axios";

// ฟังก์ชันนี้ fetch role จาก API และ return role หรือ null
export async function getRole(): Promise<string | null> {
  try {
    const res = await axios.get("/api/me");
    return res.data.role ?? null;
  } catch (err) {
    console.error("Failed to fetch role", err);
    return null;
  }
}
