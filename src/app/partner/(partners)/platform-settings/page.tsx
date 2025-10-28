"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Server, Settings, TestTube2, CheckCircle, XCircle } from "lucide-react";

interface EmailSettings {
  hostName: string;
  portNumber: string;
  senderEmail: string;
  smtpUsername: string;
  smtpPassword: string;
}

interface PlatformSettingsData {
  // Email Settings
  emailSettings: EmailSettings;
}

export default function PlatformSettings() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"email">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<PlatformSettingsData>({
    emailSettings: {
      hostName: "smtp.gmail.com",
      portNumber: "587",
      senderEmail: "noreply@yourcompany.com",
      smtpUsername: "your-email@gmail.com",
      smtpPassword: "",
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emailSettings: {
        ...prev.emailSettings,
        [name]: value
      }
    }));
    // Clear test result when user makes changes
    if (testResult) {
      setTestResult(null);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate API call to test SMTP connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test - in real implementation, you'd make an API call to test SMTP
      const { hostName, portNumber, senderEmail, smtpUsername, smtpPassword } = formData.emailSettings;
      
      // Basic validation
      if (!hostName || !portNumber || !senderEmail || !smtpUsername || !smtpPassword) {
        throw new Error("Please fill in all fields");
      }

      if (!senderEmail.includes('@')) {
        throw new Error("Please enter a valid sender email");
      }

      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo

      if (isSuccess) {
        setTestResult({
          success: true,
          message: "SMTP connection successful! Email settings are working correctly."
        });
      } else {
        throw new Error("Unable to establish connection with the SMTP server. Please check your credentials.");
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection failed. Please check your settings."
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Updated platform settings:", formData);
      // Here you would typically make an API call to update platform settings
      // await fetch('/api/platform/settings', { method: 'PUT', body: JSON.stringify(formData) });
      
      alert("Platform settings updated successfully!");
    } catch (error) {
      console.error('Error updating platform settings:', error);
      alert("Error updating settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "email", label: "Custom Email Settings", icon: Mail },
    // More tabs can be added here later
  ];

  const renderEmailSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Server className="w-5 h-5 text-blue-600 mt-0.5 dark:text-blue-400" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              SMTP Configuration
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Configure your custom SMTP server settings to send emails from your platform.
              These settings will be used for all outgoing emails including notifications and alerts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Host Name */}
        <div>
          <label htmlFor="hostName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Host Name *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Server size={18} />
            </span>
            <input
              type="text"
              id="hostName"
              name="hostName"
              value={formData.emailSettings.hostName}
              onChange={handleInputChange}
              placeholder="e.g., smtp.gmail.com"
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Port Number */}
        <div>
          <label htmlFor="portNumber" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Port Number *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Settings size={18} />
            </span>
            <input
              type="number"
              id="portNumber"
              name="portNumber"
              value={formData.emailSettings.portNumber}
              onChange={handleInputChange}
              placeholder="e.g., 587"
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>
      </div>

      {/* Sender Email */}
      <div>
        <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Sender Email *
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Mail size={18} />
          </span>
          <input
            type="email"
            id="senderEmail"
            name="senderEmail"
            value={formData.emailSettings.senderEmail}
            onChange={handleInputChange}
            placeholder="e.g., noreply@yourcompany.com"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* SMTP Username */}
        <div>
          <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            SMTP Username *
          </label>
          <input
            type="text"
            id="smtpUsername"
            name="smtpUsername"
            value={formData.emailSettings.smtpUsername}
            onChange={handleInputChange}
            placeholder="Enter SMTP username"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* SMTP Password */}
        <div>
          <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            SMTP Password *
          </label>
          <input
            type="password"
            id="smtpPassword"
            name="smtpPassword"
            value={formData.emailSettings.smtpPassword}
            onChange={handleInputChange}
            placeholder="Enter SMTP password"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Test Connection Section */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Test SMTP Connection
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Verify that your email settings are correct by testing the connection.
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || isSubmitting}
            className="flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTesting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing Connection...
              </>
            ) : (
              <>
                <TestTube2 size={16} />
                Test Connection
              </>
            )}
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`mt-4 rounded-lg p-4 ${
            testResult.success 
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 dark:text-red-400" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  testResult.success 
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }`}>
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </p>
                <p className={`text-sm mt-1 ${
                  testResult.success 
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Common SMTP Ports Info */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-800/50 dark:border-gray-700">
          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Common SMTP Ports:
          </h5>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Gmail: 587 (TLS) or 465 (SSL)</li>
            <li>• Outlook/Hotmail: 587 (TLS) or 25</li>
            <li>• Yahoo: 465 (SSL) or 587 (TLS)</li>
            <li>• Office 365: 587 (STARTTLS)</li>
            <li>• iCloud: 587 (STARTTLS)</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Platform Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure platform-wide settings and integrations.
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "email")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <form onSubmit={handleSubmit}>
          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === "email" && renderEmailSettingsTab()}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Settings...
                  </>
                ) : (
                  <>
                    Save Settings
                    <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z" fill="white"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}