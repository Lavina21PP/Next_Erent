"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/api";
import { useMessage } from "./context/MessageContext";
import { Eye, EyeOff } from "lucide-react";
// Define the shape of the form data
interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Define the shape of the validation errors
interface Errors {
  email?: string;
  password?: string;
}

// Define the shape of the message box state
interface Message {
  text: string;
  type: "success" | "error" | "";
}

export default function LoginComponent() {
  const { showMessage } = useMessage();
  const router = useRouter();
  // State to manage form data
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  // State to manage validation errors
  const [errors, setErrors] = useState<Errors>({});
  // State for loading indicator
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State for custom message box
  const [message, setMessage] = useState<Message>({ text: "", type: "" });

  // Function to handle input changes and clear errors on interaction
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear the error for the field being edited
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const login = await AuthService.login({
        email_phone: formData.email,
        password: formData.password,
      });

      if (!login) return;

      showMessage("success", login.data.message);
      setFormData({ email: "", password: "", rememberMe: false });
      router.replace(login.data.redirect);
    } catch (err: any) {
      if (!err.response.data.message) return;
      showMessage("error", err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const newErrors: Errors = {};

    // Simple validation
    if (!formData.email) {
      newErrors.email = "ກະລຸນາປ້ອນອີເມວ";
    }
    if (!formData.password) {
      newErrors.password = "ກະລຸນາປ້ອນລະຫັດຜ່ານ";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    login();
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-8">
          ເຂົ້າສູ່ລະບົບ
        </h1>

        {/* Custom message box */}
        {message.text && (
          <div
            className={`p-3 rounded-md mb-4 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email field with associated label */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ອີເມວ ຫຼື ເບີໂທລະສັບ
              </label>
              <input
                type="text"
                id="email" // Added id to link with label
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="ປ້ອນອີເມວ"
                required
              />
              {errors.email && (
                <p className="text-sm text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password field with associated label */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ລະຫັດຜ່ານ
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  placeholder="ປ້ອນລະຫັດຜ່ານ"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-rose-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe" // Added id to link with label
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-sky-500 focus:ring-sky-400 border-slate-300 rounded"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-slate-700"
                >
                  ຈື່ຂ້ອຍໄວ້
                </label>
              </div>
              <a
                href="/forgot-password"
                className="text-sm text-sky-600 hover:text-sky-500"
              >
                ລືມລະຫັດຜ່ານ?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 text-white py-2 px-4 rounded-md font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-slate-600">
            ຍັງບໍ່ມີບັນຊີ?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-sky-600 hover:text-sky-500 font-medium"
            >
              ສ້າງບັນຊີໃໝ່
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
