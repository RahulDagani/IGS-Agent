"use client";

import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Save,
    RotateCcw,
    X,
    Mail,
    Phone,
    Lock,
    User,
    Shield,
    Eye,
    EyeOff,
    AlertCircle,
    Key,
    Loader,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface UserData {
    id: number;
    agent_id: number;
    name: string;
    email: string;
    phone: string;
    role_id: string; // Comes as string from API
    status: string;
    email_verified: number;
    created_by: string | null;
    is_deleted: number;
    created_at: string;
    updated_at: string;
}

interface RoleData {
    id: number;
    agent_id: number;
    role_name: string;
    role_key: string;
    created_at: string;
    permissions_count: number;
}

interface RolesApiResponse {
    success: boolean;
    data: RoleData[];
}

// FIXED: Change to role_id in the payload
interface UpdateUserPayload {
    name: string;
    role_id: string; // Changed from role to role_id
    status: string;
}

interface UpdatePasswordPayload {
    new_password: string;
    confirm_password: string;
}

interface UserApiResponse {
    success: boolean;
    data: UserData;
}

interface RoleOption {
    role_id: number;
    value: string; // This will store role_id as string
    label: string;
}

interface StatusOption {
    value: string;
    label: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function EditUserPage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        role_id: "", // Changed from role to role_id
        status: "",
    });
    
    const [passwordForm, setPasswordForm] = useState({
        new_password: "",
        confirm_password: "",
    });
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [passwordSuccess, setPasswordSuccess] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

    const router = useRouter();
    const params = useParams();
    const { token } = useAuth();

    const userId = params.id as string;

    const availableStatuses: StatusOption[] = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
    ];

    // Fetch user data and roles
    useEffect(() => {
        if (userId) {
            fetchUserData();
            fetchAvailableRoles();
        }
    }, [userId]);

    const fetchUserData = async () => {
        try {
            setInitialLoading(true);
            const response = await fetch(`${BASE_URL}/agent/users/${userId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            const data: UserApiResponse = await response.json();
            
            if (data.success) {
                setUserData(data.data);
                // Set the role_id directly from user data
                setFormData({
                    name: data.data.name,
                    role_id: data.data.role_id, // Set role_id directly
                    status: data.data.status,
                });
            } else {
                showToast("Failed to load user data", "error");
                // router.push("/partner/users");
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            showToast("Failed to load user data", "error");
            // router.push("/partner/users");
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchAvailableRoles = async () => {
        try {
            setRolesLoading(true);
            const response = await fetch(`${BASE_URL}/agent/roles`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            const data: RolesApiResponse = await response.json();
            
            if (data.success) {
                // Transform API data to RoleOption format
                // Store role_id as string in value field
                const roles: RoleOption[] = data.data.map(role => ({
                    role_id: role.id,
                    value: role.id.toString(), // Store role_id as string in value
                    label: role.role_name
                }));
                
                setAvailableRoles(roles);
            } else {
                console.error("Failed to fetch roles from API");
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        } finally {
            setRolesLoading(false);
        }
    };

    // Update form data when userData changes
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                name: userData.name,
                role_id: userData.role_id,
                status: userData.status,
            }));
        }
    }, [userData]);

    const validateUserForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }

        if (!formData.role_id) {
            errors.role_id = "Role is required";
        }

        if (!formData.status) {
            errors.status = "Status is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePasswordForm = () => {
        const errors: Record<string, string> = {};

        if (!passwordForm.new_password) {
            errors.new_password = "New password is required";
        }

        if (!passwordForm.confirm_password) {
            errors.confirm_password = "Please confirm your password";
        } else if (passwordForm.new_password !== passwordForm.confirm_password) {
            errors.confirm_password = "Passwords do not match";
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUserChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handlePasswordChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value,
        }));
        
        // Clear error for this field
        if (passwordErrors[name]) {
            setPasswordErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateUserForm()) {
            showToast("Please fix the errors in the form", "error");
            return;
        }

        setLoading(true);

        try {
            // FIXED: Send role_id in the payload
            const payload: UpdateUserPayload = {
                name: formData.name,
                role_id: formData.role_id, // Send role_id
                status: formData.status,
            };

            console.log("Sending payload:", payload); // Debug log

            const response = await fetch(`${BASE_URL}/agent/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log("Update response:", data); // Debug log

            if (response.ok && data.success) {
                showToast("User updated successfully!", "success");
                // Refresh user data
                fetchUserData();
            } else {
                showToast(data.message || "Failed to update user", "error");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            showToast("Failed to update user. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            showPasswordToast("Please fix the errors in the form", "error");
            return;
        }

        setPasswordLoading(true);

        try {
            const payload: UpdatePasswordPayload = {
                new_password: passwordForm.new_password,
                confirm_password: passwordForm.confirm_password,
            };

            const response = await fetch(`${BASE_URL}/agent/users/${userId}/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showPasswordToast("Password updated successfully!", "success");
                // Reset password form
                setPasswordForm({
                    new_password: "",
                    confirm_password: "",
                });
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            } else {
                showPasswordToast(data.message || "Failed to update password", "error");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            showPasswordToast("Failed to update password. Please try again.", "error");
        } finally {
            setPasswordLoading(false);
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

    const showPasswordToast = (message: string, type: "success" | "error") => {
        if (type === "success") {
            setPasswordSuccess(message);
            setPasswordError("");
        } else {
            setPasswordError(message);
            setPasswordSuccess("");
        }
    };

    const resetUserForm = () => {
        if (userData) {
            setFormData({
                name: userData.name,
                role_id: userData.role_id,
                status: userData.status,
            });
        }
        setFormErrors({});
    };

    const resetPasswordForm = () => {
        setPasswordForm({
            new_password: "",
            confirm_password: "",
        });
        setPasswordErrors({});
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRole = (roleId: string) => {
        // Find the role from availableRoles
        const role = availableRoles.find(r => r.value === roleId);
        return role ? role.label : `Role ${roleId}`;
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (initialLoading || rolesLoading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <div className="text-white text-lg">
                        {initialLoading ? "Loading user data..." : "Loading roles..."}
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <div className="text-white text-lg">User not found</div>
                    <button
                        onClick={() => router.push("/partner/users")}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                    >
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">
            <div className="flex-1 mt-6 lg:mt-0 ">
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

                <div className="bg-[#111827] rounded-xl shadow-lg border border-white/10 p-4 lg:p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Edit User
                            </h2>
                            <p className="text-gray-400 mt-1">
                                Update user role, status, and password
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-gray-800 rounded-lg">
                                <span className="text-xs text-gray-400">User ID:</span>
                                <span className="text-xs text-gray-300 ml-1 font-mono">#{userId}</span>
                            </div>
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded-lg transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Users
                            </button>
                        </div>
                    </div>

                    {/* User Information Card */}
                    <div className="mb-8 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-400">Full Name</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <p className="text-white font-medium truncate">
                                        {userData.name}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Email</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <p className="text-white font-medium truncate">
                                        {userData.email}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Phone</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <p className="text-white font-medium">
                                        {userData.phone}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Created</p>
                                <p className="text-white font-medium">
                                    {formatDate(userData.created_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Email Verified</p>
                                <p className={`font-medium ${userData.email_verified ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {userData.email_verified ? 'Yes' : 'No'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Update User Form */}
                        <div className="bg-[#1F2937] border border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Update User Details
                            </h3>
                            
                            <form onSubmit={handleUserSubmit}>
                                <div className="space-y-4">
                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Full Name{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleUserChange}
                                                placeholder="Enter Full Name"
                                                className={`w-full pl-10 pr-4 py-2 bg-gray-900 border ${formErrors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-colors`}
                                            />
                                        </div>
                                        {formErrors.name && (
                                            <p className="text-red-400 text-sm">
                                                {formErrors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Role Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Role{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            {availableRoles.length > 0 ? (
                                                <select
                                                    name="role_id" // Changed from role to role_id
                                                    value={formData.role_id}
                                                    onChange={handleUserChange}
                                                    className={`w-full pl-10 pr-4 py-2 bg-gray-900 border ${formErrors.role_id ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-colors`}
                                                >
                                                    <option value="">Select a role</option>
                                                    {availableRoles.map((role) => (
                                                        <option key={role.role_id} value={role.value}>
                                                            {role.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="flex items-center justify-center pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg">
                                                    <Loader className="w-5 h-5 animate-spin text-gray-400" />
                                                    <span className="ml-2 text-gray-400">Loading roles...</span>
                                                </div>
                                            )}
                                        </div>
                                        {formErrors.role_id && (
                                            <p className="text-red-400 text-sm">
                                                {formErrors.role_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Status{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleUserChange}
                                                className={`w-full pl-10 pr-4 py-2 bg-gray-900 border ${formErrors.status ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-colors`}
                                            >
                                                <option value="">Select status</option>
                                                {availableStatuses.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {formErrors.status && (
                                            <p className="text-red-400 text-sm">
                                                {formErrors.status}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Current Status Display */}
                                <div className="mt-6 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-gray-400">Current Role</p>
                                            <p className="text-white font-medium">
                                                {formatRole(userData.role_id)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Current Status</p>
                                            <p className={`font-medium ${
                                                userData.status === 'active' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {formatStatus(userData.status)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Available Roles Info */}
                                <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Available Roles ({availableRoles.length})</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {availableRoles.slice(0, 5).map((role) => (
                                            <span 
                                                key={role.role_id} 
                                                className={`px-2 py-1 text-xs rounded ${formData.role_id === role.value ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}
                                            >
                                                {role.label}
                                            </span>
                                        ))}
                                        {availableRoles.length > 5 && (
                                            <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-400 border border-gray-600 rounded">
                                                +{availableRoles.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-4 border-t border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={loading || !formData.name || !formData.role_id || !formData.status}
                                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Update User
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetUserForm}
                                        disabled={!userData}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Update Password Form */}
                        <div className="bg-[#1F2937] border border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Update Password
                            </h3>
                            
                            {passwordSuccess && (
                                <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
                                    <p className="text-green-400 text-sm">{passwordSuccess}</p>
                                </div>
                            )}

                            {passwordError && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
                                    <p className="text-red-400 text-sm">{passwordError}</p>
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="space-y-4">
                                    {/* New Password Input */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            New Password{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                name="new_password"
                                                value={passwordForm.new_password}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter new password"
                                                className={`w-full pl-10 pr-12 py-2 bg-gray-900 border ${passwordErrors.new_password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                            >
                                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {passwordErrors.new_password && (
                                            <p className="text-red-400 text-sm">
                                                {passwordErrors.new_password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password Input */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Confirm Password{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirm_password"
                                                value={passwordForm.confirm_password}
                                                onChange={handlePasswordChange}
                                                placeholder="Confirm new password"
                                                className={`w-full pl-10 pr-12 py-2 bg-gray-900 border ${passwordErrors.confirm_password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {passwordErrors.confirm_password && (
                                            <p className="text-red-400 text-sm">
                                                {passwordErrors.confirm_password}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Password Notes */}
                                <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Notes:</h4>
                                    <ul className="text-xs text-gray-400 space-y-1">
                                        <li>• User will need to login with the new password</li>
                                        <li>• Consider informing the user about the password change</li>
                                        <li>• Password change is immediate</li>
                                    </ul>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-4 border-t border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading || !passwordForm.new_password || !passwordForm.confirm_password}
                                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {passwordLoading ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Update Password
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetPasswordForm}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}