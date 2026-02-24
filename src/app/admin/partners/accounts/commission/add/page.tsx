"use client"
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Globe, GraduationCap, Pencil, Percent, University, Calendar,
  Upload, Download, FileText, AlertCircle, CheckCircle, XCircle, Info, Loader 
} from "lucide-react";
import { Country } from "country-state-city";
import { useAuth } from "@/context/AuthContext";

// Import/Export Types
interface ImportSummary {
  total_rows_processed: number;
  inserted: number;
  updated: number;
  errors: number;
  warnings: number;
  details: {
    inserted_commissions: any[];
    updated_commissions: any[];
    errors: string[];
    warnings: string[];
  };
}

interface ValidationResult {
  valid_rows: number;
  invalid_rows: number;
  new_commissions: any[];
  updated_commissions: any[];
  errors: Array<{ row: number; errors: string[]; warnings?: string[] }>;
  warnings: Array<{ row: number; warnings: string[] }>;
  summary: {
    total_to_process: number;
    will_be_inserted: number;
    will_be_updated: number;
    valid_rows: number;
    invalid_rows: number;
    warnings_count: number;
    total_rows_processed?: number;
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

interface University {
  id: number;
  uuid: string;
  tenant_id: number;
  university: string;
  university_slug: string;
  description: string;
  state_code: string;
  city_code: string;
  address: string | null;
  map_url: string | null;
  location_url: string | null;
  kind_of_partner_id: number;
  type_of_university_id: number;
  collaboration_type_id: number;
  logo: string | null;
  image: string | null;
  brochure: string | null;
  video_link: string | null;
  tuition_url: string | null;
  email: string;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  kind_of_partner_name: string;
  collaboration_type_name: string;
  university_type_name: string;
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
  const {token} = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Import/Export states
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Download sample file function
  const handleDownloadSample = async () => {
    try {
      const link = document.createElement('a');
      link.href = '/samples/commissions_template.xlsx';
      link.download = 'commissions_import_sample.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading sample file for import:', error);
      setError('Failed to download sample file for import');
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setIsImportModalOpen(true);
      setValidationResult(null);
      setImportResult(null);
      setImportSuccessMessage(null);
    }
  };

  // Handle file validation
  const handleValidate = async () => {
    if (!importFile) return;

    setIsValidating(true);
    const formData = new FormData();
    formData.append('excelFile', importFile);

    try {
      const response = await fetch(`${BASE_URL}/tenant/commissions/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setValidationResult(result.data);
        setIsValidationModalOpen(true);
        setIsImportModalOpen(false);
      } else {
        alert(result.message || 'Validation failed');
      }
    } catch (err) {
      console.error('Validation error:', err);
      alert('Failed to validate file. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('excelFile', importFile);

    try {
      const response = await fetch(`${BASE_URL}/tenant/import/commissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.status === 'success' || result.status === 'warning') {
        setImportResult(result.data);
        
        const message = result.data.errors === 0 
          ? `Successfully imported ${result.data.inserted} new commissions and updated ${result.data.updated} existing commissions.`
          : `Import completed with warnings: ${result.data.inserted} inserted, ${result.data.updated} updated, ${result.data.warnings} warnings.`;
        
        setImportSuccessMessage(message);
        
        setIsValidationModalOpen(false);
        setIsImportModalOpen(false);
        setImportFile(null);
        setValidationResult(null);
        
        setTimeout(() => {
          setImportSuccessMessage(null);
          setImportResult(null);
        }, 10000);
      } else {
        alert(result.message || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Failed to import commissions. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  // Clear import success message
  const dismissImportMessage = () => {
    setImportSuccessMessage(null);
    setImportResult(null);
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
        {/* Header with Import/Export buttons */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 flex justify-between items-center">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Add New Commission
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create a new commission structure for tenants.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Import Button */}
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isValidating || isImporting}
                className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {isValidating ? 'Validating...' : isImporting ? 'Importing...' : 'Import'}
              </button>
            </div>

          

            {/* Download Sample Button */}
            <button
              onClick={handleDownloadSample}
              className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download Import Sample
            </button>
          </div>
        </div>

        {/* Import Success Message */}
        {importSuccessMessage && (
          <div className={`mx-5 mb-4 rounded-lg p-4 ${
            importResult?.errors === 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {importResult?.errors === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`text-sm font-medium ${
                    importResult?.errors === 0 ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    Import {importResult?.errors === 0 ? 'Successful' : 'Completed with Warnings'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {importSuccessMessage}
                  </p>
                  {importResult && importResult.details.errors.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => alert(importResult.details.errors.join('\n'))}
                        className="text-sm text-red-600 dark:text-red-400 underline"
                      >
                        View Errors
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={dismissImportMessage}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
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
      {isImportModalOpen && importFile && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            setImportFile(null);
            setValidationResult(null);
          }}
          onValidate={handleValidate}
          fileName={importFile.name}
          isValidating={isValidating}
          validationResult={validationResult}
        />
      )}

      {/* Validation Modal */}
      {isValidationModalOpen && validationResult && (
        <ValidationModal
          isOpen={isValidationModalOpen}
          onClose={() => {
            setIsValidationModalOpen(false);
            setValidationResult(null);
          }}
          onConfirm={handleImport}
          validationResult={validationResult}
          isImporting={isImporting}
        />
      )}
    </>
  );
}

// Import Modal Component
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: () => void;
  fileName: string;
  isValidating: boolean;
  validationResult: any;
}

function ImportModal({
  isOpen,
  onClose,
  onValidate,
  fileName,
  isValidating,
  validationResult,
}: ImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Import Commissions
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isValidating}
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Selected file: <span className="font-medium text-gray-800 dark:text-white">{fileName}</span>
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-medium mb-1">Please Note:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Always validate your file before importing</li>
                <li>Existing commissions will be updated based on University + Study Level combination</li>
                <li>New commissions will be created for empty rows</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isValidating}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onValidate}
              disabled={isValidating}
              className="flex-1 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate File'
              )}
            </button>
          </div>

