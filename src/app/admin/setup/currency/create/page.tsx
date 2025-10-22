"use client";

import { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";
import { useRouter } from "next/navigation";

export default function CreateCurrencyPage() {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        rate: "",
        symbol: "",
        position: "left",
        status: "active",
        note: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");

    const router = useRouter();

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
        setLoading(true);

        try {
            const response = await fetch("/api/setup/currencies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                showToast("Currency created successfully!", "success");
                setTimeout(() => {
                    router.push("/admin/setup/currency");
                }, 1000);
            } else {
                const errorData = await response.json();
                showToast(
                    errorData.error || "Failed to create currency",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error creating currency:", error);
            showToast("Failed to create currency", "error");
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
            name: "",
            code: "",
            rate: "",
            symbol: "",
            position: "left",
            status: "active",
            note: "",
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
                        Create Currency
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
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter currency name (e.g., US Dollar)"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="code"
                            placeholder="Enter currency code (e.g., USD)"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            maxLength={3}
                            className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            3-letter currency code (ISO 4217)
                        </p>
                    </div>

                    {/* Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Exchange Rate{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="rate"
                            step="0.0001"
                            min="0"
                            placeholder="1.0000"
                            value={formData.rate}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Exchange rate compared to USD (1 USD = ?)
                        </p>
                    </div>

                    {/* Symbol */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Symbol <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="symbol"
                            placeholder="Enter currency symbol (e.g., $)"
                            value={formData.symbol}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Currency Position */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Currency Position
                        </label>
                        <select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="left">Left ($100)</option>
                            <option value="right">Right (100$)</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Note
                        </label>
                        <textarea
                            name="note"
                            placeholder="Optional notes about this currency..."
                            value={formData.note}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Creating..." : "Create Currency"}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
