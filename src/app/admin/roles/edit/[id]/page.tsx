"use client";

import { useState, useEffect, useCallback } from "react";
import {
    ArrowLeft,
    Save,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    X,
    Users,
    Key,
    FileText,
    CheckSquare,
    Square,
    Loader,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface PermissionType {
    id: number;
    permission_name: string;
}

interface ModulePermission {
    module_id: number;
    module_name: string;
    module_key: string;
    permissions: {
        permission_id: number;
        permission_name: string;
        has_permission: boolean;
    }[];
}

interface RoleData {
    id: number;
    tenant_id: number;
    role_name: string;
    role_key: string;
    created_at: string;
    modules: ModulePermission[];
    permission_types: PermissionType[];
}

interface PermissionPayload {
    module_id: number;
    permission_type_id: number;
}

interface UpdateRolePayload {
    role_name: string;
    permissions: PermissionPayload[];
}

interface RoleApiResponse {
    success: boolean;
    data: RoleData;
}



const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function UpdateRolePage() {
    const [formData, setFormData] = useState({
        role_name: "",
        role_key: "",
        description: "",
    });
    const [modules, setModules] = useState<ModulePermission[]>([]);
    const [permissionTypes, setPermissionTypes] = useState<PermissionType[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Record<number, number[]>>({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");

    const router = useRouter();
    const params = useParams();
    const { token } = useAuth();

    const roleId = params.id as string;

    // Fetch role data
    const fetchRoleData = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/tenant/roles/${roleId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data: RoleApiResponse = await response.json();

            if (data.success) {
                const role = data.data;
                
                // Set form data
                setFormData({
                    role_name: role.role_name,
                    role_key: role.role_key,
                    description: "",
                });
                
                // Sort modules alphabetically by module_name
                const sortedModules = [...role.modules].sort((a, b) => 
                    a.module_name.localeCompare(b.module_name)
                );
                
                setModules(sortedModules);
                setPermissionTypes(role.permission_types);
                
                // Initialize selected permissions from API data
                const initialSelectedPermissions: Record<number, number[]> = {};
                sortedModules.forEach(module => {
                    const selectedPerms = module.permissions
                        .filter(p => p.has_permission)
                        .map(p => p.permission_id);
                    initialSelectedPermissions[module.module_id] = selectedPerms;
                });
                
                setSelectedPermissions(initialSelectedPermissions);
            } else {
                showToast("Failed to load role data", "error");
                router.push("/admin/roles");
            }
        } catch (error) {
            console.error("Error fetching role:", error);
            showToast("Failed to load role data", "error");
            router.push("/admin/roles");
        } finally {
            setInitialLoading(false);
        }
    }, [roleId, token, router]);

    useEffect(() => {
        if (roleId) {
            fetchRoleData();
        }
    }, [fetchRoleData, roleId]);

    const togglePermission = (moduleId: number, permissionId: number) => {
        setSelectedPermissions(prev => {
            const currentPermissions = prev[moduleId] || [];
            const isSelected = currentPermissions.includes(permissionId);
            
            return {
                ...prev,
                [moduleId]: isSelected
                    ? currentPermissions.filter(id => id !== permissionId)
                    : [...currentPermissions, permissionId]
            };
        });
    };

    const toggleAllPermissionsInModule = (moduleId: number) => {
        setSelectedPermissions(prev => {
            const currentPermissions = prev[moduleId] || [];
            const allSelected = currentPermissions.length === permissionTypes.length;
            
            return {
                ...prev,
                [moduleId]: allSelected ? [] : permissionTypes.map(p => p.id)
            };
        });
    };

    const toggleAllPermissions = () => {
        const allModulesHaveAllPermissions = modules.every(module => 
            selectedPermissions[module.module_id]?.length === permissionTypes.length
        );

        setSelectedPermissions(prev => {
            const newState: Record<number, number[]> = {};
            
            modules.forEach(module => {
                newState[module.module_id] = allModulesHaveAllPermissions 
                    ? [] 
                    : permissionTypes.map(p => p.id);
            });
            
            return newState;
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRoleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const roleKey = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '') // Allow only lowercase, numbers, and underscores
            .replace(/\s+/g, '_');
        
        setFormData(prev => ({
            ...prev,
            role_key: roleKey
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.role_name.trim()) {
            showToast("Role name is required", "error");
            return;
        }

        // Check if any permissions are selected
        const selectedPermissionsArray: PermissionPayload[] = [];
        Object.entries(selectedPermissions).forEach(([moduleId, permissionIds]) => {
            permissionIds.forEach(permissionId => {
                selectedPermissionsArray.push({
                    module_id: parseInt(moduleId),
                    permission_type_id: permissionId
                });
            });
        });

        if (selectedPermissionsArray.length === 0) {
            showToast("Please select at least one permission", "error");
            return;
        }

        setLoading(true);

        try {
            const payload: UpdateRolePayload = {
                role_name: formData.role_name,
                permissions: selectedPermissionsArray
            };

            const response = await fetch(`${BASE_URL}/tenant/roles/${roleId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast("Role updated successfully!", "success");
                setTimeout(() => {
                    router.push("/admin/roles");
                }, 1500);
            } else {
                showToast(data.message || "Failed to update role", "error");
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
        // Reset to original data
        fetchRoleData();
    };

    // Calculate total selected permissions
    const totalSelectedPermissions = Object.values(selectedPermissions).reduce(
        (total, permissionIds) => total + permissionIds.length,
        0
    );

    // Calculate total modules with at least one permission selected
    const modulesWithPermissions = Object.values(selectedPermissions).filter(
        permissionIds => permissionIds.length > 0
    ).length;

    // Check if all permissions are selected for all modules
    const isAllSelected = modules.length > 0 && modules.every(module => 
        selectedPermissions[module.module_id]?.length === permissionTypes.length
    );

    // Check if some permissions are selected (for indeterminate state)
    const isSomeSelected = modules.some(module => 
        selectedPermissions[module.module_id]?.length > 0
    ) && !isAllSelected;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (initialLoading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <div className="text-white text-lg">Loading role data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">
            <div className="flex-1 mt-6 lg:mt-0">
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
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Update Role
                            </h2>
                            <p className="text-gray-400 mt-1">
                                Update role details and permissions
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-gray-800 rounded-lg">
                                <span className="text-xs text-gray-400">Role ID:</span>
                                <span className="text-xs text-gray-300 ml-1 font-mono">{roleId}</span>
                            </div>
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded-lg transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Roles
                            </button>
                        </div>
                    </div>

                    {/* Role Information Card */}
                    <div className="mb-8 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* <div>
                                <p className="text-sm text-gray-400">Created Date</p>
                                <p className="text-white font-medium">
                                    {formatDate(modules[0]?.created_at || new Date().toISOString())}
                                </p>
                            </div> */}
                            <div>
                                <p className="text-sm text-gray-400">Current Permissions</p>
                                <p className="text-white font-medium">
                                    {totalSelectedPermissions} permission{totalSelectedPermissions !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Modules with Permissions</p>
                                <p className="text-white font-medium">
                                    {modulesWithPermissions} module{modulesWithPermissions !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
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
                                name="role_name"
                                value={formData.role_name}
                                onChange={handleChange}
                                placeholder="Enter role name"
                                className="w-full px-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>

                        {/* Role Key Display (Read-only) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Role Key
                            </label>
                            <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="role_key"
                                    value={formData.role_key}
                                    onChange={handleRoleKeyChange}
                                    className="w-full px-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    readOnly
                                    disabled
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Role key cannot be changed after creation
                            </p>
                        </div>

                        {/* Permissions Section - Table Design */}
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        Module Permissions
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Update permissions for each module
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-gray-300">
                                        {totalSelectedPermissions} permission{totalSelectedPermissions !== 1 ? 's' : ''} selected
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleAllPermissions}
                                        className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
                                    >
                                        {isAllSelected ? (
                                            <CheckSquare className="w-3 h-3" />
                                        ) : isSomeSelected ? (
                                            <div className="w-3 h-3 border border-gray-400 bg-gray-400" />
                                        ) : (
                                            <Square className="w-3 h-3" />
                                        )}
                                        {isAllSelected ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-full divide-y divide-gray-700">
                                    <thead className="bg-[#1F2937]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllSelected}
                                                        ref={input => {
                                                            if (input) {
                                                                input.indeterminate = isSomeSelected;
                                                            }
                                                        }}
                                                        onChange={toggleAllPermissions}
                                                        className="w-4 h-4 accent-indigo-600"
                                                    />
                                                    <span>Module Name</span>
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Module Key
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                <div className="text-center">Select All</div>
                                            </th>
                                            {permissionTypes.map(permission => (
                                                <th 
                                                    key={permission.id} 
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                                >
                                                    <div className="text-center capitalize">{permission.permission_name}</div>
                                                </th>
                                            ))}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                <div className="text-center">Selected</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {modules.map((module) => {
                                            const modulePermissions = selectedPermissions[module.module_id] || [];
                                            const allPermissionsSelected = modulePermissions.length === permissionTypes.length;
                                            const somePermissionsSelected = modulePermissions.length > 0 && !allPermissionsSelected;
                                            
                                            return (
                                                <tr 
                                                    key={module.module_id} 
                                                    className="hover:bg-[#1F2937]/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={allPermissionsSelected}
                                                                ref={input => {
                                                                    if (input) {
                                                                        input.indeterminate = somePermissionsSelected;
                                                                    }
                                                                }}
                                                                onChange={() => toggleAllPermissionsInModule(module.module_id)}
                                                                className="w-4 h-4 accent-indigo-600"
                                                            />
                                                            <div>
                                                                <div className="text-white font-medium">
                                                                    {module.module_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <code className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">
                                                            {module.module_key}
                                                        </code>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleAllPermissionsInModule(module.module_id)}
                                                                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
                                                            >
                                                                {allPermissionsSelected ? 'Deselect All' : 'Select All'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    {permissionTypes.map(permission => {
                                                        const isSelected = modulePermissions.includes(permission.id);
                                                        const hasPermission = module.permissions.find(p => p.permission_id === permission.id)?.has_permission || false;
                                                        
                                                        return (
                                                            <td key={permission.id} className="px-6 py-4">
                                                                <div className="flex justify-center">
                                                                    <label className="flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => togglePermission(module.module_id, permission.id)}
                                                                            className={`w-5 h-5 rounded ${
                                                                                isSelected 
                                                                                    ? 'accent-indigo-600' 
                                                                                    : 'bg-gray-700 border-gray-600'
                                                                            }`}
                                                                        />
                                                                        <span className={`ml-2 text-sm capitalize ${
                                                                            isSelected ? 'text-indigo-300' : 'text-gray-300'
                                                                        }`}>
                                                                            {permission.permission_name}
                                                                        </span>
                                                                        {!isSelected && hasPermission && (
                                                                            <span className="ml-2 text-xs text-red-400">
                                                                                (removed)
                                                                            </span>
                                                                        )}
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-6 py-4">
                                                        <div className="text-center">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                modulePermissions.length > 0
                                                                    ? 'bg-indigo-500/20 text-indigo-300'
                                                                    : 'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                                {modulePermissions.length} / {permissionTypes.length}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Summary Section */}
                                <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="text-indigo-300 font-semibold">
                                                Permissions Summary
                                            </h4>
                                            <p className="text-sm text-indigo-200/70">
                                                {totalSelectedPermissions} permission{totalSelectedPermissions !== 1 ? 's' : ''} selected across {modulesWithPermissions} module{modulesWithPermissions !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <Users className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                                        {permissionTypes.map(permission => {
                                            const count = modules.reduce((total, module) => {
                                                return total + ((selectedPermissions[module.module_id] || []).includes(permission.id) ? 1 : 0);
                                            }, 0);
                                            
                                            return (
                                                <div key={permission.id} className="bg-gray-800/30 p-3 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-300 capitalize">
                                                            {permission.permission_name} Permissions
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            count > 0 
                                                                ? 'bg-green-500/20 text-green-300' 
                                                                : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                            {count} / {modules.length}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                                            style={{ width: `${(count / modules.length) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 border-t border-gray-700 pt-6 gap-4">
                            <button
                                type="submit"
                                disabled={loading || totalSelectedPermissions === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Updating Role...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Update Role
                                    </>
                                )}
                            </button>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition w-full sm:w-auto"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset Changes
                                </button>
                            </div>
                        </div>

                        {/* Form Validation Notes */}
                        <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Notes:</h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>{`• Role name can be updated but role key cannot be changed after creation`}</li>
                                <li>{`• Select at least one permission to enable the Update Role button`}</li>
                                <li>{`• Use "Select All" button to quickly toggle all permissions for all modules`}</li>
                                <li>{`• Individual module permissions can be managed using the "Select All" button in each row`}</li>
                                <li>{`• Permissions marked with "(removed)" were previously selected but are now deselected`}</li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}