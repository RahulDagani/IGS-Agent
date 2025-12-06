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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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

interface CreateRolePayload {
    role_name: string;
    role_key: string;
    data_access: string;
    permissions: PermissionPayload[];
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function CreateRolePage() {
    const [formData, setFormData] = useState({
        role_name: "",
        role_key: "",
        description: "",
        data_access: "all"
    });
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Record<number, number[]>>({});
    const [loading, setLoading] = useState(false);
    const [modulesLoading, setModulesLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

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
                
                // Initialize selected permissions object
                const initialSelectedPermissions: Record<number, number[]> = {};
                const initialExpandedModules: Record<number, boolean> = {};
                
                sortedModules.forEach(module => {
                    initialSelectedPermissions[module.id] = [];
                    initialExpandedModules[module.id] = true; // Default all expanded
                });
                
                setSelectedPermissions(initialSelectedPermissions);
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

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

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
            role_key: generateRoleKey(roleName)
        }));
    };

    const handleRoleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const roleKey = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')
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

        if (!formData.role_key.trim()) {
            showToast("Role key is required", "error");
            return;
        }

        if (!/^[a-z0-9_]+$/.test(formData.role_key)) {
            showToast("Role key can only contain lowercase letters, numbers, and underscores", "error");
            return;
        }

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
            const payload: CreateRolePayload = {
                role_name: formData.role_name,
                role_key: formData.role_key,
                data_access: formData.data_access,
                permissions: permissionsArray
            };

            const response = await fetch(`${BASE_URL}/tenant/roles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast("Role created successfully!", "success");
                setTimeout(() => {
                    router.push("/admin/roles");
                }, 1500);
            } else {
                showToast(data.message || "Failed to create role", "error");
            }
        } catch (error) {
            console.error("Error creating role:", error);
            showToast("Failed to create role", "error");
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
        setFormData({
            role_name: "",
            role_key: "",
            description: "",
            data_access: "all"
        });
        
        const resetSelectedPermissions: Record<number, number[]> = {};
        modules.forEach(module => {
            resetSelectedPermissions[module.id] = [];
        });
        setSelectedPermissions(resetSelectedPermissions);
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

    return (
        <div className="flex flex-col min-h-screen bg-[#0f172a]">
            <div className="flex-1 ">
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

                <div className="bg-[#111827] rounded-xl shadow-lg border border-white/10 p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Create Role
                            </h2>
                            <p className="text-gray-400 mt-1">
                                Create a new role with specific permissions
                            </p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded-lg transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Roles
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
                                name="role_name"
                                value={formData.role_name}
                                onChange={handleRoleNameChange}
                                placeholder="Enter role name (e.g., Admission Officer)"
                                className="w-full px-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>

                        {/* Role Key Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Role Key{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="role_key"
                                    value={formData.role_key}
                                    onChange={handleRoleKeyChange}
                                    placeholder="admission_officer"
                                    className="w-full px-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Use lowercase letters, numbers, and underscores only (auto-generated from role name)
                            </p>
                        </div>

                        {/* Data Access Select */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Data Access{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="data_access"
                                value={formData.data_access}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            >
                                <option value="all">Allowed Access to All data</option>
                                <option value="assigned">Allowed Access to Assigned Data</option>
                            </select>
                        </div>

                        {/* Role Description */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description (Optional)
                            </label>
                            <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-400 mt-2" />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter role description (optional)"
                                    rows={3}
                                    className="w-full px-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Permissions Section - Card Design */}
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        Module Permissions
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Select permissions for each module
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-gray-300">
                                        {totalSelectedPermissions} permission{totalSelectedPermissions !== 1 ? 's' : ''} selected across {modulesWithPermissions} module{modulesWithPermissions !== 1 ? 's' : ''}
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

                            {modulesLoading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                                    <div className="text-gray-400">
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
                                                className="bg-[#1F2937] border border-gray-700 rounded-lg overflow-hidden"
                                            >
                                                {/* Module Header */}
                                                <div 
                                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition"
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
                                                            <div className="text-white font-medium">
                                                                {module.module_name}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                Module Key: <code className="px-1 py-0.5 bg-gray-800 rounded">{module.module_key}</code>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-3 py-1 text-xs rounded-full ${
                                                            modulePermissions.length > 0
                                                                ? 'bg-indigo-500/20 text-indigo-300'
                                                                : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                            {modulePermissions.length} / {module.permissions.length} selected
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleModuleExpansion(module.id);
                                                            }}
                                                            className="text-gray-400 hover:text-white"
                                                        >
                                                            {isExpanded ? (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Permissions Grid */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-700 p-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {module.permissions.map((permission) => {
                                                                const isSelected = modulePermissions.includes(permission.id);
                                                                return (
                                                                    <label 
                                                                        key={permission.id} 
                                                                        className="flex items-center gap-3 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg cursor-pointer transition"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => togglePermission(module.id, permission.id)}
                                                                            className="w-4 h-4 accent-indigo-600 rounded"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="text-sm text-white">
                                                                                {permission.permission_name}
                                                                            </div>
                                                                            <div className="text-xs text-gray-400 mt-1">
                                                                                Key: <code className="px-1 py-0.5 bg-gray-900 rounded">{permission.permission_key}</code>
                                                                            </div>
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
                                                    <div key={prefix} className="bg-gray-800/30 p-3 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-300 capitalize">
                                                                {prefix} Permissions
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300`}>
                                                                {count} selected
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
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
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 border-t border-gray-700 pt-6 gap-4">
                            <button
                                type="submit"
                                disabled={loading || totalSelectedPermissions === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Creating Role...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Create Role
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
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Form Validation Notes */}
                        <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Notes:</h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>{`• Role key will be auto-generated from role name but can be edited`}</li>
                                <li>{`• Role key must be lowercase with underscores (e.g., admission_officer)`}</li>
                                <li>{`• Select at least one permission to enable the Create Role button`}</li>
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