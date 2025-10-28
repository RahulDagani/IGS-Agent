"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, MapPin, Mail, FileText, Video, Link, Building2, BookOpen, Users, Plus } from "lucide-react";

interface UniversityFormData {
  // Basic Info
  universityName: string;
  description: string;
  country: string;
  state: string;
  universityType: string;
  
  // Contact Info
  email: string;
  address: string;
  googleMapUrl: string;
  
  // Media
  logo: File | null;
  image: File | null;
  brochure: File | null;
  
  // Additional Info
  videoLink: string;
  tuitionFeeUrl: string;
  partnerType: string;
  collaboration: string;
}

type Tab = "basic" | "contact" | "media" | "additional";

export default function AddUniversity() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<UniversityFormData>({
    // Basic Info
    universityName: "",
    description: "",
    country: "",
    state: "",
    universityType: "",
    
    // Contact Info
    email: "",
    address: "",
    googleMapUrl: "",
    
    // Media
    logo: null,
    image: null,
    brochure: null,
    
    // Additional Info
    videoLink: "",
    tuitionFeeUrl: "",
    partnerType: "",
    collaboration: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("University data:", formData);
      // Here you would typically make an API call to save the university
      // await fetch('/api/universities', { method: 'POST', body: JSON.stringify(formData) });
      
      // Redirect back to universities list
      router.push('/admin/universities');
      router.refresh();
    } catch (error) {
      console.error('Error adding university:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = [
    "USA",
    "UK", 
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Netherlands",
    "Ireland",
    "New Zealand",
    "Singapore"
  ];

  const universityTypes = [
    "Public",
    "Private",
  ];

  const partnerTypes = [
    "Exclusive Partner",
    "Preferred Partner",
    "Standard Partner",
    "Tier 1 Partner",
    "Tier 2 Partner",
    "Tier 3 Partner"
  ];

  const collaborationTypes = [
    "Direct Admission",
    "Pathway Program",
    "Exchange Program",
    "Research Collaboration",
    "Dual Degree",
    "Articulation Agreement"
  ];

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "media", label: "Media", icon: FileText },
    { id: "additional", label: "Additional", icon: BookOpen },
  ];

  const renderBasicInfoTab = () => (
    <div className="space-y-5">
      {/* University Name */}
      <div>
        <label htmlFor="universityName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Name *
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Building2 size={18} />
          </span>
          <input
            type="text"
            id="universityName"
            name="universityName"
            value={formData.universityName}
            onChange={handleInputChange}
            placeholder="Enter university name"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter university description"
          rows={4}
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Country *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Globe size={18} />
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

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            State/Province
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Enter state or province"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* University Type */}
      <div>
        <label htmlFor="universityType" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Type of University *
        </label>
        <select
          id="universityType"
          name="universityType"
          value={formData.universityType}
          onChange={handleInputChange}
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
        >
          <option value="">Select University Type</option>
          {universityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Email *
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Mail size={18} />
          </span>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter university email address"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Address *
        </label>
        <div className="relative">
          <span className="absolute top-4 left-4 text-gray-500 dark:text-gray-400">
            <MapPin size={18} />
          </span>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter complete university address"
            rows={3}
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
          />
        </div>
      </div>

      {/* Google Map URL */}
      <div>
        <label htmlFor="googleMapUrl" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Google Map URL (Embed URL)
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Link size={18} />
          </span>
          <input
            type="url"
            id="googleMapUrl"
            name="googleMapUrl"
            value={formData.googleMapUrl}
            onChange={handleInputChange}
            placeholder="https://maps.google.com/embed?pb=..."
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Paste the embed URL from Google Maps for the location iframe
        </p>
      </div>

      {/* Map Preview */}
      {formData.googleMapUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Map Preview
          </label>
          <div className="rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
            <iframe
              src={formData.googleMapUrl}
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-5">
      {/* Logo Upload */}
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Logo *
        </label>
        <div className="flex items-center gap-4">
          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileText size={24} className="text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Upload Logo</p>
            </div>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended: Square PNG or JPG, min 200x200px
            </p>
            {formData.logo && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Selected: {formData.logo.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Image
        </label>
        <div className="flex items-center gap-4">
          <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileText size={24} className="text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Upload Image</p>
            </div>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended: Landscape JPG, min 800x600px
            </p>
            {formData.image && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Selected: {formData.image.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Brochure Upload */}
      <div>
        <label htmlFor="brochure" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Brochure (PDF)
        </label>
        <div className="flex items-center gap-4">
          <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileText size={24} className="text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Upload PDF</p>
            </div>
            <input
              id="brochure"
              name="brochure"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload university brochure in PDF format (max 10MB)
            </p>
            {formData.brochure && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Selected: {formData.brochure.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdditionalTab = () => (
    <div className="space-y-5">
      {/* Video Link */}
      <div>
        <label htmlFor="videoLink" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Video Link
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Video size={18} />
          </span>
          <input
            type="url"
            id="videoLink"
            name="videoLink"
            value={formData.videoLink}
            onChange={handleInputChange}
            placeholder="https://youtube.com/embed/..."
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Paste embed URL for university video tour or promotional video
        </p>
      </div>

      {/* Tuition Fee URL */}
      <div>
        <label htmlFor="tuitionFeeUrl" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Tuition Fee URL
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Link size={18} />
          </span>
          <input
            type="url"
            id="tuitionFeeUrl"
            name="tuitionFeeUrl"
            value={formData.tuitionFeeUrl}
            onChange={handleInputChange}
            placeholder="https://university.edu/tuition-fees"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Partner Type */}
      <div>
        <label htmlFor="partnerType" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Kind of Partners
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Users size={18} />
          </span>
          <select
            id="partnerType"
            name="partnerType"
            value={formData.partnerType}
            onChange={handleInputChange}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
          >
            <option value="">Select Partner Type</option>
            {partnerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Collaboration */}
      <div>
        <label htmlFor="collaboration" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Collaboration Type
        </label>
        <select
          id="collaboration"
          name="collaboration"
          value={formData.collaboration}
          onChange={handleInputChange}
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
        >
          <option value="">Select Collaboration Type</option>
          {collaborationTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Add New University
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new university profile with comprehensive information.
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
            {activeTab === "basic" && renderBasicInfoTab()}
            {activeTab === "contact" && renderContactTab()}
            {activeTab === "media" && renderMediaTab()}
            {activeTab === "additional" && renderAdditionalTab()}
          </div>

          {/* Navigation and Submit Buttons */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              {activeTab !== "basic" && (
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
              {activeTab !== "additional" && (
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
                    Adding University...
                  </>
                ) : (
                  <>
                    Add University
                    <Plus size={18} />
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