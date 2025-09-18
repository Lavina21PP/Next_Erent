"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "./context/MessageContext";
import { X } from "lucide-react";
import { AuthService } from "@/services/api";

// Define the shape of the form data for OTP verification
interface FormData {
  otp: string;
}

// Define the shape of the validation errors
interface Errors {
  otp?: string;
}

interface TypeProp {
  close_verify_otp: () => void;
  dataUser: any;
  startimeOut: number;
  sendOtp: () => Promise<void | number>;
  is_reset_password?: boolean;
}

export default function VerifyOTPComponent({
  close_verify_otp,
  dataUser,
  startimeOut,
  sendOtp,
  is_reset_password,
}: TypeProp) {
  const router = useRouter();
  const { showMessage } = useMessage();

  // State to manage form data for the OTP
  const [formData, setFormData] = useState<FormData>({
    otp: "",
  });
  // State to manage validation errors
  const [errors, setErrors] = useState<Errors>({});
  // State for loading indicator
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for the countdown timer, starts at 5 seconds
  const [timeLeft, setTimeLeft] = useState<number>(startimeOut);

  // useEffect hook to manage the countdown timer
  useEffect(() => {
    console.log(startimeOut);
    // If time is 0 or less, or we're loading, don't do anything
    if (timeLeft <= 0) return;

    // Set up the interval to tick down every second
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup function to clear the interval when the component unmounts
    // or when the dependencies (timeLeft, isLoading) change

    return () => {
      clearInterval(timerId);
    };
  }, [timeLeft]);

  // Function to handle input changes and clear errors on interaction
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    // Allow only digits
    const sanitizedValue = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Clear the error for the field being edited
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Function to handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const newErrors: Errors = {};

    // Simple validation: check if OTP is not empty and has a specific length (e.g., 6 digits)
    if (!formData.otp) {
      newErrors.otp = "ກະລຸນາປ້ອນ OTP";
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "ລະຫັດ OTP ຕ້ອງມີ 6 ຫຼັກ";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log(is_reset_password);
      let resVerifyOtp;
      if (is_reset_password) {
        resVerifyOtp = await AuthService.verify_otp_reset_password({
          email_phone: dataUser.email_phone,
          otp: formData.otp,
        });
      } else {
        resVerifyOtp = await AuthService.verify_otp_register({
          first_name: dataUser.firstName,
          last_name: dataUser.lastName,
          email_phone: dataUser.email_phone,
          password: dataUser.password,
          role: Number(dataUser.role),
          otp: formData.otp,
        });
      }

      if (!resVerifyOtp) return;

      showMessage("success", "ຢືນຢັນ OTP ສຳເລັດ");
      setFormData({ otp: "" });

      router.replace(resVerifyOtp.data.redirect);
    } catch (err: any) {
      if (!err.response.data.message) return;
      showMessage("error", err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    const newTimeout = await sendOtp();
    setTimeLeft(Number(newTimeout));
    setIsLoading(false);
    setFormData({ otp: "" });
    showMessage("success", "ສົ່ງລະຫັດ OTP ໃໝ່...");
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center p-4 fixed top-0 left-0 right-0 button-0">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 w-full max-w-md relative">
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-8">
          ຢືນຢັນລະຫັດ OTP
        </h1>
        <p className="text-center text-sm text-slate-600 mb-6">
          ເຮົາໄດ້ສົ່ງລະຫັດຢືນຢັນໄປທີ່ອີເມວ ຫຼື ເບີໂທລະສັບທ່ານແລ້ວ
          ກະລຸນາຢືນຢັນລະຫັດເພື່ອດຳເນີນການຕໍ່
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* OTP field */}
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ລະຫັດ OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                maxLength={6}
                value={formData.otp}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-center text-lg tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="000000"
                required
              />
              {errors.otp && (
                <p className="text-sm text-rose-500 mt-1">{errors.otp}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 text-white py-2 px-4 rounded-md font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "ກຳລັງຢືນຢັນ..." : "ຢືນຢັນ"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center flex justify-between">
          <div className="text-sm text-slate-600"></div>
          {/* Resend button with countdown */}
          {timeLeft > 0 ? (
            <p className="text-sm text-slate-600">
              ສົ່ງລະຫັດໃໝ່ອີກຄັ້ງ{" "}
              <span className="font-semibold">{timeLeft}</span> ວິນາທີ
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-sky-600 hover:text-sky-500 font-medium disabled:text-slate-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "ກຳລັງສົ່ງລະຫັດ OTP ໃໝ່..." : "ຂໍລະຫັດ OTP ໃໝ່"}
            </button>
          )}
        </div>
        <div className="k absolute right-3 top-3">
          <X onClick={close_verify_otp} className="text-red-600" />
        </div>
      </div>
    </div>
  );
}
