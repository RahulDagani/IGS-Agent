"use client";

import { useState, useEffect } from "react";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";
import { Save, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface GeneralSettings {
  company_name: string;
  company_tagline: string;
  email_address: string;
  phone_number: string;
  address: string;
  default_language: string;
  default_currency: string;
  copyright_text: string;
  facebook_link: string;
  instagram_link: string;
  twitter_link: string;
  linkedin_link: string;
  enable_email_otp: number;
}

export default function GeneralSettingsPage() {
  const [formData, setFormData] = useState({
    company_name: "",
    company_tagline: "",
    email_address: "",
    phone_number: "",
    address: "",
    default_language: "English",
    default_currency: "USD",
    copyright_text: "",
    facebook_link: "",
    instagram_link: "",
    twitter_link: "",
    linkedin_link: "",
    enable_email_otp: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast states
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
    const { token } = useAuth();

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
      const response = await fetch(`${BASE_URL}/tenant/settings/general`,{
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.data) {
        const settings = data.data;
        setFormData({
          company_name: settings.company_name || "",
          company_tagline: settings.company_tagline || "",
          email_address: settings.email_address || "",
          phone_number: settings.phone_number || "",
          address: settings.address || "",
          default_language: settings.default_language || "English",
          default_currency: settings.default_currency || "USD",
          copyright_text: settings.copyright_text || "",
          facebook_link: settings.facebook_link || "",
          instagram_link: settings.instagram_link || "",
          twitter_link: settings.twitter_link || "",
          linkedin_link: settings.linkedin_link || "",
          enable_email_otp: settings.enable_email_otp || 0,
        });
      } else {
        // Use default empty values if no data exists
        showToast("No existing settings found. Using defaults.", "error");
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
        ? (target.checked ? 1 : 0)
        : target.value;

    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${BASE_URL}/tenant/settings/general`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast("Settings saved successfully!", "success");
      } else {
        const errorData = await response.json();
        showToast(
          errorData.message || "Failed to save settings",
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
                    name="company_name"
                    placeholder="Your Company Name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Company Tagline{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_tagline"
                    placeholder="Your Business Slogan"
                    value={formData.company_tagline}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Email Address{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email_address"
                    placeholder="email@gmail.com"
                    value={formData.email_address}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Phone Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    placeholder="01700000000"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                    required
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
                    name="default_language"
                    value={formData.default_language}
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
                    name="default_currency"
                    value={formData.default_currency}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                    required
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
                    name="copyright_text"
                    placeholder="Copyright 2025 © By YourCompany. All Rights Reserved."
                    value={formData.copyright_text}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                    required
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
                    name="facebook_link"
                    placeholder="https://www.facebook.com/yourpage"
                    value={formData.facebook_link}
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
                    name="instagram_link"
                    placeholder="https://www.instagram.com/yourpage"
                    value={formData.instagram_link}
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
                    name="twitter_link"
                    placeholder="https://www.twitter.com/yourpage"
                    value={formData.twitter_link}
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
                    name="linkedin_link"
                    placeholder="https://www.linkedin.com/yourpage"
                    value={formData.linkedin_link}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Email OTP Verification */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="enable_email_otp"
                checked={formData.enable_email_otp === 1}
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