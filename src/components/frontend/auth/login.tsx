"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  emailValidate,
  NumberValidate,
  PhoneNumberValidate,
} from "@/components/frontend/validate/validate";
import { NextResponse } from "next/server";
import axios from "axios";
import { useMessage } from "../context/MessageContext";
import { useRouter } from "next/navigation";

interface TypeFormData {
  email_phone: string;
  password: string;
}
interface TypeFormDataError {
  email_phone?: string;
  password?: string;
}
export default function Login() {
  const { showMessage } = useMessage();
  const router = useRouter();

  const [formData, setFormData] = useState<TypeFormData>({
    email_phone: "",
    password: "",
  });
  const [error, setError] = useState<TypeFormDataError>({
    email_phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validatedEmail = emailValidate.safeParse(formData.email_phone);
  const validatedPhoneNumber = PhoneNumberValidate.safeParse(
    formData.email_phone
  );
  const validatedNumber = NumberValidate.safeParse(formData.email_phone);

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // ล้าง error ของ field ที่แก้ไข
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    const newErrors: TypeFormDataError = {};

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
    }

    return newErrors;
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const resLogin = await axios.post(
        "/api/users/login",
        { email_phone: formData.email_phone, password: formData.password },
        { headers: { "Content-Type": "application-json" } }
      );
      if (resLogin.data.success) {
        showMessage("success", "Login Successfully!");
        console.log(resLogin.data)
        router.replace(resLogin.data.redirect);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
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
      login();
    }
  };

  return (
    <>
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

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email_phone"
                className={`block text-sm/6 font-medium`}
              >
                Email | Phone Number
              </label>
              <div className="mt-2">
                <input
                  id="email_phone"
                  name="email_phone"
                  type="text"
                  placeholder="Input Your Email or PhoneNumber"
                  value={formData.email_phone}
                  onChange={handleChange}
                  autoComplete="email_phone"
                  className={`border w-full rounded-md px-3 py-2 ${
                    error.email_phone && "border-red-600 outline-red-600"
                  }`}
                />
              </div>
              {error.email_phone && (
                <div className="k text-red-600">{error.email_phone}</div>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className={`block text-sm/6 font-medium`}
                >
                  Password
                </label>
                <div className="text-sm">
                  <a
                    href="/forgot-password"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  placeholder="Input Your Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={`border w-full rounded-md px-3 py-2 ${
                    error.password && "border-red-600 outline-red-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error.password && (
                <div className="k text-red-600">{error.password}</div>
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
                {isLoading ? "Loading . . ." : "Sign In"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm ">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
