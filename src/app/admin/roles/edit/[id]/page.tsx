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

// Interfaces for Role API Response
interface RoleDetailApiResponse {
    success: boolean;
    data: Role;
}

interface Role {
    id: number;
    tenant_id: number;
    role_name: string;
    role_key: string;
    panel_type: string;
    data_access: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Interfaces for Modules API Response
interface ChildModule {
    id: number;
    sub_module_id: number;
    panel_type: string;
    name: string;
    slug: string;
    route: string | null;
    icon: string;
    sort_order: number;
    is_active: number;
}

interface SubModule {
    id: number;
    module_id: number;
    panel_type: string;
    name: string;
    slug: string;
    icon: string;
    route: string | null;
    sort_order: number;
    is_active: number;
    created_at: string;
    child_modules: ChildModule[];
}

interface Module {
    id: number;
    name: string;
    sort_order: number;
    is_active: number;
    created_at: string;
    sub_modules: SubModule[];
}

interface ModulesApiResponse {
    success: boolean;
    data: {
        hierarchical: Module[];
        flat: {
            modules: Array<{
                id: number;
                name: string;
                sort_order: number;
                is_active: number;
                created_at: string;
            }>;
            sub_modules: Array<{
                id: number;
                module_id: number;
                panel_type: string;
                name: string;
                slug: string;
                icon: string;
                route: string | null;
                sort_order: number;
                is_active: number;
                created_at: string;
            }>;
            child_modules: ChildModule[];
        };
        counts: Record<string, number>;
        filters_applied: Record<string, any>;
    };
}

// Interfaces for Role Permissions API Response
interface ModulePermission {
    module_id: number;
    status: number;
}

interface SubModulePermission {
    sub_module_id: number;
    status: number;
}

interface ChildModulePermission {
    child_module_id: number;
    status: number;
}

interface RolePermissionsApiResponse {
    success: boolean;
    data: {
        role: Role;
        permissions: {
            module_permissions: ModulePermission[];
            sub_module_permissions: SubModulePermission[];
            child_module_permissions: ChildModulePermission[];
        };
    };
}

// Interface for Update Role Payload
interface UpdateRolePayload {
    role_name: string;
    role_key: string;
    panel_type: string;
    data_access: string;
    is_active: boolean;
    module_permissions: ModulePermission[];
    sub_module_permissions: SubModulePermission[];
    child_module_permissions: ChildModulePermission[];
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function EditRolePage() {
    const params = useParams();
    const roleId = params.id as string;
    
    const [formData, setFormData] = useState({
        role_name: "",
        role_key: "",
        panel_type: "admin",
        data_access: "all",
        is_active: true
    });
    
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModules, setSelectedModules] = useState<Record<number, number>>({}); // module_id: status
    const [selectedSubModules, setSelectedSubModules] = useState<Record<number, number>>({}); // sub_module_id: status
    const [selectedChildModules, setSelectedChildModules] = useState<Record<number, number>>({}); // child_module_id: status
    const [loading, setLoading] = useState(false);
    const [modulesLoading, setModulesLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
    const [expandedSubModules, setExpandedSubModules] = useState<Record<number, boolean>>({});
    const [roleDetails, setRoleDetails] = useState<Role | null>(null);

    const router = useRouter();
    const { token } = useAuth();

    // Fetch modules with their hierarchical structure
    const fetchModules = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/tenant/modules`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data: ModulesApiResponse = await response.json();

            if (data.success) {
                // Sort modules alphabetically by name
                const sortedModules = [...data.data.hierarchical].sort((a, b) => 
                    a.name.localeCompare(b.name)
                );
                
                setModules(sortedModules);
                
                // Initialize expanded state
                const initialExpandedModules: Record<number, boolean> = {};
                const initialExpandedSubModules: Record<number, boolean> = {};
                
                sortedModules.forEach(module => {
                    initialExpandedModules[module.id] = true;
                    module.sub_modules.forEach(subModule => {
                        initialExpandedSubModules[subModule.id] = true;
                    });
                });
                
                setExpandedModules(initialExpandedModules);
                setExpandedSubModules(initialExpandedSubModules);
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

    // Fetch role details and permissions
    const fetchRoleDetails = useCallback(async () => {
        if (!roleId) return;
        
        try {
            setRoleLoading(true);
            // Fetch role basic details
            const roleResponse = await fetch(`${BASE_URL}/tenant/roles/${roleId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const roleData = await roleResponse.json();

            if (roleData.success) {
                const role = roleData.data;
                setRoleDetails(role);
                
                // Set form data
                setFormData({
                    role_name: role.role_name,
                    role_key: role.role_key,
                    panel_type: role.panel_type || "admin",
                    data_access: role.data_access,
                    is_active: role.is_active
                });
                
                // Fetch role permissions
                const permissionsResponse = await fetch(`${BASE_URL}/tenant/roles/${roleId}/permissions`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const permissionsData: RolePermissionsApiResponse = await permissionsResponse.json();

                if (permissionsData.success) {
                    const { module_permissions, sub_module_permissions, child_module_permissions } = 
                        permissionsData.data.permissions;
                    
                    // Initialize selected permissions from API response
                    const initialSelectedModules: Record<number, number> = {};
                    const initialSelectedSubModules: Record<number, number> = {};
                    const initialSelectedChildModules: Record<number, number> = {};

                    // Set module permissions
                    module_permissions.forEach(perm => {
                        initialSelectedModules[perm.module_id] = perm.status;
                    });

                    // Set sub-module permissions
                    sub_module_permissions.forEach(perm => {
                        initialSelectedSubModules[perm.sub_module_id] = perm.status;
                    });

                    // Set child module permissions
                    child_module_permissions.forEach(perm => {
                        initialSelectedChildModules[perm.child_module_id] = perm.status;
                    });

                    setSelectedModules(initialSelectedModules);
                    setSelectedSubModules(initialSelectedSubModules);
                    setSelectedChildModules(initialSelectedChildModules);
                } else {
                    // If permissions endpoint doesn't exist, initialize with all zeros
                    const initialSelectedModules: Record<number, number> = {};
                    const initialSelectedSubModules: Record<number, number> = {};
                    const initialSelectedChildModules: Record<number, number> = {};

                    // TODO: You might want to fetch modules here to initialize properly
                    setSelectedModules(initialSelectedModules);
                    setSelectedSubModules(initialSelectedSubModules);
                    setSelectedChildModules(initialSelectedChildModules);
                }
            } else {
                showToast("Failed to load role details", "error");
                // router.push("/admin/roles");
            }
        } catch (error) {
            console.error("Error fetching role details:", error);
            showToast("Failed to load role details", "error");
            // router.push("/admin/roles");
        } finally {
            setRoleLoading(false);
        }
    }, [roleId, token, router]);

