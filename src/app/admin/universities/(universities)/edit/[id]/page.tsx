"use client"
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Globe, MapPin, Mail, FileText, Video, Link as LinkIcon, Building2, BookOpen, Users, ArrowBigRightDash, X } from "lucide-react";
import { Country, State, City } from "country-state-city";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface UniversityFormData {
  // Basic Info
  university: string;
  description: string;
  country_code: string;
  state_code: string;
  city_code: string;
  
  // Contact Info
  email: string | null;
  address: string | null;
  map_url: string | null;
  website_url: string | null;
  
  // Media - Now as Files or URLs
  logo: File | string | null;
  image: File | string | null;
  brochure: File | string | null;
  
  // Additional Info
  video_link: string | null;
  tuition_url: string | null;
  kind_of_partner_id: number | null;
  collaboration_type_id: number | null;
  type_of_university_id: number | null;
}

interface PartnerType {
  id: number;
  name: string;
}

interface CollaborationType {
  id: number;
  name: string;
}

interface UniversityType {
  id: number;
  name: string;
}

interface OptionsData {
  partnerTypes: PartnerType[];
  collaborationTypes: CollaborationType[];
  universityTypes: UniversityType[];
}

interface UniversityData {
  university: {
    id: number;
    uuid: string;
    tenant_id: number;
    university: string;
    university_slug: string;
    description: string;
    country_code: string;
    state_code: string;
    city_code: string;
    address: string | null;
    map_url: string | null;
    website_url: string | null;
    kind_of_partner_id: number | null;
    type_of_university_id: number | null;
    collaboration_type_id: number | null;
    logo: string | null;
    image: string | null;
    brochure: string | null;
    logo_url: string | null;
    image_url: string | null;
    brochure_url: string | null;
    video_link: string | null;
    tuition_url: string | null;
    email: string | null;
    is_deleted: number;
    created_at: string;
    updated_at: string;
    kind_of_partner_name: string | null;
    collaboration_type_name: string | null;
    university_type_name: string | null;
  };
  options: OptionsData;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: UniversityData;
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

type Tab = "basic" | "contact" | "media" | "additional"

export default function EditUniversity() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {token} = useAuth();

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");

