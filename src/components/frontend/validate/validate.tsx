import { z } from "zod";

export const emailValidate = z
  .string()
  .regex(/^\S+@\S+\.\S+$/, "Invalid Email");

export const PhoneNumberValidate = z
  .string()
  .min(9, "Invalid PhoneNumber")
  .max(10, "Invalid PhoneNumber")
  .regex(/^\d+$/, "Phone number must contain only digits")
  .refine((num) => {
    if (num.length < 3) return false; // ต้องมี prefix + digit ถัดไป
    const prefix2 = num.slice(0, 2); // "20" หรือ "30"
    const nextDigit = num[2]; // 1 หลักถัดไป

    // ตรวจ prefix
    if (prefix2 !== "20" && prefix2 !== "30") return false;

    // ตรวจ digit ถัดไป ต้องเป็น 5,2,7,9
    return ["5", "2", "7", "9"].includes(nextDigit);
  }, "Invalid PhoneNumber");

export const NumberValidate = z
  .string()
  .regex(/^\d+$/, "This Not Number");
