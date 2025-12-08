"use client";

import { useState, useEffect, useCallback } from "react";
import {
    ArrowLeft,
    Save,
    RotateCcw,
    X,
    Users,
    Key,
    FileText,
    CheckSquare,
    Square,
    AlertCircle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface RolePermission {
    permission_id: number;
    permission_name: string;
    permission_key: string;
    has_permission: boolean;
}

interface RoleModule {
    module_id: number;
    module_name: string;
    module_key: string;
    permissions: RolePermission[];
}

interface Role {
    id: number;
    tenant_id: number;
    role_name: string;
    // role_key: string;
    data_access: string;
    created_at: string;
    updated_at: string;
    modules?: RoleModule[];
}

interface RoleDetailApiResponse {
    success: boolean;
    data: Role;
}

interface Permission {
    id: number;
    module_id: number;
    permission_name: string;
    permission_key: string;
}

interface Module {
    id: number;
    module_name: string;
    module_key: string;
    permissions: Permission[];
}

interface ModuleApiResponse {
    success: boolean;
    data: Module[];
}

interface PermissionPayload {
    module_id: number;
    permission_id: number;
}

interface UpdateRolePayload {
    role_name: string;
    // role_key: string;
    data_access: string;
    permissions: PermissionPayload[];
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function EditRolePage() {
    const params = useParams();
    const roleId = params.id as string;
    
    const [formData, setFormData] = useState({
        role_name: "",
        // role_key: "",
        data_access: "all"
    });
    
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Record<number, number[]>>({});
    const [loading, setLoading] = useState(false);
    const [modulesLoading, setModulesLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
    const [roleDetails, setRoleDetails] = useState<Role | null>(null);

    const router = useRouter();
    const { token } = useAuth();

    // Fetch modules with their permissions
    const fetchModules = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/tenant/modules`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data: ModuleApiResponse = await response.json();

            if (data.success) {
                // Sort modules alphabetically by module_name
                const sortedModules = [...data.data].sort((a, b) => 
                    a.module_name.localeCompare(b.module_name)
                );
                
                setModules(sortedModules);
                
                // Initialize expanded state
                const initialExpandedModules: Record<number, boolean> = {};
                sortedModules.forEach(module => {
                    initialExpandedModules[module.id] = true;
                });
                setExpandedModules(initialExpandedModules);
            } else {
                showToast("Failed to load modules", "error");
            }
        } catch (error) {
            console.error("Error fetching modules:", error);
            showToast("Failed to load modules", "error");
        } finally {
            setModulesLoading(false);
        }
    }, [token]);

    // Fetch role details
    const fetchRoleDetails = useCallback(async () => {
        if (!roleId) return;
        
        try {
            setRoleLoading(true);
            const response = await fetch(`${BASE_URL}/tenant/roles/${roleId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data: RoleDetailApiResponse = await response.json();

            if (data.success) {
                const role = data.data;
                setRoleDetails(role);
                
                // Set form data
                setFormData({
                    role_name: role.role_name,
                    // role_key: role.role_key,
                    data_access: role.data_access
                });
                
                // Initialize selected permissions based on role's modules and permissions
                const initialSelectedPermissions: Record<number, number[]> = {};
                
                if (role.modules && role.modules.length > 0) {
                    role.modules.forEach(module => {
                        const selectedPerms = module.permissions
                            .filter(perm => perm.has_permission)
                            .map(perm => perm.permission_id);
                        
                        initialSelectedPermissions[module.module_id] = [...new Set(selectedPerms)]; // Remove duplicates
                    });
                }
                
                setSelectedPermissions(initialSelectedPermissions);
            } else {
                showToast("Failed to load role details", "error");
                router.push("/admin/roles");
            }
        } catch (error) {
            console.error("Error fetching role details:", error);
            showToast("Failed to load role details", "error");
            router.push("/admin/roles");
        } finally {
            setRoleLoading(false);
        }
    }, [roleId, token, router]);

    useEffect(() => {
        fetchModules();
        fetchRoleDetails();
    }, [fetchModules, fetchRoleDetails]);

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
        const module = modules.find(m => m.id === moduleId);
        if (!module) return;

        setSelectedPermissions(prev => {
            const currentPermissions = prev[moduleId] || [];
            const allPermissions = module.permissions.map(p => p.id);
            const allSelected = currentPermissions.length === allPermissions.length;
            
            return {
                ...prev,
                [moduleId]: allSelected ? [] : allPermissions
            };
        });
    };

    const toggleAllPermissions = () => {
        const allModulesHaveAllPermissions = modules.every(module => {
            const modulePermissions = module.permissions.map(p => p.id);
            return selectedPermissions[module.id]?.length === modulePermissions.length;
        });

        setSelectedPermissions(prev => {
            const newState: Record<number, number[]> = {};
            
            modules.forEach(module => {
                newState[module.id] = allModulesHaveAllPermissions 
                    ? [] 
                    : module.permissions.map(p => p.id);
            });
            
            return newState;
        });
    };

    const toggleModuleExpansion = (moduleId: number) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const generateRoleKey = (roleName: string) => {
        return roleName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .trim();
    };

    const handleRoleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const roleName = e.target.value;
        setFormData(prev => ({
            ...prev,
            role_name: roleName,
            // role_key: generateRoleKey(roleName)
        }));
    };

    const handleRoleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // const roleKey = e.target.value
        //     .toLowerCase()
        //     .replace(/[^a-z0-9_]/g, '')
        //     .replace(/\s+/g, '_');
        
        setFormData(prev => ({
            ...prev,
            // role_key: roleKey
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.role_name.trim()) {
            showToast("Role name is required", "error");
            return;
        }

        // if (!formData.role_key.trim()) {
        //     showToast("Role key is required", "error");
        //     return;
        // }

        // if (!/^[a-z0-9_]+$/.test(formData.role_key)) {
        //     showToast("Role key can only contain lowercase letters, numbers, and underscores", "error");
        //     return;
        // }

        // Prepare permissions array
        const permissionsArray: PermissionPayload[] = [];
        Object.entries(selectedPermissions).forEach(([moduleId, permissionIds]) => {
            permissionIds.forEach(permissionId => {
                permissionsArray.push({
                    module_id: parseInt(moduleId),
                    permission_id: permissionId
                });
            });
        });

        if (permissionsArray.length === 0) {
            showToast("Please select at least one permission", "error");
            return;
        }

        setLoading(true);

        try {
            const payload: UpdateRolePayload = {
                role_name: formData.role_name,
                // role_key: formData.role_key,
                data_access: formData.data_access,
                permissions: permissionsArray
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
        if (roleDetails) {
            setFormData({
                role_name: roleDetails.role_name,
                // role_key: roleDetails.role_key,
                data_access: roleDetails.data_access
            });
            
            // Reset to original permissions
            const resetSelectedPermissions: Record<number, number[]> = {};
            
            if (roleDetails.modules && roleDetails.modules.length > 0) {
                roleDetails.modules.forEach(module => {
                    const selectedPerms = module.permissions
                        .filter(perm => perm.has_permission)
                        .map(perm => perm.permission_id);
                    
                    resetSelectedPermissions[module.module_id] = [...new Set(selectedPerms)];
                });
            }
            
            setSelectedPermissions(resetSelectedPermissions);
        }
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
    const isAllSelected = modules.length > 0 && modules.every(module => {
        const modulePermissions = module.permissions.map(p => p.id);
        return selectedPermissions[module.id]?.length === modulePermissions.length;
    });

    // Check if some permissions are selected (for indeterminate state)
    const isSomeSelected = modules.some(module => 
        selectedPermissions[module.id]?.length > 0
    ) && !isAllSelected;

    // Get all unique permission names for summary
    const getAllPermissionNames = () => {
        const allPermissions: Permission[] = [];
        modules.forEach(module => {
            allPermissions.push(...module.permissions);
        });
        
        // Group by permission_key prefix (e.g., 'view', 'create', 'update')
        const groupedPermissions: Record<string, Permission[]> = {};
        
        allPermissions.forEach(permission => {
            const prefix = permission.permission_key.split('_')[0];
            if (!groupedPermissions[prefix]) {
                groupedPermissions[prefix] = [];
            }
            groupedPermissions[prefix].push(permission);
        });
        
        return groupedPermissions;
    };

    const permissionGroups = getAllPermissionNames();

    if (roleLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <div className="text-gray-600 dark:text-gray-400">
                        Loading role details...
                    </div>
                </div>
            </div>
        );
    }

    if (!roleDetails) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        Role Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The role you're trying to edit doesn't exist or you don't have permission to access it.
                    </p>
                    <button
                        onClick={() => router.push("/admin/roles")}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                    >
                        Back to Roles
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
            <div className="flex-1 ">
                {/* Toast Notifications */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg flex justify-between items-center">
                        <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                        <button
                            onClick={() => setSuccess("")}
                            className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex justify-between items-center">
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        <button
                            onClick={() => setError("")}
                            className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Edit Role
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Update role details and permissions
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                    ID: {roleDetails.id}
                                </span>
                                {/* <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
                                    {roleDetails.role_key}
                                </span> */}
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                    Created: {new Date(roleDetails.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Roles
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Role Name Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Role Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="role_name"
                                value={formData.role_name}
                                onChange={handleRoleNameChange}
                                placeholder="Enter role name (e.g., Admission Officer)"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        {/* Role Key Input */}
                        {/* <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Role Key{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <input
                                    type="text"
                                    name="role_key"
                                    value={formData.role_key}
                                    onChange={handleRoleKeyChange}
                                    placeholder="admission_officer"
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono transition"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Use lowercase letters, numbers, and underscores only (auto-generated from role name)
                            </p>
                        </div> */}

                        {/* Data Access Select */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Data Access{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="data_access"
                                value={formData.data_access}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                required
                            >
                                <option value="all">Allowed Access to All data</option>
                                <option value="assigned">Allowed Access to Assigned Data</option>
                                
                            </select>
                        </div>

                      

                        {/* Permissions Section - Card Design */}
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        Module Permissions
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Update permissions for each module
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {totalSelectedPermissions} permission{totalSelectedPermissions !== 1 ? 's' : ''} selected across {modulesWithPermissions} module{modulesWithPermissions !== 1 ? 's' : ''}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleAllPermissions}
                                        className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition"
                                    >
                                        {isAllSelected ? (
                                            <CheckSquare className="w-3 h-3" />
                                        ) : isSomeSelected ? (
                                            <div className="w-3 h-3 border border-gray-400 dark:border-gray-500 bg-gray-400 dark:bg-gray-500" />
                                        ) : (
                                            <Square className="w-3 h-3" />
                                        )}
                                        {isAllSelected ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>

                            {modulesLoading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                                    <div className="text-gray-600 dark:text-gray-400">
                                        Loading modules and permissions...
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {modules.map((module) => {
                                        const modulePermissions = selectedPermissions[module.id] || [];
                                        const allPermissionsSelected = modulePermissions.length === module.permissions.length;
                                        const somePermissionsSelected = modulePermissions.length > 0 && !allPermissionsSelected;
                                        const isExpanded = expandedModules[module.id] || false;
                                        
                                        return (
                                            <div 
                                                key={module.id} 
                                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200"
                                            >
                                                {/* Module Header */}
                                                <div 
                                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                                                    onClick={() => toggleModuleExpansion(module.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={allPermissionsSelected}
                                                                ref={input => {
                                                                    if (input) {
                                                                        input.indeterminate = somePermissionsSelected;
                                                                    }
                                                                }}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleAllPermissionsInModule(module.id);
                                                                }}
                                                                className="w-5 h-5 accent-indigo-600 rounded"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="text-gray-800 dark:text-white font-medium">
                                                                {module.module_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                Module Key: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{module.module_key}</code>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-3 py-1 text-xs rounded-full ${
                                                            modulePermissions.length > 0
                                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                                        }`}>
                                                            {modulePermissions.length} / {module.permissions.length} selected
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleModuleExpansion(module.id);
                                                            }}
                                                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-5 h-5" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Permissions Grid */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {module.permissions.map((permission) => {
                                                                const isSelected = modulePermissions.includes(permission.id);
                                                                return (
                                                                    <label 
                                                                        key={permission.id} 
                                                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer transition"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => togglePermission(module.id, permission.id)}
                                                                            className="w-4 h-4 accent-indigo-600 rounded"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="text-sm text-gray-800 dark:text-white">
                                                                                {permission.permission_name}
                                                                            </div>
                                                                            {/* <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                Key: <code className="px-1 py-0.5 bg-white dark:bg-gray-900 rounded">{permission.permission_key}</code>
                                                                            </div> */}
                                                                        </div>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Summary Section */}
                                    <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/30 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="text-indigo-700 dark:text-indigo-300 font-semibold">
                                                    Permissions Summary
                                                </h4>
                                                <p className="text-sm text-indigo-600/70 dark:text-indigo-200/70">
                                                    {totalSelectedPermissions} permission{totalSelectedPermissions !== 1 ? 's' : ''} selected across {modulesWithPermissions} module{modulesWithPermissions !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                                            {Object.entries(permissionGroups).map(([prefix, permissions]) => {
                                                const count = modules.reduce((total, module) => {
                                                    const modulePermissions = selectedPermissions[module.id] || [];
                                                    const matchingPermissions = permissions.filter(p => 
                                                        p.permission_key.startsWith(prefix) && modulePermissions.includes(p.id)
                                                    );
                                                    return total + matchingPermissions.length;
                                                }, 0);
                                                
                                                if (count === 0) return null;
                                                
                                                return (
                                                    <div key={prefix} className="bg-white dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                                {prefix} Permissions
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300`}>
                                                                {count} selected
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 gap-4">
                            <button
                                type="submit"
                                disabled={loading || totalSelectedPermissions === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
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
                                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex items-center gap-2 px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition w-full sm:w-auto"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset Changes
                                </button>
                            </div>
                        </div>

                        {/* Form Validation Notes */}
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes:</h4>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>{`• Role key will be auto-generated from role name but can be edited`}</li>
                                <li>{`• Role key must be lowercase with underscores (e.g., admission_officer)`}</li>
                                <li>{`• Select at least one permission to enable the Update Role button`}</li>
                                <li>{`• Use "Select All" button to quickly toggle all permissions for all modules`}</li>
                                <li>{`• Click on module headers to expand/collapse permissions`}</li>
                                <li>{`• Data access determines what data the role can access`}</li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}