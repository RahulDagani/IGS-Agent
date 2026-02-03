"use client";

import { useState, useEffect } from "react";
import { Mail, User, Phone, Lock, ChevronLeftIcon, Save, CheckCircle, X, Info, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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

// Eye icons components
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.147.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
);

const EyeCloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092A4 4 0 007.752 6.69z"/>
    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.257 0-7.893-2.66-9.336-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252A4 4 0 0010.748 13.93z"/>
  </svg>
);

// Password strength indicator component
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthText = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][strength] || 'Very weak';
  const strengthColor = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'][strength] || 'bg-red-500';

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
        <span className={`text-xs font-medium ${
          strength === 0 ? 'text-red-500' :
          strength === 1 ? 'text-red-400' :
          strength === 2 ? 'text-yellow-500' :
          strength === 3 ? 'text-green-400' : 'text-green-500'
        }`}>
          {strengthText}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full ${
              level <= strength ? strengthColor : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Password Input Field with show/hide functionality
const PasswordInputField = ({ 
  value, 
  onChange, 
  name,
  placeholder,
  error,
  showPassword,
  onTogglePassword,
  label
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder: string;
  error?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  label: string;
}) => (
  <div>
    <Label required>{label}</Label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white pr-12 pl-10 ${
          error ? "border-red-500" : ""
        }`}
      />
      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <span
        onClick={onTogglePassword}
        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
      >
        {showPassword ? (
          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
        ) : (
          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
        )}
      </span>
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default function StudentRegistrationPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"details" | "otp">("details");
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    otp?: string;
    submit?: string;
  }>({});
  const [resendTimer, setResendTimer] = useState(0);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [verificationSuccessful, setVerificationSuccessful] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateDetails = (): boolean => {
    const newErrors: {
      name?: string;
      phoneNumber?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateDetails()) return;

    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/student/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone_number: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Save registration ID for verification step
        setRegistrationId(data.data?.id || null);
        setOtpSent(true);
        setResendTimer(60);
        
        // Show success alert
        showAlertMessage('success', 'Registration submitted! OTP sent to your email.');
        
        // Move to OTP verification step
        setStep("otp");
        
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to register. Please try again.";
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
      const response = await fetch(`${BASE_URL}/student/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: formData.email,
          registrationId: registrationId 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateOtp()) return;

    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/student/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: formData.email,
          otp: otp,
          registrationId: registrationId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const { user, token } = data.data;
        if (user && token) {
          setVerificationSuccessful(true);
          login(user, token);
          showAlertMessage('success', 'Verification successful! Welcome to the platform.');
          
          // Show success message for 2 seconds then redirect
          setTimeout(() => {
            router.push('/student');
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
    const { name, value } = e.target;
    
    if (name === "otp") {
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
      
      // Clear error when user starts typing
      if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const goToPreviousStep = () => {
    setStep("details");
    setOtp("");
    setErrors({});
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
                  step === "details" ? "bg-brand-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  1
                </div>
                <div className="h-1 w-8 bg-gray-300 dark:bg-gray-700"></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === "otp" ? "bg-brand-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  2
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-brand-50 rounded-lg dark:bg-brand-900/20">
                  <GraduationCap className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
                  {step === "details" ? "Student Registration" : "Verify Your Email"}
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {step === "details" 
                  ? "Enter your details to create an account" 
                  : "Enter the OTP sent to your email"}
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
                  Welcome to the student platform! Redirecting to your dashboard...
                </p>
                <div className="w-16 h-1 bg-brand-500 mx-auto rounded-full animate-pulse"></div>
              </div>
            ) : (
              <form onSubmit={step === "details" ? handleSubmitDetails : handleVerifyOtp}>
                <div className="space-y-6">
                  {step === "details" ? (
                    <>
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
                        <Label required>Email Address</Label>
                        <InputField 
                          type="email"
                          name="email"
                          placeholder="student@university.edu"
                          value={formData.email}
                          onChange={handleChange}
                          error={errors.email}
                          icon={Mail}
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          We'll send a verification code to this email.
                        </p>
                      </div>

                      {/* Password Field with Strength Indicator */}
                      <PasswordInputField
                        value={formData.password}
                        onChange={handleChange}
                        name="password"
                        placeholder="Create a password (min. 8 characters)"
                        error={errors.password}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        label="Password"
                      />
                      <PasswordStrength password={formData.password} />
                      
                      {/* Password Requirements */}
                      {formData.password && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Requirements:</p>
                          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-500' : ''}`}>
                              {formData.password.length >= 8 ? '✓' : '•'} At least 8 characters
                            </li>
                            <li className={`flex items-center ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-500' : ''}`}>
                              {/(?=.*[A-Z])/.test(formData.password) ? '✓' : '•'} One uppercase letter
                            </li>
                            <li className={`flex items-center ${/(?=.*[0-9])/.test(formData.password) ? 'text-green-500' : ''}`}>
                              {/(?=.*[0-9])/.test(formData.password) ? '✓' : '•'} One number
                            </li>
                          </ul>
                        </div>
                      )}

                      {/* Confirm Password Field */}
                      <PasswordInputField
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        error={errors.confirmPassword}
                        showPassword={showConfirmPassword}
                        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                        label="Confirm Password"
                      />

                      {/* Password Tips */}
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                          🔒 Password Security Tips:
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                          <li>Use a combination of letters, numbers, and symbols</li>
                          <li>Avoid using personal information like birthdays</li>
                          <li>Don't reuse passwords from other accounts</li>
                          <li>Consider using a password manager</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                Registration submitted successfully!
                              </p>
                              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                Verification code sent to <strong>{formData.email}</strong>. 
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={goToPreviousStep}
                            className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 flex-shrink-0"
                          >
                            Edit details
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
                      ) : step === "details" ? (
                        <Save className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      {loading 
                        ? "PROCESSING..." 
                        : step === "details" 
                          ? "REGISTER & SEND OTP" 
                          : "VERIFY & COMPLETE REGISTRATION"}
                    </Button>
                  </div>

                  {step === "otp" && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={goToPreviousStep}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        ← Back to edit details
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
                    href="/signin/student"
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