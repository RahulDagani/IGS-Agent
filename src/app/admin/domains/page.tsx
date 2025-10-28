"use client";

import { useState, useEffect } from "react";
import {
    SearchIcon,
    Trash2,
    CheckCircle,
    XCircle,
    Star,
    Eye,
} from "lucide-react";

interface Domain {
    id: number;
    uuid: string;
    domain: string;
    isActive: boolean;
    isPrimary: boolean;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function DomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchDomains = async (search = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append("search", search);

            const url = `/api/domains?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch domains");
            }

            const data = await response.json();
            setDomains(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Error fetching domains:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDomains(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleStatusUpdate = async (
        id: number,
        field: string,
        value: boolean
    ) => {
        try {
            setActionLoading(id);
            const response = await fetch(`/api/domains/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ [field]: value }),
            });

            if (!response.ok) {
                throw new Error("Failed to update domain");
            }

            // Refresh the list
            fetchDomains(searchTerm);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update domain"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (
            !confirm(
                "Are you sure you want to delete this domain? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            setActionLoading(id);
            const response = await fetch(`/api/domains/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete domain");
            }

            // Refresh the list
            fetchDomains(searchTerm);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete domain"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading && domains.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center items-center py-12">
                    <div className="text-white">Loading domains...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Domains
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Manage domains.
                        {domains.length > 0 && ` (${domains.length} domains)`}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Search Bar */}
                <div className="relative w-full md:w-1/3">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by domain, or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#111827] shadow-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#1F2937]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Domain
                            </th>
                         
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Primary
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Verified
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {domains.map((domain) => (
                            <tr
                                key={domain.id}
                                className="hover:bg-[#1F2937] transition"
                            >
                                {/* Domain */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-white font-medium">
                                        {domain.domain}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        ID: {domain.id}
                                    </div>
                                </td>

                               

                                {/* Status */}
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() =>
                                            handleStatusUpdate(
                                                domain.id,
                                                "isActive",
                                                !domain.isActive
                                            )
                                        }
                                        disabled={actionLoading === domain.id}
                                        className={`flex items-center justify-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                            domain.isActive
                                                ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                                                : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                        } disabled:opacity-50 mx-auto`}
                                    >
                                        {domain.isActive ? (
                                            <CheckCircle className="w-3 h-3" />
                                        ) : (
                                            <XCircle className="w-3 h-3" />
                                        )}
                                        {domain.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </button>
                                </td>

                                {/* Primary */}
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() =>
                                            handleStatusUpdate(
                                                domain.id,
                                                "isPrimary",
                                                !domain.isPrimary
                                            )
                                        }
                                        disabled={
                                            actionLoading === domain.id ||
                                            !domain.isActive
                                        }
                                        className={`flex items-center justify-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                            domain.isPrimary
                                                ? "bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30"
                                                : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                                        } disabled:opacity-50 mx-auto`}
                                    >
                                        <Star
                                            className={`w-3 h-3 ${
                                                domain.isPrimary
                                                    ? "fill-current"
                                                    : ""
                                            }`}
                                        />
                                        {domain.isPrimary
                                            ? "Primary"
                                            : "Secondary"}
                                    </button>
                                </td>

                                {/* Verified */}
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() =>
                                            handleStatusUpdate(
                                                domain.id,
                                                "verified",
                                                !domain.verified
                                            )
                                        }
                                        disabled={
                                            actionLoading === domain.id ||
                                            !domain.isActive
                                        }
                                        className={`flex items-center justify-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                            domain.verified
                                                ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                                                : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                                        } disabled:opacity-50 mx-auto`}
                                    >
                                        <Eye className="w-3 h-3" />
                                        {domain.verified
                                            ? "Verified"
                                            : "Pending"}
                                    </button>
                                </td>

                                {/* Created Date */}
                                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                    {formatDate(domain.createdAt)}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => handleDelete(domain.id)}
                                        disabled={actionLoading === domain.id}
                                        className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* No data message */}
                {domains.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-400">
                        {searchTerm
                            ? "No domains found matching your criteria."
                            : "No domains found."}
                    </div>
                )}

                {loading && domains.length > 0 && (
                    <div className="p-6 text-center text-gray-400">
                        Loading...
                    </div>
                )}
            </div>
        </div>
    );
}
