// app/verify-email/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, CheckCircle, X, ChevronLeftIcon, AlertCircle } from "lucide-react";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// Alert component
interface AlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

const Alert = ({ type, message, onClose }: AlertProps) => {
  const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
  };

  const textColors = {
    success: 'text-green-700 dark:text-green-300',
    error: 'text-red-700 dark:text-red-300',
    info: 'text-blue-700 dark:text-blue-300'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />
  };

  return (
    <div className={`flex items-center justify-between p-4 mb-4 border rounded-lg ${bgColors[type]}`}>
      <div className="flex items-center gap-3">
        <div className={`${textColors[type]}`}>
          {icons[type]}
        </div>
        <p className={`text-sm ${textColors[type]}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// InputField component
const InputField = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  name,
  error,
  icon: Icon,
  disabled = false
}: { 
  type: string; 
  placeholder: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
  icon?: React.ComponentType<{className?: string}>;
  disabled?: boolean;
}) => (
  <div>
    <div className="relative">
      {Icon && (
        <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
          disabled ? "text-gray-300 dark:text-gray-600" : "text-gray-400"
        }`} />
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
          error ? "border-red-500" : ""
        } ${Icon ? "pl-10" : ""} ${
          disabled ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : ""
        }`}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

// Button component
const Button = ({ 
  children, 
  onClick, 
  disabled, 
  className = "",
  size = "md",
  type = "button"
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
      size === "sm" ? "py-3 text-sm" : "py-3"
    } ${className}`}
  >
    {children}
  </button>
);

// Label component
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<{
    otp?: string;
    submit?: string;
  }>({});
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationSuccessful, setVerificationSuccessful] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-hide alert after 5 seconds
  useEffect(() => {
    if (showAlert && alert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert, alert]);

  // Send OTP on component mount if user exists
  useEffect(() => {
    if (user?.email && !verificationSuccessful) {
      sendOtp();
    }
  }, [user]);

  // Redirect if user is already verified
  useEffect(() => {
    if (user?.email_verified) {
      const redirectPath = user.role_key === 'student' ? '/student' : '/agent';
      router.push(redirectPath);
    }
  }, [user, router]);

  const showAlertMessage = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setShowAlert(true);
  };

  const sendOtp = async () => {
    if (!user?.email) {
      showAlertMessage('error', 'No email found. Please login again.');
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/${user.role_key}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: user.email
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResendTimer(60);
        showAlertMessage('success', 'OTP sent successfully to your email!');
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send OTP";
      showAlertMessage('error', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    await sendOtp();
  };

  const validateOtp = (): boolean => {
    const newErrors: { otp?: string } = {};

    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateOtp()) return;

    if (!user?.email) {
      showAlertMessage('error', 'No email found. Please login again.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/${user.role_key}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: user.email,
          otp: otp
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const { user: updatedUser, token } = data.data;
        
        if (updatedUser && token) {
          setVerificationSuccessful(true);
          
          // Update user in auth context
          login(updatedUser, token);
          
          showAlertMessage('success', 'Email verified successfully!');
          
          // Redirect after 2 seconds
          setTimeout(() => {
            const redirectPath = updatedUser.role_key === 'student' ? '/student' : '/agent';
            router.push(redirectPath);
          }, 2000);
        }
      } else {
        throw new Error(data.message || "Verification failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed. Please try again.";
      setErrors({ submit: errorMessage });
      showAlertMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: undefined }));
    }
  };

  // Show loading state if no user
  if (!user) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="text-center my-auto">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show success state if already verified (should redirect but just in case)
  if (user.email_verified) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="text-center my-auto">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Email Already Verified!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4 sm:px-0">
          <button
            onClick={() => {
              // Logout or go back to login
              router.push('/signin');
            }}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Back to Login
          </button>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
          <div>
            <div className="mb-5 sm:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-500 text-white">
                  <Mail className="w-6 h-6" />
                </div>
              </div>
              
              <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
                Verify Your Email
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter the 6-digit verification code sent to your email
              </p>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {user.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {user.role_key === 'student' ? 'Student Account' : 'Agent Account'}
                  </p>
                </div>
              </div>
            </div>

            {/* Alert Messages */}
            {showAlert && alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => {
                  setShowAlert(false);
                  setAlert(null);
                }}
              />
            )}

            {verificationSuccessful ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Email Verified Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your email has been verified. Redirecting to your dashboard...
                </p>
                <div className="w-16 h-1 bg-brand-500 mx-auto rounded-full animate-pulse"></div>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="space-y-6">
                  <div>
                    <Label required>Verification Code (OTP)</Label>
                    <InputField 
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={handleChange}
                      error={errors.otp}
                      icon={Lock}
                    />
                    
                    <div className="mt-3 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || resendLoading}
                        className="text-sm text-brand-500 hover:text-brand-600 disabled:text-gray-400 dark:text-brand-400 disabled:cursor-not-allowed"
                      >
                        {resendLoading ? (
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-brand-500 border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : resendTimer > 0 ? (
                          `Resend OTP in ${resendTimer}s`
                        ) : (
                          "Didn't receive code? Resend OTP"
                        )}
                      </button>
                      
                      {resendTimer === 0 && !resendLoading && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Code valid for 10 minutes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email Tips */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                      📧 Check your email:
                    </p>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Look for an email from our system</li>
                      <li>• Check your spam folder if you don't see it</li>
                      <li>• The OTP is valid for 10 minutes</li>
                      <li>• Enter the 6-digit code exactly as shown</li>
                    </ul>
                  </div>

                  {/* Display submit errors from API */}
                  {errors.submit && !showAlert && (
                    <Alert
                      type="error"
                      message={errors.submit}
                      onClose={() => setErrors(prev => ({ ...prev, submit: undefined }))}
                    />
                  )}

                  <div>
                    <Button 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      {loading ? "VERIFYING..." : "VERIFY EMAIL"}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Having trouble?{" "}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0}
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Request new code
                      </button>
                    </p>
                  </div>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Need help?{" "}
                  <Link
                    href="/contact-support"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}