    useEffect(() => {
        fetchModules();
        fetchRoleDetails();
    }, [fetchModules, fetchRoleDetails]);

    // Toggle module selection
    const toggleModule = (moduleId: number) => {
        setSelectedModules(prev => ({
            ...prev,
            [moduleId]: prev[moduleId] === 1 ? 0 : 1
        }));
    };

    // Toggle sub-module selection
    const toggleSubModule = (subModuleId: number) => {
        setSelectedSubModules(prev => ({
            ...prev,
            [subModuleId]: prev[subModuleId] === 1 ? 0 : 1
        }));
    };

    // Toggle child module selection
    const toggleChildModule = (childModuleId: number) => {
        setSelectedChildModules(prev => ({
            ...prev,
            [childModuleId]: prev[childModuleId] === 1 ? 0 : 1
        }));
    };

    // Toggle all permissions in a module (including sub-modules and child modules)
    const toggleAllPermissionsInModule = (moduleId: number) => {
        const module = modules.find(m => m.id === moduleId);
        if (!module) return;

        const allSelected = selectedModules[moduleId] === 1;
        const newStatus = allSelected ? 0 : 1;

        // Update module
        setSelectedModules(prev => ({
            ...prev,
            [moduleId]: newStatus
        }));

        // Update all sub-modules in this module
        const updatedSubModules = { ...selectedSubModules };
        module.sub_modules.forEach(subModule => {
            updatedSubModules[subModule.id] = newStatus;
            
            // Update all child modules in this sub-module
            const updatedChildModules = { ...selectedChildModules };
            subModule.child_modules.forEach(childModule => {
                updatedChildModules[childModule.id] = newStatus;
            });
            setSelectedChildModules(updatedChildModules);
        });
        setSelectedSubModules(updatedSubModules);
    };

