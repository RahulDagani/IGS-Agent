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
import { Edit, Trash, Plus, Building } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UniversityType {
  id: number;
  name: string;
  slug: string;
}

interface AddEditTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (typeData: { name: string }) => void;
  mode: "add" | "edit";
  initialData?: UniversityType;
}

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
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving university type:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: initialData?.name || "",
    });
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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


export default function UniversityTypesTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<keyof UniversityType>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<UniversityType | null>(null);
  const [universityTypes, setUniversityTypes] = useState<UniversityType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
      const {token} = useAuth();


  // Fetch university types from API
  const fetchUniversityTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Replace with your actual token

      const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_partner_types`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })

      if (!response.ok) {
        throw new Error(`Failed to fetch university types: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUniversityTypes(result.data);
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

  useEffect(() => {
    fetchUniversityTypes();
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = universityTypes.filter((type) => {
      const matchesSearch = 
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.slug.toLowerCase().includes(searchTerm.toLowerCase());
      
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
  }, [universityTypes, searchTerm, sortField, sortDirection]);

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

      if (!response.ok) {
        throw new Error(`Failed to add university type: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the university types list
        await fetchUniversityTypes();
      } else {
        throw new Error('Failed to add university type');
      }
    } catch (error) {
      console.error('Error adding university type:', error);
      throw error;
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

      if (!response.ok) {
        throw new Error(`Failed to update university type: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the university types list
        await fetchUniversityTypes();
        setSelectedType(null);
      } else {
        throw new Error('Failed to update university type');
      }
    } catch (error) {
      console.error('Error updating university type:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this university type? This action cannot be undone.")) {
      try {
        
        
        const response = await fetch(`${BASE_URL}/tenant/university/types/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete university type: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          // Refresh the university types list
          await fetchUniversityTypes();
        } else {
          throw new Error('Failed to delete university type');
        }
      } catch (error) {
        console.error('Error deleting university type:', error);
        alert('Failed to delete university type. Please try again.');
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
            onClick={fetchUniversityTypes}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Types</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {filteredAndSortedData.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Community</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {filteredAndSortedData.filter(d => d.slug === 'community').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Deemed</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredAndSortedData.filter(d => d.slug === 'deemed').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Other Types</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {filteredAndSortedData.filter(d => !['community', 'deemed'].includes(d.slug)).length}
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
                    { key: "id", label: "ID" },
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
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          #{type.id}
                        </div>
                      </TableCell>
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

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedData.length} of {universityTypes.length} university types
      </div>

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
  );
}

type SortDirection = "asc" | "desc";