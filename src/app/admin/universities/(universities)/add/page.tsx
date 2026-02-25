"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Country, State, City } from "country-state-city";
import { 
  Globe, 
  MapPin, 
  Mail, 
  FileText, 
  Video, 
  Link, 
  Building2, 
  BookOpen, 
  Users, 
  Plus, 
  X, 
  Calendar,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  website_url: string;
  
  // Media - File objects
  logo: File | null;
  image: File | null;
  brochure: File | null;
  
  // Additional Info
  video_link: string;
  tuition_url: string;
  agreement_start_date: string;
  agreement_end_date: string;
}

interface Option {
  id: number;
  name: string;
}

type Tab = "basic" | "contact" | "media" | "additional";

// Import Modal Types and Interface
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onSuccess: () => void;
}
interface ImportResponse {
  status: string;
  message: string;
  data: {
    file_info: {
      filename: string;
      size: number;
      type: string;
    };
    total_rows: number;
    inserted: number;
    updated: number;
    errors: number;
    details: {
      new_partner_types_created: number;
      new_university_types_created: number;
      inserted_universities: Array<{
        id: number;
        university: string;
        slug: string;
      }>;
      updated_universities: any[];
      errors: any[];
    };
  };
}


const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, token, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setImportResult(null);
    }
  };

  const handleDownloadSample = async () => {
    try {
      // Create a link to download the sample file
      const link = document.createElement('a');
      link.href = '/samples/university_feilds.xlsx';
      link.download = 'university_import_sample.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading sample file:', error);
      setError('Failed to download sample file');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      // Simulate progress (since fetch doesn't support upload progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('https://api.applystore.org/api/tenant/import/universities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to import universities');
      }

      setImportResult(result as ImportResponse);
      
      // Call onSuccess callback to refresh the university list
      if (result.status === 'success') {
        onSuccess();
        
        // Auto close after 3 seconds on success
        setTimeout(() => {
          onClose();
          // Reset state
          setSelectedFile(null);
          setImportResult(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-black-800/50  transition-opacity" onClick={handleClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Universities</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-4">
            {/* Sample Download Section */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Download className="text-blue-600 dark:text-blue-400 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Download Sample File</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 mb-2">
                    Download our sample Excel file to see the required format and fields.
                  </p>
                  <button
                    onClick={handleDownloadSample}
                    className="inline-flex items-center gap-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
                  >
                    <Download size={14} />
                    Download Sample
                  </button>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Excel File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white dark:bg-gray-900 font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Excel files only (.xlsx, .xls) up to 10MB
                  </p>
                </div>
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="text-red-600 dark:text-red-400" size={18} />
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
              </div>
            )}

            {/* Import Result */}
            {importResult && importResult.status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                    Import Successful!
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total Rows</p>
                    <p className="font-medium text-gray-900 dark:text-white">{importResult.data.total_rows}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Inserted</p>
                    <p className="font-medium text-green-600">{importResult.data.inserted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Updated</p>
                    <p className="font-medium text-blue-600">{importResult.data.updated}</p>
                  </div>
                </div>
                {importResult.data.details && importResult.data.details.inserted_universities && 
                 importResult.data.details.inserted_universities.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Inserted Universities:</p>
                    <div className="max-h-24 overflow-y-auto">
                      {importResult.data.details.inserted_universities.map((uni, idx) => (
                        <p key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                          • {uni.university}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
            {importResult && importResult.status === "fail" && (
  <div className="mt-4 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">

    {/* Main Message */}
    <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
      {importResult.message}
    </p>

    {/* Summary */}
    <div className="text-xs text-red-700 dark:text-red-400 space-y-1 mb-3">
      <p>Total Rows: {importResult.data?.total_rows}</p>
      <p>Inserted: {importResult.data?.inserted}</p>
      <p>Updated: {importResult.data?.updated}</p>
      <p>Total Errors: {importResult.data?.errors}</p>
      <p>New Partner Types Created: {importResult.data?.details?.new_partner_types_created}</p>
      <p>New University Types Created: {importResult.data?.details?.new_university_types_created}</p>
    </div>

    {/* Detailed Row Errors */}
    {importResult.data?.details?.errors?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
          Row Errors:
        </p>

        <ul className="list-disc pl-4 max-h-40 overflow-y-auto text-xs text-red-600 dark:text-red-400 space-y-1">
          {importResult.data.details.errors.map((error: string, idx: number) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}

         
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Import Universities
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AddUniversity() {
  const router = useRouter();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Options state
  const [kindOfPartners, setKindOfPartners] = useState<Option[]>([]);
  const [typeOfUniversities, setTypeOfUniversities] = useState<Option[]>([]);
  const [collaborationTypes, setCollaborationTypes] = useState<Option[]>([]);

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
    kind_of_partner_id: "",
    type_of_university_id: "",
    collaboration_type_id: "",
    
    // Contact Info
    email: "",
    address: "",
    map_url: "",
    website_url: "",
    
    // Media - initialize with null
    logo: null,
    image: null,
    brochure: null,
    
    // Additional Info
    video_link: "",
    tuition_url: "",
    agreement_start_date: "",
    agreement_end_date: "",
  });

  const [preview, setPreview] = useState({
    logo: "",
    image: "",
    brochureName: "",
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

  // Handle date change function
  const handleDateChange = (date: Date | null, field: 'agreement_start_date' | 'agreement_end_date') => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        [field]: formattedDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: ""
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
    
    if (!token) {
      alert("Please log in to add a university");
      return;
    }

    // Validate required files
    if (!formData.logo || !formData.image) {
      alert("Please upload both logo and university image");
      return;
    }

    setIsSubmitting(true);

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

      // Create FormData object
      const formDataToSend = new FormData();

      // Append all text fields
      formDataToSend.append('university', formData.university);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('country_code', formData.country_code);
      formDataToSend.append('state_code', formData.state_code);
      formDataToSend.append('city_code', formData.city_code);
      formDataToSend.append('kind_of_partner_id', formData.kind_of_partner_id);
      formDataToSend.append('type_of_university_id', formData.type_of_university_id);
      formDataToSend.append('collaboration_type_id', formData.collaboration_type_id);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('map_url', formData.map_url);
      formDataToSend.append('website_url', formData.website_url);
      formDataToSend.append('video_link', formData.video_link);
      formDataToSend.append('tuition_url', formData.tuition_url);
      
      // Append new date fields
      formDataToSend.append('agreement_start_date', formData.agreement_start_date);
      formDataToSend.append('agreement_end_date', formData.agreement_end_date);

      // Append files
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      if (formData.brochure) {
        formDataToSend.append('brochure', formData.brochure);
      }

      const response = await fetch(`${BASE_URL}/tenant/university/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header for FormData - browser will set it with boundary
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Redirect back to universities list
      router.push('/admin/universities');
      // router.refresh();
    } catch (error) {
      console.error('Error adding university:', error);
      alert('Error adding university. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful import
  const handleImportSuccess = () => {
    // Refresh the universities list if we're on the list page
    // For now, just show a success message
    console.log('Import completed successfully');
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
    // ... (keep existing basic info tab code unchanged)
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
    // ... (keep existing contact tab code unchanged)
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
        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Website URL
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Link size={18} />
          </span>
          <input
            type="url"
            id="website_url"
            name="website_url"
            value={formData.website_url}
            onChange={handleInputChange}
            placeholder="https://www.stanford.edu"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>
    </div>
  );

  const renderMediaTab = () => (
    // ... (keep existing media tab code unchanged)
    <div className="space-y-5">
      {/* Logo Upload */}
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Logo *
        </label>
        <div className="flex items-center gap-4">
          {preview.logo ? (
            <div className="relative w-32 h-32 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <img 
                src={preview.logo} 
                alt="Logo preview" 
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
                required
              />
            </label>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended: Square PNG or JPG, min 200x200px
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              * Required
            </p>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Image *
        </label>
        <div className="flex items-center gap-4">
          {preview.image ? (
            <div className="relative w-48 h-32 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <img 
                src={preview.image} 
                alt="Image preview" 
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
                required
              />
            </label>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended: Landscape JPG, min 800x600px
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              * Required
            </p>
          </div>
        </div>
      </div>

      {/* Brochure Upload */}
      <div>
        <label htmlFor="brochure" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          University Brochure (PDF)
        </label>
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
              Optional
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdditionalTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      {/* Agreement Start Date */}
      <div>
        <label htmlFor="agreement_start_date" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Agreement Start Date
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10">
            <Calendar size={18} />
          </span>
          <DatePicker
            id="agreement_start_date"
            selected={formData.agreement_start_date ? new Date(formData.agreement_start_date) : null}
            onChange={(date: Date | null) => handleDateChange(date, 'agreement_start_date')}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select agreement start date"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            className="w-100 dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Agreement End Date */}
      <div>
        <label htmlFor="agreement_end_date" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Agreement End Date
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10">
            <Calendar size={18} />
          </span>
          <DatePicker
            id="agreement_end_date"
            selected={formData.agreement_end_date ? new Date(formData.agreement_end_date) : null}
            onChange={(date: Date | null) => handleDateChange(date, 'agreement_end_date')}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select agreement end date"
            minDate={formData.agreement_start_date ? new Date(formData.agreement_start_date) : undefined}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            className="w-100 dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>
    </div>
    </div>
  );

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-4 sm:px-6 sm:py-5 flex justify-between items-center">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Add New University
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create a new university profile with comprehensive information.
            </p>
          </div>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Upload size={18} />
            Import Excel
          </button>
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
                    disabled={isSubmitting || !token || isLoadingOptions || !formData.logo || !formData.image}
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

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        token={token}
        onSuccess={handleImportSuccess}
      />
    </>
  );
}