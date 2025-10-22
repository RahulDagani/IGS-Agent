"use client";

import { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";

export default function AddPaymentMethodPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    shortCode: "",
    note: "",
    status: "active" as "active" | "inactive"
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just show success and redirect
      setSuccess("Payment method added successfully!");
      
      // Redirect back after success
      setTimeout(() => {
        router.push("/admin/setup/payment-methods");
      }, 1500);
    } catch (err) {
      console.log(err)
      setError("Failed to add payment method");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">
      <SetupSettingsSidebar />

      <div className="flex-1 ml-0 lg:ml-6 mt-6 lg:mt-0 mb-6 bg-[#111827] rounded-xl shadow-lg border border-white/10 p-6">
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Payment Method</h2>
            <p className="text-gray-400 mt-1">
              Create a new payment method for your system
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Payment Method Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Bank Transfer, Credit Card, etc."
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Short Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="shortCode"
                  value={formData.shortCode}
                  onChange={handleChange}
                  required
                  placeholder="e.g., BANK_TRF, CC, etc."
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Unique code for internal reference (uppercase, underscores)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Note/Description
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Provide details about this payment method..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50 font-medium"
            >
              <Save className="w-5 h-5" />
              {saving ? "Adding Payment Method..." : "Add Payment Method"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-3 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}