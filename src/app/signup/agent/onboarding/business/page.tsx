"use client";

import { useState, useEffect } from "react";
import { Save, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { Country, State, City } from "country-state-city";

interface BusinessFormData {
  business_name: string;
  business_country: string;
  business_state: string;
  business_city: string;
  business_address: string;
  business_certificate: File | null;
}

interface FormErrors {
  business_name?: string;
  business_country?: string;
  business_state?: string;
  business_city?: string;
  business_address?: string;
  business_certificate?: string;
  submit?: string;
}

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

const SelectField = ({ 
  placeholder, 
  value, 
  onChange, 
  name,
  options,
  error,
  disabled = false
}: { 
  placeholder: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  options: { value: string; label: string }[];
  error?: string;
  disabled?: boolean;
}) => (
  <div>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
        error ? "border-red-500" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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

export default function BusinessDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { user, token } = useAuth();
  
  const [formData, setFormData] = useState<BusinessFormData>({
    business_name: "",
    business_country: "",
    business_state: "",
    business_city: "",
    business_address: "",
    business_certificate: null,
  });

  const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);

  const businessTypes = [
    { value: "individual", label: "Individual" },
    { value: "company", label: "Company" },
    { value: "partnership", label: "Partnership" },
    { value: "llc", label: "LLC" },
    { value: "corporation", label: "Corporation" },
    { value: "sole_proprietorship", label: "Sole Proprietorship" },
  ];

  // Load countries on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const countryOptions = allCountries.map(country => ({
      value: country.isoCode,
      label: country.name
    }));
    setCountries(countryOptions);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (formData.business_country) {
      const countryStates = State.getStatesOfCountry(formData.business_country);
      const stateOptions = countryStates.map(state => ({
        value: state.isoCode,
        label: state.name
      }));
      setStates(stateOptions);
      
      // Reset state and city when country changes
      setFormData(prev => ({
        ...prev,
        business_state: "",
        business_city: ""
      }));
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [formData.business_country]);

  // Load cities when state changes
  useEffect(() => {
    if (formData.business_country && formData.business_state) {
      const stateCities = City.getCitiesOfState(formData.business_country, formData.business_state);
      const cityOptions = stateCities.map(city => ({
        value: city.name,
        label: city.name
      }));
      setCities(cityOptions);
      
      // Reset city when state changes
      setFormData(prev => ({
        ...prev,
        business_city: ""
      }));
    } else {
      setCities([]);
    }
  }, [formData.business_country, formData.business_state]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.business_name.trim()) newErrors.business_name = "Business name is required";
    if (!formData.business_country) newErrors.business_country = "Country is required";
    if (!formData.business_state) newErrors.business_state = "State is required";
    if (!formData.business_city) newErrors.business_city = "City is required";
    if (!formData.business_address.trim()) newErrors.business_address = "Business address is required";
    if (!formData.business_certificate) newErrors.business_certificate = "Business certificate is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    if (!token) {
      setErrors({ submit: "Authentication required. Please log in again." });
      return;
    }

    setLoading(true);

    try {
      // Get country, state, and city names from their codes
      const countryName = Country.getCountryByCode(formData.business_country)?.name || formData.business_country;
      const stateName = State.getStateByCodeAndCountry(formData.business_state, formData.business_country)?.name || formData.business_state;
      const cityName = formData.business_city;

      const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

      const body = new FormData();
      body.append("business_name", formData.business_name);
      body.append("country_code", countryName);
      body.append("state_code", stateName);
      body.append("city_code", cityName);
      body.append("street_address", formData.business_address);
      if (formData.business_certificate) {
        body.append("business_certificate", formData.business_certificate);
      }

      const response = await fetch(`${BASE_URL}/agent/business`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          // No Content-Type — browser sets it automatically with the boundary for multipart
        },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Business details submission failed");
      }

      // Handle successful submission
      if (data.success) {
        Cookies.set("agent_status", "under_review", { expires: 7 });
        router.push("/signup/agent/pending-verification");
      } else {
        throw new Error(data.message || "Submission failed");
      }

    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : "Business details submission failed" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== "application/pdf") {
      setErrors(prev => ({ ...prev, business_certificate: "Only PDF files are accepted" }));
      e.target.value = "";
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, business_certificate: "File must be under 5 MB" }));
      e.target.value = "";
      return;
    }
    setFormData(prev => ({ ...prev, business_certificate: file }));
    setErrors(prev => ({ ...prev, business_certificate: undefined }));
  };

  const getCountryName = (countryCode: string) => {
    return Country.getCountryByCode(countryCode)?.name || countryCode;
  };

  const getStateName = (countryCode: string, stateCode: string) => {
    return State.getStateByCodeAndCountry(stateCode, countryCode)?.name || stateCode;
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* Left Side - Form Content */}
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4 sm:px-0 flex justify-end">
          <button
            onClick={() => logout("partner")}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </button>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
                Business Details
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Complete your business information to get started!
              </p>
            </div>

            {/* Business Details Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label required>Business Name</Label>
                  <InputField 
                    type="text"
                    name="business_name"
                    placeholder="Enter your business name"
                    value={formData.business_name}
                    onChange={handleChange}
                    error={errors.business_name}
                  />
                </div>

                

                <div>
                  <Label required>Country</Label>
                  <SelectField 
                    name="business_country"
                    placeholder="Select country"
                    value={formData.business_country}
                    onChange={handleChange}
                    options={countries}
                    error={errors.business_country}
                  />
                </div>

                <div>
                  <Label required>State/Province</Label>
                  <SelectField 
                    name="business_state"
                    placeholder={formData.business_country ? "Select state/province" : "Please select country first"}
                    value={formData.business_state}
                    onChange={handleChange}
                    options={states}
                    error={errors.business_state}
                    disabled={!formData.business_country}
                  />
                </div>

                <div>
                  <Label required>City</Label>
                  <SelectField 
                    name="business_city"
                    placeholder={formData.business_state ? "Select city" : "Please select state first"}
                    value={formData.business_city}
                    onChange={handleChange}
                    options={cities}
                    error={errors.business_city}
                    disabled={!formData.business_state}
                  />
                </div>

                <div>
                  <Label required>Business Address</Label>
                  <InputField
                    type="text"
                    name="business_address"
                    placeholder="Enter your complete business address"
                    value={formData.business_address}
                    onChange={handleChange}
                    error={errors.business_address}
                  />
                </div>

                <div>
                  <Label required>Business Certificate <span className="text-gray-400 font-normal">(PDF, max 5 MB)</span></Label>
                  <div className={`relative flex items-center w-full rounded-lg border ${errors.business_certificate ? "border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 overflow-hidden`}>
                    <label className="flex items-center gap-2 px-4 py-3 cursor-pointer w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className={`text-sm truncate ${formData.business_certificate ? "text-gray-800 dark:text-white" : "text-gray-400"}`}>
                        {formData.business_certificate ? formData.business_certificate.name : "Choose PDF file..."}
                      </span>
                      <input
                        type="file"
                        name="business_certificate"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {errors.business_certificate && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_certificate}</p>
                  )}
                </div>

                {/* Display selected location summary */}
                {(formData.business_country || formData.business_state || formData.business_city) && (
                  <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Selected Location:</strong>{" "}
                      {formData.business_city && `${formData.business_city}, `}
                      {formData.business_state && `${getStateName(formData.business_country, formData.business_state)}, `}
                      {formData.business_country && getCountryName(formData.business_country)}
                    </p>
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
                      <Save className="w-5 h-5" />
                    )}
                    {loading ? "SAVING DETAILS..." : "SAVE BUSINESS DETAILS"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                Need help? {""}
                <Link
                  href="/support"
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
  );
}