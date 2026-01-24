"use client";

import { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams  } from "next/navigation";
import Link from "next/link";

import { Suspense } from 'react';
import { useAuth } from "@/context/AuthContext";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

// Reusable components (same as login page)
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

const Checkbox = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 focus:ring-2"
  />
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

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
    {children}
  </label>
);

function StudentLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/student';
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; submit?: string }>({});
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const { user, token } = data.data;
       
        if (user && token) {
          
            login(user, token);
        
            router.push(callbackUrl);
          
        } else {
          throw new Error(data.message || "Login failed");
        }
        
      } else {
        throw new Error(data.message || "Login failed");
      }
      
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* Left Side - Form Content */}
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
                Student Sign In
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your email and password to access your student portal
              </p>
            </div>

            {/* Student Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <InputField 
                    type="email"
                    name="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <InputField 
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={formData.rememberMe} 
                      onChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked }))} 
                    />
                    <span className="block font-normal text-gray-700 text-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/signin/student/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>

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
                      <LogIn className="w-5 h-5" />
                    )}
                    {loading ? "SIGNING IN..." : "SIGN IN AS STUDENT"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-3">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                 {" Don't have an account? "}
                <Link
                  href="/signup/student"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Create Student Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <StudentLoginContent />
    </Suspense>
  );
}