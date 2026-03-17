"use client";

import { useState, useEffect } from "react";
import { Phone, ChevronLeftIcon, CheckCircle, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import countries from "country-list-with-dial-code-and-flag";

// Types for country data
interface Country {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

// Phone Input with Country Code
const PhoneInput = ({
  value,
  onChange,
  name,
  error,
  disabled = false,
  selectedCountry,
  onCountryChange
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
  disabled?: boolean;
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all countries using getAll() method
  const allCountries = countries.getAll() as Country[];
  
  // Filter countries based on search
  const filteredCountries = allCountries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dial_code.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="relative mr-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 ${
              error ? "border-red-500" : ""
            } ${disabled ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50" : ""}`}
          >
            <span className="text-gray-700 dark:text-gray-300">{selectedCountry.flag}</span>
            <span className="text-gray-700 dark:text-gray-300">{selectedCountry.dial_code}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Country Dropdown Menu */}
          {isOpen && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute left-0 z-20 w-72 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    autoFocus
                  />
                </div>
                
                {/* Country List */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        onCountryChange(country);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="text-xl mr-3">{country.flag}</span>
                      <span className="flex-1 text-left text-gray-700 dark:text-gray-300">
                        {country.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {country.dial_code}
                      </span>
                    </button>
                  ))}
                  
                  {filteredCountries.length === 0 && (
                    <div className="px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            disabled ? "text-gray-300 dark:text-gray-600" : "text-gray-400"
          }`} />
          <input
            type="tel"
            name={name}
            placeholder="Phone number"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-4 py-3 pl-10 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
              error ? "border-red-500" : ""
            } ${disabled ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : ""}`}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Button component
const Button = ({ 
  children, 
  onClick, 
  disabled, 
  className = "",
  type = "button"
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition-all duration-200 ${className}`}
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
    info: <X className="w-5 h-5" />
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

export default function SavePhonePage() {
  const router = useRouter();
  const { login, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string>();
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null);
  
  const allCountries = countries.getAll() as Country[];
  const defaultCountry = allCountries.find(c => c.code === "US") || allCountries[0];
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  const validatePhone = (): boolean => {
    if (!phoneNumber.trim()) {
      setError("Phone number is required");
      return false;
    }
    
    // Remove any non-digit characters for validation
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setError("Please enter a valid phone number");
      return false;
    }
    
    setError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone()) return;

    setLoading(true);
    setAlert(null);
    
    try {
      // Combine country code with phone number and remove all non-digit characters
      const fullPhoneNumber = `${selectedCountry.dial_code}${phoneNumber.replace(/\D/g, '')}`;
      
      const response = await fetch(`${BASE_URL}/save-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include auth token if the user is already logged in
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          phone_number: fullPhoneNumber
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Now the response matches the login format
        // Login the user with the returned data
        if (data.data?.user && data.data?.token) {
          login(data.data.user, data.data.token);
          
          setAlert({
            type: 'success',
            message: data.message || 'Phone number saved successfully! Redirecting...'
          });

          // Handle redirect based on user role and status
          setTimeout(() => {
            
             if (data.data.user.role_key === 'agent') {
              

              if(data.status === "business_pending"){
            router.push('/signup/agent/onboarding/business');
          }else if(data.status === "under_review"){
            router.push('/signup/agent/pending-verification');
          }else if(data.status === "verification_failed"){
            router.push('/signup/agent/verification-failed');
          }else if(data.status === "verified"){
            // Redirect to intended page or partner dashboard
            router.push("/");
          }
            } else {
              // Regular user redirect
              router.push('/');
            }
            
          }, 2000);
        } else {
          throw new Error("Invalid response format from server");
        }
      } else {
        throw new Error(data.message || "Failed to save phone number");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save phone number. Please try again.";
      setAlert({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits, spaces, and basic phone number characters
    const value = e.target.value.replace(/[^\d\s\-\(\)\+]/g, '');
    setPhoneNumber(value);
    if (error) setError(undefined);
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
  };

  return (
    <div className="min-h-screen flex flex-1 flex-col bg-white dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto pt-10 px-4 sm:px-0">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-8"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl mb-2">
            Save Phone Number
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your phone number below.
          </p>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label required>Phone Number</Label>
            <PhoneInput
              name="phoneNumber"
              value={phoneNumber}
              onChange={handleChange}
              error={error}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Save Phone Number"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}