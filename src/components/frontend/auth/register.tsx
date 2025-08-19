"use client";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Mail, Phone, User, Lock, X } from "lucide-react";
import Confirmotp from "../confirmotp/confirmotp";
import { useMessage } from "@/components/frontend/context/MessageContext";

import {
  emailValidate,
  NumberValidate,
  PhoneNumberValidate,
} from "../validate/validate";

interface TypeFormErrors {
  first_name?: string;
  last_name?: string;
  email_phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}
interface TypeForm {
  first_name: string;
  last_name: string;
  email_phone: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export default function Register() {
  //import
  //showMessagePop || library
  const { showMessage } = useMessage();

  const [formData, setFormData] = useState<TypeForm>({
    first_name: "",
    last_name: "",
    email_phone: "",
    password: "",
    confirmPassword: "",
    role: "", // เปลี่ยนค่าเริ่มต้นเป็นค่าว่าง
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<TypeFormErrors>({
    first_name: "",
    last_name: "",
    email_phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const validatedEmail = emailValidate.safeParse(formData.email_phone);
  const validatedPhoneNumber = PhoneNumberValidate.safeParse(
    formData.email_phone
  );
  const validatedNumber = NumberValidate.safeParse(formData.email_phone);

  // Use useRef to store the timer ID
  const otpTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // ล้าง error ของ field ที่แก้ไข
    setError((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): TypeFormErrors => {
    const newErrors: TypeFormErrors = {};

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = "First name must be at least 2 characters";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = "Last name must be at least 2 characters";
    }

    // email_phone validation (email or phone)
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

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role validation
    if (!formData.role) {
      // ตรวจสอบว่าไม่ได้เลือก Account Type
      newErrors.role = "Account type is required";
    }

    return newErrors;
  };
  //////////////////////////

  //sendMail
  const sendEmailForGetOtp = async () => {
    if (isLoading) return; // กันกดซ้ำ
    setIsLoading(true);

    try {
      if (validatedEmail.success) {
        const resRegister = await axios.post(
          "/api/users/create-otp-register",
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
          setShowOTP(true);
          startOtpTimer(err.response?.data.timeoutOtp);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    setError(newErrors);

    if (Object.keys(newErrors).length === 0) {
      sendEmailForGetOtp();
    }
  };

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
          Sign in to your account
        </h2>
      </div>

      {/* Form */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className={`block text-sm/6 font-medium`}
              >
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="Input Your Email or PhoneNumber"
                  value={formData.first_name}
                  onChange={handleChange}
                  autoComplete="firstname"
                  className={`border w-full rounded-md px-3 py-2 ${
                    error.first_name && "border-red-600 outline-red-600"
                  }`}
                />
              </div>
              {error.first_name && (
                <div className="k text-red-600">{error.first_name}</div>
              )}
            </div>

            <div>
              <label
                htmlFor="last_name"
                className={`block text-sm/6 font-medium`}
              >
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Input Your Email or PhoneNumber"
                  value={formData.last_name}
                  onChange={handleChange}
                  autoComplete="lastname"
                  className={`border w-full rounded-md px-3 py-2 ${
                    error.last_name && "border-red-600 outline-red-600"
                  }`}
                />
              </div>
              {error.last_name && (
                <div className="k text-red-600">{error.last_name}</div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email_phone"
              className={`block text-sm/6 font-medium`}
            >
              Email Or Phone Number
            </label>
            <div className="mt-2">
              <input
                id="email_phone"
                name="email_phone"
                type="text"
                placeholder="Input Your Email or PhoneNumber"
                value={formData.email_phone}
                onChange={handleChange}
                autoComplete="email"
                className={`border w-full rounded-md px-3 py-2 ${
                  error.email_phone && "border-red-600 outline-red-600"
                }`}
              />
            </div>
            {error.email_phone && (
              <div className="k text-red-600">{error.email_phone}</div>
            )}
          </div>

          {/* Role */}
          <div className="relative">
            <label htmlFor="role" className={`block text-sm/6 font-medium`}>
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`border w-full rounded-md px-3 py-2 ${
                error.role && "border-red-600 outline-red-600"
              }`}
            >
              <option value="" disabled>
                Select Account Type
              </option>{" "}
              {/* เพิ่ม option ที่เป็นค่าว่างและ disabled */}
              <option value="TENANT">Tenant</option>
              <option value="LANDLORD">Landlord</option>
            </select>
            {error.role && <div className="k text-red-600">{error.role}</div>}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div className="k">
              <label
                htmlFor="password"
                className={`block text-sm/6 font-medium`}
              >
                Password
              </label>
              <div>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Input Your Email or PhoneNumber"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="password"
                    className={`border w-full rounded-md px-3 py-2 ${
                      error.password && "border-red-600 outline-red-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-600 hover:text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error.password && (
                  <div className="k text-red-600">{error.password}</div>
                )}
              </div>
            </div>

            <div className="k">
              <label
                htmlFor="confirmPassword"
                className={`block text-sm/6 font-medium`}
              >
                Confirm Password
              </label>
              <div>
                <div className="mt-2 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Input Your Email or PhoneNumber"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="password"
                    className={`border w-full rounded-md px-3 py-2 ${
                      error.confirmPassword && "border-red-600 outline-red-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-600 hover:text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {error.confirmPassword && (
                  <div className="k text-red-600">{error.confirmPassword}</div>
                )}
              </div>
            </div>
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
              {isLoading ? "Loading . . ." : "Sign Up"}
            </button>
          </div>
        </form>
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

      {/* OTP Modal */}
      {showOTP && (
        <Confirmotp
          formData={formData}
          setFormData={setFormData}
          setShowOTP={setShowOTP}
          otpTimer={otpTimer}
          resendOTP={resendOTP}
          isLoading1={isLoading}
          typeOtp="createUsers"
        />
      )}
    </div>
  );
}
