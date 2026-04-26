"use client";

import { useState } from "react";
import { Phone, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Suspense } from "react";

function CollectPhoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { token, updateUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!/^\+?[\d\s\-().]{7,20}$/.test(phone.trim())) {
      setError("Please enter a valid phone number");
      return;
    }

    if (!token) {
      setError("Session expired. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
      const response = await fetch(`${BASE_URL}/agent/phone`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone_number: phone.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save phone number");
      }

      updateUser({ phone_number: phone.trim() });

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
                  <input
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError(undefined);
                    }}
                    className={`w-full px-4 py-3 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      error ? "border-red-500" : "border-gray-300"
                    }`}
                  />
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
