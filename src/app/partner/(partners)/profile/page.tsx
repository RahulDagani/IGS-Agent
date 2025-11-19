"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, Building, MapPin, Globe, MessageCircle, Facebook, Linkedin, Instagram, Twitter, Link, CreditCard, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Country, State, City } from "country-state-city";

interface BusinessFormData {
  business_name: string;
  business_certificate: string;
  agency_logo: string;
  pan_card_upload: string;
  country_code: string;
  street_address: string;
  city_code: string;
  state_code: string;
  postal_code: string;
}

interface SocialFormData {
  website_url: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  twitter: string;
  other: string;
  whatsapp_id: string;
  skype_id: string;
}

interface PaymentFormData {
  ifsc_code: string;
  bank_account_number: string;
  bank_account_name: string;
}

interface AgentProfileResponse {
  success: boolean;
  profile: {
    id: number;
    uuid: string;
    tenant_id: number;
    user_id: number;
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
    twitter: string | null;
    other: string | null;
    whatsapp_id: string;
    skype_id: string;
    ifsc_code: string;
    bank_account_number: string;
    bank_account_name: string;
    is_payment_verified: number;
    is_agent_verified: number;
    agent_verified_at: string;
    agent_payment_verified_at: string | null;
    created_at: string;
    updated_at: string;
    is_deleted: number;
  };
}

type Tab = "business" | "payment" | "social";

const BASE_URL = "https://api.applystore.org/api";

// API functions
const fetchAgentProfile = async (token: string): Promise<AgentProfileResponse> => {
  const response = await fetch(`${BASE_URL}/agent/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    } else {
      throw new Error('Failed to fetch agent profile');
    }
  }
  
  return await response.json();
};

const updateBusinessProfile = async (formData: BusinessFormData, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/agent/business`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update business profile');
  }
};

const updatePaymentProfile = async (formData: PaymentFormData, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/agent/business`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update payment profile');
  }
};

const updateSocialProfile = async (formData: SocialFormData, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/agent/business`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update social profile');
  }
};

