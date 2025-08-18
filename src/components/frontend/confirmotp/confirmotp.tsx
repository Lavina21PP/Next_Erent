"use client";
import { CheckCircle, Shield } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useMessage } from "@/components/frontend/context/MessageContext";
import { useRouter } from "next/navigation";

function Confirmotp({
  formData,
  setFormData,
  setShowOTP,
  otpTimer,
  resendOTP,
  isLoading1,
  typeOtp,
}: {
  formData: any;
  setFormData: any;
  setShowOTP: any;
  otpTimer: number;
  resendOTP: () => void;
  isLoading1: boolean;
  typeOtp: string;
}) {
  const router = useRouter();
  const [otp, setOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const otpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { showMessage } = useMessage();

  const handleOTPSubmit = async () => {
    if (otp.length !== 6) return;
    setIsLoading(true);
    switch (typeOtp) {
      case "createUsers":
        try {
          const resCheckOtp = await axios.post(
            "/api/verified-otp/register",
            { email_phone: formData.email_phone, otp_code: otp },
            { headers: { "Content-Type": "application/json" } }
          );

          if (resCheckOtp.data.success) {
            const data = resCheckOtp.data;
            const resCreateUser = await axios.post(
              "/api/users/create-user",
              { ...formData },
              { headers: { "Content-Type": "application/json" } }
            );

            if (resCreateUser.data.success) {
              const data = resCreateUser.data;
              // Clear timer on successful submit
              if (otpTimerRef.current) {
                clearInterval(otpTimerRef.current);
                otpTimerRef.current = null;
              }
              showMessage("success", data.message);
              setShowOTP(false);
              setFormData({
                first_name: "",
                last_name: "",
                email_phone: "",
                password: "",
                confirmPassword: "",
                role: "",
              });
              setOTP("");
              console.log(resCreateUser.data);
              router.replace(resCreateUser.data.redirect);
            }
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
        break;
      case "resetPassword":
        try {
          const resCheckOtp = await axios.post(
            "/api/verified-otp/reset-password",
            { email_phone: formData.email_phone, otp_code: otp },
            { headers: { "Content-Type": "application/json" } }
          );

          if (resCheckOtp.data.success) {
            // Clear timer on successful submit
            if (otpTimerRef.current) {
              clearInterval(otpTimerRef.current);
              otpTimerRef.current = null;
            }
            showMessage("success", "Verification your email successfully!");
            setFormData({
              email_phone: "",
            });
            setOTP("");
            setShowOTP(false);
            router.replace("/reset-password");
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
        break;
      default:
        break;
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

  const handleCloseOTPModal = () => {
    if (otpTimerRef.current) {
      clearInterval(otpTimerRef.current);
      otpTimerRef.current = null;
    }
    setShowOTP(false);
  };
  return (
    <div>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform scale-100 transition-all duration-300">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Account
            </h3>
            <p className="text-gray-600">
              Enter the 6-digit code sent to your{" "}
            </p>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="••••••"
              maxLength={6}
              className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </div>

          <div className="flex justify-between items-center mb-6 text-sm">
            <button
              onClick={resendOTP}
              disabled={otpTimer > 0 || isLoading1}
              className={`font-medium transition-colors ${
                otpTimer > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-indigo-600 hover:text-indigo-700"
              }`}
            >
              {isLoading1 ? "Resending . . ." : "Resend Code"}
            </button>
            {otpTimer > 0 && (
              <div className="k">
                {otpTimer > 0 && `Resend in ${otpTimer}s`}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCloseOTPModal}
              className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleOTPSubmit}
              disabled={otp.length !== 6 || isLoading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="inline w-4 h-4 mr-2" />
                  Verify
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Confirmotp;
