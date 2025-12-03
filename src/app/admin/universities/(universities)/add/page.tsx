"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Country, State, City } from "country-state-city";
import { Globe, MapPin, Mail, FileText, Video, Link, Building2, BookOpen, Users, Plus } from "lucide-react";

interface UniversityFormData {
  // Basic Info
  university: string;
  description: string;
  country_code: string;
  state_code: string;
  city_code: string;
  kind_of_partner_id: string;
  type_of_university_id: string;
  collaboration_type_id: string;
  
  // Contact Info
  email: string;
  address: string;
  map_url: string;
  location_url: string;
  
  // Media - now just strings for dummy names
  logo: string;
  image: string;
  brochure: string;
  
  // Additional Info
  video_link: string;
  tuition_url: string;
}

interface Option {
  id: number;
  name: string;
}

type Tab = "basic" | "contact" | "media" | "additional";

export default function AddUniversity() {
  const router = useRouter();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  
  // Options state
  const [kindOfPartners, setKindOfPartners] = useState<Option[]>([]);
  const [typeOfUniversities, setTypeOfUniversities] = useState<Option[]>([]);
  const [collaborationTypes, setCollaborationTypes] = useState<Option[]>([]);

  const [formData, setFormData] = useState<UniversityFormData>({
    // Basic Info
    university: "",
    description: "",
    country_code: "",
    state_code: "",
    city_code: "",
    kind_of_partner_id: "",
    type_of_university_id: "",
    collaboration_type_id: "",
    
    // Contact Info
    email: "",
    address: "",
    map_url: "",
    location_url: "",
    
    // Media - initialize with empty strings
    logo: "",
    image: "",
    brochure: "",
    
    // Additional Info
    video_link: "",
    tuition_url: "",
  });

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");

  // Fetch options from APIs
  useEffect(() => {
    const fetchOptions = async () => {
      if (!token) return;

      try {
        setIsLoadingOptions(true);
        const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

        // Fetch all options in parallel
        const [partnerTypesRes, universityTypesRes, collaborationTypesRes] = await Promise.all([
          fetch(`${BASE_URL}/tenant/option/apply_tenant_partner_types`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch(`${BASE_URL}/tenant/option/apply_tenant_university_types`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch(`${BASE_URL}/tenant/option/apply_tenant_collaboration_types`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
        ]);

        if (partnerTypesRes.ok) {
          const partnerData = await partnerTypesRes.json();
          setKindOfPartners(partnerData.data || []);
        }

        if (universityTypesRes.ok) {
          const universityData = await universityTypesRes.json();
          setTypeOfUniversities(universityData.data || []);
        }

        if (collaborationTypesRes.ok) {
          const collaborationData = await collaborationTypesRes.json();
          setCollaborationTypes(collaborationData.data || []);
        }

      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update country and state selections for dependent dropdowns
    if (name === 'country_code') {
      setSelectedCountry(value);
      setSelectedState("");
      setFormData(prev => ({
        ...prev,
        state_code: "",
        city_code: ""
      }));
    } else if (name === 'state_code') {
      setSelectedState(value);
      setFormData(prev => ({
        ...prev,
        city_code: ""
      }));
    }
  };

  // Remove file change handler since we're not handling actual file uploads

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!token) {
    alert("Please log in to add a university");
    return;
  }

  setIsSubmitting(true);

  try {

    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

    // Add dummy file names since we're not handling actual file uploads
    const submitData = {
      ...formData,
      logo: "dummy-logo.jpg", // Add dummy filename
      image: "dummy-image.jpg", // Add dummy filename  
      brochure: "dummy-brochure.pdf", // Add dummy filename
    };


    const response = await fetch(`${BASE_URL}/tenant/university/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', // Add this header
      },
      body: JSON.stringify(submitData), // Use the data with dummy filenames
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Redirect back to universities list
    router.push('/admin/universities');
    router.refresh();
  } catch (error) {
    console.error('Error adding university:', error);
    alert('Error adding university. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
  // Get countries, states, and cities
  const countries = Country.getAllCountries();
  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry) : [];
  const cities = selectedState ? City.getCitiesOfState(selectedCountry, selectedState) : [];

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "media", label: "Media", icon: FileText },
    { id: "additional", label: "Additional", icon: BookOpen },
  ];

  const renderBasicInfoTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* University Name */}
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            University Name *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Building2 size={18} />
            </span>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              placeholder="Enter university name"
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Country *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Globe size={18} />
            </span>
            <select
              id="country_code"
              name="country_code"
              value={formData.country_code}
              onChange={handleInputChange}
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State */}
        <div>
          <label htmlFor="state_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            State/Province
          </label>
          <select
            id="state_code"
            name="state_code"
            value={formData.state_code}
            onChange={handleInputChange}
            disabled={!selectedCountry}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label htmlFor="city_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            City
          </label>
          <select
            id="city_code"
            name="city_code"
            value={formData.city_code}
            onChange={handleInputChange}
            disabled={!selectedState}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type of University */}
        <div>
          <label htmlFor="type_of_university_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Type of University *
          </label>
          <select
            id="type_of_university_id"
            name="type_of_university_id"
            value={formData.type_of_university_id}
            onChange={handleInputChange}
            required
            disabled={isLoadingOptions}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{isLoadingOptions ? "Loading..." : "Select University Type"}</option>
            {typeOfUniversities.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        {/* Kind of Partner */}
        <div>
          <label htmlFor="kind_of_partner_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Kind of Partner
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Users size={18} />
            </span>
            <select
              id="kind_of_partner_id"
              name="kind_of_partner_id"
              value={formData.kind_of_partner_id}
              onChange={handleInputChange}
              disabled={isLoadingOptions}
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{isLoadingOptions ? "Loading..." : "Select Partner Type"}</option>
              {kindOfPartners.map(partner => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Collaboration Type */}
        <div>
          <label htmlFor="collaboration_type_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Collaboration Type
          </label>
          <select
            id="collaboration_type_id"
            name="collaboration_type_id"
            value={formData.collaboration_type_id}
            onChange={handleInputChange}
            disabled={isLoadingOptions}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{isLoadingOptions ? "Loading..." : "Select Collaboration Type"}</option>
            {collaborationTypes.map(collab => (
              <option key={collab.id} value={collab.id}>{collab.name}</option>
            ))}
          </select>
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

      {/* Map URL */}
      <div>
        <label htmlFor="map_url" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Google Map URL
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Link size={18} />
          </span>
          <input
            type="url"
            id="map_url"
            name="map_url"
            value={formData.map_url}
            onChange={handleInputChange}
            placeholder="https://maps.google.com?q=Stanford"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Location URL */}
      <div>
        <label htmlFor="location_url" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Website URL
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Link size={18} />
          </span>
          <input
            type="url"
            id="location_url"
            name="location_url"
            value={formData.location_url}
            onChange={handleInputChange}
            placeholder="https://www.stanford.edu"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-5">
      {/* Logo Upload - UI only */}
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Logo
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
              className="hidden"
              disabled // Disable actual file selection
            />
          </label>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended: Square PNG or JPG, min 200x200px
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Will use dummy image automatically
            </p>
          </div>
        </div>
      </div>

      {/* Image Upload - UI only */}
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
              className="hidden"
              disabled // Disable actual file selection
            />
          </label>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended: Landscape JPG, min 800x600px
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Will use dummy image automatically
            </p>
          </div>
        </div>
      </div>

      {/* Brochure Upload - UI only */}
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
              className="hidden"
              disabled // Disable actual file selection
            />
          </label>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload university brochure in PDF format (max 10MB)
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Will use dummy PDF automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdditionalTab = () => (
    <div className="space-y-5">
      {/* Video Link */}
      <div>
        <label htmlFor="video_link" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Video Link
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Video size={18} />
          </span>
          <input
            type="url"
            id="video_link"
            name="video_link"
            value={formData.video_link}
            onChange={handleInputChange}
            placeholder="https://youtu.be/samplevideo"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Tuition URL */}
      <div>
        <label htmlFor="tuition_url" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Tuition Fee URL
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Link size={18} />
          </span>
          <input
            type="url"
            id="tuition_url"
            name="tuition_url"
            value={formData.tuition_url}
            onChange={handleInputChange}
            placeholder="https://stanford.edu/tuition-fees"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
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
              <button
                type="button"
                onClick={() => router.back()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </button>
            </div>

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
              {activeTab === "additional" && (
              <button
                type="submit"
                disabled={isSubmitting || !token || isLoadingOptions}
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
            )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}