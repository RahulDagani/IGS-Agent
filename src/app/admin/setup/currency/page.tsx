"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, RefreshCw } from "lucide-react";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Currency {
    id: number;
    tenant_id: number;
    from_currency: string;
    to_currency: string;
    conversion_rate: string;
    added_by: number | null;
    status: number;
    created_at: string;
    updated_at: string;
}

export default function CurrencySettingsPage() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Currency;
        direction: 'asc' | 'desc';
    }>({ key: 'id', direction: 'desc' });

    const router = useRouter();
    const { token } = useAuth();
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

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

    const fetchCurrencies = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            
            const response = await fetch(
                `${BASE_URL}/tenant/currency/list`,
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

            if (data.success) {
                setCurrencies(data.data || []);
            } else {
                throw new Error(data.message || "Failed to load currencies");
            }
        } catch (error) {
            console.error("Error fetching currencies:", error);
            showToast(
                error instanceof Error ? error.message : "Failed to load currencies", 
                "error"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchCurrencies(false);
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

    const handleEdit = (id: number) => {
        router.push(`/admin/setup/currency/edit/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this currency conversion rate?")) {
            return;
        }

        setDeletingId(id);

        try {
            const response = await fetch(
                `${BASE_URL}/tenant/currency/delete/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                showToast("Currency conversion rate deleted successfully!", "success");
                await fetchCurrencies(false); // Refresh the list
            } else {
                const errorMessage = data.message || data.error || "Failed to delete currency";
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error deleting currency:", error);
            showToast("Network error. Please try again.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSort = (key: keyof Currency) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: number) => {
        if (status === 1) {
            return (
                <span className="px-2 py-1 text-xs rounded-full bg-green-700/20 text-green-400 border border-green-700/30">
                    Active
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs rounded-full bg-red-700/20 text-red-400 border border-red-700/30">
                Inactive
            </span>
        );
    };

    // Filter and sort currencies
    const filteredAndSortedCurrencies = currencies
        .filter(currency => {
            const searchLower = searchTerm.toLowerCase();
            return (
                currency.from_currency.toLowerCase().includes(searchLower) ||
                currency.to_currency.toLowerCase().includes(searchLower) ||
                currency.conversion_rate.includes(searchTerm)
            );
        })
        .sort((a, b) => {
            if (sortConfig.key === 'id' || sortConfig.key === 'status' || sortConfig.key === 'added_by') {
                const aValue = a[sortConfig.key] || 0;
                const bValue = b[sortConfig.key] || 0;
                return sortConfig.direction === 'asc' 
                    ? Number(aValue) - Number(bValue)
                    : Number(bValue) - Number(aValue);
            } else {
                const aValue = String(a[sortConfig.key]).toLowerCase();
                const bValue = String(b[sortConfig.key]).toLowerCase();
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
        });

    const SortIcon = ({ column }: { column: keyof Currency }) => {
        if (sortConfig.key !== column) return null;
        return (
            <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <SetupSettingsSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        <p>Loading currency conversion rates...</p>
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

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Currency Conversion Rates
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Manage currency conversion rates for your application
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                        <button
                            onClick={() => router.push("/admin/setup/currency/create")}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Conversion Rate
                        </button>
                    </div>
                </div>

                {/* Search and Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by currency code or rate..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 pl-10 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center justify-end text-sm text-gray-400">
                        <span>Showing {filteredAndSortedCurrencies.length} of {currencies.length} conversion rates</span>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="min-w-full text-sm text-left text-gray-300">
                        <thead className="bg-[#1F2937] text-gray-400">
                            <tr>
                                <th 
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center">
                                        ID
                                        <SortIcon column="id" />
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                    onClick={() => handleSort('from_currency')}
                                >
                                    <div className="flex items-center">
                                        From Currency
                                        <SortIcon column="from_currency" />
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                    onClick={() => handleSort('to_currency')}
                                >
                                    <div className="flex items-center">
                                        To Currency
                                        <SortIcon column="to_currency" />
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                    onClick={() => handleSort('conversion_rate')}
                                >
                                    <div className="flex items-center">
                                        Rate
                                        <SortIcon column="conversion_rate" />
                                    </div>
                                </th>
                                <th className="px-4 py-3">Preview</th>
                                <th 
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center">
                                        Status
                                        <SortIcon column="status" />
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                    onClick={() => handleSort('created_at')}
                                >
                                    <div className="flex items-center">
                                        Created
                                        <SortIcon column="created_at" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedCurrencies.map((currency, index) => (
                                <tr
                                    key={currency.id}
                                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                                >
                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                                        #{currency.id}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">
                                                {currency.from_currency}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {currency.from_currency.length === 3 ? 'ISO Code' : 'Custom'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">
                                                {currency.to_currency}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {currency.to_currency.length === 3 ? 'ISO Code' : 'Custom'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-white">
                                                {parseFloat(currency.conversion_rate).toFixed(6)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm bg-gray-800/50 px-3 py-1 rounded border border-gray-700">
                                            1 {currency.from_currency} = {parseFloat(currency.conversion_rate).toFixed(4)} {currency.to_currency}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(currency.status)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">
                                        {formatDate(currency.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(currency.id)}
                                                className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 rounded-lg transition-all border border-blue-600/30 hover:border-blue-600/50"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(currency.id)}
                                                disabled={deletingId === currency.id}
                                                className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-600/30 hover:border-red-600/50 disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deletingId === currency.id ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredAndSortedCurrencies.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-2">
                                <svg className="w-12 h-12 mx-auto opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 mb-4">
                                {searchTerm ? 'No conversion rates found matching your search.' : 'No currency conversion rates found.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => router.push("/admin/setup/currency/create")}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all"
                                >
                                    <Plus className="w-4 h-4 inline mr-2" />
                                    Add Your First Conversion Rate
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Information Card */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-400 mb-2">💡 How Currency Conversion Works</h3>
                    <ul className="text-xs text-blue-400/80 space-y-1">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Each conversion rate defines how much of the "to" currency equals 1 unit of the "from" currency</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>For example: USD → INR: 83.25 means 1 USD = 83.25 INR</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>You need to create both directions (USD→INR and INR→USD) for complete conversion support</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Rates should be updated regularly to reflect current market values</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}