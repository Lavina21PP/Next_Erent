"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "./context/MessageContext";
import axios from "axios";
import { AuthService, GetEnumDB } from "@/services/api";
import VerifyOTPComponent from "./verify_otp";
import Spinner from "./ui/spinner";
import { Eye, EyeOff } from "lucide-react";

// Define the shape of the form data for registration
interface FormData {
  firstName: string;
  lastName: string;
  email_phone: string;
  password: string;
  confirmPassword: string;
  role: string;
}

// Define the shape of the validation errors
interface Errors {
  firstName?: string;
  lastName?: string;
  email_phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

interface TypeRole {
  id: number;
  name: string;
}

export default function RegisterComponent() {
  const [role, setRole] = useState<TypeRole[]>([]);
  const [is_loading, set_is_loading] = useState(false);
  const [show_verify_otp, set_show_verify_otp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const close_verify_otp = () => {
    set_show_verify_otp(false);
  };

  useEffect(() => {
    set_is_loading(true);
    const getRole = async (): Promise<void> => {
      try {
        const res = await GetEnumDB.role();
        if (res.data.success) {
          setRole(res.data.data);
        }
      } catch (err: any) {
        console.error(err.response?.data || err.message);
      } finally {
        set_is_loading(false);
      }
    };
    getRole();
  }, []);

  const { showMessage } = useMessage();
  const router = useRouter();
  // State to manage form data
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email_phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  // State to manage validation errors
  const [errors, setErrors] = useState<Errors>({});
  // State for loading indicator
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startimeOut, set_startimeOut] = useState<number>(0);

  // Function to handle input changes and clear errors on interaction
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
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

  // From register.tsx
  const sendOtp = async (): Promise<void | number> => {
    setIsLoading(true);
    try {
      const resRegister = await AuthService.register({
        email_phone: formData.email_phone,
      });

      if (!resRegister.data.success) {
        return;
      }

      // Set the new startimeOut here
      let newStartTime = 0;
      if (resRegister.status === 200) {
        newStartTime = resRegister.data.startimeOut;
      } else if (resRegister.status === 201) {
        newStartTime = resRegister.data.timeoutOtp;
      }

      set_startimeOut(newStartTime);
      set_show_verify_otp(true);

      return newStartTime;
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

    // Validation for new and existing fields
    if (!formData.firstName) {
      newErrors.firstName = "ກະລຸນາປ້ອນຊື່";
    }
    if (!formData.lastName) {
      newErrors.lastName = "ກະລຸນາປ້ອນນາມສະກຸນ";
    }
    if (!formData.email_phone) {
      newErrors.email_phone = "ກະລຸນາປ້ອນອີເມວ";
    }
    if (!formData.password) {
      newErrors.password = "ກະລຸນາປ້ອນລະຫັດຜ່ານ";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "ກະລຸນາຢືນຢັນລະຫັດຜ່ານ";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "ລະຫັດຜ່ານບໍ່ຄືກັນ";
    }
    if (!formData.role) {
      newErrors.role = "ກະລຸນາເລືອກປະເພດຜູ້ໃຊ້";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    sendOtp();
  };

  if (is_loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-8">
          ສ້າງບັນຊີໃໝ່
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* First Name field */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ຊື່
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="ປ້ອນຊື່"
                required
              />
              {errors.firstName && (
                <p className="text-sm text-rose-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name field */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ນາມສະກຸນ
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="ປ້ອນນາມສະກຸນ"
                required
              />
              {errors.lastName && (
                <p className="text-sm text-rose-500 mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Email/Phone field */}
            <div>
              <label
                htmlFor="email_phone"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ອີເມວ ຫຼື ເບີໂທລະສັບ
              </label>
              <input
                type="text"
                id="email_phone"
                name="email_phone"
                value={formData.email_phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="ປ້ອນອີເມວ ຫຼື ເບີໂທລະສັບ"
                required
              />
              {errors.email_phone && (
                <p className="text-sm text-rose-500 mt-1">
                  {errors.email_phone}
                </p>
              )}
            </div>

            {/* Password field */}
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

            {/* Confirm Password field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ຢືນຢັນລະຫັດຜ່ານ
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-rose-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role selection field */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                ປະເພດຜູ້ໃຊ້
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white"
              >
                <option value="" disabled>
                  ເລືອກປະເພດຜູ້ໃຊ້
                </option>
                {role &&
                  role.map((e, i) => (
                    <option key={i} value={e.id}>
                      {e.name}
                    </option>
                  ))}
              </select>
              {errors.role && (
                <p className="text-sm text-rose-500 mt-1">{errors.role}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 text-white py-2 px-4 rounded-md font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "ກຳລັງສ້າງບັນຊີໃໝ່..." : "ສ້າງບັນຊີໃໝ່"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-slate-600">
            ມີບັນຊີຢູ່ແລ້ວ?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-sky-600 hover:text-sky-500 font-medium"
            >
              ເຂົ້າສູ່ລະບົບ
            </button>
          </div>
        </div>
      </div>
      {show_verify_otp && (
        <VerifyOTPComponent
          close_verify_otp={close_verify_otp}
          dataUser={formData}
          startimeOut={startimeOut}
          sendOtp={sendOtp}
        />
      )}
    </div>
  );
}
