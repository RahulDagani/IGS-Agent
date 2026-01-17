"use client";

import { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Currency {
  id: number;
  currency_code: string;
  currency_name: string;
}

export default function CreateCurrencyPage() {
    const [formData, setFormData] = useState({
        from_currency: "",
        to_currency: "",
        conversion_rate: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");

    const router = useRouter();
    const { token } = useAuth();
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (formData.from_currency === formData.to_currency) {
            showToast("From currency and To currency cannot be the same", "error");
            return;
        }
        
        if (!formData.conversion_rate || parseFloat(formData.conversion_rate) <= 0) {
            showToast("Please enter a valid conversion rate", "error");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${BASE_URL}/tenant/currency/add`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        from_currency: formData.from_currency,
                        to_currency: formData.to_currency,
                        conversion_rate: parseFloat(formData.conversion_rate)
                    }),
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                showToast("Currency conversion rate created successfully!", "success");
                setTimeout(() => {
                    router.push("/admin/setup/currency");
                }, 1500);
            } else {
                const errorMessage = data.message || data.error || "Failed to create currency conversion rate";
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error creating currency conversion rate:", error);
            showToast("Network error. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: "success" | "error") => {
        if (type === "success") {
            setSuccess(message);
            setError("");
        } else {
            setError(message);
            setSuccess("");
        }
    };

    const handleReset = () => {
        setFormData({
            from_currency: "",
            to_currency: "",
            conversion_rate: "",
        });
    };

   

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">
            {/* Sidebar */}
            <SetupSettingsSidebar />

            {/* Main Content */}
            <div className="flex-1 mt-6 ml-0 lg:ml-6 lg:mt-0 mb-6 bg-[#111827] rounded-xl shadow-lg border border-white/10 p-6">
                {/* Toast Notifications */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg flex justify-between items-center">
                        <p className="text-green-400 text-sm">{success}</p>
                        <button
                            onClick={() => setSuccess("")}
                            className="text-green-400 hover:text-green-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex justify-between items-center">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={() => setError("")}
                            className="text-red-400 hover:text-red-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                        Add Currency Conversion Rate
                    </h2>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* From Currency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            From Currency <span className="text-red-500">*</span>
                        </label>                      

                        <input
                                type="text"
                                name="from_currency"
                                step="0.0001"
                                min="0"
                                placeholder="e.g., USD"
                                value={formData.from_currency}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                    </div>

                    {/* To Currency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            To Currency <span className="text-red-500">*</span>
                        </label>

                        <input
                                type="text"
                                name="to_currency"
                                step="0.0001"
                                min="0"
                                placeholder="e.g., INR"
                                value={formData.to_currency}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                    </div>

                    {/* Conversion Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Conversion Rate <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="conversion_rate"
                                step="0.0001"
                                min="0"
                                placeholder="e.g., 83.25"
                                value={formData.conversion_rate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            {formData.from_currency && formData.to_currency ? (
                                `1 ${formData.from_currency} = ${formData.conversion_rate || '?'} ${formData.to_currency}`
                            ) : (
                                "Enter conversion rate (e.g., 1 USD = 83.25 INR)"
                            )}
                        </p>
                    </div>

                    {/* Preview */}
                    {(formData.from_currency && formData.to_currency && formData.conversion_rate) && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-400 mb-2">Preview</h3>
                            <p className="text-sm text-gray-300">
                                {formData.from_currency} → {formData.to_currency}
                            </p>
                            <p className="text-lg font-semibold text-white mt-1">
                                1 {formData.from_currency} = {parseFloat(formData.conversion_rate).toFixed(4)} {formData.to_currency}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                This will create a conversion rate from {formData.from_currency} 
                                to {formData.to_currency}
                            </p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            type="submit"
                            disabled={loading || !formData.from_currency || !formData.to_currency}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Creating..." : "Add Conversion Rate"}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
                        >
                            Reset
                        </button>
                    </div>
                </form>

                {/* Help Text */}
                <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">How it works</h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>Select the "From Currency" (the currency you're converting from)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>Select the "To Currency" (the currency you're converting to)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>Enter the conversion rate (e.g., 83.25 means 1 USD = 83.25 INR)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>The system will use this rate to convert between the two currencies</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}