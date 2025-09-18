"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import VerifyOTPComponent from "./verify_otp";
import { useMessage } from "./context/MessageContext";
import { AuthService } from "@/services/api";

// Define the shape of the form data
interface FormData {
  email_phone: string;
}

// Define the shape of the validation errors
interface Errors {
  email_phone?: string;
}

// Define the shape of the message box state
interface Message {
  text: string;
  type: "success" | "error" | "";
}

export default function ForgotPasswordComponent() {
  const { showMessage } = useMessage();
  const close_verify_otp = () => {
    set_show_verify_otp(false);
  };
  const [startimeOut, set_startimeOut] = useState<number>(0);

  const [show_verify_otp, set_show_verify_otp] = useState<boolean>(false);
  const router = useRouter();
  // State to manage form data
  const [formData, setFormData] = useState<FormData>({
    email_phone: "",
  });
  // State to manage validation errors
  const [errors, setErrors] = useState<Errors>({});
  // State for loading indicator
  const [isLoading, setIsLoading] = useState<boolean>(false);

    const sendOtp = async (): Promise<void | number> => {
      setIsLoading(true);
      try {
        const resRegister = await AuthService.reset_password({
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

  // Function to handle input changes and clear errors on interaction
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

  // Function to handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const newErrors: Errors = {};

    // Simple validation
    if (!formData.email_phone) {
      newErrors.email_phone = "ກະລຸນາປ້ອນອີເມວ ຫຼື ເບີໂທລະສັບ";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    sendOtp();
    
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-8">
          ລືມລະຫັດຜ່ານ?
        </h1>
        <p className="text-center text-sm text-slate-600 mb-6">
          ກະລຸນາປ້ອນອີເມວ ຫຼື ເບີໂທລະສັບທີ່ທ່ານໃຊ້ລົງທະບຽນ ທາງເຮົາຈະສົ່ງລະຫັດ
          OTP ໄປໃຫ້
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 text-white py-2 px-4 rounded-md font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "ກຳລັງສົ່ງ..." : "ສົ່ງ"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-slate-600">
            <button
              onClick={() => router.push("/login")}
              className="text-sky-600 hover:text-sky-500 font-medium"
            >
              ກັບໄປໜ້າເຂົ້າສູ່ລະບົບ
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
          is_reset_password={true}
        />
      )}
    </div>
  );
}