    // Toggle all permissions in a sub-module (including child modules)
    const toggleAllPermissionsInSubModule = (subModuleId: number, moduleId: number) => {
        const module = modules.find(m => m.id === moduleId);
        if (!module) return;

        const subModule = module.sub_modules.find(sm => sm.id === subModuleId);
        if (!subModule) return;

        const allSelected = selectedSubModules[subModuleId] === 1;
        const newStatus = allSelected ? 0 : 1;

        // Update sub-module
        setSelectedSubModules(prev => ({
            ...prev,
            [subModuleId]: newStatus
        }));

        // Update all child modules in this sub-module
        const updatedChildModules = { ...selectedChildModules };
        subModule.child_modules.forEach(childModule => {
            updatedChildModules[childModule.id] = newStatus;
        });
        setSelectedChildModules(updatedChildModules);

        // Check if all sub-modules in the module are now selected
        const allSubModulesSelected = module.sub_modules.every(sm => 
            selectedSubModules[sm.id] === 1 || (sm.id === subModuleId ? newStatus === 1 : selectedSubModules[sm.id] === 1)
        );
        
        // Update module status based on sub-modules
        if (allSubModulesSelected) {
            setSelectedModules(prev => ({
                ...prev,
                [moduleId]: 1
            }));
        } else {
            setSelectedModules(prev => ({
                ...prev,
                [moduleId]: 0
            }));
        }
    };

    // Toggle all permissions
    const toggleAllPermissions = () => {
        const allSelected = Object.values(selectedModules).every(status => status === 1);
        const newStatus = allSelected ? 0 : 1;

        const updatedModules: Record<number, number> = {};
        const updatedSubModules: Record<number, number> = {};
        const updatedChildModules: Record<number, number> = {};

        modules.forEach(module => {
            updatedModules[module.id] = newStatus;
            
            module.sub_modules.forEach(subModule => {
                updatedSubModules[subModule.id] = newStatus;
                
                subModule.child_modules.forEach(childModule => {
                    updatedChildModules[childModule.id] = newStatus;
                });
            });
        });

        setSelectedModules(updatedModules);
        setSelectedSubModules(updatedSubModules);
        setSelectedChildModules(updatedChildModules);
    };

