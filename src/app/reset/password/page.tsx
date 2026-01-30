// app/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Lock, ChevronLeftIcon, CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from 'react';

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
  submit?: string;
  success?: string;
}

// InputField component
const InputField = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  name,
  error,
  disabled = false
}: { 
  type: string; 
  placeholder: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
  disabled?: boolean;
}) => (
  <div>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
        error ? "border-red-500" : ""
      }`}
    />
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

const Label = ({ children, optional = false }: { children: React.ReactNode; optional?: boolean }) => (
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {children}
    </label>
    {optional && (
      <span className="text-xs text-gray-500 dark:text-gray-400">Optional</span>
    )}
  </div>
);

// Password strength indicator
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

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Extract token and id from URL query parameters
    const tokenParam = searchParams.get('token');
    const idParam = searchParams.get('id');
    
    if (tokenParam) setToken(tokenParam);
    if (idParam) setUserId(idParam);
    
    // Validate that we have both token and userId
    if (!tokenParam || !idParam) {
      setErrors({ submit: "Invalid or expired verification link." });
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[0-9])/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!token || !userId) {
      setErrors({ submit: "Invalid Verification link." });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

    try {
      const response = await fetch(`${BASE_URL}/reset/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          userId: userId,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setErrors({ success: "Password set successfully! Redirecting to login..." });
        
        // Clear the form
        setFormData({
          newPassword: "",
          confirmPassword: "",
        });
        const url = data?.data?.login_url;
        if(url)
        setTimeout(()=>{
            router.push(url)
        },3000)
       
      } else {
        throw new Error(data.message || data.error || "Failed to set password");
      }
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : "Failed to set password. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear success message when user starts typing
    if (errors.success) {
      setErrors(prev => ({ ...prev, success: undefined }));
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* Left Side - Form Content */}
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
                Set Password
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your password below.
              </p>
            </div>

            {/* Set Password Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <InputField 
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      error={errors.newPassword}
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showNewPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  <PasswordStrength password={formData.newPassword} />
                  
                  {/* Password requirements */}
                  {formData.newPassword && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Requirements:</p>
                      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                        <li className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-500' : ''}`}>
                          {formData.newPassword.length >= 8 ? '✓' : '•'} At least 8 characters
                        </li>
                        <li className={`flex items-center ${/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-500' : ''}`}>
                          {/(?=.*[A-Z])/.test(formData.newPassword) ? '✓' : '•'} One uppercase letter
                        </li>
                        <li className={`flex items-center ${/(?=.*[0-9])/.test(formData.newPassword) ? 'text-green-500' : ''}`}>
                          {/(?=.*[0-9])/.test(formData.newPassword) ? '✓' : '•'} One number
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <Label>
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <InputField 
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {errors.success && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{errors.success}</span>
                    </div>
                  </div>
                )}

                {errors.submit && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/20">
                    {errors.submit}
                  </div>
                )}

                <div className="space-y-4">
                  <Button 
                    type="submit"
                    size="sm" 
                    disabled={loading || !token || !userId}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                    {loading ? "SETTING..." : "SET PASSWORD"}
                  </Button>

                  
                </div>
              </div>
            </form>

            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2 font-medium">Password Tips:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use a combination of letters, numbers, and symbols</li>
                <li>Avoid using personal information like birthdays</li>
                <li>Don't reuse passwords from other accounts</li>
                <li>Consider using a password manager</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
          <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4 sm:px-0">
            <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          </div>
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}