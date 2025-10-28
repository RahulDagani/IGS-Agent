"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Building, MapPin, Globe, MessageCircle, Facebook, Linkedin, Instagram, Twitter, Link, Download, Upload, X, CreditCard } from "lucide-react";

interface AgentFormData {
  // Personal Tab
  fullName: string;
  phoneNumber: string;
  agencyLogo: File | null;
  existingAgencyLogo?: string;
  
  // Business Tab
  businessName: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  businessCertificate: File | null;
  existingBusinessCertificate?: string;
  
  // Contact Tab
  whatsapp: string;
  website: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  otherSocial: string;
  
  // Payment Tab
  ifscCode: string;
  bankAccountNumber: string;
  accountHolderName: string;
  panCard: File | null;
  existingPanCard?: string;
}

// Mock function to fetch agent data
const fetchAgentData = async (): Promise<AgentFormData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockData: AgentFormData = {
    // Personal
    fullName: "John Smith",
    phoneNumber: "+1 (555) 123-4567",
    agencyLogo: null,
    existingAgencyLogo: "/images/agency-logo.jpg",
    
    // Business
    businessName: "Global Education Consultants",
    country: "United States",
    streetAddress: "123 Education Street",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    businessCertificate: null,
    existingBusinessCertificate: "/docs/business-certificate.pdf",
    
    // Contact
    whatsapp: "+1 (555) 123-4567",
    website: "www.globaleduconsultants.com",
    facebook: "facebook.com/globaleduconsultants",
    linkedin: "linkedin.com/company/globaleduconsultants",
    instagram: "instagram.com/globaleduconsultants",
    twitter: "twitter.com/globaleducons",
    otherSocial: "",
    
    // Payment
    ifscCode: "SBIN0000123",
    bankAccountNumber: "123456789012",
    accountHolderName: "John Smith",
    panCard: null,
    existingPanCard: "/docs/pan-card.jpg",
  };
  
  return mockData;
};

type Tab = "personal" | "business" | "contact" | "payment";

