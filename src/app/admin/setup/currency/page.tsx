"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";
import { useRouter } from "next/navigation";

interface Currency {
    id: string;
    name: string;
    code: string;
    rate: number;
    symbol: string;
    position: "left" | "right";
    preview: string;
    status: "Active" | "Inactive";
    note?: string;
}

export default function CurrencySettingsPage() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");

    const router = useRouter();

    // Fetch currencies
    useEffect(() => {
        fetchCurrencies();
    }, []);

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

    const fetchCurrencies = async () => {
        try {
            const response = await fetch("/api/setup/currencies");
            const data = await response.json();

            if (response.ok) {
                setCurrencies(data);
            } else {
                showToast(data.error || "Failed to load currencies", "error");
            }
        } catch (error) {
            console.error("Error fetching currencies:", error);
            showToast("Failed to load currencies", "error");
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

    const handleEdit = (id: string) => {
        router.push(`/admin/setup/currency/edit/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this currency?")) {
            return;
        }

        setDeletingId(id);

        try {
            const response = await fetch(`/api/setup/currencies/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                showToast("Currency deleted successfully!", "success");
                await fetchCurrencies(); // Refresh the list
            } else {
                const errorData = await response.json();
                showToast(
                    errorData.error || "Failed to delete currency",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error deleting currency:", error);
            showToast("Failed to delete currency", "error");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <SetupSettingsSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white">Loading currencies...</div>
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

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">
                        Currency Settings
                    </h2>
                    <button
                        onClick={() =>
                            router.push("/admin/setup/currency/create")
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Create
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-300">
                        <thead className="bg-[#1F2937] text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Rate</th>
                                <th className="px-4 py-3">Symbol</th>
                                <th className="px-4 py-3">Position</th>
                                <th className="px-4 py-3">Preview</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currencies.map((currency, index) => (
                                <tr
                                    key={currency.id}
                                    className="border-b border-gray-700 hover:bg-[#1e293b] transition-colors"
                                >
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        {currency.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        {currency.code}
                                    </td>
                                    <td className="px-4 py-3">
                                        {currency.rate.toFixed(4)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {currency.symbol}
                                    </td>
                                    <td className="px-4 py-3 capitalize">
                                        {currency.position}
                                    </td>
                                    <td className="px-4 py-3">
                                        {currency.preview}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                currency.status === "Active"
                                                    ? "bg-green-700 text-green-200"
                                                    : "bg-red-700 text-red-200"
                                            }`}
                                        >
                                            {currency.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() =>
                                                handleEdit(currency.id)
                                            }
                                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(currency.id)
                                            }
                                            disabled={
                                                deletingId === currency.id
                                            }
                                            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-50"
                                        >
                                            {deletingId === currency.id ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {currencies.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            No currencies found. Create your first currency to
                            get started.
                        </div>
                    )}
                </div>

                {/* Per Page Section */}
                <div className="mt-4 flex items-center gap-3 text-gray-400">
                    <span>Showing {currencies.length} currencies</span>
                </div>
            </div>
        </div>
    );
}
