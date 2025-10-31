// app/login/page.tsx
"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Redirect to admin dashboard on successful login
      router.push("/admin");
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side Image */}
      <div className="md:w-1/2 w-full h-[40vh] md:h-auto">
        <Image
          height={500}
          width={500}
          className="w-full h-full object-cover"
          src="/images/university.jpg"
          alt="Background"
        />
      </div>

      {/* Right Side Content */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-gray-50 p-6 md:p-12 overflow-y-auto">
        {/* Logo */}
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="flex justify-center items-center">
            <Image
              className=""
              src="/images/logo/logo.png"
              alt="Logo"
              width={45}
              height={45}
            />
            <span className="dark:text-black ms-1 text-black font-semibold text-2xl">
              ApplyTech
            </span>
          </div>
          <p className="text-gray-600 text-center mb-8">
            Welcome back! Please sign in to your account.
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-full border border-gray-200 py-3 px-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1 px-5">{errors.email}</p>}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-full border border-gray-200 py-3 px-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1 px-5">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="mr-2 rounded border-gray-300"
                />
                Remember me
              </label>
              
              <Link href="/forgot-password" className="text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                {errors.submit}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn />
              )}
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
             {"Don't have an account? "}
              <Link href="/register" className="text-indigo-600 hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}