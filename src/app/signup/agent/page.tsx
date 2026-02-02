"use client";

import { useState, useEffect } from "react";
import { Mail, User, Phone, Lock, ChevronLeftIcon, Save, CheckCircle, X, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

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
    info: <Info className="w-5 h-5" />
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

export default function AgentRegistrationPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "details">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    name?: string;
    phoneNumber?: string;
    password?: string;
    submit?: string;
  }>({});
  const [emailData, setEmailData] = useState<{email: string; expires_in?: string} | null>(null);
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

  const showAlertMessage = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setShowAlert(true);
  };

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

  const validateDetails = (): boolean => {
    const newErrors: {name?: string; phoneNumber?: string; password?: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.password = "Passwords do not match";
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
        setResendTimer(60); // 60 seconds cooldown
        
        // Show success alert
        showAlertMessage('success', 'OTP sent successfully to your email!');
        
        // Automatically move to next step after 1 second
        setTimeout(() => {
          setStep("details");
        }, 1000);
        
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send OTP";
      setErrors({ submit: errorMessage });
      showAlertMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

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
        setResendTimer(60);
        showAlertMessage('success', 'New OTP sent successfully!');
      } else {
        throw new Error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resend OTP";
      setErrors({ submit: errorMessage });
      showAlertMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate OTP
    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: "OTP must be 6 digits" });
      return;
    }

    // Validate details
    if (!validateDetails()) return;

    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/agent/verifyagent`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: email,
          otp: otp,
          name: formData.name.trim(),
          phone_number: formData.phoneNumber,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const { user, token } = data.data;
        if (user && token) {
          setVerificationSuccessful(true);
          login(user, token);
          showAlertMessage('success', 'Registration successful! Redirecting...');
          
          // Show success message for 2 seconds then redirect
          setTimeout(() => {
            router.push('/signup/agent/onboarding/business');
          }, 2000);
        }
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setErrors({ submit: errorMessage });
      showAlertMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "email") {
      setEmail(value);
      if (errors.email) {
        setErrors(prev => ({ ...prev, email: undefined }));
      }
    } else if (name === "otp") {
      // Only allow numbers and limit to 6 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setOtp(numericValue);
      if (errors.otp) {
        setErrors(prev => ({ ...prev, otp: undefined }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
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
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === "email" ? "bg-brand-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  1
                </div>
                <div className="h-1 w-8 bg-gray-300 dark:bg-gray-700"></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === "details" ? "bg-brand-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  2
                </div>
              </div>
              
              <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
                {step === "email" ? "Agent Registration" : "Complete Your Profile"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {step === "email" 
                  ? "Enter your email to get started!" 
                  : "Add your details to complete registration"}
              </p>
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
                  Registration Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your account has been created. Redirecting to business setup...
                </p>
                <div className="w-16 h-1 bg-brand-500 mx-auto rounded-full animate-pulse"></div>
              </div>
            ) : (
              <form onSubmit={step === "email" ? handleSendOtp : handleVerifyAndSubmit}>
                <div className="space-y-6">
                  {step === "email" ? (
                    <div>
                      <Label required>Email Address</Label>
                      <InputField 
                        type="email"
                        name="email"
                        placeholder="agent@example.com"
                        value={email}
                        onChange={handleChange}
                        error={errors.email}
                        icon={Mail}
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        We'll send a verification code to this email
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                OTP sent successfully!
                              </p>
                              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                Verification code sent to <strong>{email}</strong>. 
                              
                              </p>
                              {/* {emailData?.expires_in && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                  ⏰ OTP expires in {emailData.expires_in}
                                </p>
                              )} */}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 flex-shrink-0"
                          >
                            Change email
                          </button>
                        </div>
                      </div>

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
                        
                        <div className="mt-3 flex justify-between">
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={resendTimer > 0 || loading}
                            className="text-sm text-brand-500 hover:text-brand-600 disabled:text-gray-400 dark:text-brand-400 disabled:cursor-not-allowed"
                          >
                            {loading ? (
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
                        </div>
                      </div>

                      <div>
                        <Label required>Full Name</Label>
                        <InputField 
                          type="text"
                          name="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleChange}
                          error={errors.name}
                          icon={User}
                        />
                      </div>

                      <div>
                        <Label required>Phone Number</Label>
                        <InputField 
                          type="tel"
                          name="phoneNumber"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          error={errors.phoneNumber}
                          icon={Phone}
                        />
                      </div>

                      <div>
                        <Label required>Password</Label>
                        <InputField 
                          type="password"
                          name="password"
                          placeholder="Create a password (min. 8 characters)"
                          value={formData.password}
                          onChange={handleChange}
                          error={errors.password}
                          icon={Lock}
                        />
                      </div>

                      <div>
                        <Label required>Confirm Password</Label>
                        <InputField 
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          icon={Lock}
                        />
                      </div>
                    </>
                  )}

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
                      ) : step === "email" ? (
                        <Mail className="w-5 h-5" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {loading 
                        ? "PROCESSING..." 
                        : step === "email" 
                          ? "SEND VERIFICATION CODE" 
                          : "COMPLETE REGISTRATION"}
                    </Button>
                  </div>

                  {step === "email" && otpSent && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setStep("details");
                          setOtp("");
                        }}
                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        I've received the OTP, continue to details →
                      </button>
                    </div>
                  )}
                </div>
              </form>
            )}

            {!verificationSuccessful && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}