"use client";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useMessage } from "@/components/frontend/context/MessageContext";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();
  const { showMessage } = useMessage();
  const [formData, setFormData] = useState({
    passwordOne: "",
    passwordTwo: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showPasswordOne, setShowPasswordOne] = useState(false);
  const [showPasswordTwo, setShowPasswordTwo] = useState(false);
  interface TypeError {
    passwordOne: string;
    passwordTwo: string;
  }
  const [error, setError] = useState<TypeError>({
    passwordOne: "",
    passwordTwo: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // ล้าง error ของ field ที่แก้ไข
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePasswordVisibilityOne = () => {
    setShowPasswordOne((prev) => !prev);
  };
  const togglePasswordVisibilityTwo = () => {
    setShowPasswordTwo((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { passwordOne?: string; passwordTwo?: string } = {};

    // Password validation
    if (!formData.passwordOne) {
      newErrors.passwordOne = "password is required";
    } else if (formData.passwordOne.length < 6) {
      newErrors.passwordOne = "password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.passwordOne)) {
      newErrors.passwordOne =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.passwordTwo) {
      newErrors.passwordTwo = "Please confirm your password";
    } else if (formData.passwordOne !== formData.passwordTwo) {
      newErrors.passwordTwo = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setError((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setIsLoading(true);
    try {
      const resResetPassword = await axios.post(
        "/api/users/reset-password",
        { password: formData.passwordOne },
        { headers: { "Content-Type": "application/json" } }
      );
      if (resResetPassword.data.success) {
        showMessage("success", "Reset Password Successfully!");
        router.replace("/login");
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

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="t2logo.png"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
          Reset Password
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="passwordOne"
                className={`block text-sm/6 font-medium`}
              >
                Password
              </label>
            </div>
            <div className="mt-2 relative">
              <input
                id="passwordOne"
                name="passwordOne"
                placeholder="Enter Your New Password"
                type={showPasswordOne ? "text" : "password"}
                value={formData.passwordOne}
                onChange={handleChange}
                autoComplete="current-password"
                className={`border w-full rounded-md px-3 py-2 ${
                  error.passwordOne && "border-red-600 outline-red-600"
                }`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibilityOne}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
              >
                {showPasswordOne ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error.passwordOne && (
              <div className="k text-red-600">{error.passwordOne}</div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="passwordTwo"
                className={`block text-sm/6 font-medium`}
              >
                Password
              </label>
            </div>
            <div className="mt-2 relative">
              <input
                id="passwordTwo"
                name="passwordTwo"
                placeholder="Confirm Your New Password"
                type={showPasswordTwo ? "text" : "password"}
                value={formData.passwordTwo}
                onChange={handleChange}
                autoComplete="current-password"
                className={`border w-full rounded-md px-3 py-2 ${
                  error.passwordTwo && "border-red-600 outline-red-600"
                }`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibilityTwo}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
              >
                {showPasswordTwo ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error.passwordTwo && (
              <div className="k text-red-600">{error.passwordTwo}</div>
            )}
          </div>

          <div>
            <button
              disabled={isLoading}
              type="submit"
              className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white
              ${isLoading ? "bg-gray-400" : "bg-indigo-500 hover:bg-indigo-400"}
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
              `}
            >
              {isLoading ? "Loading . . ." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
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
  );
}
