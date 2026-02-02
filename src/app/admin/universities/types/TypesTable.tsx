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
import { Edit, Trash, Plus, Building, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UniversityType {
  id: number;
  name: string;
  slug: string;
}

interface ApiResponse {
  success: boolean;
  data: UniversityType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}

interface AddEditTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (typeData: { name: string }) => Promise<void>;
  mode: "add" | "edit";
  initialData?: UniversityType;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

interface AlertMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="dark:bg-dark-900 h-9 rounded-lg border border-gray-200 bg-transparent px-3 py-1 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          {[5, 10, 20, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`flex items-center justify-center min-w-9 h-9 px-3 rounded-lg border ${
              currentPage === pageNum
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const AddEditTypeModal: React.FC<AddEditTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
      });
    } else {
      setFormData({
        name: "",
      });
    }
    setError(null); // Clear error when modal opens
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("University type name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setError(error.message || "Failed to save university type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: initialData?.name || "",
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
            {mode === "add" ? "Add New University Type" : "Edit University Type"}
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
            {/* University Type Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                University Type Name *
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <Building size={18} />
                </span>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    setError(null); // Clear error on input change
                  }}
                  placeholder="e.g., Community, Deemed, Private, Public"
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The slug will be automatically generated from the name
              </p>
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
              disabled={isSubmitting || !formData.name.trim()}
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
                mode === "add" ? "Add Type" : "Update Type"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

type SortDirection = "asc" | "desc";

export default function UniversityTypesTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<keyof UniversityType>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<UniversityType | null>(null);
  const [universityTypes, setUniversityTypes] = useState<UniversityType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const { token } = useAuth();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
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

  // Fetch university types from API with pagination
  const fetchUniversityTypes = async (page: number = currentPage, limit: number = itemsPerPage) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      // Add search parameter if search term exists
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm);
      }
      
      // Add sorting parameters if needed
      if (sortField) {
        queryParams.append('sortBy', sortField);
        queryParams.append('sortOrder', sortDirection);
      }

      const response = await fetch(
        `${BASE_URL}/tenant/option/apply_tenant_university_types?${queryParams}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch university types: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setUniversityTypes(result.data);
        
        // Update pagination meta if available
        if (result) {
          setTotalItems(result.total);
          setCurrentPage(result.page);
          setTotalPages(result.totalPages);
          if (result.limit !== limit) {
            setItemsPerPage(result.limit);
          }
        } 
      } else {
        throw new Error('Failed to fetch university types');
      }
    } catch (err) {
      console.error('Error fetching university types:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch university types');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    // Reset to first page when search term changes
    if (searchTerm) {
      setCurrentPage(1);
    }
    
    // Use debounce for search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchUniversityTypes(currentPage, itemsPerPage);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  // Filter data client-side for current page
  const filteredData = useMemo(() => {
    return universityTypes.filter((type) => {
      const matchesSearch = 
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.slug.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [universityTypes, searchTerm]);

  // Sort data client-side
  const filteredAndSortedData = useMemo(() => {
    const dataToSort = [...filteredData];
    
    if (sortField) {
      dataToSort.sort((a, b) => {
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

    return dataToSort;
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (field: keyof UniversityType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof UniversityType) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getTypeColor = (slug: string) => {
    switch (slug) {
      case "community":
        return "primary";
      case "deemed":
        return "success";
      case "private":
        return "warning";
      case "public":
        return "info";
      default:
        return "primary";
    }
  };

  const handleAddType = async (typeData: { name: string }) => {
    try {
      const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_university_types`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeData),
      });

      const result: ApiResponse = await response.json();
      
      if (response.ok && result.success) {
        // Refresh the university types list
        await fetchUniversityTypes(currentPage, itemsPerPage);
        addAlert('success', 'University type added successfully!');
      } else {
        // Handle API error
        const errorMessage = result.message || `Failed to add university type: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error adding university type:', error);
      addAlert('error', error.message || 'Failed to add university type');
      throw error; // Re-throw to handle in modal
    }
  };

  const handleEditType = async (typeData: { name: string }) => {
    if (!selectedType) return;

    try {
      const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_university_types/${selectedType.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeData),
      });

      const result: ApiResponse = await response.json();
      
      if (response.ok && result.success) {
        // Refresh the university types list
        await fetchUniversityTypes(currentPage, itemsPerPage);
        setSelectedType(null);
        addAlert('success', 'University type updated successfully!');
      } else {
        // Handle API error
        const errorMessage = result.message || `Failed to update university type: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error updating university type:', error);
      addAlert('error', error.message || 'Failed to update university type');
      throw error; // Re-throw to handle in modal
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this university type? This action cannot be undone.")) {
      try {
        const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_university_types/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result: ApiResponse = await response.json();
        
        if (response.ok && result.success) {
          // Refresh the university types list
          await fetchUniversityTypes(currentPage, itemsPerPage);
          addAlert('success', 'University type deleted successfully!');
        } else {
          // Handle specific 409 Conflict error
          if (response.status === 409) {
            const errorMessage = result.message || "This University Type is already used in universities. Please update universities first.";
            addAlert('error', errorMessage);
          } else {
            // Handle other API errors
            const errorMessage = result.message || `Failed to delete university type: ${response.status}`;
            addAlert('error', errorMessage);
          }
        }
      } catch (error: any) {
        console.error('Error deleting university type:', error);
        addAlert('error', 'Failed to delete university type. Please try again.');
      }
    }
  };

  const handleEditClick = (type: UniversityType) => {
    setSelectedType(type);
    setIsEditModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedType(null);
    setIsAddModalOpen(true);
  };

  // Alert component
  const AlertDisplay = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-md">
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
          <span className="text-gray-600 dark:text-gray-400">Loading university types...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error Loading University Types</div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => fetchUniversityTypes(currentPage, itemsPerPage)}
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
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Types</div>
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
              {universityTypes.length} / {itemsPerPage}
            </div>
          </div>
        </div>

        {/* Search and Add Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by type name or slug..."
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

          {/* Add Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddClick}
              className="dark:border-green-500 h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Type
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
                      { key: "name", label: "University Type" },
                      { key: "slug", label: "Slug" },
                      { key: "action", label: "Action" },
                    ].map(({ key, label }) => (
                      <TableCell
                        key={key}
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => key !== "action" ? handleSort(key as keyof UniversityType) : undefined}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {key !== "action" && (
                            <span className="text-xs">{getSortIcon(key as keyof UniversityType)}</span>
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredAndSortedData.length > 0 ? (
                    filteredAndSortedData.map((type) => (
                      <TableRow key={type.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Building size={16} className="text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {type.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            size="sm"
                            color={getTypeColor(type.slug)}
                          >
                            {type.slug}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(type)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit University Type"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete University Type"
                            >
                              <Trash size={18} />
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
                        {searchTerm ? "No university types found matching your search." : "No university types available."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
        />

        {/* Add Modal */}
        <AddEditTypeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddType}
          mode="add"
        />

        {/* Edit Modal */}
        <AddEditTypeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedType(null);
          }}
          onSave={handleEditType}
          mode="edit"
          initialData={selectedType || undefined}
        />
      </div>
    </>
  );
}