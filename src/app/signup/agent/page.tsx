"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, User, ChevronLeftIcon, Save, CheckCircle, X, Info, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";


// Types for country data
interface Country {
  id?: number;
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

// Phone Input with Country Code — matches admin add-student style
const PhoneInput = ({
  value,
  onChange,
  name,
  error,
  disabled = false,
  selectedCountry,
  onCountryChange,
  allCountries = [],
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
  disabled?: boolean;
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  allCountries?: Country[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? allCountries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial_code.includes(search) ||
        c.code.toLowerCase().startsWith(search.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  return (
    <div ref={containerRef}>
      <div className="flex gap-2">
        {/* Country code button */}
        <div className="relative">
          <button
            type="button"
            onClick={handleOpen}
            disabled={disabled}
            className={`flex items-center gap-1.5 h-11 px-3 rounded-lg border bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="text-base leading-none">{selectedCountry?.flag}</span>
            <span className="text-xs font-medium min-w-[36px]">{selectedCountry?.dial_code ?? "—"}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => { setIsOpen(false); setSearch(""); }} />
              <div
                className="absolute left-0 z-20 mt-1 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search country name or code..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {!search.trim() ? (
                    <div className="px-3 py-4 text-sm text-center text-gray-400 dark:text-gray-500">
                      Type to search countries...
                    </div>
                  ) : filtered.length > 0 ? filtered.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { onCountryChange(c); setIsOpen(false); setSearch(""); }}
                      className={`flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedCountry?.code === c.code ? "bg-brand-50 dark:bg-brand-900/20" : ""
                      }`}
                    >
                      <span className="text-base w-6 text-center">{c.flag}</span>
                      <span className="flex-1 text-left text-gray-700 dark:text-gray-300 truncate">{c.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{c.dial_code}</span>
                    </button>
                  )) : (
                    <div className="px-3 py-4 text-sm text-center text-gray-400">No countries found</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Phone number input */}
        <input
            type="tel"
            name={name}
            placeholder="Phone number"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`h-11 flex-1 rounded-lg border px-4 text-sm text-gray-700 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
  disabled = false,
  className = ""
}: { 
  type: string; 
  placeholder: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
  icon?: React.ComponentType<{className?: string}>;
  disabled?: boolean;
  className?: string;
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
        } ${className}`}
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

export default function AgentRegistrationPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳",
  });

  const [formData, setFormData] = useState({ name: "", phoneNumber: "", email: "" });
  const [errors, setErrors] = useState<{
    name?: string; phoneNumber?: string; email?: string; submit?: string;
  }>({});
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    fetch(`${BASE_URL}/countries`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const list: Country[] = (d.data || []).map((c: any) => ({
            name: c.name,
            dial_code: c.phone_code,
            code: c.iso_code,
            flag: c.flag || "",
          }));
          setAllCountries(list);
          const india = list.find(c => c.code === "IN") || list[0];
          if (india) setSelectedCountry(india);
        }
      })
      .catch(() => {});
  }, [BASE_URL]);

  useEffect(() => {
    fetch(`${BASE_URL}/auth/google/status`)
      .then(r => r.json())
      .then(d => setGoogleConfigured(d.configured === true))
      .catch(() => setGoogleConfigured(false));
  }, [BASE_URL]);

  useEffect(() => {
    if (showAlert && alert) {
      const timer = setTimeout(() => { setShowAlert(false); setAlert(null); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert, alert]);

  const showAlertMessage = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setShowAlert(true);
  };

  const validateDetails = (): boolean => {
    const newErrors: { name?: string; phoneNumber?: string; email?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
      if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }
    }
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
    if (!validateDetails()) return;
    setLoading(true);
    try {
      const fullPhoneNumber = `${selectedCountry.dial_code}${formData.phoneNumber.replace(/\D/g, '')}`;
      const response = await fetch(`${BASE_URL}/agent/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone_number: fullPhoneNumber,
          email: formData.email,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const { user, token } = data.data;
        if (user && token) {
          login(user, token);
        }
        router.push('/signup/agent/onboarding/business');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const phoneValue = value.replace(/[^\d\s\-\(\)\+]/g, '');
      setFormData(prev => ({ ...prev, [name]: phoneValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGoogleSuccess = () => {};
  const handleGoogleError = (error: string) => {
    setErrors({ submit: error });
    showAlertMessage('error', error);
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
                Partner Registration
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create your account — we'll email you a link to set your password.
              </p>
            </div>

            {/* Google Signup Button — only shown when Google is configured */}
            {googleConfigured && (
              <>
                <div className="mb-6">
                  <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    role="agent"
                  />
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or sign up with email</span>
                  </div>
                </div>
              </>
            )}

            {/* Alert Messages */}
            {showAlert && alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => { setShowAlert(false); setAlert(null); }}
              />
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
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
                  <PhoneInput
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={errors.phoneNumber}
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                    allCountries={allCountries}
                  />
                </div>

                <div>
                  <Label required>Email Address</Label>
                  <InputField
                    type="email"
                    name="email"
                    placeholder="partner@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={Mail}
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    We'll send a link to this email to set your password after registration.
                  </p>
                </div>

                {errors.submit && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/20">
                    {errors.submit}
                  </div>
                )}

                <div>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {loading ? "PROCESSING..." : "CREATE ACCOUNT"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/signin/agent" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
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