"use client";
import React from "react";
import axios from "axios";

function Page() {
  const generateOTP = (length = 6) => {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  };

  //sendMail
  const sendEmail = async ({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) => {
    try {
      const res = await axios.post("/api/send-email", { to, subject, text });
      console.log(res.data);
    } catch (error: any) {
      console.error(
        "Error sending email:",
        error.response?.data || error.message
      );
    }
  };

  const handleSend = () => {
    const otp = generateOTP(6); // สร้าง OTP ใหม่ทุกครั้ง
    sendEmail({
      to: "vinakasi777@gmail.com",
      subject: "Hello From Next Erent!",
      text: `Your OTP: ${otp}`,
    });
  };

  return (
    <div>
      <button
        onClick={handleSend}
        className="bg-amber-700 px-4 py-2 text-white rounded"
      >
        Send Mail
      </button>
    </div>
  );
}

export default Page;
