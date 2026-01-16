"use client";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Globe, 
  CreditCard, 
  Shield,
  CheckCircle,
  XCircle,
  ExternalLink,
  Edit,
  Save,
  Percent,
  Calendar,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  Video
} from "lucide-react";

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
  agent_share?: number; // Added agent share field
}

interface ApiResponse {
  success: boolean;
  agent: Agent;
}

const AgentDetails = () => {
  const [agentInfo, setAgentInfo] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState<boolean>(false);
  const [paymentVerified, setPaymentVerified] = useState<boolean>(false);
  const [agentShare, setAgentShare] = useState<string>("");
  const [isEditingShare, setIsEditingShare] = useState<boolean>(false);
  const [isUpdatingShare, setIsUpdatingShare] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  const { id: agentId } = useParams();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const updateAgentShare = async () => {
    if (!agentShare || isNaN(Number(agentShare))) {
      setError("Please enter a valid percentage");
      return;
    }

    const shareValue = Number(agentShare);
    if (shareValue < 0 || shareValue > 100) {
      setError("Agent share must be between 0 and 100");
      return;
    }

    try {
      setIsUpdatingShare(true);
      const response = await fetch(
        `${BASE_URL}/tenant/agent/${agentId}/update_partner_share`,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ agent_share: shareValue })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update agent share: ${response.status}`);
      }

      setUpdateSuccess(true);
      setIsEditingShare(false);
      
      // Update local state
      if (agentInfo) {
        setAgentInfo({
          ...agentInfo,
          agent_share: shareValue
        });
      }

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsUpdatingShare(false);
    }
  };

  const approveAgent = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/tenant/agent/${agentId}/verify/`,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to approve agent: ${response.status}`);
      }

      setApproved(true);
      if (agentInfo) {
        setAgentInfo({
          ...agentInfo,
          is_agent_verified: 1,
          agent_verified_at: new Date().toISOString()
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const verifyPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/tenant/agent/${agentId}/verify/payment`,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to verify payment details: ${response.status}`);
      }

      setPaymentVerified(true);
      if (agentInfo) {
        setAgentInfo({
          ...agentInfo,
          is_payment_verified: 1,
          agent_payment_verified_at: new Date().toISOString()
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/tenant/agent/list/${agentId}`,
          {
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
          if (data.agent.agent_share) {
            setAgentShare(data.agent.agent_share.toString());
          }
          if (data.agent.is_agent_verified == 1) {
            setApproved(true);
          }
          if (data.agent.is_payment_verified == 1) {
            setPaymentVerified(true);
          }
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading agent details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-2">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div className="text-lg text-red-600 dark:text-red-400">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!agentInfo) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-2">
          <User className="h-12 w-12 text-gray-400 mx-auto" />
          <div className="text-lg text-gray-600 dark:text-gray-400">No agent data found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Agent Details</h1>
        <p className="d-block text-sm text-gray-800 dark:text-white/90">
          Manage agent information and commission settings
        </p>
      </div>

      {/* Success Message */}
      {updateSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-300 font-medium">
            Agent share updated successfully!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Actions */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{agentInfo.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{agentInfo.email}</p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  agentInfo.user_status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {agentInfo.user_status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  approved 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {approved ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>

            {/* Agent Share Input */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Percent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Agent Share</span>
                </div>
                {isEditingShare ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setIsEditingShare(false);
                        setAgentShare(agentInfo.agent_share?.toString() || "");
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <XCircle className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingShare(true)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Edit className="h-5 w-5 text-gray-500" />
                  </button>
                )}
              </div>

              {isEditingShare ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={agentShare}
                      onChange={(e) => setAgentShare(e.target.value)}
                      className="w-full px-4 py-2 pl-10 text-black dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter percentage"
                    />
                    <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setIsEditingShare(false);
                        setAgentShare(agentInfo.agent_share?.toString() || "");
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateAgentShare}
                      disabled={isUpdatingShare}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isUpdatingShare ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {agentInfo.agent_share ? `${agentInfo.agent_share}%` : 'Not set'}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={approveAgent}
                  disabled={approved || loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Shield className="h-5 w-5" />
                  <span>{approved ? 'Agent Approved' : 'Approve Agent'}</span>
                </button>
                
                <button
                  onClick={verifyPaymentDetails}
                  disabled={paymentVerified || loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>{paymentVerified ? 'Payment Verified' : 'Verify Payment'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Contact & Social</h3>
            <div className="space-y-3">
              {agentInfo.website_url && (
                <a
                  href={agentInfo.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">Website</span>
                  <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                </a>
              )}
              
              {agentInfo.whatsapp_id && (
                <a
                  href={`https://wa.me/${agentInfo.whatsapp_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">WhatsApp</span>
                </a>
              )}
              
              {agentInfo.skype_id && (
                <a
                  href={`skype:${agentInfo.skype_id}?chat`}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <Video className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">Skype</span>
                </a>
              )}
            </div>

            {/* Social Media */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Social Media</h4>
              <div className="flex flex-wrap gap-2">
                {agentInfo.facebook && (
                  <a
                    href={agentInfo.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Facebook className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </a>
                )}
                {agentInfo.instagram && (
                  <a
                    href={agentInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Instagram className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </a>
                )}
                {agentInfo.linkedin && (
                  <a
                    href={agentInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </a>
                )}
                {agentInfo.twitter && (
                  <a
                    href={agentInfo.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </a>
                )}
                {!agentInfo.facebook && !agentInfo.instagram && !agentInfo.linkedin && !agentInfo.twitter && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">No social links</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Joined {formatDate(agentInfo.user_created_at)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </span>
                <p className="font-medium text-gray-900 dark:text-white">{agentInfo.email}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </span>
                <p className="font-medium text-gray-900 dark:text-white">{agentInfo.phone || "--"}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">User ID</span>
                <p className="font-medium text-gray-900 dark:text-white">{agentInfo.user_id}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">UUID</span>
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{agentInfo.uuid}</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Business Information</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">Business Name</span>
                <p className="font-medium text-gray-900 dark:text-white">{agentInfo.business_name}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Country</span>
                  <p className="font-medium text-gray-900 dark:text-white">{agentInfo.country_code}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">State</span>
                  <p className="font-medium text-gray-900 dark:text-white">{agentInfo.state_code}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">City</span>
                  <p className="font-medium text-gray-900 dark:text-white">{agentInfo.city_code}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Postal Code</span>
                  <p className="font-medium text-gray-900 dark:text-white">{agentInfo.postal_code}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Street Address</span>
                </span>
                <p className="font-medium text-gray-900 dark:text-white">{agentInfo.street_address}</p>
              </div>
              
              {agentInfo.business_certificate && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Business Certificate</span>
                  <a
                    href={agentInfo.business_certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Certificate</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Details</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">IFSC Code</span>
                  <p className="font-medium text-gray-900 dark:text-white">{agentInfo.ifsc_code || "--"}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Account Number</span>
                  <p className="font-medium text-gray-900 dark:text-white">{agentInfo.bank_account_number || "--"}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Account Holder</span>
                  <p className="font-medium text-gray-900 dark:text-white">{agentInfo.bank_account_name || "--"}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">PAN Card</span>
                  {agentInfo.pan_card_upload ? (
                    <a
                      href={agentInfo.pan_card_upload}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View PAN</span>
                    </a>
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">--</p>
                  )}
                </div>
              </div>
              
              {/* Verification Status */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Verification Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Payment Verified</span>
                    <div className="flex items-center space-x-2">
                      {agentInfo.is_payment_verified ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-green-600 dark:text-green-400 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-red-600 dark:text-red-400 font-medium">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Agent Verified</span>
                    <div className="flex items-center space-x-2">
                      {agentInfo.is_agent_verified ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-green-600 dark:text-green-400 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-red-600 dark:text-red-400 font-medium">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Verification Dates */}
                {agentInfo.agent_verified_at && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Agent verified on {formatDate(agentInfo.agent_verified_at)}
                  </div>
                )}
                {agentInfo.agent_payment_verified_at && (
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Payment verified on {formatDate(agentInfo.agent_payment_verified_at)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetails;