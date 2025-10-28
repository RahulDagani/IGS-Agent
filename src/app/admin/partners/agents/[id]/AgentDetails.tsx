"use client";
import React from "react";

const AgentDetails = () => {
  const agentInfo = {
    name: "John",
    email: "john@gmail.com",
    phone: "+91 8619110253",
    businessName: "defg",
    country: "india",
    streetAddress: "abc, fts",
    city: "jajour",
    state: "rajasthan",
    postalCode: "302020",
    website: "--",
    whatsapp: "+91 8619110253",
    skype: "--",
    panCard: "--",
    ifscCode: "--",
    bankAccountNumber: "--",
    accountHolderName: "--",
    paymentVerified: false,
    adminVerified: false,
  };

  return (
    <div className="mx-auto space-y-6">
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Agent Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Agent Information
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.email}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Business Information
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Business Name:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.businessName}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Country:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.country}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Street Address:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.streetAddress}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  City:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.city}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  State:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.state}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Postal Code:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.postalCode}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Business Certificate:
                </span>
                <span className="col-span-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    View
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Social & Contact Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Social & Contact Links
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Website:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.website}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  WhatsApp:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.whatsapp}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Skype:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.skype}
                </span>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Facebook
                  </span>
                </button>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instagram
                  </span>
                </button>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    LinkedIn
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pan Card:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.panCard}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  IFSC Code:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.ifscCode}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Bank Account Number:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.bankAccountNumber}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Account Holder Name:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.accountHolderName}
                </span>
              </div>
            </div>

            {/* Payment Verification Status */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Payment Verified: <span className="text-lg dark:text-white">No</span>
                </span>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        
        <button className="px-6 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Verify Payment Details
        </button>
        <button className="px-6 py-2.5 bg-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Approve Agent
        </button>
      </div>
    </div>
  );
};

export default AgentDetails;