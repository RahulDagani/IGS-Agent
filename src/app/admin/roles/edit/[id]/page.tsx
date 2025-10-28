"use client";

import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Save,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    X,
    Users,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface Permission {
    id: string;
    name: string;
    category: string;
    description?: string;
}

interface PermissionGroup {
    category: string;
    permissions: Permission[];
}

interface Role {
    id: string;
    name: string;
    description?: string;
    isSystem: boolean;
    permissions: Permission[];
}

export default function EditRolePage() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
        []
    );
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        []
    );
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [permissionsLoading, setPermissionsLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(true);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");

    const router = useRouter();
    const params = useParams();
    const roleId = params.id as string;

    // Fetch role data and permissions
    useEffect(() => {
        if (roleId) {
            Promise.all([fetchRole(), fetchPermissions()]);
        }
    }, [roleId]);

    const fetchRole = async () => {
        try {
            const response = await fetch(`/api/setup/roles/${roleId}`);
            const data: Role = await response.json();

            if (response.ok) {
                setFormData({
                    name: data.name,
                    description: data.description || "",
                });
                setSelectedPermissions(data.permissions.map((p) => p.id));
            } else {
                showToast("Failed to load role", "error");
                router.push("/admin/setup/roles");
            }
        } catch (error) {
            console.error("Error fetching role:", error);
            showToast("Failed to load role", "error");
            router.push("/admin/setup/roles");
        } finally {
            setRoleLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await fetch("/api/setup/permissions");
            const data = await response.json();

            if (response.ok) {
                // Convert grouped permissions to array format
                const groups = Object.entries(data).map(
                    ([category, permissions]) => ({
                        category,
                        permissions: permissions as Permission[],
                    })
                );
                setPermissionGroups(groups);
                // Expand all groups by default
                setExpandedGroups(groups.map((group) => group.category));
            } else {
                showToast("Failed to load permissions", "error");
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
            showToast("Failed to load permissions", "error");
        } finally {
            setPermissionsLoading(false);
        }
    };

    const toggleGroup = (category: string) => {
        setExpandedGroups((prev) =>
            prev.includes(category)
                ? prev.filter((cat) => cat !== category)
                : [...prev, category]
        );
    };

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleAllInGroup = (group: PermissionGroup) => {
        const groupPermissionIds = group.permissions.map((p) => p.id);
        const allSelected = groupPermissionIds.every((id) =>
            selectedPermissions.includes(id)
        );

        if (allSelected) {
            // Remove all permissions from this group
            setSelectedPermissions((prev) =>
                prev.filter((id) => !groupPermissionIds.includes(id))
            );
        } else {
            // Add all permissions from this group
            setSelectedPermissions((prev) => {
                const newPermissions = [...prev];
                groupPermissionIds.forEach((id) => {
                    if (!newPermissions.includes(id)) {
                        newPermissions.push(id);
                    }
                });
                return newPermissions;
            });
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showToast("Role name is required", "error");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/setup/roles/${roleId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    permissionIds: selectedPermissions,
                }),
            });

            if (response.ok) {
                showToast("Role updated successfully!", "success");
                setTimeout(() => {
                    router.push("/admin/setup/roles");
                }, 1000);
            } else {
                const errorData = await response.json();
                showToast(errorData.error || "Failed to update role", "error");
            }
        } catch (error) {
            console.error("Error updating role:", error);
            showToast("Failed to update role", "error");
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

    const resetForm = () => {
        fetchRole(); // Reset to original values
    };

    const expandAll = () => {
        setExpandedGroups(permissionGroups.map((group) => group.category));
    };

    const collapseAll = () => {
        setExpandedGroups([]);
    };

    if (roleLoading || permissionsLoading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white">Loading...</div>
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
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Edit Role
                            </h2>
                            <p className="text-gray-400 mt-1">
                                Update role details and permissions
                            </p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded-lg transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Role Name Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Role Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter role name"
                                className="w-full px-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>

                        {/* Role Description */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter role description (optional)"
                                rows={3}
                                className="w-full px-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>

                        {/* Permissions Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        Select Permissions
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Choose the permissions for this role
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={expandAll}
                                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
                                    >
                                        Expand All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={collapseAll}
                                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
                                    >
                                        Collapse All
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                                {permissionGroups.map((group) => {
                                    const isExpanded = expandedGroups.includes(
                                        group.category
                                    );
                                    const selectedInGroup =
                                        group.permissions.filter((perm) =>
                                            selectedPermissions.includes(
                                                perm.id
                                            )
                                        ).length;
                                    const allSelected =
                                        selectedInGroup ===
                                        group.permissions.length;

                                    return (
                                        <div
                                            key={group.category}
                                            className="bg-[#1F2937] border border-gray-700 rounded-lg overflow-hidden"
                                        >
                                            {/* Group Header */}
                                            <div
                                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors border-b border-gray-600"
                                                onClick={() =>
                                                    toggleGroup(group.category)
                                                }
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        onChange={() =>
                                                            toggleAllInGroup(
                                                                group
                                                            )
                                                        }
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="w-4 h-4 accent-indigo-600"
                                                    />
                                                    <div>
                                                        <h4 className="text-white font-semibold">
                                                            {group.category}
                                                        </h4>
                                                        <p className="text-sm text-gray-400">
                                                            {selectedInGroup} of{" "}
                                                            {
                                                                group
                                                                    .permissions
                                                                    .length
                                                            }{" "}
                                                            permissions selected
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Group Content */}
                                            {isExpanded && (
                                                <div className=" bg-gray-800/20">
                                                    {group.permissions.map(
                                                        (permission) => (
                                                            <div
                                                                key={
                                                                    permission.id
                                                                }
                                                                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border-t border-gray-600"
                                                            >
                                                                <div>
                                                                    <div className="text-white font-medium">
                                                                        {
                                                                            permission.name
                                                                        }
                                                                    </div>
                                                                    {permission.description && (
                                                                        <div className="text-sm text-gray-400 mt-1">
                                                                            {
                                                                                permission.description
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedPermissions.includes(
                                                                        permission.id
                                                                    )}
                                                                    onChange={() =>
                                                                        togglePermission(
                                                                            permission.id
                                                                        )
                                                                    }
                                                                    className="w-4 h-4 accent-indigo-600"
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Selected Permissions Summary */}
                            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-indigo-300 font-semibold">
                                            Selected Permissions
                                        </h4>
                                        <p className="text-sm text-indigo-200/70">
                                            {selectedPermissions.length}{" "}
                                            permission
                                            {selectedPermissions.length !== 1
                                                ? "s"
                                                : ""}{" "}
                                            selected
                                        </p>
                                    </div>
                                    <Users className="w-5 h-5 text-indigo-400" />
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between mt-8 border-t border-gray-700 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? "Updating..." : "Update Role"}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
