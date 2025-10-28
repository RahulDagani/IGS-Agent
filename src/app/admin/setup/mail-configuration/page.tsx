"use client";

import { useState, useEffect } from "react";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";
import { Save, X, TestTube2 } from "lucide-react";

interface MailConfiguration {
    id?: string;
    mailer: string;
    host: string;
    port: string;
    username: string;
    password: string;
    encryption: string;
    fromAddress: string;
    fromName: string;
}

export default function MailConfigurationPage() {
    const [formData, setFormData] = useState({
        mailMailer: "smtp",
        mailHost: "",
        mailPort: "587",
        mailUsername: "",
        mailPassword: "",
        mailEncryption: "tls",
        mailFromAddress: "",
        mailFromName: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [configId, setConfigId] = useState<string>("");

    // Toast states
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [testResult, setTestResult] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Fetch mail configuration
    useEffect(() => {
        fetchMailConfiguration();
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

    const fetchMailConfiguration = async () => {
        try {
            const response = await fetch("/api/setup/mail-configuration");
            const data: MailConfiguration = await response.json();

            if (response.ok) {
                setConfigId(data.id || "");
                setFormData({
                    mailMailer: data.mailer,
                    mailHost: data.host,
                    mailPort: data.port,
                    mailUsername: data.username,
                    mailPassword: data.password,
                    mailEncryption: data.encryption,
                    mailFromAddress: data.fromAddress,
                    mailFromName: data.fromName || "",
                });
            } else {
                showToast("Failed to load mail configuration", "error");
            }
        } catch (error) {
            console.error("Error fetching mail configuration:", error);
            showToast("Failed to load mail configuration", "error");
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

            const response = await fetch("/api/setup/mail-configuration", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            if (response.ok) {
                const updatedConfig = await response.json();
                setConfigId(updatedConfig.id);
                showToast("Mail configuration saved successfully!", "success");
            } else {
                const errorData = await response.json();
                showToast(
                    errorData.error || "Failed to save mail configuration",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error saving mail configuration:", error);
            showToast("Failed to save mail configuration", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch("/api/setup/mail-configuration/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setTestResult({
                    type: "success",
                    message: result.message,
                });
            } else {
                setTestResult({
                    type: "error",
                    message: result.error,
                });
            }
        } catch (error) {
            console.error("Error testing connection:", error);
            setTestResult({
                type: "error",
                message: "Failed to test connection. Please try again.",
            });
        } finally {
            setTesting(false);
        }
    };

    const isTestButtonDisabled =
        !formData.mailHost ||
        !formData.mailPort ||
        !formData.mailUsername ||
        !formData.mailPassword;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a]">
                <SetupSettingsSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white">
                        Loading mail configuration...
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
                    Mail Configuration
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
                    {/* MAIL MAILER */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            MAIL MAILER <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="mailMailer"
                            value={formData.mailMailer}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="smtp">SMTP</option>
                            <option value="sendmail">Sendmail</option>
                            <option value="mailgun">Mailgun</option>
                            <option value="ses">Amazon SES</option>
                        </select>
                    </div>

                    {/* MAIL HOST */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            MAIL HOST <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="mailHost"
                            placeholder="smtp.gmail.com"
                            value={formData.mailHost}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* MAIL PORT */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            MAIL PORT <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="mailPort"
                            value={formData.mailPort}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="587">587 (TLS)</option>
                            <option value="465">465 (SSL)</option>
                            <option value="25">25</option>
                            <option value="2525">2525</option>
                        </select>
                    </div>

                    {/* MAIL USERNAME */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            MAIL USERNAME{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="mailUsername"
                            placeholder="your-email@gmail.com"
                            value={formData.mailUsername}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* MAIL PASSWORD */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            MAIL PASSWORD{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="mailPassword"
                            placeholder="Enter your email password or app password"
                            value={formData.mailPassword}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            For Gmail, use an App Password instead of your
                            regular password.
                        </p>
                    </div>

                    {/* MAIL ENCRYPTION */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            MAIL ENCRYPTION{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="mailEncryption"
                            value={formData.mailEncryption}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="tls">TLS</option>
                            <option value="ssl">SSL</option>
                            <option value="">None</option>
                        </select>
                    </div>

                    {/* MAIL FROM ADDRESS */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            MAIL FROM ADDRESS{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="mailFromAddress"
                            placeholder="noreply@yourdomain.com"
                            value={formData.mailFromAddress}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* MAIL FROM NAME */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            MAIL FROM NAME{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="mailFromName"
                            placeholder="Your Company Name"
                            value={formData.mailFromName}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testing || isTestButtonDisabled}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50"
                        >
                            <TestTube2 className="w-4 h-4" />
                            {testing ? "Testing..." : "Test Connection"}
                        </button>
                    </div>

                    {/* Configuration Tips */}
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-400 mb-2">
                            Configuration Tips:
                        </h3>
                        <ul className="text-xs text-blue-300 space-y-1">
                            <li>
                                • For Gmail: Use port 587 with TLS, and enable
                                2-factor authentication with an App Password
                            </li>
                            <li>
                                • For Outlook/Hotmail: Use port 587 with TLS
                            </li>
                            <li>• For Yahoo: Use port 465 with SSL</li>
                            <li>
                                • Make sure your firewall allows outbound
                                connections on the specified port
                            </li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    );
}