    // Toggle module expansion
    const toggleModuleExpansion = (moduleId: number) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    // Toggle sub-module expansion
    const toggleSubModuleExpansion = (subModuleId: number) => {
        setExpandedSubModules(prev => ({
            ...prev,
            [subModuleId]: !prev[subModuleId]
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
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

        // if (!formData.role_key.trim()) {
        //     showToast("Role key is required", "error");
        //     return;
        // }

        // if (!/^[a-z0-9_]+$/.test(formData.role_key)) {
        //     showToast("Role key can only contain lowercase letters, numbers, and underscores", "error");
        //     return;
        // }

        // Check if at least one permission is selected
        const hasModulePermissions = Object.values(selectedModules).some(status => status === 1);
        const hasSubModulePermissions = Object.values(selectedSubModules).some(status => status === 1);
        const hasChildModulePermissions = Object.values(selectedChildModules).some(status => status === 1);

        if (!hasModulePermissions && !hasSubModulePermissions && !hasChildModulePermissions) {
            showToast("Please select at least one permission", "error");
            return;
        }

        setLoading(true);

        try {
            // Prepare permissions arrays
            const modulePermissions = Object.entries(selectedModules).map(([moduleId, status]) => ({
                module_id: parseInt(moduleId),
                status: status
            }));

            const subModulePermissions = Object.entries(selectedSubModules).map(([subModuleId, status]) => ({
                sub_module_id: parseInt(subModuleId),
                status: status
            }));

            const childModulePermissions = Object.entries(selectedChildModules).map(([childModuleId, status]) => ({
                child_module_id: parseInt(childModuleId),
                status: status
            }));

            const payload: UpdateRolePayload = {
                role_name: formData.role_name,
                role_key: formData.role_key,
                panel_type: formData.panel_type,
                data_access: formData.data_access,
                is_active: formData.is_active,
                module_permissions: modulePermissions,
                sub_module_permissions: subModulePermissions,
                child_module_permissions: childModulePermissions
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
                role_key: roleDetails.role_key,
                panel_type: roleDetails.panel_type || "admin",
                data_access: roleDetails.data_access,
                is_active: roleDetails.is_active
            });
            
            // Note: We can't reset permissions without making another API call
            // The current implementation assumes we want to keep the current selections
        }
    };

    // Calculate total selected permissions
    const totalSelectedModules = Object.values(selectedModules).filter(status => status === 1).length;
    const totalSelectedSubModules = Object.values(selectedSubModules).filter(status => status === 1).length;
    const totalSelectedChildModules = Object.values(selectedChildModules).filter(status => status === 1).length;
    const totalSelectedPermissions = totalSelectedModules + totalSelectedSubModules + totalSelectedChildModules;

    // Check if all modules are selected
    const isAllModulesSelected = modules.length > 0 && 
        modules.every(module => selectedModules[module.id] === 1);

    // Check if some modules are selected (for indeterminate state)
    const isSomeModulesSelected = modules.some(module => 
        selectedModules[module.id] === 1
    ) && !isAllModulesSelected;

    // Get all unique module names for summary
    const getAllModuleNames = () => {
        const allModules: { id: number; name: string; type: 'module' | 'sub_module' | 'child_module' }[] = [];
        
        modules.forEach(module => {
            allModules.push({ id: module.id, name: module.name, type: 'module' });
            module.sub_modules.forEach(subModule => {
                allModules.push({ id: subModule.id, name: subModule.name, type: 'sub_module' });
                subModule.child_modules.forEach(childModule => {
                    allModules.push({ id: childModule.id, name: childModule.name, type: 'child_module' });
                });
            });
        });
        
        return allModules;
    };

    const allModules = getAllModuleNames();

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
                                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
                                    {roleDetails.role_key}
                                </span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                                    {roleDetails.panel_type}
                                </span>
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

                        {/* Panel Type Select */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Panel Type{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="panel_type"
                                value={formData.panel_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                required
                            >
                                <option value="admin">Admin</option>
                                <option value="agent">Agent</option>
                                <option value="student">Student</option>
                                <option value="university">University</option>
                            </select>
                        </div>

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

                        {/* Active Status */}
                        <div className="mb-6 flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-4 h-4 accent-indigo-600 rounded"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active Role
                            </label>
                        </div>

                        {/* Permissions Section - Hierarchical Design */}
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        Module Permissions
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Update permissions for each module, sub-module, and child module
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {totalSelectedPermissions} permission{totalSelectedPermissions !== 1 ? 's' : ''} selected
                                        ({totalSelectedModules} modules, {totalSelectedSubModules} sub-modules, {totalSelectedChildModules} child modules)
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleAllPermissions}
                                        className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition"
                                    >
                                        {isAllModulesSelected ? (
                                            <CheckSquare className="w-3 h-3" />
                                        ) : isSomeModulesSelected ? (
                                            <div className="w-3 h-3 border border-gray-400 dark:border-gray-500 bg-gray-400 dark:bg-gray-500" />
                                        ) : (
                                            <Square className="w-3 h-3" />
                                        )}
                                        {isAllModulesSelected ? 'Deselect All' : 'Select All'}
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
                                        const isModuleSelected = selectedModules[module.id] === 1;
                                        const isModuleExpanded = expandedModules[module.id] || false;
                                        
                                        // Count selected sub-modules in this module
                                        const selectedSubModulesCount = module.sub_modules.filter(
                                            sm => selectedSubModules[sm.id] === 1
                                        ).length;
                                        
                                        // Count selected child modules in this module
                                        const selectedChildModulesCount = module.sub_modules.reduce(
                                            (total, sm) => total + sm.child_modules.filter(
                                                cm => selectedChildModules[cm.id] === 1
                                            ).length,
                                            0
                                        );
                                        
                                        const totalItemsInModule = module.sub_modules.length + 
                                            module.sub_modules.reduce((total, sm) => total + sm.child_modules.length, 0);
                                        
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
                                                                checked={isModuleSelected}
                                                                ref={input => {
                                                                    if (input) {
                                                                        const someSubSelected = selectedSubModulesCount > 0 || selectedChildModulesCount > 0;
                                                                        input.indeterminate = someSubSelected && !isModuleSelected;
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
                                                                {module.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                ID: {module.id} • Sort Order: {module.sort_order}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-3 py-1 text-xs rounded-full ${
                                                            isModuleSelected || selectedSubModulesCount > 0 || selectedChildModulesCount > 0
                                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                                        }`}>
                                                            {selectedSubModulesCount + selectedChildModulesCount} / {totalItemsInModule} selected
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleModuleExpansion(module.id);
                                                            }}
                                                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
                                                        >
                                                            {isModuleExpanded ? (
                                                                <ChevronUp className="w-5 h-5" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Sub-modules and Child Modules */}
                                                {isModuleExpanded && (
                                                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                                                        {module.sub_modules.map((subModule) => {
                                                            const isSubModuleSelected = selectedSubModules[subModule.id] === 1;
                                                            const isSubModuleExpanded = expandedSubModules[subModule.id] || false;
                                                            
                                                            // Count selected child modules in this sub-module
                                                            const selectedChildModulesInSub = subModule.child_modules.filter(
                                                                cm => selectedChildModules[cm.id] === 1
                                                            ).length;
                                                            
                                                            return (
                                                                <div key={subModule.id} className="ml-6">
                                                                    {/* Sub-module Header */}
                                                                    <div 
                                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition"
                                                                        onClick={() => toggleSubModuleExpansion(subModule.id)}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="relative">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSubModuleSelected}
                                                                                    ref={input => {
                                                                                        if (input) {
                                                                                            input.indeterminate = selectedChildModulesInSub > 0 && !isSubModuleSelected;
                                                                                        }
                                                                                    }}
                                                                                    onChange={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toggleAllPermissionsInSubModule(subModule.id, module.id);
                                                                                    }}
                                                                                    className="w-4 h-4 accent-indigo-600 rounded"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-gray-800 dark:text-white text-sm font-medium">
                                                                                    {subModule.name}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                    Slug: {subModule.slug} • Route: {subModule.route || 'N/A'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                                isSubModuleSelected || selectedChildModulesInSub > 0
                                                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                                                            }`}>
                                                                                {selectedChildModulesInSub} / {subModule.child_modules.length} child modules
                                                                            </span>
                                                                            {subModule.child_modules.length > 0 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toggleSubModuleExpansion(subModule.id);
                                                                                    }}
                                                                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                                                                >
                                                                                    {isSubModuleExpanded ? (
                                                                                        <ChevronUp className="w-4 h-4" />
                                                                                    ) : (
                                                                                        <ChevronDown className="w-4 h-4" />
                                                                                    )}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Child Modules */}
                                                                    {isSubModuleExpanded && subModule.child_modules.length > 0 && (
                                                                        <div className="ml-6 mt-3 space-y-2">
                                                                            {subModule.child_modules.map((childModule) => {
                                                                                const isChildSelected = selectedChildModules[childModule.id] === 1;
                                                                                
                                                                                return (
                                                                                    <label 
                                                                                        key={childModule.id} 
                                                                                        className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/20 hover:bg-gray-100 dark:hover:bg-gray-800/30 rounded-lg cursor-pointer transition"
                                                                                    >
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={isChildSelected}
                                                                                            onChange={() => toggleChildModule(childModule.id)}
                                                                                            className="w-4 h-4 accent-indigo-600 rounded"
                                                                                        />
                                                                                        <div className="flex-1">
                                                                                            <div className="text-sm text-gray-800 dark:text-white">
                                                                                                {childModule.name}
                                                                                            </div>
                                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                Slug: {childModule.slug} • Route: {childModule.route || 'N/A'}
                                                                                            </div>
                                                                                        </div>
                                                                                    </label>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
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
                                                    {totalSelectedPermissions} permission{totalSelectedPermissions !== 1 ? 's' : ''} selected
                                                    ({totalSelectedModules} modules, {totalSelectedSubModules} sub-modules, {totalSelectedChildModules} child modules)
                                                </p>
                                            </div>
                                            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                            <div className="bg-white dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Modules
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300`}>
                                                        {totalSelectedModules} selected
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${(totalSelectedModules / modules.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Sub-modules
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`}>
                                                        {totalSelectedSubModules} selected
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${(totalSelectedSubModules / Object.keys(selectedSubModules).length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Child modules
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300`}>
                                                        {totalSelectedChildModules} selected
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-purple-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${(totalSelectedChildModules / Object.keys(selectedChildModules).length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
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
                                {/* <li>{`• Role key will be auto-generated from role name but can be edited`}</li> */}
                                {/* <li>{`• Role key must be lowercase with underscores (e.g., admission_officer)`}</li> */}
                                <li>{`• Select at least one permission to enable the Update Role button`}</li>
                                <li>{`• Use "Select All" button to quickly toggle all permissions`}</li>
                                <li>{`• Click on module headers to expand/collapse sub-modules`}</li>
                                <li>{`• Click on sub-module headers to expand/collapse child modules`}</li>
                                <li>{`• Data access determines what data the role can access`}</li>
                                <li>{`• Panel type determines which interface this role can access`}</li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}