"use client";

import { useState, useEffect } from "react";
import { SearchIcon, CalendarIcon } from "lucide-react";

// Define the status types based on your Prisma schema
type DomainRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CONNECTED";

interface DomainRequest {
    id: number;
    uuid: string;
    domain: string;
    status: DomainRequestStatus;
    createdAt: string;
    updatedAt: string;
}

export default function DomainsRequestPage() {
    const [requests, setRequests] = useState<DomainRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<DomainRequestStatus | "">(
        ""
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchRequests = async (search = "", status = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (status) params.append("status", status);

            const url = `/api/domain-requests?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch domain requests");
            }

            const data = await response.json();
            setRequests(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Error fetching domain requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchRequests(searchTerm, statusFilter);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    const handleStatusChange = async (
        id: number,
        status: DomainRequestStatus
    ) => {
        try {
            setActionLoading(id);
            const response = await fetch(`/api/domain-requests/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error("Failed to update domain request status");
            }

            // Refresh the list
            fetchRequests(searchTerm, statusFilter);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update domain request status"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (
            !confirm(
                "Are you sure you want to delete this domain request? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            setActionLoading(id);
            const response = await fetch(`/api/domain-requests/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete domain request");
            }

            // Refresh the list
            fetchRequests(searchTerm, statusFilter);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete domain request"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: DomainRequestStatus) => {
        const statusConfig = {
            PENDING: {
                color: "bg-yellow-600/20 text-yellow-400",
                label: "Pending",
            },
            APPROVED: {
                color: "bg-blue-600/20 text-blue-400",
                label: "Approved",
            },
            REJECTED: {
                color: "bg-red-600/20 text-red-400",
                label: "Rejected",
            },
            CONNECTED: {
                color: "bg-green-600/20 text-green-400",
                label: "Connected",
            },
        };

        const config = statusConfig[status];

        return (
            <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${config.color}`}
            >
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading && requests.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center items-center py-12">
                    <div className="text-white">Loading domain requests...</div>
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
                        Domain Requests
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Manage domain connection requests.
                        {requests.length > 0 &&
                            ` (${requests.length} requests)`}
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

                {/* Status Filter */}
                <div className="w-full md:w-1/4">
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value as DomainRequestStatus | ""
                            )
                        }
                        className="w-full px-4 py-2.5 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CONNECTED">Connected</option>
                    </select>
                </div>

                {/* Date Filter */}
                <div className="relative w-full md:w-1/4">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                        type="date"
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
                                #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Requested Domain
                            </th>
                            
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Created Date
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {requests.map((request, index) => (
                            <tr
                                key={request.id}
                                className="hover:bg-[#1F2937] transition"
                            >
                                {/* Index */}
                                <td className="px-6 py-4 whitespace-nowrap text-white">
                                    {index + 1}
                                </td>

                                {/* Requested Domain */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-white font-medium">
                                        {request.domain}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        Requested:{" "}
                                        {formatDate(request.createdAt)}
                                    </div>
                                </td>

                               

                                {/* Created Date */}
                                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                    {formatDate(request.createdAt)}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 text-center">
                                    {getStatusBadge(request.status)}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            const action = e.target.value;
                                            if (action === "approve") {
                                                handleStatusChange(
                                                    request.id,
                                                    "APPROVED"
                                                );
                                            } else if (action === "reject") {
                                                handleStatusChange(
                                                    request.id,
                                                    "REJECTED"
                                                );
                                            } else if (action === "connect") {
                                                handleStatusChange(
                                                    request.id,
                                                    "CONNECTED"
                                                );
                                            } else if (action === "pending") {
                                                handleStatusChange(
                                                    request.id,
                                                    "PENDING"
                                                );
                                            } else if (action === "delete") {
                                                handleDelete(request.id);
                                            }
                                            e.target.value = "";
                                        }}
                                        disabled={actionLoading === request.id}
                                        className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                                    >
                                        <option
                                            value=""
                                            className="text-gray-400"
                                        >
                                            {actionLoading === request.id
                                                ? "Processing..."
                                                : "Actions"}
                                        </option>
                                        {request.status !== "APPROVED" && (
                                            <option value="approve">
                                                Approve
                                            </option>
                                        )}
                                        {request.status !== "REJECTED" && (
                                            <option value="reject">
                                                Reject
                                            </option>
                                        )}
                                        {request.status !== "CONNECTED" && (
                                            <option value="connect">
                                                Mark Connected
                                            </option>
                                        )}
                                        {request.status !== "PENDING" && (
                                            <option value="pending">
                                                Mark Pending
                                            </option>
                                        )}
                                        <option value="delete">
                                            Delete Request
                                        </option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* No data message */}
                {requests.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-400">
                        {searchTerm || statusFilter
                            ? "No domain requests found matching your criteria."
                            : "No domain requests found."}
                    </div>
                )}

                {loading && requests.length > 0 && (
                    <div className="p-6 text-center text-gray-400">
                        Loading...
                    </div>
                )}
            </div>
        </div>
    );
}
