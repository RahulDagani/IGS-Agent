// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { Mail, ChevronLeftIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from 'react';

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
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

// Button component
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

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
    {children}
  </label>
);

function ForgotPasswordContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });

  const validateForm = (): boolean => {
    const newErrors: { email?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("https://api.applystore.org/api/forgot/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setErrors({ success: "Password reset link has been sent to your email." });
        // Optionally clear the form
        setFormData({ email: "" });
        
        // Auto-redirect after 5 seconds
        
      } else {
        throw new Error(data.message || data.error || "Failed to send reset link");
      }
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : "Failed to send reset link. Please try again." 
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

  // const handleBackToLogin = () => {
  //   router.push("/login");
  // };

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
                Forgot Password
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <InputField 
                    type="email"
                    name="email"
                    placeholder="info@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                </div>

                {errors.success && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg dark:bg-green-900/20">
                    {errors.success}
                    
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
                      <Mail className="w-5 h-5" />
                    )}
                    {loading ? "SENDING..." : "SEND RESET LINK"}
                  </Button>
                </div>

                {/* {!success && (
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button 
                      onClick={handleBackToLogin}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                      size="sm"
                    >
                      <ArrowRightIcon className="w-4 h-4 rotate-180" />
                      BACK TO LOGIN
                    </Button>
                  </div>
                )} */}
              </div>
            </form>

            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2 font-medium">Instructions:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Enter the email address associated with your account</li>
                <li>Check your email for the password reset link</li>
                <li>Click the link to create a new password</li>
                <li>The link will expire after a certain period</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
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
      <ForgotPasswordContent />
    </Suspense>
  );
}