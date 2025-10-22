"use client";

import { useState, useEffect } from "react";
import { Plus, Printer, Edit, Trash2, X, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface Permission {
    id: string;
    name: string;
    category: string;
    description?: string;
}

interface Role {
    id: string;
    name: string;
    description?: string;
    isSystem: boolean;
    permissions: Permission[];
}

export default function RolesAndPermissionsPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useState<number>(10);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");

    const router = useRouter();

    // Fetch roles
    useEffect(() => {
        fetchRoles();
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

    const fetchRoles = async () => {
        try {
            const response = await fetch("/api/setup/roles");
            const data = await response.json();

            if (response.ok) {
                setRoles(data);
            } else {
                showToast(data.error || "Failed to load roles", "error");
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            showToast("Failed to load roles", "error");
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

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the role "${name}"?`)) {
            return;
        }

        setDeletingId(id);

        try {
            const response = await fetch(`/api/setup/roles/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                showToast("Role deleted successfully!", "success");
                await fetchRoles(); // Refresh the list
            } else {
                const errorData = await response.json();
                showToast(errorData.error || "Failed to delete role", "error");
            }
        } catch (error) {
            console.error("Error deleting role:", error);
            showToast("Failed to delete role", "error");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white">Loading roles...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">
            {/* Sidebar */}

            {/* Main Content */}
            <div className="flex-1 mt-6 ml-0 lg:ml-6 lg:mt-0 mb-6">
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

                <div className="bg-[#111827] rounded-xl shadow-lg border border-white/10 p-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Roles & Permissions
                            </h2>
                            <p className="text-gray-400 mt-1">
                                Manage user roles and their permissions
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Print Button */}
                            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm rounded-lg transition">
                                <Printer className="w-4 h-4" />
                            </button>

                            {/* Create Button */}
                            <button
                                onClick={() =>
                                    router.push("/admin/roles/create")
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition"
                            >
                                <Plus className="w-4 h-4" />
                                Create Role
                            </button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#1F2937]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                        Role Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                        Permissions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {roles.map((role, index) => (
                                    <tr
                                        key={role.id}
                                        className="hover:bg-[#1F2937] transition-colors"
                                    >
                                        <td className="px-6 py-4 text-gray-300">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-indigo-400" />
                                                <span className="text-white font-medium">
                                                    {role.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {role.description ||
                                                "No description"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions
                                                    .slice(0, 3)
                                                    .map((perm) => (
                                                        <span
                                                            key={perm.id}
                                                            className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30"
                                                        >
                                                            {perm.name}
                                                        </span>
                                                    ))}
                                                {role.permissions.length >
                                                    3 && (
                                                    <span className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">
                                                        +
                                                        {role.permissions
                                                            .length - 3}{" "}
                                                        more
                                                    </span>
                                                )}
                                                {role.permissions.length ===
                                                    0 && (
                                                    <span className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">
                                                        No permissions
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    role.isSystem
                                                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                        : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                                                }`}
                                            >
                                                {role.isSystem
                                                    ? "System"
                                                    : "Custom"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {role.name != "SUPER_ADMIN" ? (
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/admin/setup/roles/edit/${role.id}`
                                                            )
                                                        }
                                                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                                                        title={"Edit role"}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <></>
                                                )}

                                                {!role.isSystem && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                role.id,
                                                                role.name
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            role.id
                                                        }
                                                        className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition disabled:opacity-50"
                                                        title="Delete role"
                                                    >
                                                        {deletingId ===
                                                        role.id ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {roles.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-300 mb-2">
                                    No roles found
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Get started by creating your first role
                                </p>
                                <button
                                    onClick={() =>
                                        router.push("/admin/roles/create")
                                    }
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                                >
                                    Create Role
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Section */}
                    <div className="mt-6 flex items-center justify-between border-t border-gray-700 pt-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-300">
                                Per Page
                            </span>
                            <select
                                value={perPage}
                                onChange={(e) =>
                                    setPerPage(Number(e.target.value))
                                }
                                className="text-sm rounded-md bg-[#111827] border border-gray-700 text-white px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-400">
                            Showing {roles.length} role
                            {roles.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
