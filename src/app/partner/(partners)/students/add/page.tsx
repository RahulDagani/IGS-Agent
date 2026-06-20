"use client"
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StudentFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface PhoneCountry {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

const PhoneInput = ({
  value,
  onChange,
  name,
  error,
  selectedCountry,
  onCountryChange,
  allCountries = [],
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
  selectedCountry: PhoneCountry;
  onCountryChange: (country: PhoneCountry) => void;
  allCountries?: PhoneCountry[];
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
        <div className="relative">
          <button
            type="button"
            onClick={handleOpen}
            className={`flex items-center gap-1.5 h-11 px-3 rounded-lg border bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
            }`}
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

        <input
          type="tel"
          name={name}
          placeholder="Phone number"
          value={value}
          onChange={onChange}
          className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 flex-1 rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
            error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default function AddStudent() {
  const router = useRouter();
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [allCountries, setAllCountries] = useState<PhoneCountry[]>([]);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<PhoneCountry>({
    name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳",
  });

  const [formData, setFormData] = useState<StudentFormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<StudentFormData>>({});

  useEffect(() => {
    fetch(`${BASE_URL}/countries`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const list: PhoneCountry[] = (d.data || []).map((c: any) => ({
            name: c.name,
            dial_code: c.phone_code,
            code: c.iso_code,
            flag: c.flag || "",
          }));
          setAllCountries(list);
          const india = list.find(c => c.code === "IN") || list[0];
          if (india) setSelectedPhoneCountry(india);
        }
      })
      .catch(() => {});
  }, [BASE_URL]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  // For name fields, only allow letters, spaces, hyphens, and apostrophes
  if (name === "first_name" || name === "middle_name" || name === "last_name") {
    // Allow only letters (including accented), spaces, hyphens, and apostrophes
    const cleaned = value.replace(/[^a-zA-Z\s\-']/g, "");
    setFormData(prev => ({ ...prev, [name]: cleaned }));
    if (errors[name as keyof StudentFormData]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    return;
  }
  
  // For phone, only allow digits
  if (name === "phone") {
    const cleaned = value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, [name]: cleaned }));
    if (errors[name as keyof StudentFormData]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    return;
  }
  
  // For email and other fields
  setFormData(prev => ({ ...prev, [name]: value }));
  if (errors[name as keyof StudentFormData]) {
    setErrors(prev => ({ ...prev, [name]: "" }));
  }
};

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentFormData> = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{4,15}$/.test(formData.phone)) newErrors.phone = "Please enter a valid phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const phone = `${selectedPhoneCountry.dial_code}${formData.phone}`;

      const response = await fetch(`${BASE_URL}/agent/student/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, phone }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message);
        setTimeout(() => setError(""), 3000);
      } else {
        setSuccess("Student created successfully!");
        setTimeout(() => setSuccess(""), 3000);
        router.push("/partner/students");
        router.refresh();
      }
    } catch {
      setError("Failed to create student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Add New Student</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a new student account with basic information.</p>
        {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
        {success && <p className="mt-1 text-sm text-green-500 dark:text-green-400">{success}</p>}
      </div>

      <div className="space-y-6 border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">First Name *</label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><User size={18} /></span>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Enter first name" required className={inputCls} />
                  </div>
                  {errors.first_name && <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>}
                </div>

                {/* Middle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Middle Name</label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><User size={18} /></span>
                    <input type="text" name="middle_name" value={formData.middle_name} onChange={handleInputChange} placeholder="Enter middle name (optional)" className={inputCls} />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Last Name *</label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><User size={18} /></span>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Enter last name" required className={inputCls} />
                  </div>
                  {errors.last_name && <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Email Address *</label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><Mail size={18} /></span>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" required className={inputCls} />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Phone Number *</label>
                  <PhoneInput
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    selectedCountry={selectedPhoneCountry}
                    onCountryChange={setSelectedPhoneCountry}
                    allCountries={allCountries}
                  />
                </div>

              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={() => router.back()}
              className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </div>
              ) : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
