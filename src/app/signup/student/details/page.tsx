"use client";

import { useState, useEffect } from "react";
import { User, Phone, Lock, ChevronLeftIcon, Save, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const InputField = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  name,
  error,
  icon: Icon
}: { 
  type: string; 
  placeholder: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
  icon?: React.ComponentType<{className?: string}>;
}) => (
  <div>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
          error ? "border-red-500" : ""
        } ${Icon ? "pl-10" : ""}`}
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

export default function StudentDetailsPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string; 
    lastName?: string; 
    phone?: string; 
    password?: string; 
    confirmPassword?: string;
    submit?: string;
  }>({});
  
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Get data from localStorage
    const email = localStorage.getItem('student_email');
    const id = localStorage.getItem('student_user_id');
    
    if (!email || !id) {
      // Redirect back if no email/user id found
      router.push('/signup/student');
      return;
    }
    
    setUserEmail(email);
    setUserId(id);
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: {
      firstName?: string; 
      lastName?: string; 
      phone?: string; 
      password?: string; 
      confirmPassword?: string;
    } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
    
    try {
      const response = await fetch(`${BASE_URL}/student/details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('student_temp_token')}`
        },
        body: JSON.stringify({
          email: userEmail,
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const { user, token } = data.data;
        
        // Login the user with the new token
        login(user, token);
        
        // Clear temporary storage
        localStorage.removeItem('student_temp_token');
        localStorage.removeItem('student_email');
        localStorage.removeItem('student_user_id');
        
        // Redirect to student dashboard
        router.push('/student');
      } else {
        throw new Error(data.message || "Failed to save details");
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to save details" });
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
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4 sm:px-0">
          <button
            onClick={() => router.push('/signup/student')}
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
                Complete Your Profile
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add your details to complete registration
              </p>
              {userEmail && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Registering as: <span className="font-medium text-gray-800 dark:text-gray-300">{userEmail}</span>
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label required>First Name</Label>
                    <InputField 
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      icon={User}
                    />
                  </div>
                  
                  <div>
                    <Label>Middle Name</Label>
                    <InputField 
                      type="text"
                      name="middleName"
                      placeholder="Middle name"
                      value={formData.middleName}
                      onChange={handleChange}
                      error={undefined}
                      icon={User}
                    />
                  </div>
                  
                  <div>
                    <Label required>Last Name</Label>
                    <InputField 
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      icon={User}
                    />
                  </div>
                </div>

                <div>
                  <Label required>Phone Number</Label>
                  <InputField 
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    icon={Phone}
                  />
                </div>

                <div>
                  <Label required>Password</Label>
                  <div className="relative">
                    <InputField 
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label required>Confirm Password</Label>
                  <div className="relative">
                    <InputField 
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
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
                      <Save className="w-5 h-5" />
                    )}
                    {loading ? "SAVING DETAILS..." : "COMPLETE REGISTRATION"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                Need to change email?{" "}
                <Link
                  href="/signup/student"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Go back
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}