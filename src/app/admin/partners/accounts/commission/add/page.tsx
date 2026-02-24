"use client"
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Globe, GraduationCap, Pencil, Percent, University, Calendar,
  Upload, Download, FileText, AlertCircle, CheckCircle, XCircle, Info, Loader, X
} from "lucide-react";
import { Country } from "country-state-city";
import { useAuth } from "@/context/AuthContext";

// Import Response Types
interface ImportResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      total_rows: number;
      successful: number;
      failed: number;
      success_rate: string;
    };
    file_info: {
      filename: string;
      size: number;
      sheet: string;
    };
    details: any[];
  };
}

interface CommissionFormData {
  university_id: string;
  study_level_id: string;
  tenant_commission: string;
  commission_type: string;
  no_of_installments: string;
  remark: string;
}

interface StudyLevel {
  id: number;
  name: string;
  slug: string;
}

interface UniversityType {
  id: number;
  university: string;
}

export default function AddCommission() {
  const router = useRouter();
  const [formData, setFormData] = useState<CommissionFormData>({
    university_id: "",
    study_level_id: "",
    tenant_commission: "",
    commission_type: "percentage",
    no_of_installments: "1",
    remark: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState<UniversityType[]>([]);
  const [studyLevels, setStudyLevels] = useState<StudyLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const {token} = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`${BASE_URL}/tenant/university/names`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch universities: ${response.status}`);
        }

        const data = await response.json();
        const universities: UniversityType[] = data.data;

        const responseStudylevels = await fetch(`${BASE_URL}/tenant/option/apply_tenant_study_levels`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!responseStudylevels.ok) {
        throw new Error(`Failed to fetch study levels: ${responseStudylevels.status}`);
      }

      const resultStudylevels = await responseStudylevels.json();
        const studylevels: StudyLevel[] = resultStudylevels.data;

        setUniversities(universities);
        setStudyLevels(studylevels);
        
      } catch (err) {
        setError("Failed to load initial data");
        console.error('Error fetching initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [BASE_URL, token]);

  // Form handling functions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "no_of_installments") {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCommissionTypeChange = (value: string) => {
    const numericValue = formData.tenant_commission.replace(/[^0-9.]/g, '');
    setFormData(prev => ({
      ...prev,
      commission_type: value,
      tenant_commission: numericValue
    }));
  };

  const handleCommissionValueChange = (value: string) => {
    const cleanValue = value.replace(/[%$]/g, '');
    setFormData(prev => ({
      ...prev,
      tenant_commission: cleanValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.no_of_installments.trim()) {
        setError("Total installments is required");
        return;
      }

      const totalInstallments = parseInt(formData.no_of_installments);
      if (isNaN(totalInstallments) || totalInstallments < 1) {
        setError("Total installments must be a positive number (1 or greater)");
        return;
      }

      const apiData = {
        university_id: parseInt(formData.university_id),
        study_level_id: parseInt(formData.study_level_id),
        tenant_commission: parseFloat(formData.tenant_commission),
        commission_type: formData.commission_type,
        no_of_installments: totalInstallments,
        remark: formData.remark || "Standard commission"
      };

      const response = await fetch(`${BASE_URL}/tenant/agent/commissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Commission created successfully:", result);
      
      router.push('/admin/partners/accounts/commission');
      router.refresh();
      
    } catch (error) {
      console.error('Error adding commission:', error);
      setError(error instanceof Error ? error.message : "Failed to create commission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSuccess = () => {
    // Refresh or show success message
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading form data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header with Import button */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 flex justify-between items-center">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Add New Commission
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create a new commission structure for tenants.
            </p>
          </div>
          
          {/* Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Upload size={18} />
            Import Excel
          </button>
        </div>
        
        {/* Form Section */}
        <div className="space-y-6 border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="-mx-2.5 flex flex-wrap gap-y-5">
              {/* University Name Field */}
              <div className="w-full px-2.5">
                <label htmlFor="university_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  University Name
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <University size={18} />
                  </span>
                  <select
                    id="university_id"
                    name="university_id"
                    value={formData.university_id}
                    onChange={handleChange}
                    required
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                  >
                    <option value="">Select University</option>
                    {universities && universities.map(university => (
                      <option key={university.id} value={university.id}>
                        {university.university}
                      </option>
                    ))}
                  </select>
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                    <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Study Level Field */}
              <div className="w-full px-2.5">
                <label htmlFor="study_level_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Study Level
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <GraduationCap size={18} />
                  </span>
                  <select
                    id="study_level_id"
                    name="study_level_id"
                    value={formData.study_level_id}
                    onChange={handleChange}
                    required
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                  >
                    <option value="">Select Study Level</option>
                    {studyLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                    <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Commission Type and Value Fields */}
              <div className="w-full px-2.5">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Tenant Commission
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <select
                        name="commission_type"
                        value={formData.commission_type}
                        onChange={(e) => handleCommissionTypeChange(e.target.value)}
                        required
                        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                      <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                        <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        {formData.commission_type === "percentage" ? <Percent size={18} /> : "$"}
                      </span>
                      <input
                        type="text"
                        name="tenant_commission"
                        value={formData.tenant_commission}
                        onChange={(e) => handleCommissionValueChange(e.target.value)}
                        placeholder={formData.commission_type === "percentage" ? "e.g., 15" : "e.g., 500"}
                        required
                        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Installments Field */}
              <div className="w-full px-2.5">
                <label htmlFor="no_of_installments" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Total Installments
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <Calendar size={18} />
                  </span>
                  <input
                    type="text"
                    id="no_of_installments"
                    name="no_of_installments"
                    value={formData.no_of_installments}
                    onChange={handleChange}
                    placeholder="e.g., 1, 2, 3, etc."
                    required
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Number of installments for commission payment (e.g., 1 for one-time payment, 2 for two installments, etc.)
                </p>
              </div>

              {/* Remark Field */}
              <div className="w-full px-2.5">
                <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Remark
                </label>
                <div className="relative">
                  <span className="absolute top-4 left-4 text-gray-500 dark:text-gray-400">
                    <Pencil size={18} />
                  </span>
                  <textarea
                    id="remark"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    placeholder="Additional notes or comments about this commission"
                    rows={4}
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="w-full px-2.5">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
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
                        <Loader className="animate-spin h-4 w-4" />
                        Adding...
                      </>
                    ) : (
                      <>
                        Add Commission
                        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z" fill="white"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
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

// Import Modal Component
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, token, onSuccess }) => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

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
      link.href = '/samples/commissions_template.xlsx';
      link.download = 'commissions_import_sample.xlsx';
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

      const response = await fetch(`${BASE_URL}/tenant/import/commissions`, {
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
        throw new Error(result.message || 'Failed to import commissions');
      }

      setImportResult(result as ImportResponse);
      
      // Call onSuccess callback to refresh the commission list
      if (result.success) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeeCommissions = () => {
    onClose();
    router.push('/admin/partners/accounts/commission');
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
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Commissions</h3>
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

            {/* Import Result - Success */}
            {importResult && importResult.success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                    Import Completed!
                  </h4>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {importResult.message}
                </p>

                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Total Rows</p>
                    <p className="font-medium text-gray-900 dark:text-white">{importResult.data.summary.total_rows}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Successful</p>
                    <p className="font-medium text-green-600">{importResult.data.summary.successful}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Failed</p>
                    <p className="font-medium text-red-600">{importResult.data.summary.failed}</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <p>File: {importResult.data.file_info.filename}</p>
                  <p>Sheet: {importResult.data.file_info.sheet}</p>
                </div>

                {/* See Commissions Button */}
                <button
                  onClick={handleSeeCommissions}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <FileText size={18} />
                  See Commissions
                </button>
              </div>
            )}

            {/* Import Result - Fail */}
            {importResult && !importResult.success && (
              <div className="mb-6 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="text-red-600 dark:text-red-400" size={20} />
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Import Failed
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  {importResult.message}
                </p>
                <div className="text-xs text-red-700 dark:text-red-400 space-y-1">
                  <p>Total Rows: {importResult.data?.summary?.total_rows}</p>
                  <p>Successful: {importResult.data?.summary?.successful}</p>
                  <p>Failed: {importResult.data?.summary?.failed}</p>
                </div>
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
            {!importResult?.success && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedFile || isUploading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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
                    Import Commissions
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};