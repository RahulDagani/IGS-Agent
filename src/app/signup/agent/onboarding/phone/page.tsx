"use client";

import { useState } from "react";
import { Phone, ArrowRight, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Suspense } from "react";
import phoneCountries from "country-list-with-dial-code-and-flag";

interface CountryData {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

const allCountries = phoneCountries.getAll() as CountryData[];
const defaultCountry = allCountries.find((c) => c.code === "US") ?? allCountries[0];

function CollectPhoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { token, updateUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const filteredCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dial_code.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!/^[\d\s\-().]{4,15}$/.test(phone.trim())) {
      setError("Please enter a valid phone number");
      return;
    }

    if (!token) {
      setError("Session expired. Please sign in again.");
      return;
    }

    const fullPhone = `${selectedCountry.dial_code}${phone.trim()}`;

    setLoading(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
      const response = await fetch(`${BASE_URL}/agent/phone`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone_number: fullPhone }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save phone number");
      }

      updateUser({ phone_number: fullPhone });

      if (next === "pending") {
        router.push("/signup/agent/pending-verification");
      } else {
        router.push("/signup/agent/onboarding/business");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
          <div>
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
                <Phone className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
            </div>

            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
                Add Your Phone Number
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We need your phone number to complete your account setup and keep you informed about your application status.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <div className="relative mr-2">
                      <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-3 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{selectedCountry.dial_code}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      {isOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                          <div className="absolute left-0 top-full mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-64 flex flex-col">
                            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                              <input
                                type="text"
                                placeholder="Search country..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                autoFocus
                              />
                            </div>
                            <div className="overflow-y-auto flex-1">
                              {filteredCountries.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => { setSelectedCountry(c); setIsOpen(false); setSearchTerm(""); }}
                                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <span className="text-xl mr-3">{c.flag}</span>
                                  <span className="flex-1 text-left text-gray-700 dark:text-gray-300">{c.name}</span>
                                  <span className="text-gray-500 dark:text-gray-400">{c.dial_code}</span>
                                </button>
                              ))}
                              {filteredCountries.length === 0 && (
                                <div className="px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-400">No countries found</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      type="tel"
                      placeholder="555 000 0000"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ''));
                        if (error) setError(undefined);
                      }}
                      className={`flex-1 px-4 py-3 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                        error ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                  {loading ? "SAVING..." : "CONTINUE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectPhonePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
            <div className="text-center text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <CollectPhoneContent />
    </Suspense>
  );
}
