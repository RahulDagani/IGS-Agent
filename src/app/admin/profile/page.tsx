"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    mobile: string | null;
    country_code: string | null;
    employee_code: string | null;
    image: string | null;
    created_at: string;
}

export default function UpdateProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        role: "",
        mobile: "",
        country_code: "+1",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch("/api/profile");
            const result = await response.json();

            if (result.success) {
                const userData: UserProfile = result.data;
                setForm({
                    name: userData.name || "",
                    email: userData.email || "",
                    currentPassword: "",
                    newPassword: "",
                    role: "",
                    confirmPassword: "",
                    mobile: userData.mobile || "",
                    country_code: userData.country_code || "+1",
                });
            } else {
                alert(result.error || "Failed to load profile");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            alert("Failed to load profile");
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (form.newPassword && form.newPassword.length < 8) {
            alert("New password must be at least 8 characters long!");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            alert("New password and confirm password don't match!");
            return;
        }

        // If new password is provided, current password is required
        if (form.newPassword && !form.currentPassword) {
            alert("Please enter your current password to set a new password");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    currentPassword: form.currentPassword || undefined,
                    newPassword: form.newPassword || undefined,
                    mobile: form.mobile,
                    country_code: form.country_code,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message || "Profile updated successfully!");

                // Clear password fields
                setForm((prev) => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                }));

                // Refresh profile data
                fetchProfile();
            } else {
                alert(result.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="flex min-h-screen bg-[#111827] items-center justify-center">
                <div className="text-white">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#111827] ">
            <div className="flex-1">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">
                            Update Profile
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Manage your personal information and credentials.
                        </p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="bg-[#1f2937] rounded-lg p-6 text-center h-fit">
                        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-semibold text-white border-4 border-gray-600">
                            {getInitials(form.name)}
                        </div>
                        <h2 className="mt-4 text-xl font-medium text-white">
                            {form.name}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {form.email}
                        </p>
                        <div className="mt-3">
                            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                                {form.role || "User"}
                            </span>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-6 text-left space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Mobile:</span>
                                <span className="text-white">
                                    {form.mobile
                                        ? `${form.country_code} ${form.mobile}`
                                        : "Not set"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">
                                    Member since:
                                </span>
                                <span className="text-white">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-2 bg-[#1f2937] rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">
                                        Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded bg-[#111827] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">
                                        Email{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded bg-[#111827] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                {/* Mobile */}
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">
                                        Mobile
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            name="country_code"
                                            value={form.country_code}
                                            onChange={handleChange}
                                            className="w-1/3 px-3 py-2 rounded bg-[#111827] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="+1">+1 (US)</option>
                                            <option value="+44">
                                                +44 (UK)
                                            </option>
                                            <option value="+91">
                                                +91 (IN)
                                            </option>
                                            <option value="+61">
                                                +61 (AU)
                                            </option>
                                            <option value="+86">
                                                +86 (CN)
                                            </option>
                                        </select>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={form.mobile}
                                            onChange={handleChange}
                                            placeholder="Enter mobile number"
                                            className="flex-1 px-4 py-2 rounded bg-[#111827] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password Change Section */}
                            <div className="border-t border-gray-600 pt-6">
                                <h3 className="text-lg font-medium text-white mb-4">
                                    Change Password
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    {"Leave these fields blank if you don't want to change your password."}
                                </p>

                                <div className="space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-gray-300 text-sm mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showCurrentPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="currentPassword"
                                                placeholder="Enter current password"
                                                value={form.currentPassword}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded bg-[#111827] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        !showCurrentPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* New Password */}
                                        <div>
                                            <label className="block text-gray-300 text-sm mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={
                                                        showNewPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="newPassword"
                                                    placeholder="Enter new password"
                                                    value={form.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded bg-[#111827] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                                                    minLength={8}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowNewPassword(
                                                            !showNewPassword
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {form.newPassword &&
                                                form.newPassword.length < 8 && (
                                                    <p className="text-red-400 text-xs mt-1">
                                                        Password must be at
                                                        least 8 characters
                                                    </p>
                                                )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-gray-300 text-sm mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="confirmPassword"
                                                    placeholder="Confirm new password"
                                                    value={form.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded bg-[#111827] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {form.newPassword &&
                                                form.confirmPassword &&
                                                form.newPassword !==
                                                    form.confirmPassword && (
                                                    <p className="text-red-400 text-xs mt-1">
                                                        {"Passwords don't match"}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-600">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded transition"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
