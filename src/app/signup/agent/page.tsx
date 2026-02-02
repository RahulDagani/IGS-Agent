"use client";

import { useState } from "react";
import { LogIn, ChevronLeftIcon, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const InputField = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  name,
  error 
}: { 
  type: string; 
  placeholder: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
}) => (
  <div>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
        error ? "border-red-500" : ""
      }`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  disabled, 
  className = "",
  size = "md"
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
      size === "sm" ? "py-3 text-sm" : "py-3"
    } ${className}`}
  >
    {children}
  </button>
);

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export default function AgentEmailVerificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<{email?: string; otp?: string; submit?: string}>({});
  const [emailData, setEmailData] = useState<{email: string; expires_in?: string} | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  const {login} = useAuth();

  const validateEmail = (): boolean => {
    const newErrors: {email?: string} = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail()) return;

    setLoading(true);
    
    
    try {
      const response = await fetch(`${BASE_URL}/agent/sendotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setEmailData(data.data);
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/agent/verifyotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: emailData?.email || email, 
          otp: otp 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const { user, token } = data.data;
        if(user && token){
          login(user, token);
          router.push('/signup/agent/details');
        }
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    
    
    try {
      const response = await fetch(`${BASE_URL}/agent/sendotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setEmailData(data.data);
        setOtp("");
        alert("New OTP sent successfully!");
      } else {
        throw new Error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to resend OTP" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4 sm:px-0">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
                {otpSent ? "Verify Your Email" : "Agent Registration"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {otpSent 
                  ? `Enter the OTP sent to ${email}` 
                  : "Enter your email to get started!"}
              </p>
            </div>

            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
              <div className="space-y-6">
                {!otpSent ? (
                  <div>
                    <Label required>Email Address</Label>
                    <InputField 
                      type="email"
                      name="email"
                      placeholder="agent@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      We'll send a verification code to this email
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        OTP sent to <strong>{email}</strong>
                      </p>
                      {emailData?.expires_in && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Expires in {emailData.expires_in}
                        </p>
                      )}
                    </div>
                    
                    <Label required>Verification Code (OTP)</Label>
                    <InputField 
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      error={errors.otp}
                    />
                    
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Didn't receive code? Resend OTP
                      </button>
                    </div>
                  </div>
                )}

                {errors.submit && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/20">
                    {errors.submit}
                  </div>
                )}

                <div>
                  <Button 
                    size="sm" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      otpSent ? null : <Mail className="w-5 h-5" />
                    )}
                    {loading 
                      ? "PROCESSING..." 
                      : otpSent 
                        ? "VERIFY OTP & CONTINUE" 
                        : "SEND VERIFICATION CODE"}
                  </Button>
                </div>

                {otpSent && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Use different email
                    </button>
                  </div>
                )}
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}