  const countries = Country.getAllCountries();
  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry) : [];
  const cities = selectedState ? City.getCitiesOfState(selectedCountry, selectedState) : [];
  
  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UniversityFormData>({
    // Basic Info
    university: "",
    description: "",
    country_code: "",
    state_code: "",
    city_code: "",
    
    // Contact Info
    email: null,
    address: null,
    map_url: null,
    website_url: null,
    
    // Media
    logo: null,
    image: null,
    brochure: null,
    
    // Additional Info
    video_link: null,
    tuition_url: null,
    kind_of_partner_id: null,
    collaboration_type_id: null,
    type_of_university_id: null,
  });

  const [preview, setPreview] = useState({
    logo: "",
    image: "",
    brochureName: "",
    currentLogo: "",
    currentImage: "",
    currentBrochure: "",
  });

  const [options, setOptions] = useState<OptionsData>({
    partnerTypes: [],
    collaborationTypes: [],
    universityTypes: [],
  });

  const [filteredStates, setFilteredStates] = useState<typeof states>([]);
  const [filteredCities, setFilteredCities] = useState<typeof cities>([]);

  const fetchUniversity = async (id: string): Promise<UniversityData> => {
    const response = await fetch(`${BASE_URL}/tenant/university/list/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch university: ${response.status}`);
    }
    
    const result: ApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data;
  };

  useEffect(() => {
    const loadUniversity = async () => {
      try {
        const data = await fetchUniversity(id);
        setFormData({
          university: data.university.university,
          description: data.university.description,
          country_code: data.university.country_code,
          state_code: data.university.state_code,
          city_code: data.university.city_code,
          email: data.university.email,
          address: data.university.address,
          map_url: data.university.map_url,
          website_url: data.university.website_url,
          logo: data.university.logo,
          image: data.university.image,
          brochure: data.university.brochure,
          video_link: data.university.video_link,
          tuition_url: data.university.tuition_url,
          kind_of_partner_id: data.university.kind_of_partner_id,
          collaboration_type_id: data.university.collaboration_type_id,
          type_of_university_id: data.university.type_of_university_id,
        });
        
        // Set current URLs for preview
        setPreview(prev => ({
          ...prev,
          currentLogo: data.university.logo_url || "",
          currentImage: data.university.image_url || "",
          currentBrochure: data.university.brochure_url || "",
        }));
        console.log(data.university.logo)
        
        setOptions(data.options);
        setSelectedCountry(data.university.country_code);
        setSelectedState(data.university.state_code);
      } catch (error) {
        console.error('Error loading university:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadUniversity();
    }
  }, [id]);

  // Update filtered states when country changes
  useEffect(() => {
    if (formData.country_code) {
      const statesForCountry = states.filter(state => state.countryCode === formData.country_code);
      setFilteredStates(statesForCountry);
      
      // Reset state and city if country changes
      if (statesForCountry.length > 0 && !statesForCountry.some(state => state.isoCode === formData.state_code)) {
        setFormData(prev => ({
          ...prev,
          state_code: "",
          city_code: ""
        }));
      }
    } else {
      setFilteredStates([]);
    }
  }, [formData.country_code]);

  // Update filtered cities when state changes
  useEffect(() => {
    if (formData.state_code) {
      const citiesForState = cities.filter(city => city.stateCode === formData.state_code);
      setFilteredCities(citiesForState);
      
      // Reset city if state changes
      if (citiesForState.length > 0 && !citiesForState.some(city => city.name === formData.city_code)) {
        setFormData(prev => ({
          ...prev,
          city_code: ""
        }));
      }
    } else {
      setFilteredCities([]);
    }
  }, [formData.state_code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle country/state/city changes
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

    // Handle numeric fields
    if (name === 'kind_of_partner_id' || name === 'collaboration_type_id' || name === 'type_of_university_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value === "" ? null : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value === "" ? null : value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'image' | 'brochure') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));

      // Create preview for images
      if (field === 'logo' || field === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(prev => ({
            ...prev,
            [field]: reader.result as string
          }));
        };
        reader.readAsDataURL(file);
      } else if (field === 'brochure') {
        setPreview(prev => ({
          ...prev,
          brochureName: file.name
        }));
      }
    }
  };

  console.log(preview)

  const removeFile = (field: 'logo' | 'image' | 'brochure') => {
    setFormData(prev => ({
      ...prev,
      [field]: null
    }));
    
    setPreview(prev => ({
      ...prev,
      [field]: field === 'brochure' ? '' : '',
      brochureName: field === 'brochure' ? '' : prev.brochureName
    }));

    // Reset file input
    if (field === 'logo' && logoInputRef.current) {
      logoInputRef.current.value = '';
    } else if (field === 'image' && imageInputRef.current) {
      imageInputRef.current.value = '';
    } else if (field === 'brochure' && brochureInputRef.current) {
      brochureInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData object
      const formDataToSend = new FormData();

      // Append all text fields
      formDataToSend.append('university', formData.university);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('country_code', formData.country_code);
      formDataToSend.append('state_code', formData.state_code);
      formDataToSend.append('city_code', formData.city_code);
      
      // Append contact info
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.address) formDataToSend.append('address', formData.address);
      if (formData.map_url) formDataToSend.append('map_url', formData.map_url);
      if (formData.website_url) formDataToSend.append('website_url', formData.website_url);
      
      // Append additional info
      if (formData.video_link) formDataToSend.append('video_link', formData.video_link);
      if (formData.tuition_url) formDataToSend.append('tuition_url', formData.tuition_url);
      if (formData.kind_of_partner_id !== null) formDataToSend.append('kind_of_partner_id', formData.kind_of_partner_id.toString());
      if (formData.collaboration_type_id !== null) formDataToSend.append('collaboration_type_id', formData.collaboration_type_id.toString());
      if (formData.type_of_university_id !== null) formDataToSend.append('type_of_university_id', formData.type_of_university_id.toString());

      // Append files if they are File objects
      if (formData.logo && typeof formData.logo !== 'string') {
        formDataToSend.append('logo', formData.logo);
      }
      if (formData.image && typeof formData.image !== 'string') {
        formDataToSend.append('image', formData.image);
      }
      if (formData.brochure && typeof formData.brochure !== 'string') {
        formDataToSend.append('brochure', formData.brochure);
      }

      // If media is string (existing URL) and no new file uploaded, we might need to handle it differently
      // This depends on your API. If your API expects the URL when no new file is uploaded, you might need to send it.
      // For now, we'll only send files when they are File objects

      const response = await fetch(`${BASE_URL}/tenant/university/edit/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser sets it automatically
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to update university: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }

      console.log("University updated successfully:", result);
      
      // Redirect back to universities list
      router.push('/admin/universities');
      router.refresh();
    } catch (error) {
      console.error('Error updating university:', error);
      alert(`Error updating university: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
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
            value={formData.state_code || ""}
            onChange={handleInputChange}
            disabled={!formData.country_code}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select State</option>
            {filteredStates.map(state => (
              <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
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
            value={formData.city_code || ""}
            onChange={handleInputChange}
            disabled={!formData.state_code}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select City</option>
            {filteredCities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* University Type */}
      <div>
        <label htmlFor="type_of_university_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Type of University *
        </label>
        <select
          id="type_of_university_id"
          name="type_of_university_id"
          value={formData.type_of_university_id || ""}
          onChange={handleInputChange}
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
        >
          <option value="">Select University Type</option>
          {options.universityTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
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
          University Email
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Mail size={18} />
          </span>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ""}
            onChange={handleInputChange}
            placeholder="Enter university email address"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Address
        </label>
        <div className="relative">
          <span className="absolute top-4 left-4 text-gray-500 dark:text-gray-400">
            <MapPin size={18} />
          </span>
          <textarea
            id="address"
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            placeholder="Enter complete university address"
            rows={3}
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
            <LinkIcon size={18} />
          </span>
          <input
            type="url"
            id="map_url"
            name="map_url"
            value={formData.map_url || ""}
            onChange={handleInputChange}
            placeholder="https://maps.google.com/embed?pb=..."
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Location URL */}
      <div>
        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Website URL
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <LinkIcon size={18} />
          </span>
          <input
            type="url"
            id="website_url"
            name="website_url"
            value={formData.website_url || ""}
            onChange={handleInputChange}
            placeholder="https://university.edu/location"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-5">
      {/* Logo Upload */}
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Logo
        </label>
        <div className="space-y-3">
          {/* Current logo preview */}
          {preview.currentLogo && !preview.logo && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Logo:</p>
              <div className="flex items-center gap-3">
                <div className="relative w-24 h-24 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
               
                  <img 
                    src={preview.currentLogo} 
                    alt="Current logo" 
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                {/* <p className="text-sm text-green-600 dark:text-green-400 break-all flex-1">
                  {preview.currentLogo}
                </p> */}
              </div>
            </div>
          )}

          {/* New logo upload */}
          <div className="flex items-center gap-4">
            {preview.logo ? (
              <div className="relative w-32 h-32 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <img 
                  src={preview.logo} 
                  alt="New logo preview" 
                  className="w-full h-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={() => removeFile('logo')}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload Logo</p>
                </div>
                <input
                  ref={logoInputRef}
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recommended: Square PNG or JPG, min 200x200px
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {preview.currentLogo ? "Upload new logo to replace current one" : "Optional"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Image
        </label>
        <div className="space-y-3">
          {/* Current image preview */}
          {preview.currentImage && !preview.image && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Image:</p>
              <div className="flex items-center gap-3">
                <div className="relative w-48 h-32 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <img 
                    src={preview.currentImage} 
                    alt="Current image" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* <p className="text-sm text-green-600 dark:text-green-400 break-all flex-1">
                  {preview.currentImage}
                </p> */}
              </div>
            </div>
          )}

          {/* New image upload */}
          <div className="flex items-center gap-4">
            {preview.image ? (
              <div className="relative w-48 h-32 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <img 
                  src={preview.image} 
                  alt="New image preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile('image')}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload Image</p>
                </div>
                <input
                  ref={imageInputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recommended: Landscape JPG, min 800x600px
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {preview.currentImage ? "Upload new image to replace current one" : "Optional"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brochure Upload */}
      <div>
        <label htmlFor="brochure" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Brochure (PDF)
        </label>
        <div className="space-y-3">
          {/* Current brochure info */}
          {preview.currentBrochure && !preview.brochureName && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Brochure:</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                
                <Link href={preview.currentBrochure} className="text-sm text-green-600 dark:text-green-400 break-all"> view current brochure </Link>
              </div>
            </div>
          )}

          {/* New brochure upload */}
          <div className="flex items-center gap-4">
            {preview.brochureName ? (
              <div className="relative w-48 h-32 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50 dark:bg-gray-800">
                  <FileText size={32} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-300 text-center truncate w-full">
                    {preview.brochureName}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFile('brochure')}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload PDF</p>
                </div>
                <input
                  ref={brochureInputRef}
                  id="brochure"
                  name="brochure"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'brochure')}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload university brochure in PDF format (max 10MB)
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {preview.currentBrochure ? "Upload new brochure to replace current one" : "Optional"}
              </p>
            </div>
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
            value={formData.video_link || ""}
            onChange={handleInputChange}
            placeholder="https://youtube.com/embed/..."
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
            <LinkIcon size={18} />
          </span>
          <input
            type="url"
            id="tuition_url"
            name="tuition_url"
            value={formData.tuition_url || ""}
            onChange={handleInputChange}
            placeholder="https://university.edu/tuition-fees"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Partner Type */}
      <div>
        <label htmlFor="kind_of_partner_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Kind of Partners
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Users size={18} />
          </span>
          <select
            id="kind_of_partner_id"
            name="kind_of_partner_id"
            value={formData.kind_of_partner_id || ""}
            onChange={handleInputChange}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
          >
            <option value="">Select Partner Type</option>
            {options.partnerTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
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
          value={formData.collaboration_type_id || ""}
          onChange={handleInputChange}
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
        >
          <option value="">Select Collaboration Type</option>
          {options.collaborationTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
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
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading university data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Edit University
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update university profile information.
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
                disabled={isSubmitting}
                className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating University...
                  </>
                ) : (
                  <>
                    Update University
                    <ArrowBigRightDash size={18} />
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