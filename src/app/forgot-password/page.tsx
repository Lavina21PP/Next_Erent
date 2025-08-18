"use client";
import { useEffect, useRef, useState } from "react";
import {
  NumberValidate,
  PhoneNumberValidate,
  emailValidate,
} from "@/components/frontend/validate/validate";
import Confirmotp from "@/components/frontend/confirmotp/confirmotp";
import axios from "axios";
import { useMessage } from "@/components/frontend/context/MessageContext";

export default function ForgotPassword() {
  interface TypeFormData {
    email_phone: string;
  }
  interface TypeError {
    email_phone?: any;
  }
  const { showMessage } = useMessage();
  const [formData, setFormData] = useState<TypeFormData>({
    email_phone: "",
  });
  const [error, setError] = useState<TypeError>({
    email_phone: "",
  });
  const [showOTP, setShowOTP] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const otpTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validatedEmail = emailValidate.safeParse(formData.email_phone);
  const validatedPhoneNumber = PhoneNumberValidate.safeParse(
    formData.email_phone
  );
  const validatedNumber = NumberValidate.safeParse(formData.email_phone);

  const startOtpTimer = (time = 60) => {
    setOtpTimer(time);
    // Clear any existing timer before starting a new one
    if (otpTimerRef.current) {
      clearInterval(otpTimerRef.current);
    }

    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          otpTimerRef.current = null; // Clear the ref
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    otpTimerRef.current = timer; // Store the timer ID in ref
  };
  const resendOTP = () => {
    if (otpTimer === 0) {
      sendEmailForGetOtp();
    }
  };

  const validateForm = () => {
    const newErrors: { email_phone?: string } = {};

    if (!formData.email_phone.trim()) {
      newErrors.email_phone = "Email or phone number is required";
    } else if (validatedNumber.success) {
      // ถ้าเป็นเบอร์โทร
      if (validatedPhoneNumber.error) {
        newErrors.email_phone = validatedPhoneNumber.error.issues[0]?.message;
      }
    } else {
      // ถ้าไม่ใช่เบอร์ ก็ตรวจอีเมล
      if (validatedEmail.error) {
        newErrors.email_phone = validatedEmail.error.issues[0]?.message;
      }
    }

    console.log(newErrors);
    return newErrors;
  };

  const sendEmailForGetOtp = async () => {
    if (isLoading) return; // กันกดซ้ำ
    setIsLoading(true);

    try {
      if (validatedEmail.success) {
        const resRegister = await axios.post(
          "/api/users/create-otp-forgot-password",
          {
            email_phone: formData.email_phone,
          },
          { headers: { "Content-Type": "application/json" } }
        );
        if (resRegister.data.success) {
          const data = resRegister.data;
          setShowOTP(true);
          startOtpTimer(data.startOtpTimer);
          showMessage("success", "Verification code sent successfully.");
        }
      } else {
        showMessage("warning", "ລໍຖ້າເບີກ່ອນ");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data.timeoutOtp) {
          startOtpTimer(err.response?.data.timeoutOtp);
          setShowOTP(true);
        }
        if (err.response?.data.message) {
          showMessage("error", err.response.data.message);
        }
      } else {
        console.error("Unknown error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // ล้าง error ของ field ที่แก้ไข
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    setError(newErrors);
    if (Object.keys(newErrors).length === 0) {
      sendEmailForGetOtp();
    }
  };

  // Cleanup effect: clear timer if component unmounts
  useEffect(() => {
    return () => {
      if (otpTimerRef.current) {
        clearInterval(otpTimerRef.current);
        otpTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="t2logo.png"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
          Forgot Password
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="k">
            <label
              htmlFor="email_phone"
              className={`block text-sm/6 font-medium`}
            >
              Email | Phone Number
            </label>
            <div className="k mt-2">
              <input
                id="email_phone"
                name="email_phone"
                type="text"
                value={formData.email_phone}
                onChange={handleChange}
                placeholder="Enter your Email or Phone Number"
                className={`border w-full rounded-md px-3 py-2 ${
                  error.email_phone && "border-red-600 outline-red-600"
                }`}
              />
            </div>
            {error.email_phone && (
              <div className="k text-red-600">{error.email_phone}</div>
            )}
          </div>
          {/* Submit Button */}
          <div>
            <button
              disabled={isLoading}
              type="submit"
              className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white
              ${isLoading ? "bg-gray-400" : "bg-indigo-500 hover:bg-indigo-400"}
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
              `}
            >
              {isLoading ? "Loading . . ." : "Get OTP"}
            </button>
          </div>
        </form>
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>

      {showOTP && (
        <Confirmotp
          formData={formData}
          setFormData={setFormData}
          setShowOTP={setShowOTP}
          otpTimer={otpTimer}
          resendOTP={resendOTP}
          isLoading1={isLoading}
          typeOtp="resetPassword"
        />
      )}
    </div>
  );
}
