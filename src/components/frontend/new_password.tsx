"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "./context/MessageContext";
import { AuthService } from "@/services/api";
import { Eye, EyeOff } from "lucide-react";

// Define the shape of the form data
interface FormData {
  newPassword: string;
  confirmPassword: string;
}

// Define the shape of the validation errors
interface Errors {
  newPassword?: string;
  confirmPassword?: string;
}

// Define the shape of the message box state
interface Message {
  text: string;
  type: "success" | "error" | "";
}

export default function NewPasswordComponent() {
  const router = useRouter();
  const { showMessage } = useMessage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    newPassword: "",
    confirmPassword: "",
  });
  // State to manage validation errors
  const [errors, setErrors] = useState<Errors>({});
  // State for loading indicator
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State for custom message box
  const [message, setMessage] = useState<Message>({ text: "", type: "" });

  // Function to handle input changes for all fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for the field being edited
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const reset_password = async () => {
    setIsLoading(true);
    try {
      let set_password;
      set_password = await AuthService.new_password({
        password: formData.newPassword,
      });

      if (!set_password) return;

      showMessage("success", set_password.data.message);
      console.log(set_password);
      router.replace(set_password.data.redirect);
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
    if (!formData.newPassword) {
      newErrors.newPassword = "ກະລຸນາປ້ອນລະຫັດຜ່ານ";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "ກະລຸນາຢືນຢັນລະຫັດ";
    }
    if (
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "ລະຫັດຜ່ານບໍ່ຄືກັນ";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    reset_password();
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-8">
          ຕັ້ງລະຫັດຜ່ານໃໝ່
        </h1>

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
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ລະຫັດຜ່ານໃໝ່
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່"
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
              {errors.newPassword && (
                <p className="text-sm text-rose-500 mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ຢືນຢັນລະຫັດຜ່ານໃໝ່
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  placeholder="ຢືນຢັນລະຫັດຜ່ານ"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-rose-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 text-white py-2 px-4 rounded-md font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-slate-600">
            <button
              onClick={() => router.replace("/login")}
              className="text-sky-600 hover:text-sky-500 font-medium"
            >
              ກັບໄປໜ້າເຂົ້າສູ່ລະບົບ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