export default function AgentAccountDetails() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, token } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>("business");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");

  
  const [businessData, setBusinessData] = useState<BusinessFormData>({
    business_name: "",
    business_certificate: "dummy.png",
    agency_logo: "dummy.png",
    pan_card_upload: "dummy.png",
    country_code: "",
    street_address: "",
    city_code: "",
    state_code: "",
    postal_code: "",
  });

  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    ifsc_code: "",
    bank_account_number: "",
    bank_account_name: "",
  });

  const [socialData, setSocialData] = useState<SocialFormData>({
    website_url: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    other: "",
    whatsapp_id: "",
    skype_id: "",
  });

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/signin/agent');
      return;
    }

    if (authUser && token) {
      loadAgentProfile();
    }
  }, [authUser, authLoading, router, token]);

  const loadAgentProfile = async () => {
    try {
      const profileData = await fetchAgentProfile(token!);
      
      // Populate business data
      setBusinessData({
        business_name: profileData.profile.business_name || "",
        business_certificate: profileData.profile.business_certificate || "dummy.png",
        agency_logo: profileData.profile.agency_logo || "dummy.png",
        pan_card_upload: profileData.profile.pan_card_upload || "dummy.png",
        country_code: profileData.profile.country_code || "",
        street_address: profileData.profile.street_address || "",
        city_code: profileData.profile.city_code || "",
        state_code: profileData.profile.state_code || "",
        postal_code: profileData.profile.postal_code || "",
      });

      // Populate payment data
      setPaymentData({
        ifsc_code: profileData.profile.ifsc_code || "",
        bank_account_number: profileData.profile.bank_account_number || "",
        bank_account_name: profileData.profile.bank_account_name || "",
      });

      // Populate social data
      setSocialData({
        website_url: profileData.profile.website_url || "",
        instagram: profileData.profile.instagram || "",
        facebook: profileData.profile.facebook || "",
        linkedin: profileData.profile.linkedin || "",
        twitter: profileData.profile.twitter || "",
        other: profileData.profile.other || "",
        whatsapp_id: profileData.profile.whatsapp_id || "",
        skype_id: profileData.profile.skype_id || "",
      });
      
    } catch (error) {
      console.error('Error loading agent profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile data';
      setError(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSocialData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser || !token) {
      alert('Please log in to update your profile');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateBusinessProfile(businessData, token);
      setSuccess("Business profile updated successfully!")
      setTimeout(()=>{setSuccess("")},3000)
      
      // Move to next tab
      setActiveTab("payment");
    } catch (error) {
      console.error('Error updating business profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update business profile';
      setError(`Error: ${errorMessage}`)
      setTimeout(()=>{setError("")},3000)

    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser || !token) {
      alert('Please log in to update your profile');
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePaymentProfile(paymentData, token);
      setSuccess("Payment profile updated successfully!");
        setTimeout(()=>{setSuccess("")},3000)

      
      // Move to next tab
      setActiveTab("social");
    } catch (error) {
      console.error('Error updating payment profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update payment profile';
      setError(`Error: ${errorMessage}`);
        setTimeout(()=>{setError("")},3000)

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser || !token) {
      alert('Please log in to update your profile');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateSocialProfile(socialData, token);
      setSuccess("Social profile updated successfully!");
        setTimeout(()=>{setSuccess("")},3000)
      
    } catch (error) {
      console.error('Error updating social profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update social profile';
      setError(`Error: ${errorMessage}`);
        setTimeout(()=>{setError("")},3000)

    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = Country.getAllCountries().map(country => country.name);

  const tabs = [
    { id: "business", label: "Business", icon: Building },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "social", label: "Social", icon: MessageCircle },
  ];

  const renderBusinessTab = () => (
    <form onSubmit={handleBusinessSubmit}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Business Name */}
          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Business Name *
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Building size={18} />
              </span>
              <input
                type="text"
                id="business_name"
                name="business_name"
                value={businessData.business_name}
                onChange={handleBusinessInputChange}
                placeholder="Enter your business name"
                required
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Postal Code *
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={businessData.postal_code}
              onChange={handleBusinessInputChange}
              placeholder="Enter postal code"
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Country */}
          <div>
            <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Country *
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <MapPin size={18} />
              </span>
              <select
                id="country_code"
                name="country_code"
                value={businessData.country_code}
                onChange={handleBusinessInputChange}
                required
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
              >
                <option value="">Select Country</option>
                {Country.getAllCountries().map(country => (
                  <option key={country.isoCode} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* State */}
          <div>
            <label htmlFor="state_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              State *
            </label>
            <div className="relative">
              <select
                id="state_code"
                name="state_code"
                value={businessData.state_code}
                onChange={handleBusinessInputChange}
                required
                disabled={!businessData.country_code}
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
              >
                <option value="">Select State</option>
                {businessData.country_code &&
                  (() => {
                    const country = Country.getAllCountries().find(c => c.name === businessData.country_code);
                    return country 
                      ? State.getStatesOfCountry(country.isoCode).map(state => (
                          <option key={state.isoCode} value={state.name}>
                            {state.name}
                          </option>
                        ))
                      : null;
                  })()
                }
              </select>
            </div>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              City *
            </label>
            <div className="relative">
              <select
                id="city_code"
                name="city_code"
                value={businessData.city_code}
                onChange={handleBusinessInputChange}
                required
                disabled={!businessData.state_code}
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
              >
                <option value="">Select City</option>
                {businessData.country_code && businessData.state_code &&
                  (() => {
                    const country = Country.getAllCountries().find(c => c.name === businessData.country_code);
                    const states = country ? State.getStatesOfCountry(country.isoCode) : [];
                    const state = states.find(s => s.name === businessData.state_code);
                    
                    if (country && state) {
                      const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
                      return cities.map(city => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ));
                    }
                    return null;
                  })()
                }
              </select>
            </div>
          </div>
        </div>

        {/* Street Address */}
        <div>
          <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Street Address *
          </label>
          <textarea
            id="street_address"
            name="street_address"
            value={businessData.street_address}
            onChange={handleBusinessInputChange}
            placeholder="Enter your complete street address"
            required
            rows={3}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* File Upload Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg dark:border-gray-600">
            <Briefcase size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Business Certificate</p>
            <p className="text-xs text-gray-400 mt-1">dummy.png</p>
          </div>
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg dark:border-gray-600">
            <Building size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Agency Logo</p>
            <p className="text-xs text-gray-400 mt-1">dummy.png</p>
          </div>
          
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                Save & Continue
                <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );

  const renderPaymentTab = () => (
    <form onSubmit={handlePaymentSubmit}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Bank Account Name */}
          <div>
            <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Bank Account Name *
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <CreditCard size={18} />
              </span>
              <input
                type="text"
                id="bank_account_name"
                name="bank_account_name"
                value={paymentData.bank_account_name}
                onChange={handlePaymentInputChange}
                placeholder="Enter account holder name"
                required
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Bank Account Number */}
          <div>
            <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Bank Account Number *
            </label>
            <input
              type="text"
              id="bank_account_number"
              name="bank_account_number"
              value={paymentData.bank_account_number}
              onChange={handlePaymentInputChange}
              placeholder="Enter bank account number"
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>

        {/* IFSC Code */}
        <div>
          <label htmlFor="ifsc_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            IFSC Code *
          </label>
          <input
            type="text"
            id="ifsc_code"
            name="ifsc_code"
            value={paymentData.ifsc_code}
            onChange={handlePaymentInputChange}
            placeholder="Enter IFSC code"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg dark:border-gray-600">
            <CreditCard size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">PAN Card</p>
            <p className="text-xs text-gray-400 mt-1">dummy.png</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                Save & Continue
                <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );

  const renderSocialTab = () => (
    <form onSubmit={handleSocialSubmit}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              WhatsApp Number *
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <MessageCircle size={18} />
              </span>
              <input
                type="tel"
                id="whatsapp_id"
                name="whatsapp_id"
                value={socialData.whatsapp_id}
                onChange={handleSocialInputChange}
                placeholder="Enter WhatsApp number"
                required
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Skype */}
          <div>
            <label htmlFor="skype_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Skype ID
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <MessageCircle size={18} />
              </span>
              <input
                type="text"
                id="skype_id"
                name="skype_id"
                value={socialData.skype_id}
                onChange={handleSocialInputChange}
                placeholder="Enter Skype ID"
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Website */}
          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Website
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Globe size={18} />
              </span>
              <input
                type="url"
                id="website_url"
                name="website_url"
                value={socialData.website_url}
                onChange={handleSocialInputChange}
                placeholder="Enter your company website"
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              LinkedIn
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Linkedin size={18} />
              </span>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={socialData.linkedin}
                onChange={handleSocialInputChange}
                placeholder="LinkedIn profile/company URL"
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Facebook */}
          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Facebook
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Facebook size={18} />
              </span>
              <input
                type="url"
                id="facebook"
                name="facebook"
                value={socialData.facebook}
                onChange={handleSocialInputChange}
                placeholder="Facebook profile/company URL"
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Instagram
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Instagram size={18} />
              </span>
              <input
                type="url"
                id="instagram"
                name="instagram"
                value={socialData.instagram}
                onChange={handleSocialInputChange}
                placeholder="Instagram profile URL"
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Twitter */}
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Twitter/X
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Twitter size={18} />
              </span>
              <input
                type="url"
                id="twitter"
                name="twitter"
                value={socialData.twitter}
                onChange={handleSocialInputChange}
                placeholder="X/Twitter profile URL"
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Other Social */}
          <div>
            <label htmlFor="other" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Other Social Media
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Link size={18} />
              </span>
              <input
                type="text"
                id="other"
                name="other"
                value={socialData.other}
                onChange={handleSocialInputChange}
                placeholder="Enter other social media details or URL"
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Complete Profile"
            )}
          </button>
        </div>
      </div>
    </form>
  );

  if (authLoading || isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading agent data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-8 text-center">
        <p className="text-red-500">Authentication required. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Agent Account Details
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Complete your agent profile setup.
        </p>
        {success && <p className="mt-1 text-sm text-success-500 dark:text-success-400">
          {success}
        </p>}
        {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">
          {error}
        </p>}
      </div>
      
      {/* Tab Navigation */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
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
        {/* Tab Content */}
        <div>
          {activeTab === "business" && renderBusinessTab()}
          {activeTab === "payment" && renderPaymentTab()}
          {activeTab === "social" && renderSocialTab()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              if (activeTab === "payment") setActiveTab("business");
              if (activeTab === "social") setActiveTab("payment");
            }}
            disabled={activeTab === "business"}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
              <path d="M12 8L8 4L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Previous
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}