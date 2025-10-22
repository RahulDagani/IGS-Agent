"use client";

import { useState, useEffect } from "react";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";
import { Save, X, Eye, EyeOff } from "lucide-react";

interface SMSConfiguration {
    id?: string;
    provider: string;
    accountSid: string;
    authToken: string;
    fromNumber: string;
    serviceSid: string;
}

export default function SMSConfigurationPage() {
    const [formData, setFormData] = useState({
        provider: "twilio",
        accountSid: "",
        authToken: "",
        fromNumber: "",
        serviceSid: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [configId, setConfigId] = useState<string>("");
    const [showAuthToken, setShowAuthToken] = useState(false);

    // Toast states
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [testResult, setTestResult] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Fetch SMS configuration
    useEffect(() => {
        fetchSMSConfiguration();
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

    // Auto-hide test result after 8 seconds
    useEffect(() => {
        if (testResult) {
            const timer = setTimeout(() => {
                setTestResult(null);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [testResult]);

    const showToast = (message: string, type: "success" | "error") => {
        if (type === "success") {
            setSuccess(message);
            setError("");
        } else {
            setError(message);
            setSuccess("");
        }
    };

    const fetchSMSConfiguration = async () => {
        try {
            const response = await fetch("/api/setup/sms-configuration");
            const data: SMSConfiguration = await response.json();

            if (response.ok) {
                setConfigId(data.id || "");
                setFormData({
                    provider: data.provider || "twilio",
                    accountSid: data.accountSid,
                    authToken: data.authToken || "", // Note: Auth token might not be returned for security
                    fromNumber: data.fromNumber,
                    serviceSid: data.serviceSid,
                });
            } else {
                showToast("Failed to load SMS configuration", "error");
            }
        } catch (error) {
            console.error("Error fetching SMS configuration:", error);
            showToast("Failed to load SMS configuration", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = {
                id: configId,
                ...formData,
            };

            const response = await fetch("/api/setup/sms-configuration", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            if (response.ok) {
                const updatedConfig = await response.json();
                setConfigId(updatedConfig.id);
                showToast("SMS configuration saved successfully!", "success");
            } else {
                const errorData = await response.json();
                showToast(
                    errorData.error || "Failed to save SMS configuration",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error saving SMS configuration:", error);
            showToast("Failed to save SMS configuration", "error");
        } finally {
            setSaving(false);
        }
    };

    // const handleTestConnection = async () => {
    //     setTesting(true);
    //     setTestResult(null);

    //     try {
    //         const response = await fetch(
    //             "/api/settings/sms-configuration/test",
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify(formData),
    //             }
    //         );

    //         const result = await response.json();

    //         if (response.ok) {
    //             setTestResult({
    //                 type: "success",
    //                 message: result.message,
    //             });
    //         } else {
    //             setTestResult({
    //                 type: "error",
    //                 message: result.error,
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error testing connection:", error);
    //         setTestResult({
    //             type: "error",
    //             message: "Failed to test connection. Please try again.",
    //         });
    //     } finally {
    //         setTesting(false);
    //     }
    // };

    // const isTestButtonDisabled =
    //     !formData.accountSid || !formData.authToken || !formData.fromNumber;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <SetupSettingsSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white">
                        Loading SMS configuration...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">
            {/* Sidebar */}
            <SetupSettingsSidebar />

            {/* Main Content */}
            <div className="flex-1 mt-6 ml-0 lg:ml-6 lg:mt-0 mb-6 bg-[#111827] rounded-xl shadow-lg border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                    SMS Configuration
                </h2>

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

                {/* Test Connection Result */}
                {testResult && (
                    <div
                        className={`mb-6 p-4 border rounded-lg flex justify-between items-center ${
                            testResult.type === "success"
                                ? "bg-green-500/10 border-green-500"
                                : "bg-red-500/10 border-red-500"
                        }`}
                    >
                        <p
                            className={`text-sm ${
                                testResult.type === "success"
                                    ? "text-green-400"
                                    : "text-red-400"
                            }`}
                        >
                            {testResult.message}
                        </p>
                        <button
                            onClick={() => setTestResult(null)}
                            className={`${
                                testResult.type === "success"
                                    ? "text-green-400"
                                    : "text-red-400"
                            } hover:opacity-70`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SMS Provider */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            SMS Provider <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="provider"
                            value={formData.provider}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="twilio">Twilio</option>
                            {/* <option value="vonage">Vonage (Nexmo)</option>
                            <option value="plivo">Plivo</option>
                            <option value="messagebird">MessageBird</option> */}
                        </select>
                    </div>

                    {/* TWILIO ACCOUNT SID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            ACCOUNT SID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="accountSid"
                            placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            value={formData.accountSid}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            {'Your Twilio Account SID starting with "AC"'}
                        </p>
                    </div>

                    {/* TWILIO AUTH TOKEN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            AUTH TOKEN <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showAuthToken ? "text" : "password"}
                                name="authToken"
                                placeholder="Enter your Auth Token"
                                value={formData.authToken}
                                onChange={handleChange}
                                className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowAuthToken(!showAuthToken)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                                {showAuthToken ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Keep this secure! Your Auth Token is sensitive.
                        </p>
                    </div>

                    {/* TWILIO FROM NUMBER */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            FROM NUMBER <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fromNumber"
                            placeholder="+1234567890"
                            value={formData.fromNumber}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Your Twilio phone number in E.164 format (e.g.,
                            +1234567890)
                        </p>
                    </div>

                    {/* TWILIO SMS SERVICE SID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            MESSAGING SERVICE SID
                        </label>
                        <input
                            type="text"
                            name="serviceSid"
                            placeholder="MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            value={formData.serviceSid}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            {'Optional: Your Messaging Service SID starting with "MG"'}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end items-center pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>

                        {/* <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testing || isTestButtonDisabled}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50"
                        >
                            <TestTube2 className="w-4 h-4" />
                            {testing ? "Testing..." : "Test Connection"}
                        </button> */}
                    </div>

                    {/* Configuration Tips */}
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-400 mb-2">
                            Twilio Configuration Tips:
                        </h3>
                        <ul className="text-xs text-blue-300 space-y-1">
                            <li>
                                • Find your Account SID and Auth Token in the
                                Twilio Console dashboard
                            </li>
                            <li>
                                • Your From Number must be a purchased Twilio
                                phone number
                            </li>
                            <li>
                                • Messaging Service SID is optional but
                                recommended for better delivery
                            </li>
                            <li>
                                • Keep your Auth Token secure and never share it
                                publicly
                            </li>
                            {/* <li>
                                • Test numbers: Use +15005550000 for successful
                                test, +15005550001 for failed test
                            </li> */}
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    );
}
