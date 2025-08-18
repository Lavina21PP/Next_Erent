// src/lib/env.ts
if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables");
}

export const JWT_SECRET = process.env.JWT_SECRET;