          {validationResult && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Validation Summary:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <span className="text-green-600 dark:text-green-400">Valid Rows:</span>
                  <span className="ml-2 font-medium">{validationResult.valid_rows}</span>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  <span className="text-red-600 dark:text-red-400">Invalid Rows:</span>
                  <span className="ml-2 font-medium">{validationResult.invalid_rows}</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <span className="text-blue-600 dark:text-blue-400">To Insert:</span>
                  <span className="ml-2 font-medium">{validationResult.summary.will_be_inserted}</span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                  <span className="text-purple-600 dark:text-purple-400">To Update:</span>
                  <span className="ml-2 font-medium">{validationResult.summary.will_be_updated}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Validation Modal Component
interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  validationResult: any;
  isImporting: boolean;
}

function ValidationModal({
  isOpen,
  onClose,
  onConfirm,
  validationResult,
  isImporting,
}: ValidationModalProps) {
  if (!isOpen) return null;

  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings.length > 0;
  const canProceed = validationResult.valid_rows > 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Validation Results
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isImporting}
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {validationResult.summary.total_rows_processed || validationResult.summary.total_to_process}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Rows</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {validationResult.valid_rows}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Valid</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {validationResult.invalid_rows}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">Invalid</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {validationResult.summary.warnings_count}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">Warnings</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Will be Inserted
                </span>
              </div>
              <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {validationResult.summary.will_be_inserted}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Will be Updated
                </span>
              </div>
              <div className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                {validationResult.summary.will_be_updated}
              </div>
            </div>
          </div>

          {hasErrors && (
            <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
              <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 border-b border-red-200 dark:border-red-800">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Errors ({validationResult.errors.length})
                </h4>
              </div>
              <div className="max-h-40 overflow-y-auto p-4 space-y-2">
                {validationResult.errors.map((error: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-red-600 dark:text-red-400">Row {error.row}:</span>
                    <ul className="mt-1 list-disc list-inside text-red-600 dark:text-red-400">
                      {error.errors.map((msg: string, i: number) => (
                        <li key={i} className="text-xs">{msg}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasWarnings && (
            <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg overflow-hidden">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 border-b border-yellow-200 dark:border-yellow-800">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Warnings ({validationResult.warnings.length})
                </h4>
              </div>
              <div className="max-h-40 overflow-y-auto p-4 space-y-2">
                {validationResult.warnings.map((warning: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">Row {warning.row}:</span>
                    <ul className="mt-1 list-disc list-inside text-yellow-600 dark:text-yellow-400">
                      {warning.warnings.map((msg: string, i: number) => (
                        <li key={i} className="text-xs">{msg}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validationResult.new_commissions?.length > 0 && (
            <div className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
              <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 border-b border-green-200 dark:border-green-800">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  New Commissions to Insert ({validationResult.new_commissions.length})
                </h4>
              </div>
              <div className="max-h-40 overflow-y-auto p-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                      <th className="pb-2">Row</th>
                      <th className="pb-2">University</th>
                      <th className="pb-2">Study Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.new_commissions.slice(0, 5).map((item: any, index: number) => (
                      <tr key={index} className="text-gray-700 dark:text-gray-300">
                        <td className="py-1">{item.row}</td>
                        <td className="py-1">{item.university}</td>
                        <td className="py-1">{item.study_level}</td>
                      </tr>
                    ))}
                    {validationResult.new_commissions.length > 5 && (
                      <tr>
                        <td colSpan={3} className="pt-2 text-xs text-gray-500">
                          ... and {validationResult.new_commissions.length - 5} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {validationResult.updated_commissions?.length > 0 && (
            <div className="border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden">
              <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 border-b border-purple-200 dark:border-purple-800">
                <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Commissions to Update ({validationResult.updated_commissions.length})
                </h4>
              </div>
              <div className="max-h-40 overflow-y-auto p-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                      <th className="pb-2">Row</th>
                      <th className="pb-2">University</th>
                      <th className="pb-2">Study Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.updated_commissions.slice(0, 5).map((item: any, index: number) => (
                      <tr key={index} className="text-gray-700 dark:text-gray-300">
                        <td className="py-1">{item.row}</td>
                        <td className="py-1">{item.university}</td>
                        <td className="py-1">{item.study_level}</td>
                      </tr>
                    ))}
                    {validationResult.updated_commissions.length > 5 && (
                      <tr>
                        <td colSpan={3} className="pt-2 text-xs text-gray-500">
                          ... and {validationResult.updated_commissions.length - 5} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canProceed || isImporting}
              className="flex-1 px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-hidden focus:ring-2 focus:ring-green-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Proceed with Import'
              )}
            </button>
          </div>

          {!canProceed && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              Cannot proceed with import as there are no valid rows to process.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}