export default function AgentAccountDetails() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AgentFormData>({
    // Personal Tab
    fullName: "",
    phoneNumber: "",
    agencyLogo: null,
    existingAgencyLogo: "",
    
    // Business Tab
    businessName: "",
    country: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    businessCertificate: null,
    existingBusinessCertificate: "",
    
    // Contact Tab
    whatsapp: "",
    website: "",
    facebook: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    otherSocial: "",
    
    // Payment Tab
    ifscCode: "",
    bankAccountNumber: "",
    accountHolderName: "",
    panCard: null,
    existingPanCard: "",
  });

  useEffect(() => {
    const loadAgentData = async () => {
      try {
        const data = await fetchAgentData();
        setFormData(data);
      } catch (error) {
        console.error('Error loading agent data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgentData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleRemoveFile = (fieldName: 'agencyLogo' | 'businessCertificate' | 'panCard') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null,
      [`existing${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` as keyof AgentFormData]: ""
    }));
  };

  const handleDownloadCertificate = () => {
    if (formData.existingBusinessCertificate) {
      // Simulate download
      const link = document.createElement('a');
      link.href = formData.existingBusinessCertificate;
      link.download = 'business-registration-certificate.pdf';
      link.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Updated agent data:", formData);
      // Here you would typically make an API call to update the agent profile
      // await fetch('/api/agent/profile', { method: 'PUT', body: JSON.stringify(formData) });
      
      alert("Profile updated successfully!");
    } catch (error) {
      console.error('Error updating profile:', error);
      alert("Error updating profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "India",
    "Germany",
    "France",
    "Japan",
    "Singapore",
    "United Arab Emirates"
  ];

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "business", label: "Business", icon: Building },
    { id: "contact", label: "Contact", icon: MessageCircle },
    { id: "payment", label: "Payment", icon: CreditCard },
  ];

  const renderPersonalTab = () => (
    <div className="space-y-5">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Full Name *
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <User size={18} />
          </span>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Phone Number *
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Phone size={18} />
          </span>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Agency Logo */}
      <div>
        <label htmlFor="agencyLogo" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Agency Logo
        </label>
        <div className="flex items-center gap-4">
          {(formData.existingAgencyLogo || formData.agencyLogo) ? (
            <div className="relative">
              <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                {formData.agencyLogo ? (
                  <div className="text-center">
                    <Upload size={24} className="text-green-500 mb-2 mx-auto" />
                    <p className="text-xs text-green-600 dark:text-green-400">New logo selected</p>
                    <p className="text-xs text-gray-500 truncate px-2">{formData.agencyLogo.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Building size={24} className="text-brand-500 mb-2 mx-auto" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Current logo</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile('agencyLogo')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Upload Logo</p>
              </div>
              <input
                id="agencyLogo"
                name="agencyLogo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended: JPG, PNG, SVG, min 200x200px
            </p>
            {formData.agencyLogo && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                New file selected: {formData.agencyLogo.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessTab = () => (
    <div className="space-y-5">
      {/* Business Name */}
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Registered Business Name *
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Building size={18} />
          </span>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            placeholder="Enter your registered business name"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Country/Region *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <MapPin size={18} />
            </span>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Street Address */}
        <div>
          <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Street Address *
          </label>
          <input
            type="text"
            id="streetAddress"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            placeholder="Enter street address"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            City/Town *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            State/Province *
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Enter state"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Zip/Postal Code *
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            placeholder="Enter postal code"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Business Registration Certificate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Business Registration Certificate
        </label>
        <div className="flex items-center gap-4">
          {(formData.existingBusinessCertificate || formData.businessCertificate) ? (
            <div className="relative">
              <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                {formData.businessCertificate ? (
                  <div className="text-center">
                    <Upload size={24} className="text-green-500 mb-2 mx-auto" />
                    <p className="text-xs text-green-600 dark:text-green-400">New certificate</p>
                    <p className="text-xs text-gray-500 truncate px-2">{formData.businessCertificate.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Download size={24} className="text-brand-500 mb-2 mx-auto" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Current certificate</p>
                  </div>
                )}
              </div>
              <div className="absolute -top-2 -right-2 flex gap-1">
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                  title="Download certificate"
                >
                  <Download size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('businessCertificate')}
                  className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Upload Certificate</p>
              </div>
              <input
                id="businessCertificate"
                name="businessCertificate"
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload your business registration certificate (PDF, DOC, or image files)
            </p>
            {formData.businessCertificate && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                New file selected: {formData.businessCertificate.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-5">
      {/* WhatsApp */}
      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          WhatsApp Number
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <MessageCircle size={18} />
          </span>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            placeholder="Enter WhatsApp number"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Company Website
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Globe size={18} />
          </span>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="Enter your company website"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
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
              value={formData.facebook}
              onChange={handleInputChange}
              placeholder="Facebook profile/company URL"
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
              value={formData.linkedin}
              onChange={handleInputChange}
              placeholder="LinkedIn profile/company URL"
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
              value={formData.instagram}
              onChange={handleInputChange}
              placeholder="Instagram profile URL"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Twitter/X */}
        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            X (formerly Twitter)
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Twitter size={18} />
            </span>
            <input
              type="url"
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              placeholder="X/Twitter profile URL"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>
      </div>

      {/* Other Social */}
      <div>
        <label htmlFor="otherSocial" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Other (provide details or URL)
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Link size={18} />
          </span>
          <input
            type="text"
            id="otherSocial"
            name="otherSocial"
            value={formData.otherSocial}
            onChange={handleInputChange}
            placeholder="Enter other social media details or URL"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* IFSC Code */}
        <div>
          <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            IFSC Code *
          </label>
          <input
            type="text"
            id="ifscCode"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleInputChange}
            placeholder="Enter IFSC code"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* Bank Account Number */}
        <div>
          <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Bank Account Number *
          </label>
          <input
            type="text"
            id="bankAccountNumber"
            name="bankAccountNumber"
            value={formData.bankAccountNumber}
            onChange={handleInputChange}
            placeholder="Enter bank account number"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Account Holder Name */}
      <div>
        <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Account Holder Name *
        </label>
        <input
          type="text"
          id="accountHolderName"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleInputChange}
          placeholder="Enter account holder name as in bank records"
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        />
      </div>

      {/* PAN Card Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          PAN Card Upload *
        </label>
        <div className="flex items-center gap-4">
          {(formData.existingPanCard || formData.panCard) ? (
            <div className="relative">
              <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                {formData.panCard ? (
                  <div className="text-center">
                    <Upload size={24} className="text-green-500 mb-2 mx-auto" />
                    <p className="text-xs text-green-600 dark:text-green-400">New PAN card</p>
                    <p className="text-xs text-gray-500 truncate px-2">{formData.panCard.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <CreditCard size={24} className="text-brand-500 mb-2 mx-auto" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Current PAN card</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile('panCard')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Upload PAN Card</p>
              </div>
              <input
                id="panCard"
                name="panCard"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please make sure the Pan Card is in PNG or JPEG file format and is not larger than 200kb in size
            </p>
            {formData.panCard && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                New file selected: {formData.panCard.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Agent Account Details
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your agent profile and business information.
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
        <form onSubmit={handleSubmit}>
          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === "personal" && renderPersonalTab()}
            {activeTab === "business" && renderBusinessTab()}
            {activeTab === "contact" && renderContactTab()}
            {activeTab === "payment" && renderPaymentTab()}
          </div>

          {/* Navigation and Submit Buttons */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              {activeTab !== "personal" && (
                <button
                  type="button"
                  onClick={() => {
                    const tabIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (tabIndex > 0) {
                      setActiveTab(tabs[tabIndex - 1].id as Tab);
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
              )}
              {activeTab !== "payment" && (
                <button
                  type="button"
                  onClick={() => {
                    const tabIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (tabIndex < tabs.length - 1) {
                      setActiveTab(tabs[tabIndex + 1].id as Tab);
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg border border-brand-500 bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Next
                  <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Profile...
                  </>
                ) : (
                  <>
                    Update Profile
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