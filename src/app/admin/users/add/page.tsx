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
    Loader,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface CreateUserPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    status: string;
}

interface CreateUserApiResponse {
    success: boolean;
    data?: {
        id: number;
        name: string;
        email: string;
        phone: string;
        role: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
    message?: string;
}

interface RoleData {
    id: number;
    tenant_id: number;
    role_name: string;
    role_key: string;
    created_at: string;
    permissions_count: number;
}

interface RolesApiResponse {
    success: boolean;
    data: RoleData[];
}

interface RoleOption {
    value: string;
    label: string;
}

interface StatusOption {
    value: string;
    label: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function AddUserPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "",
        status: "active",
    });
    
    const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const router = useRouter();
    const { token } = useAuth();

    const availableStatuses: StatusOption[] = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        
    ];

    // Fetch available roles on component mount
    useEffect(() => {
        fetchAvailableRoles();
    }, []);

    const fetchAvailableRoles = async () => {
        try {
            setRolesLoading(true);
            const response = await fetch(`${BASE_URL}/tenant/getroles`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            const data: RolesApiResponse = await response.json();
            
            if (data.success) {
                // Transform API data to RoleOption format
                const roles: RoleOption[] = data.data.map(role => ({
                    value: role.role_key, // Using role_key as value for API compatibility
                    label: role.role_name
                }));
                
                // Merge API roles with default roles, avoiding duplicates
                const allRoles = [...roles];
                
                setAvailableRoles(allRoles);
                
                // Set default role if available
                if (allRoles.length > 0 && !formData.role) {
                    setFormData(prev => ({
                        ...prev,
                        role: allRoles[0].value
                    }));
                }
            } else {
                // Fallback to default roles if API fails
                const defaultRoles = [
                    { value: "student", label: "Student" },
                    { value: "agent", label: "Agent" },
                    { value: "admin", label: "Admin" },
                    { value: "agent_student", label: "Agent Student" },
                ];
                setAvailableRoles(defaultRoles);
                if (!formData.role) {
                    setFormData(prev => ({
                        ...prev,
                        role: defaultRoles[0].value
                    }));
                }
                console.error("Failed to fetch roles from API");
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            // Fallback to default roles
            const defaultRoles = [
                { value: "student", label: "Student" },
                { value: "agent", label: "Agent" },
                { value: "admin", label: "Admin" },
                { value: "agent_student", label: "Agent Student" },
            ];
            setAvailableRoles(defaultRoles);
            if (!formData.role) {
                setFormData(prev => ({
                    ...prev,
                    role: defaultRoles[0].value
                }));
            }
        } finally {
            setRolesLoading(false);
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Name validation
      
        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }

        // Phone validation
        if (!formData.phone.trim()) {
            errors.phone = "Phone number is required";
        }

        // Password validation
        if (!formData.password) {
            errors.password = "Password is required";
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        // Role validation
        if (!formData.role) {
            errors.role = "Please select a role";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast("Please fix the errors in the form", "error");
            return;
        }

        setLoading(true);

        try {
            const payload: CreateUserPayload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
                status: formData.status,
            };

            const response = await fetch(`${BASE_URL}/tenant/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data: CreateUserApiResponse = await response.json();

            if (response.ok && data.success) {
                showToast("User created successfully!", "success");
                
                // Reset form after successful creation
                setTimeout(() => {
                    resetForm();
                    router.push("/admin/users");
                }, 1500);
            } else {
                showToast(data.message || "Failed to create user", "error");
            }
        } catch (error) {
            console.error("Error creating user:", error);
            showToast("Failed to create user. Please try again.", "error");
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
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            role: availableRoles.length > 0 ? availableRoles[0].value : "",
            status: "active",
        });
        setValidationErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

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
                                Add New User
                            </h2>
                            <p className="text-gray-400 mt-1">
                                Create a new user account
                            </p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded-lg transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Users
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        onChange={handleChange}
                                        placeholder="Enter Full Name"
                                        className={`w-full pl-10 pr-12 py-2 bg-[#1F2937] border ${validationErrors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors`}
                                    />
                                    
                                </div>
                                {validationErrors.name && (
                                    <p className="text-red-400 text-sm">
                                        {validationErrors.name}
                                    </p>
                                )}
                            </div>
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Email Address{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="user@example.com"
                                        className={`w-full pl-10 pr-4 py-2 bg-[#1F2937] border ${validationErrors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors`}
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="text-red-400 text-sm">
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Phone Number{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1234567890"
                                        className={`w-full pl-10 pr-4 py-2 bg-[#1F2937] border ${validationErrors.phone ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors`}
                                    />
                                </div>
                                {validationErrors.phone && (
                                    <p className="text-red-400 text-sm">
                                        {validationErrors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Password{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        className={`w-full pl-10 pr-12 py-2 bg-[#1F2937] border ${validationErrors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {validationErrors.password && (
                                    <p className="text-red-400 text-sm">
                                        {validationErrors.password}
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
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        className={`w-full pl-10 pr-12 py-2 bg-[#1F2937] border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {validationErrors.confirmPassword && (
                                    <p className="text-red-400 text-sm">
                                        {validationErrors.confirmPassword}
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
                                    {rolesLoading ? (
                                        <div className="w-full pl-10 pr-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg flex items-center">
                                            <Loader className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                                            <span className="text-gray-400">Loading roles...</span>
                                        </div>
                                    ) : availableRoles.length > 0 ? (
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2 bg-[#1F2937] border ${validationErrors.role ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-colors`}
                                        >
                                            <option value="">Select a role</option>
                                            {availableRoles.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="w-full pl-10 pr-4 py-2 bg-[#1F2937] border border-red-500 rounded-lg text-red-400">
                                            No roles available. Please create roles first.
                                        </div>
                                    )}
                                </div>
                                {validationErrors.role && (
                                    <p className="text-red-400 text-sm">
                                        {validationErrors.role}
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
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-colors"
                                    >
                                        {availableStatuses.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Available Roles Info */}
                        {!rolesLoading && availableRoles.length > 0 && (
                            <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-gray-300">
                                        Available Roles ({availableRoles.length})
                                    </h4>
                                    <span className="text-xs text-gray-400">
                                        Click to select
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {availableRoles.map((role) => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, role: role.value }));
                                                if (validationErrors.role) {
                                                    setValidationErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.role;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                                                formData.role === role.value
                                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                                                    : 'bg-gray-700/30 text-gray-400 border-gray-600 hover:bg-gray-600/30'
                                            }`}
                                        >
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 border-t border-gray-700 pt-6 gap-4">
                            <button
                                type="submit"
                                disabled={loading || rolesLoading || availableRoles.length === 0 || !formData.role}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Creating User...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Create User
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
                                    Reset Form
                                </button>
                            </div>
                        </div>

                        {/* Form Notes */}
                        <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Notes:</h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>• All fields marked with * are required</li>
                                <li>• Email must be unique and valid</li>
                                <li>• Click the eye icon to show/hide password</li>
                                <li>• User will receive an invitation email</li>
                                <li>• Roles are loaded from the system</li>
                                <li className={`${rolesLoading ? 'text-yellow-400' : 'text-gray-400'}`}>
                                    • {rolesLoading ? 'Loading roles...' : `Loaded ${availableRoles.length} roles`}
                                </li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}