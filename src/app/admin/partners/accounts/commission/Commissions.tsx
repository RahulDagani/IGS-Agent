"use client"
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import { Edit, Trash, Download, Upload, FileText, AlertCircle, CheckCircle, XCircle, Info, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


interface Commission {
  id: number;
  tenant_id: number;
  university_id: number;
  study_level_id: number;
  tenant_commission: string;
  commission_type: string;
  remark: string;
  created_at: string;
  updated_at: string;
  university_name: string;
  study_level_name: string;
  no_of_installments: string;
}

interface ApiResponse {
  success: boolean;
  data: Commission[];
}

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
  };
}

type SortField = keyof Commission | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  study_level_name: string;
  university_name: string;
  commission_type: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  studyLevels: string[];
  universityNames: string[];
  commissionTypes: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  studyLevels,
  universityNames,
  commissionTypes,
}) => {
  const [selectedStudyLevel, setSelectedStudyLevel] = useState<string>("all");
  const [selectedUniversityName, setSelectedUniversityName] = useState<string>("all");
  const [selectedCommissionType, setSelectedCommissionType] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      study_level_name: selectedStudyLevel,
      university_name: selectedUniversityName,
      commission_type: selectedCommissionType,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedStudyLevel("all");
    setSelectedUniversityName("all");
    setSelectedCommissionType("all");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Commissions
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* University Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              University Name
            </label>
            <select
              value={selectedUniversityName}
              onChange={(e) => setSelectedUniversityName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Universities</option>
              {universityNames.map((university) => (
                <option key={university} value={university}>
                  {university}
                </option>
              ))}
            </select>
          </div>

          {/* Study Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Study Level
            </label>
            <select
              value={selectedStudyLevel}
              onChange={(e) => setSelectedStudyLevel(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Study Levels</option>
              {studyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Commission Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Commission Type
            </label>
            <select
              value={selectedCommissionType}
              onChange={(e) => setSelectedCommissionType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Types</option>
              {commissionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CommissionsTable() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    study_level_name: "all",
    university_name: "all",
    commission_type: "all",
  });

  // Import/Export states
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {token} = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch commissions from API
  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${BASE_URL}/tenant/agent/commissions`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data: ApiResponse = await response.json();
        
        setCommissions(data.data);
      } catch (err) {
        console.error('Error fetching commissions:', err);
        setError('Failed to load commissions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommissions();
  }, [BASE_URL, token]);

  // Get unique values for filters
  const studyLevels = useMemo(() => {
    return Array.from(new Set(commissions.map(commission => commission.study_level_name)));
  }, [commissions]);

  const universityNames = useMemo(() => {
    return Array.from(new Set(commissions.map(commission => commission.university_name)));
  }, [commissions]);

  const commissionTypes = useMemo(() => {
    return Array.from(new Set(commissions.map(commission => commission.commission_type)));
  }, [commissions]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = commissions.filter((commission) => {
      const matchesSearch = 
        commission.university_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.study_level_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.tenant_commission.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.remark.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.commission_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStudyLevel = filters.study_level_name === "all" || commission.study_level_name === filters.study_level_name;
      const matchesUniversityName = filters.university_name === "all" || commission.university_name === filters.university_name;
      const matchesCommissionType = filters.commission_type === "all" || commission.commission_type === filters.commission_type;
      
      return matchesSearch && matchesStudyLevel && matchesUniversityName && matchesCommissionType;
    });

    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [commissions, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: keyof Commission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Commission) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getCommissionDisplay = (commission: Commission) => {
    if (commission.commission_type === "percentage") {
      return `${commission.tenant_commission}%`;
    } else {
      return `$${commission.tenant_commission}`;
    }
  };

  const getCommissionColor = (commission: Commission) => {
    if (commission.commission_type === "percentage") {
      const percentage = parseFloat(commission.tenant_commission);
      if (percentage >= 15) return "success";
      if (percentage >= 10) return "warning";
      return "error";
    } else {
      const amount = parseFloat(commission.tenant_commission);
      if (amount >= 1000) return "success";
      if (amount >= 500) return "warning";
      return "error";
    }
  };

  const getCommissionTypeColor = (type: string) => {
    return type === "percentage" ? "info" : "primary";
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.study_level_name !== "all" || 
                          filters.university_name !== "all" || 
                          filters.commission_type !== "all";

  const clearAllFilters = () => {
    setFilters({
      study_level_name: "all",
      university_name: "all",
      commission_type: "all",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this commission?")) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/tenant/agent/commissions/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        setCommissions(prev => prev.filter(commission => commission.id !== id));
      } else {
        throw new Error('Failed to delete commission');
      }
    } catch (err) {
      console.error('Error deleting commission:', err);
      alert('Failed to delete commission. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Export functionality
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const response = await fetch(`${BASE_URL}/tenant/export/commissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'university_commissions.xlsx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export commissions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export filtered data
  const handleExportFiltered = async () => {
    try {
      setIsExporting(true);
      
      // Build query params from current filters
      const params = new URLSearchParams();
      
      const selectedUniversity = universityNames.find(u => u === filters.university_name);
      if (selectedUniversity && filters.university_name !== 'all') {
        const university = commissions.find(c => c.university_name === selectedUniversity);
        if (university) {
          params.append('university_id', university.university_id.toString());
        }
      }
      
      if (filters.study_level_name !== 'all') {
        const studyLevel = commissions.find(c => c.study_level_name === filters.study_level_name);
        if (studyLevel) {
          params.append('study_level_id', studyLevel.study_level_id.toString());
        }
      }
      
      if (filters.commission_type !== 'all') {
        params.append('commission_type', filters.commission_type);
      }

      const response = await fetch(`${BASE_URL}/tenant/export/commissions/filtered?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Filtered export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filtered_commissions_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Filtered export error:', err);
      alert('Failed to export filtered commissions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Import functionality
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setIsImportModalOpen(true);
    }
  };

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
        setIsImportModalOpen(false);
        
        // Refresh the commissions list
        const refreshResponse = await fetch(`${BASE_URL}/tenant/agent/commissions`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const refreshData: ApiResponse = await refreshResponse.json();
        setCommissions(refreshData.data);
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

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/tenant/commissions/template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // For template info, we're just showing the structure
      const data = await response.json();
      alert('Template information:\n\n' + 
            'Required columns: ' + data.data.required_fields.join(', ') + '\n\n' +
            'Notes:\n- ' + data.data.notes.join('\n- '));
    } catch (err) {
      console.error('Template fetch error:', err);
      alert('Failed to fetch template information');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading commissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-800 dark:text-red-200 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by university, study level, commission, or remark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
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

          {/* Export Button with Dropdown */}
          <div className="relative group">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-7 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-50">
              <button
                onClick={handleExport}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export All
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleExportFiltered}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export Filtered
                </button>
              )}
              <button
                onClick={handleDownloadTemplate}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Template Info
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          )}
          
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Apply Filters
          </button>
          
          <Link href={"/admin/partners/accounts/commission/add"}>
            <button className="dark:border-green-500 h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </Link>
        </div>
      </div>

      {/* Import Result Display */}
      {importResult && (
        <div className={`rounded-lg p-4 ${
          importResult.errors === 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {importResult.errors === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <h3 className={`text-sm font-medium ${
                  importResult.errors === 0 ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  Import {importResult.errors === 0 ? 'Successful' : 'Completed with Warnings'}
                </h3>
                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>Processed: {importResult.total_rows_processed} rows</p>
                  <p>Inserted: {importResult.inserted} | Updated: {importResult.updated}</p>
                  {importResult.errors > 0 && (
                    <p className="text-red-600 dark:text-red-400">Errors: {importResult.errors}</p>
                  )}
                  {importResult.warnings > 0 && (
                    <p className="text-yellow-600 dark:text-yellow-400">Warnings: {importResult.warnings}</p>
                  )}
                </div>
                {importResult.details.errors.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => alert(importResult.details.errors.join('\n'))}
                      className="text-sm text-red-600 dark:text-red-400 underline"
                    >
                      View Errors
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setImportResult(null)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.university_name !== "all" && (
            <Badge size="sm" color="primary">
              University: {filters.university_name}
            </Badge>
          )}
          {filters.study_level_name !== "all" && (
            <Badge size="sm" color="primary">
              Study Level: {filters.study_level_name}
            </Badge>
          )}
          {filters.commission_type !== "all" && (
            <Badge size="sm" color="primary">
              Type: {filters.commission_type}
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    { key: "id", label: "ID" },
                    { key: "university_name", label: "University Name" },
                    { key: "study_level_name", label: "Study Level" },
                    { key: "commission_type", label: "Type" },
                    { key: "tenant_commission", label: "Tenant Commission" },
                    { key: "no_of_installments", label: "No of Installment" },
                    { key: "remark", label: "Remark" },
                    { key: "created_at", label: "Created" },
                    { key: "action", label: "Action" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => key !== "action" ? handleSort(key as keyof Commission) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== "action" && (
                          <span className="text-xs">{getSortIcon(key as keyof Commission)}</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((commission) => (
                    <TableRow key={commission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          #{commission.id}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {commission.university_name}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color="info">
                          {commission.study_level_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={getCommissionTypeColor(commission.commission_type)}>
                          {commission.commission_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getCommissionColor(commission)}
                        >
                          {getCommissionDisplay(commission)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-600 text-theme-sm dark:text-gray-400 max-w-[200px] truncate">
                          {commission.no_of_installments}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-600 text-theme-sm dark:text-gray-400 max-w-[200px] truncate">
                          {commission.remark}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(commission.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Link
                            href={'/admin/partners/accounts/commission/edit/'+commission.id}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit size={18}/>
                          </Link>
                          <button
                            onClick={() => handleDelete(commission.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash size={18}/>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      No commissions found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedData.length} of {commissions.length} commissions
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        studyLevels={studyLevels}
        universityNames={universityNames}
        commissionTypes={commissionTypes}
      />

      {/* Import Modal */}
      {isImportModalOpen && importFile && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            setImportFile(null);
          }}
          onValidate={handleValidate}
          onImport={handleImport}
          fileName={importFile.name}
          isValidating={isValidating}
          isImporting={isImporting}
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

    </div>

      
  );
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: () => void;
  onImport: () => void;
  fileName: string;
  isValidating: boolean;
  isImporting: boolean;
  validationResult: any;
}

function ImportModal({
  isOpen,
  onClose,
  onValidate,
  onImport,
  fileName,
  isValidating,
  isImporting,
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
            disabled={isValidating || isImporting}
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* File Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Selected file: <span className="font-medium text-gray-800 dark:text-white">{fileName}</span>
            </p>
          </div>

          {/* Warning Message */}
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

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isValidating || isImporting}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onValidate}
              disabled={isValidating || isImporting}
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
            <button
              onClick={onImport}
              disabled={isValidating || isImporting || !validationResult}
              className="flex-1 px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-hidden focus:ring-2 focus:ring-green-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Now'
              )}
            </button>
          </div>

          {/* Validation Result Summary */}
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
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {validationResult.summary.total_to_process}
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

          {/* Operation Summary */}
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

          {/* Errors Section */}
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

          {/* Warnings Section */}
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

          {/* New Commissions Preview */}
          {validationResult.new_commissions.length > 0 && (
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

          {/* Updated Commissions Preview */}
          {validationResult.updated_commissions.length > 0 && (
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

          {/* Action Buttons */}
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