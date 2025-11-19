"use client";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";

interface Agent {
  user_id: number;
  email: string;
  phone: string | null;
  user_status: string;
  user_created_at: string;
  uuid: string;
  name: string;
  business_name: string;
  business_certificate: string;
  agency_logo: string;
  pan_card_upload: string;
  country_code: string;
  street_address: string;
  city_code: string;
  state_code: string;
  postal_code: string;
  website_url: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  twitter: string;
  other: string;
  whatsapp_id: string;
  skype_id: string;
  ifsc_code: string;
  bank_account_number: string;
  bank_account_name: string;
  is_payment_verified: number;
  is_agent_verified: number;
  agent_verified_at: string | null;
  agent_payment_verified_at: string | null;
  profile_created_at: string;
}

interface ApiResponse {
  success: boolean;
  agent: Agent;
}

const AgentDetails = () => {
  const [agentInfo, setAgentInfo] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {id: agentId} = useParams();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
    const {token} = useAuth();

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/tenant/agent/list/${agentId}`,{
          headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
        }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agent details: ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        
        if (data.success && data.agent) {
          setAgentInfo(data.agent);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading agent details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!agentInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">No agent data found</div>
      </div>
    );
  }

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
                  {agentInfo.phone || "--"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white capitalize">
                  {agentInfo.user_status}
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
                  {agentInfo.business_name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Country:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.country_code}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Street Address:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.street_address}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  City:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.city_code}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  State:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.state_code}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Postal Code:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.postal_code}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Business Certificate:
                </span>
                <span className="col-span-2">
                  <button 
                    onClick={() => window.open(agentInfo.business_certificate, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
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
                  {agentInfo.website_url || "--"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  WhatsApp:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.whatsapp_id || "--"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Skype:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.skype_id || "--"}
                </span>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                {agentInfo.facebook && (
                  <button 
                    onClick={() => window.open(agentInfo.facebook, '_blank')}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Facebook
                    </span>
                  </button>
                )}
                {agentInfo.instagram && (
                  <button 
                    onClick={() => window.open(agentInfo.instagram, '_blank')}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Instagram
                    </span>
                  </button>
                )}
                {agentInfo.linkedin && (
                  <button 
                    onClick={() => window.open(agentInfo.linkedin, '_blank')}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      LinkedIn
                    </span>
                  </button>
                )}
                {!agentInfo.facebook && !agentInfo.instagram && !agentInfo.linkedin && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">No social links available</span>
                )}
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
                <span className="col-span-2">
                  {agentInfo.pan_card_upload ? (
                    <button 
                      onClick={() => window.open(agentInfo.pan_card_upload, '_blank')}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-sm text-gray-900 dark:text-white">--</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  IFSC Code:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.ifsc_code || "--"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Bank Account Number:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.bank_account_number || "--"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Account Holder Name:
                </span>
                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                  {agentInfo.bank_account_name || "--"}
                </span>
              </div>
            </div>

            {/* Verification Status */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Payment Verified:
                </span>
                <span className={`text-sm font-medium ${
                  agentInfo.is_payment_verified 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {agentInfo.is_payment_verified ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Agent Verified:
                </span>
                <span className={`text-sm font-medium ${
                  agentInfo.is_agent_verified 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {agentInfo.is_agent_verified ? "Yes" : "No"}
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
          {agentInfo.is_agent_verified ? "Update Agent" : "Approve Agent"}
        </button>
      </div>
    </div>
  );
};

export default AgentDetails;