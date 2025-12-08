"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Users, Shield, Key, Calendar, Eye, MoreVertical, CheckCircle, XCircle, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Permission {
    permission_id: number;
    permission_key: string;
    permission_name: string;
}

interface Module {
    module_id: number;
    module_name: string;
    module_key: string;
    permissions: Permission[];
}

interface Role {
    id: number;
    tenant_id: number;
    role_name: string;
    // role_key: string;
    data_access: string;
    is_active: number;
    created_at: string;
    permissions_count: number;
    modules: Module[];
}

interface ApiResponse {
    success: boolean;
    data: Role[];
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function RolesAndPermissionsPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [filter, setFilter] = useState<string>("all"); // "all", "active", "inactive"
    const [searchTerm, setSearchTerm] = useState<string>("");
    
    const {token} = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchRoles();
    }, []);

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
            const response = await fetch(`${BASE_URL}/tenant/roles`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data: ApiResponse = await response.json();

            if (data.success) {
                setRoles(data.data);
                showToast("Roles loaded successfully!", "success");
            } else {
                showToast("Failed to load roles", "error");
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

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete the role "${name}"?`)) {
            return;
        }

        setDeletingId(id);

        try {
            const response = await fetch(`${BASE_URL}/tenant/roles/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                showToast("Role deleted successfully!", "success");
                await fetchRoles(); // Refresh the list
            } else {
                const errorData = await response.json();
                showToast(errorData.message || "Failed to delete role", "error");
            }
        } catch (error) {
            console.error("Error deleting role:", error);
            showToast("Failed to delete role", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTopModules = (role: Role) => {
        return role.modules.slice(0, 3).map(module => module.module_name);
    };

    const getDataAccessLabel = (dataAccess: string) => {
        const labels: Record<string, string> = {
            'all': 'Allowed Access to All data',
            'assigned': 'Allowed Access to Assigned Data',
           
        };
        return labels[dataAccess] || dataAccess;
    };

    // Filter roles based on search term and filter
    const filteredRoles = roles.filter(role => {
        // Apply status filter
        if (filter === "active" && role.is_active !== 1) return false;
        if (filter === "inactive" && role.is_active !== 0) return false;
        
        // Apply search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                role.role_name.toLowerCase().includes(term) ||
                // role.role_key.toLowerCase().includes(term) ||
                role.data_access.toLowerCase().includes(term)
            );
        }
        
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-gray-600 border-t-indigo-500 mb-4"></div>
                    <div className="text-gray-400 text-lg">Loading roles...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 ">
            <div className="max-w-7xl mx-auto">
                {/* Toast Notifications */}
                {success && (
                    <div className="mb-6 bg-gradient-to-r from-green-900/20 to-green-800/20 backdrop-blur-sm border border-green-700/50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <p className="text-green-300">{success}</p>
                        </div>
                        <button
                            onClick={() => setSuccess("")}
                            className="text-green-400 hover:text-green-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-700/50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-300">{error}</p>
                        </div>
                        <button
                            onClick={() => setError("")}
                            className="text-red-400 hover:text-red-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Roles Management</h1>
                        <p className="text-gray-400 mt-2">Manage and configure user roles and permissions</p>
                    </div>
                    
                    <button
                        onClick={() => router.push("/admin/roles/create")}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg transition"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Role
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Roles</p>
                                <p className="text-2xl font-bold text-white mt-2">{roles.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Active Roles</p>
                                <p className="text-2xl font-bold text-white mt-2">
                                    {roles.filter(role => role.is_active === 1).length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                    </div>

                    

                   
                </div>

                {/* Filters and Search */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search roles by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-11 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                <Filter className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-800/50 border border-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 text-sm rounded-md transition ${
                                    filter === "all" 
                                        ? "bg-gray-700 text-white" 
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                All Roles
                            </button>
                            <button
                                onClick={() => setFilter("active")}
                                className={`px-4 py-2 text-sm rounded-md transition ${
                                    filter === "active" 
                                        ? "bg-green-500/20 text-green-300" 
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilter("inactive")}
                                className={`px-4 py-2 text-sm rounded-md transition ${
                                    filter === "inactive" 
                                        ? "bg-red-500/20 text-red-300" 
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                {/* Roles Grid/Table */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-700 bg-gray-900/50">
                        <div className="col-span-3">
                            <span className="text-sm font-medium text-gray-300">Role Name</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-sm font-medium text-gray-300">Status</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-sm font-medium text-gray-300">Permissions</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-sm font-medium text-gray-300">Data Access</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-sm font-medium text-gray-300">Created</span>
                        </div>
                        <div className="col-span-1">
                            <span className="text-sm font-medium text-gray-300">Actions</span>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-700">
                        {filteredRoles.length === 0 ? (
                            <div className="p-12 text-center">
                                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-300 mb-2">
                                    No roles found
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    {searchTerm 
                                        ? `No roles match your search "${searchTerm}"` 
                                        : "Get started by creating your first role"}
                                </p>
                                {searchTerm ? (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
                                    >
                                        Clear Search
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push("/admin/roles/create")}
                                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg transition"
                                    >
                                        Create Role
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredRoles.map((role) => (
                                <div 
                                    key={role.id} 
                                    className="grid grid-cols-12 gap-4 p-6 hover:bg-gray-800/30 transition-colors"
                                >
                                    {/* Role Name and Key */}
                                    <div className="col-span-3">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                                <Users className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-white">
                                                        {role.role_name}
                                                    </h3>
                                                    {role.is_active === 0 && (
                                                        <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-300 rounded-full">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                {/* <div className="flex items-center gap-2 mt-1">
                                                    <Key className="w-3 h-3 text-gray-400" />
                                                    <code className="text-xs text-gray-400 font-mono">
                                                        {role.role_key}
                                                    </code>
                                                </div> */}
                                                {role.modules.length > 0 && (
                                                    <div className="mt-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {getTopModules(role).map((moduleName, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 text-xs bg-purple-500/10 text-purple-300 rounded border border-purple-500/20"
                                                                >
                                                                    {moduleName}
                                                                </span>
                                                            ))}
                                                            {role.modules.length > 3 && (
                                                                <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-400 rounded">
                                                                    +{role.modules.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                role.is_active === 1 
                                                    ? 'bg-green-500' 
                                                    : 'bg-red-500'
                                            }`} />
                                            <span className={`text-sm ${
                                                role.is_active === 1 
                                                    ? 'text-green-300' 
                                                    : 'text-red-300'
                                            }`}>
                                                {role.is_active === 1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Permissions Count */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-indigo-400" />
                                            <span className="text-white font-medium">
                                                {role.permissions_count}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                permissions
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            across {role.modules.length} modules
                                        </div>
                                    </div>

                                    {/* Data Access */}
                                    <div className="col-span-2">
                                        <div className="px-3 py-1 bg-blue-500/10 text-blue-300 text-sm rounded-full inline-flex items-center gap-2">
                                            <Eye className="w-3 h-3" />
                                            {getDataAccessLabel(role.data_access)}
                                        </div>
                                    </div>

                                    {/* Created Date */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm">{formatDate(role.created_at)}</div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDateTime(role.created_at).split(',')[1]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => router.push(`/admin/roles/edit/${role.id}`)}
                                                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition"
                                                title="Edit role"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            
                                            {/* <button
                                                onClick={() => router.push(`/admin/roles/view/${role.id}`)}
                                                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button> */}
                                            
                                            <button
                                                onClick={() => handleDelete(role.id, role.role_name)}
                                                disabled={deletingId === role.id}
                                                className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition disabled:opacity-50"
                                                title="Delete role"
                                            >
                                                {deletingId === role.id ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {filteredRoles.length > 0 && (
                        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                    Showing {filteredRoles.length} of {roles.length} role
                                    {roles.length !== 1 ? 's' : ''}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {searchTerm && `Filtered by: "${searchTerm}"`}
                                    {filter !== "all" && ` • ${filter.charAt(0).toUpperCase() + filter.slice(1)} roles`}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Tips */}
                {/* <div className="mt-8 p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Tips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <Users className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h4 className="font-medium text-white">Role Types</h4>
                            </div>
                            <p className="text-sm text-gray-400">
                                System roles cannot be deleted but can be edited. Custom roles can be fully managed.
                            </p>
                        </div>
                        
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                </div>
                                <h4 className="font-medium text-white">Active Status</h4>
                            </div>
                            <p className="text-sm text-gray-400">
                                Inactive roles won't be available for assignment to new users. Existing assignments remain.
                            </p>
                        </div>
                        
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Eye className="w-5 h-5 text-blue-400" />
                                </div>
                                <h4 className="font-medium text-white">Data Access</h4>
                            </div>
                            <p className="text-sm text-gray-400">
                                Defines what data users with this role can access (All or Assigned).
                            </p>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}