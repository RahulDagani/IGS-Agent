"use client"
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash, Plus, MapPin } from "lucide-react";

interface Country {
  id: number;
  uuid: string;
  country: string;
  country_slug: string;
  created_at: string;
  updated_at: string;
}

type SortField = keyof Country | "";
type SortDirection = "asc" | "desc";

interface AddEditCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (countryData: { country: string }) => Promise<void>;
  mode: "add" | "edit";
  initialData?: Country;
}

const AddEditCountryModal: React.FC<AddEditCountryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    country: initialData?.country || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        country: initialData.country,
      });
    } else {
      setFormData({
        country: "",
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country.trim()) {
      setError("Country name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error: unknown) {

      console.error('Error saving country:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to save country');
      } else {
        setError('Failed to save country');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      country: initialData?.country || "",
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {mode === "add" ? "Add New Country" : "Edit Country"}
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Country Name */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Country Name *
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <MapPin size={18} />
                </span>
                <input
                  type="text"
                  id="country"
                  value={formData.country}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, country: e.target.value }));
                    setError(null);
                  }}
                  placeholder="e.g., United States, United Kingdom"
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
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
              disabled={isSubmitting || !formData.country.trim()}
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
                mode === "add" ? "Add Country" : "Update Country"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// API service functions
const countryService = {
  async getCountries(search?: string): Promise<Country[]> {
    const url = search ? `/api/university/countries?search=${encodeURIComponent(search)}` : '/api/university/countries';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    
    const result = await response.json();
    return result.data;
  },

  async createCountry(countryData: { country: string }): Promise<Country> {
    const response = await fetch('/api/university/countries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(countryData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create country');
    }
    
    return result.data;
  },

  async updateCountry(id: number, countryData: { country: string }): Promise<Country> {
    const response = await fetch(`/api/university/countries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(countryData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update country');
    }
    
    return result.data;
  },

  async deleteCountry(id: number): Promise<void> {
    const response = await fetch(`/api/university/countries/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to delete country');
    }
  },
};

export default function CountriesTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load countries on component mount and when search term changes
  useEffect(() => {
    loadCountries();
  }, [searchTerm]);

  const loadCountries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await countryService.getCountries(searchTerm);
      setCountries(data);
    } catch (err: unknown) {
      console.error('Error saving country:', error);
    if (err instanceof Error) {
      setError(err.message || 'Failed to load countries');
    } else {
      setError('Failed to load countries');
    }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = [...countries];

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
  }, [countries, sortField, sortDirection]);

  const handleSort = (field: keyof Country) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Country) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddCountry = async (countryData: { country: string }) => {
    await countryService.createCountry(countryData);
    await loadCountries(); // Refresh the list
  };

  const handleEditCountry = async (countryData: { country: string }) => {
    if (!selectedCountry) return;
    await countryService.updateCountry(selectedCountry.id, countryData);
    await loadCountries(); // Refresh the list
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this country? This action cannot be undone.")) {
      try {
        await countryService.deleteCountry(id);
        await loadCountries(); // Refresh the list
      } catch (error: unknown) {
        

        console.error('Error saving country:', error);
        if (error instanceof Error) {
            alert(error.message || 'Failed to delete country');
        } else {
          alert('Failed to delete country');

        }
      }
    }
  };

  const handleEditClick = (country: Country) => {
    setSelectedCountry(country);
    setIsEditModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedCountry(null);
    setIsAddModalOpen(true);
  };

  // Count countries by region (you might want to make this dynamic based on actual regions)
  const getRegionCounts = () => {
    const northAmerica = ["United States", "Canada", "Mexico"];
    const europe = ["United Kingdom", "Germany", "France", "Italy", "Spain"];
    
    return {
      northAmerica: filteredAndSortedData.filter(c => 
        northAmerica.includes(c.country)
      ).length,
      europe: filteredAndSortedData.filter(c => 
        europe.includes(c.country)
      ).length,
    };
  };

  const regionCounts = getRegionCounts();

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Countries</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {isLoading ? "..." : filteredAndSortedData.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">North America</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {isLoading ? "..." : regionCounts.northAmerica}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Europe</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {isLoading ? "..." : regionCounts.europe}
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
              placeholder="Search by country name..."
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
            Add Country
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
                    { key: "country", label: "Country" },
                    { key: "country_slug", label: "Slug" },
                    { key: "created_at", label: "Created At" },
                    { key: "action", label: "Action" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => key !== "action" ? handleSort(key as keyof Country) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== "action" && (
                          <span className="text-xs">{getSortIcon(key as keyof Country)}</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell
              
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      Loading countries...
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((country) => (
                    <TableRow key={country.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          #{country.id}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <MapPin size={16} className="text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {country.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-500 text-theme-sm dark:text-gray-400 font-mono">
                          {country.country_slug}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(country.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(country)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit Country"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(country.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Country"
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
                      {searchTerm ? "No countries found matching your search." : "No countries available."}
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
        {isLoading ? "Loading..." : `Showing ${filteredAndSortedData.length} of ${countries.length} countries`}
      </div>

      {/* Add Modal */}
      <AddEditCountryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCountry}
        mode="add"
      />

      {/* Edit Modal */}
      <AddEditCountryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCountry(null);
        }}
        onSave={handleEditCountry}
        mode="edit"
        initialData={selectedCountry || undefined}
      />
    </div>
  );
}