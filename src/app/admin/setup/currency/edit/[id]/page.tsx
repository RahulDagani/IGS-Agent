"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface CurrencyData {
    id: number;
    tenant_id: number;
    from_currency: string;
    to_currency: string;
    conversion_rate: string;
    added_by: number;
    status: number;
    created_at: string;
    updated_at: string;
}

export default function EditCurrencyPage() {
    const [formData, setFormData] = useState({
        from_currency: "",
        to_currency: "",
        conversion_rate: "",
    });

    const [originalData, setOriginalData] = useState<CurrencyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");

    const router = useRouter();
    const params = useParams();
    const currencyId = params.id as string;

    const { token } = useAuth();
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

    // Fetch currency data
    useEffect(() => {
        if (currencyId) {
            fetchCurrency();
        }
    }, [currencyId]);

    // Auto-hide toasts
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess("");
                setError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const fetchCurrency = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/tenant/currency/get/${currencyId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data) {
                const currencyData = data.data;
                setOriginalData(currencyData);
                setFormData({
                    from_currency: currencyData.from_currency,
                    to_currency: currencyData.to_currency,
                    conversion_rate: currencyData.conversion_rate,
                });
            } else {
                throw new Error(data.message || "Failed to load currency");
            }
        } catch (error) {
            console.error("Error fetching currency:", error);
            showToast(
                error instanceof Error ? error.message : "Failed to load currency", 
                "error"
            );
            setTimeout(() => {
                router.push("/admin/setup/currency");
            }, 2000);
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.from_currency.trim()) {
            showToast("From Currency is required", "error");
            return;
        }
        
        if (!formData.to_currency.trim()) {
            showToast("To Currency is required", "error");
            return;
        }
        
        if (formData.from_currency === formData.to_currency) {
            showToast("From currency and To currency cannot be the same", "error");
            return;
        }
        
        if (!formData.conversion_rate || parseFloat(formData.conversion_rate) <= 0) {
            showToast("Please enter a valid conversion rate", "error");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${BASE_URL}/tenant/currency/update/${currencyId}`,
                {
                    method: "PUT",
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
                showToast("Currency conversion rate updated successfully!", "success");
                // Update original data
                setOriginalData(prev => prev ? {
                    ...prev,
                    from_currency: formData.from_currency,
                    to_currency: formData.to_currency,
                    conversion_rate: formData.conversion_rate,
                    updated_at: new Date().toISOString()
                } : null);
                
                setTimeout(() => {
                    router.push("/admin/setup/currency");
                }, 1500);
            } else {
                const errorMessage = data.message || data.error || "Failed to update currency conversion rate";
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error updating currency:", error);
            showToast("Network error. Please try again.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (originalData) {
            setFormData({
                from_currency: originalData.from_currency,
                to_currency: originalData.to_currency,
                conversion_rate: originalData.conversion_rate,
            });
            showToast("Form reset to original values", "success");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <SetupSettingsSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        <p>Loading currency conversion rate...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">
            {/* Sidebar */}
            <SetupSettingsSidebar />

            {/* Main Content */}
            <div className="flex-1 mt-6 ml-0 lg:ml-6 lg:mt-0 mb-6 bg-[#111827] rounded-xl shadow-lg border border-white/10 p-6">
                {/* Toast Notifications */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg flex justify-between items-center animate-pulse">
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
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex justify-between items-center animate-pulse">
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
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Edit Currency Conversion Rate
                        </h2>
                        {originalData && (
                            <p className="text-sm text-gray-400 mt-1">
                                ID: {originalData.id} • Created: {formatDate(originalData.created_at)}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>

                {/* Original Data Summary */}
                {originalData && (
                    <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Original Conversion Rate</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400">From Currency</p>
                                <p className="text-sm font-medium text-white">{originalData.from_currency}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">To Currency</p>
                                <p className="text-sm font-medium text-white">{originalData.to_currency}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-400">Conversion Rate</p>
                                <p className="text-lg font-semibold text-white">
                                    1 {originalData.from_currency} = {parseFloat(originalData.conversion_rate).toFixed(6)} {originalData.to_currency}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Status</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${originalData.status === 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {originalData.status === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Last Updated</p>
                                <p className="text-sm text-gray-300">{formatDate(originalData.updated_at)}</p>
                            </div>
                        </div>
                    </div>
                )}

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
                            placeholder="e.g., USD"
                            value={formData.from_currency}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                            maxLength={3}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            3-letter currency code (ISO 4217)
                        </p>
                    </div>

                    {/* To Currency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            To Currency <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="to_currency"
                            placeholder="e.g., INR"
                            value={formData.to_currency}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                            maxLength={3}
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
                                step="0.000001"
                                min="0.000001"
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
                            <h3 className="text-sm font-medium text-blue-400 mb-2">Preview Changes</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400">From Currency</p>
                                    <p className={`text-sm font-medium ${formData.from_currency !== originalData?.from_currency ? 'text-yellow-400' : 'text-white'}`}>
                                        {formData.from_currency}
                                        {formData.from_currency !== originalData?.from_currency && (
                                            <span className="text-xs text-yellow-400 ml-2">(changed)</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">To Currency</p>
                                    <p className={`text-sm font-medium ${formData.to_currency !== originalData?.to_currency ? 'text-yellow-400' : 'text-white'}`}>
                                        {formData.to_currency}
                                        {formData.to_currency !== originalData?.to_currency && (
                                            <span className="text-xs text-yellow-400 ml-2">(changed)</span>
                                        )}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-400">New Conversion Rate</p>
                                    <p className={`text-lg font-semibold ${formData.conversion_rate !== originalData?.conversion_rate ? 'text-yellow-400' : 'text-white'}`}>
                                        1 {formData.from_currency} = {parseFloat(formData.conversion_rate).toFixed(6)} {formData.to_currency}
                                        {formData.conversion_rate !== originalData?.conversion_rate && (
                                            <span className="text-xs text-yellow-400 ml-2">(changed)</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            type="submit"
                            disabled={saving || !formData.from_currency || !formData.to_currency || !formData.conversion_rate}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Updating..." : "Update Conversion Rate"}
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={saving || JSON.stringify(formData) === JSON.stringify({
                                    from_currency: originalData?.from_currency || "",
                                    to_currency: originalData?.to_currency || "",
                                    conversion_rate: originalData?.conversion_rate || ""
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </form>

                {/* Warning */}
                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-400 mb-2">⚠️ Important Note</h3>
                    <ul className="text-xs text-yellow-400 space-y-1">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Changing the conversion rate will affect all financial calculations using this currency pair</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Make sure the new rate is accurate and up-to-date</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Consider the impact on existing transactions and calculations</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}