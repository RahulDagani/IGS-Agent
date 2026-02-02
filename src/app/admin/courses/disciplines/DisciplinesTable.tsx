"use client"
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Edit, Trash, Plus, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StudyLevel {
  id: number;
  name: string;
  slug: string;
}

interface Discipline {
  id: number;
  name: string;
  study_level_id: number;
  study_level_name?: string;
  slug?: string;
  created_at?: string;
}

interface ApiResponse {
  success: boolean;
  data: Discipline[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  message?: string;
}

interface AddEditDisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (disciplineData: { name: string; study_level_id: number }) => Promise<void>;
  mode: "add" | "edit";
  initialData?: Discipline;
  studyLevels: StudyLevel[];
}

interface AlertMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const AddEditDisciplineModal: React.FC<AddEditDisciplineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData,
  studyLevels,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    study_level_id: initialData?.study_level_id || studyLevels[0]?.id || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        study_level_id: initialData.study_level_id,
      });
    } else {
      setFormData({
        name: "",
        study_level_id: studyLevels[0]?.id || 0,
      });
    }
    setError(null); // Clear error when modal opens
  }, [initialData, studyLevels, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.study_level_id) {
      setError("All fields are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setError(error.message || "Failed to save discipline");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: initialData?.name || "",
      study_level_id: initialData?.study_level_id || studyLevels[0]?.id || 0,
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-999999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {mode === "add" ? "Add New Discipline" : "Edit Discipline"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Study Level */}
            <div>
              <label htmlFor="study_level_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Study Level *
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <BookOpen size={18} />
                </span>
                <select
                  id="study_level_id"
                  value={formData.study_level_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, study_level_id: parseInt(e.target.value) }))}
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                >
                  <option value="">Select Study Level</option>
                  {studyLevels.map((studyLevel) => (
                    <option key={studyLevel.id} value={studyLevel.id}>
                      {studyLevel.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Discipline Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Discipline Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setError(null); // Clear error on input change
                }}
                placeholder="e.g., Computer Science, Business Administration"
                required
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim() || !formData.study_level_id}
              className="flex-1 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === "add" ? "Adding..." : "Updating..."}
                </div>
              ) : (
                mode === "add" ? "Add Discipline" : "Update Discipline"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function DisciplinesTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Discipline>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [studyLevels, setStudyLevels] = useState<StudyLevel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const { token } = useAuth();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Function to add alert
  const addAlert = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    const newAlert: AlertMessage = { id, type, message };
    setAlerts(prev => [newAlert, ...prev]);
    
    // Auto remove alert after 5 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  };

  // Function to remove alert
  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Fetch disciplines from API with pagination
  const fetchDisciplines = async (page: number = currentPage, search: string = searchTerm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = new URL(`${BASE_URL}/tenant/option/apply_tenant_disciplines`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      
      if (search.trim()) {
        url.searchParams.append('search', search);
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch disciplines: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setDisciplines(result.data);
        
        // Handle pagination data
        if (result) {
          setTotalItems(result.total);
          setTotalPages(result.totalPages);
          setCurrentPage(result.page);
          // Update limit if it's different from pagination limit
          if (result.limit !== limit) {
            setLimit(result.limit);
          }
        } 
      } else {
        throw new Error('Failed to fetch disciplines');
      }
    } catch (err) {
      console.error('Error fetching disciplines:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch disciplines');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch study levels from API
  const fetchStudyLevels = async () => {
    try {
      const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_study_levels`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch study levels: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setStudyLevels(result.data);
      } else {
        throw new Error('Failed to fetch study levels');
      }
    } catch (err) {
      console.error('Error fetching study levels:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchDisciplines(), fetchStudyLevels()]);
    };
    fetchData();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        fetchDisciplines(1, searchTerm);
      } else {
        fetchDisciplines(1);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
    fetchDisciplines(1, searchTerm);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchDisciplines(page, searchTerm);
  };

  // Filter and sort data (client-side for current page)
  const filteredAndSortedData = useMemo(() => {
    const filtered = disciplines.filter((discipline) => {
      const matchesSearch = 
        discipline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (discipline.study_level_name && discipline.study_level_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (discipline.slug && discipline.slug.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
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
        if (aValue && bValue) {
          if (aValue < bValue) {
            return sortDirection === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortDirection === "asc" ? 1 : -1;
          }
        }
        
        return 0;
      });
    }

    return filtered;
  }, [disciplines, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof Discipline) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Discipline) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStudyLevelColor = (studyLevelName: string) => {
    const studyLevel = studyLevels.find(sl => sl.name === studyLevelName);
    if (!studyLevel) return "primary";

    switch (studyLevel.slug) {
      case "bachelors":
        return "primary";
      case "masters":
        return "success";
      case "phd":
        return "warning";
      case "diploma":
        return "info";
      case "certificate":
        return "success";
      default:
        return "primary";
    }
  };

  const getStudyLevelName = (studyLevelId: number) => {
    const studyLevel = studyLevels.find(sl => sl.id === studyLevelId);
    return studyLevel ? studyLevel.name : "Unknown";
  };

  const handleAddDiscipline = async (disciplineData: { name: string; study_level_id: number }) => {
    try {
      const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_disciplines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(disciplineData),
      });

      const result: ApiResponse = await response.json();
      
      if (response.ok && result.success) {
        // Refresh the disciplines list
        await fetchDisciplines(currentPage, searchTerm);
        addAlert('success', 'Discipline added successfully!');
      } else {
        // Handle API error
        const errorMessage = result.message || `Failed to add discipline: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error adding discipline:', error);
      addAlert('error', error.message || 'Failed to add discipline');
      throw error; // Re-throw to handle in modal
    }
  };

  const handleEditDiscipline = async (disciplineData: { name: string; study_level_id: number }) => {
    if (!selectedDiscipline) return;

    try {
      const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_disciplines/${selectedDiscipline.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(disciplineData),
      });

      const result: ApiResponse = await response.json();
      
      if (response.ok && result.success) {
        // Refresh the disciplines list
        await fetchDisciplines(currentPage, searchTerm);
        setSelectedDiscipline(null);
        addAlert('success', 'Discipline updated successfully!');
      } else {
        // Handle API error
        const errorMessage = result.message || `Failed to update discipline: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error updating discipline:', error);
      addAlert('error', error.message || 'Failed to update discipline');
      throw error; // Re-throw to handle in modal
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this discipline? This action cannot be undone.")) {
      try {
        const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_disciplines/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result: ApiResponse = await response.json();
        
        if (response.ok && result.success) {
          // Refresh the disciplines list
          await fetchDisciplines(currentPage, searchTerm);
          addAlert('success', 'Discipline deleted successfully!');
        } else {
          // Handle specific 409 Conflict error
          if (response.status === 409) {
            const errorMessage = result.message || "This Discipline is already used in courses. Please update courses first.";
            addAlert('error', errorMessage);
          } else {
            // Handle other API errors
            const errorMessage = result.message || `Failed to delete discipline: ${response.status}`;
            addAlert('error', errorMessage);
          }
        }
      } catch (error: any) {
        console.error('Error deleting discipline:', error);
        addAlert('error', 'Failed to delete discipline. Please try again.');
      }
    }
  };

  const handleEditClick = (discipline: Discipline) => {
    setSelectedDiscipline(discipline);
    setIsEditModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedDiscipline(null);
    setIsAddModalOpen(true);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = currentPage - half;
      let end = currentPage + half;
      
      if (start < 1) {
        start = 1;
        end = maxVisiblePages;
      }
      
      if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Alert component
  const AlertDisplay = () => (
    <div className=" z-50 space-y-2 w-full">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg shadow-lg border flex items-start gap-3 ${
            alert.type === 'success'
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50'
              : alert.type === 'error'
              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50'
              : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50'
          }`}
        >
          {alert.type === 'success' && (
            <svg className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {alert.type === 'error' && (
            <svg className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              alert.type === 'success'
                ? 'text-green-800 dark:text-green-300'
                : alert.type === 'error'
                ? 'text-red-800 dark:text-red-300'
                : 'text-blue-800 dark:text-blue-300'
            }`}>
              {alert.message}
            </p>
          </div>
          <button
            onClick={() => removeAlert(alert.id)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Loading disciplines...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error Loading Disciplines</div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => fetchDisciplines(currentPage, searchTerm)}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertDisplay />
      <div className="space-y-4">

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Disciplines</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {totalItems}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Current Page</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentPage}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Showing</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {disciplines.length} / {limit}
            </div>
          </div>
        </div>

        {/* Search, Add Controls, and Pagination Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by discipline name or study level..."
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

          {/* Add Button and Items Per Page */}
          <div className="flex items-center gap-3">
            {/* Items Per Page Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="h-10 px-3 rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            {/* Add Button */}
            <button
              onClick={handleAddClick}
              className="dark:border-green-500 h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Discipline
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {[
                      // { key: "id", label: "ID" },
                      { key: "name", label: "Discipline" },
                      { key: "study_level_id", label: "Study Level" },
                      { key: "action", label: "Action" },
                    ].map(({ key, label }) => (
                      <TableCell
                        key={key}
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => key !== "action" ? handleSort(key as keyof Discipline) : undefined}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {key !== "action" && (
                            <span className="text-xs">{getSortIcon(key as keyof Discipline)}</span>
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredAndSortedData.length > 0 ? (
                    filteredAndSortedData.map((discipline) => {
                      const studyLevelName = getStudyLevelName(discipline.study_level_id);
                      return (
                        <TableRow key={discipline.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="px-5 py-4 text-start">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <BookOpen size={16} className="text-gray-600 dark:text-gray-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {discipline.name}
                                </span>
                                {discipline.slug && (
                                  <Badge
                                    size="sm"
                                    color="primary"
                                  >
                                    {discipline.slug}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                            <Badge
                              size="sm"
                              color={getStudyLevelColor(studyLevelName)}
                            >
                              {studyLevelName}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditClick(discipline)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Edit Discipline"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(discipline.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete Discipline"
                              >
                                <Trash size={18} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        {searchTerm ? "No disciplines found matching your search." : "No disciplines available."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Results Count */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {disciplines.length} of {totalItems} disciplines (Page {currentPage} of {totalPages})
          </div>
          
          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              title="First Page"
            >
              <ChevronsLeft size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              title="Previous Page"
            >
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Page Numbers */}
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`h-10 w-10 flex items-center justify-center rounded-lg border text-sm font-medium ${
                  currentPage === pageNum
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              title="Next Page"
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              title="Last Page"
            >
              <ChevronsRight size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Add Modal */}
        <AddEditDisciplineModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddDiscipline}
          mode="add"
          studyLevels={studyLevels}
        />

        {/* Edit Modal */}
        <AddEditDisciplineModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDiscipline(null);
          }}
          onSave={handleEditDiscipline}
          mode="edit"
          initialData={selectedDiscipline || undefined}
          studyLevels={studyLevels}
        />
      </div>
    </>
  );
}

type SortDirection = "asc" | "desc";