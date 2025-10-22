"use client";

import { useState, useEffect } from "react";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";
import { Save, X } from "lucide-react";
import Image from "next/image";

interface GeneralSettings {
    id?: string;
    companyName: string;
    companyTagline: string;
    emailAddress: string;
    phoneNumber: string;
    address: string;
    yearlyPlanDiscount: number;
    trialDayCount: number;
    defaultLanguage: string;
    defaultCurrency: string;
    copyrightText: string;
    facebookLink: string;
    instagramLink: string;
    twitterLink: string;
    linkedinLink: string;
    whiteLogo: string;
    blackLogo: string;
    smallLogo: string;
    favicon: string;
    emailOtpVerification: boolean;
}

export default function GeneralSettingsPage() {
    const [formData, setFormData] = useState({
        companyName: "",
        companyTagline: "",
        email: "",
        phone: "",
        address: "",
        yearlyPlanDiscount: "",
        trialDayCount: "14",
        defaultLanguage: "English",
        defaultCurrency: "USD",
        copyrightText: "",
        facebookLink: "",
        instagramLink: "",
        twitterLink: "",
        linkedinLink: "",
        emailOtpVerification: false,
    });

    const [whiteLogo, setWhiteLogo] = useState<File | null>(null);
    const [blackLogo, setBlackLogo] = useState<File | null>(null);
    const [smallLogo, setSmallLogo] = useState<File | null>(null);
    const [favicon, setFavicon] = useState<File | null>(null);
    const [existingLogos, setExistingLogos] = useState({
        whiteLogo: "",
        blackLogo: "",
        smallLogo: "",
        favicon: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settingsId, setSettingsId] = useState<string>("");

    // Toast states
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Fetch settings data
    useEffect(() => {
        fetchSettings();
    }, []);

    // Auto-hide toasts after 5 seconds
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess("");
                setError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const showToast = (message: string, type: "success" | "error") => {
        if (type === "success") {
            setSuccess(message);
            setError("");
        } else {
            setError(message);
            setSuccess("");
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/setup/general-settings");
            const data: GeneralSettings = await response.json();

            if (response.ok) {
                setSettingsId(data.id || "");
                setFormData({
                    companyName: data.companyName,
                    companyTagline: data.companyTagline,
                    email: data.emailAddress,
                    phone: data.phoneNumber,
                    address: data.address,
                    yearlyPlanDiscount:
                        data.yearlyPlanDiscount?.toString() || "",
                    trialDayCount: data.trialDayCount?.toString() || "14",
                    defaultLanguage: "English", // You might want to map this from "en"
                    defaultCurrency: data.defaultCurrency,
                    copyrightText: data.copyrightText,
                    facebookLink: data.facebookLink,
                    instagramLink: data.instagramLink,
                    twitterLink: data.twitterLink,
                    linkedinLink: data.linkedinLink,
                    emailOtpVerification: data.emailOtpVerification,
                });
                setExistingLogos({
                    whiteLogo: data.whiteLogo,
                    blackLogo: data.blackLogo,
                    smallLogo: data.smallLogo,
                    favicon: data.favicon,
                });
            } else {
                showToast("Failed to load settings", "error");
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            showToast("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const target = e.target;

        const value =
            target instanceof HTMLInputElement && target.type === "checkbox"
                ? target.checked
                : target.value;

        setFormData({
            ...formData,
            [target.name]: value,
        });
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: React.Dispatch<React.SetStateAction<File | null>>
    ) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file: File, type: string): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const response = await fetch("/api/setup/general-settings/upload", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to upload file");
        }

        return result.filePath;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Upload files if selected
            let whiteLogoPath = existingLogos.whiteLogo;
            let blackLogoPath = existingLogos.blackLogo;
            let smallLogoPath = existingLogos.smallLogo;
            let faviconPath = existingLogos.favicon;

            if (whiteLogo) {
                whiteLogoPath = await uploadFile(whiteLogo, "whiteLogo");
            }
            if (blackLogo) {
                blackLogoPath = await uploadFile(blackLogo, "blackLogo");
            }
            if (smallLogo) {
                smallLogoPath = await uploadFile(smallLogo, "smallLogo");
            }
            if (favicon) {
                faviconPath = await uploadFile(favicon, "favicon");
            }

            // Prepare data for API
            const submitData = {
                id: settingsId,
                ...formData,
                whiteLogo: whiteLogoPath,
                blackLogo: blackLogoPath,
                smallLogo: smallLogoPath,
                favicon: faviconPath,
            };

            const response = await fetch("/api/setup/general-settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            if (response.ok) {
                const updatedSettings = await response.json();
                setSettingsId(updatedSettings.id);
                setExistingLogos({
                    whiteLogo: updatedSettings.whiteLogo,
                    blackLogo: updatedSettings.blackLogo,
                    smallLogo: updatedSettings.smallLogo,
                    favicon: updatedSettings.favicon,
                });

                // Clear file inputs after successful upload
                setWhiteLogo(null);
                setBlackLogo(null);
                setSmallLogo(null);
                setFavicon(null);

                showToast("Settings saved successfully!", "success");
            } else {
                const errorData = await response.json();
                showToast(
                    errorData.error || "Failed to save settings",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            showToast("Failed to save settings", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <SetupSettingsSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white">Loading settings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">
            {/* Sidebar */}
            <SetupSettingsSidebar />

            {/* Main Content */}
            <div className="bg-[#111827] flex-1 mt-6 ml-0 lg:ml-6 lg:mt-0 mb-6 space-y-8">
                {/* Toast Notifications */}
                {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg flex justify-between items-center">
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
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex justify-between items-center">
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
                    <h2 className="text-xl font-semibold text-white mb-6">
                        General Settings
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Company Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-200 mb-4">
                                Add Your Company Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Company Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="Your Company Name"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Company Tagline{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyTagline"
                                        placeholder="Your Business Slogan"
                                        value={formData.companyTagline}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Email Address{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="email@gmail.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Phone Number{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="01700000000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        placeholder="Your address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={2}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Default Settings */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-200 mb-4">
                                Default Settings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Default Language
                                    </label>
                                    <input
                                        type="text"
                                        name="defaultLanguage"
                                        value={formData.defaultLanguage}
                                        disabled
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Default Currency{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="defaultCurrency"
                                        value={formData.defaultCurrency}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Copyright Text{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="copyrightText"
                                        placeholder="Copyright 2025 © By YourCompany. All Rights Reserved."
                                        value={formData.copyrightText}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-200 mb-4">
                                Social Links
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Facebook Link
                                    </label>
                                    <input
                                        type="url"
                                        name="facebookLink"
                                        placeholder="https://www.facebook.com/yourpage"
                                        value={formData.facebookLink}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Instagram Link
                                    </label>
                                    <input
                                        type="url"
                                        name="instagramLink"
                                        placeholder="https://www.instagram.com/yourpage"
                                        value={formData.instagramLink}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Twitter Link
                                    </label>
                                    <input
                                        type="url"
                                        name="twitterLink"
                                        placeholder="https://www.twitter.com/yourpage"
                                        value={formData.twitterLink}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        LinkedIn Link
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedinLink"
                                        placeholder="https://www.linkedin.com/yourpage"
                                        value={formData.linkedinLink}
                                        onChange={handleChange}
                                        className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logos */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-200 mb-4">
                                Logos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        White Logo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleFileChange(e, setWhiteLogo)
                                        }
                                        className="mt-1 w-full text-gray-300"
                                    />
                                    {existingLogos.whiteLogo && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-400">
                                                Current:
                                            </p>
                                            <Image
                                                src={existingLogos.whiteLogo}
                                                alt="White Logo"
                                                className="h-8 mt-1"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Black Logo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleFileChange(e, setBlackLogo)
                                        }
                                        className="mt-1 w-full text-gray-300"
                                    />
                                    {existingLogos.blackLogo && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-400">
                                                Current:
                                            </p>
                                            <Image
                                                src={existingLogos.blackLogo}
                                                alt="Black Logo"
                                                className="h-8 mt-1"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Small Logo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleFileChange(e, setSmallLogo)
                                        }
                                        className="mt-1 w-full text-gray-300"
                                    />
                                    {existingLogos.smallLogo && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-400">
                                                Current:
                                            </p>
                                            <Image
                                                src={existingLogos.smallLogo}
                                                alt="Small Logo"
                                                className="h-8 mt-1"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Favicon
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,.ico"
                                        onChange={(e) =>
                                            handleFileChange(e, setFavicon)
                                        }
                                        className="mt-1 w-full text-gray-300"
                                    />
                                    {existingLogos.favicon && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-400">
                                                Current:
                                            </p>
                                            <Image
                                                src={existingLogos.favicon}
                                                alt="Favicon"
                                                className="h-8 mt-1"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Email OTP Verification */}
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="emailOtpVerification"
                                checked={formData.emailOtpVerification}
                                onChange={handleChange}
                                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-700 rounded"
                            />
                            <label className="text-sm text-gray-300">
                                Enable Email OTP Verification
                            </label>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
