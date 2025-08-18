// app/api/send-email/route.ts
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { to, subject, text } = await req.json();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // เช่น smtp.gmail.com
    port: 465, // 465 สำหรับ SSL, 587 สำหรับ TLS
    secure: true, // true = ใช้ SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `<${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    return new Response(JSON.stringify({ message: "Send Email Successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error Sending Email" }), {
      status: 500,
    });
  }
}
