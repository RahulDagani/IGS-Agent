"use client"
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash, Plus, MapPin } from "lucide-react";

interface State {
  id: number;
  country: string;
  state: string;
  createdAt: string;
}

// Define the table data using the interface
const tableData: State[] = [
  {
    id: 1,
    country: "United States",
    state: "California",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    country: "United States",
    state: "New York",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    country: "Canada",
    state: "Ontario",
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    country: "United Kingdom",
    state: "England",
    createdAt: "2024-04-05",
  },
  {
    id: 5,
    country: "Australia",
    state: "New South Wales",
    createdAt: "2024-01-28",
  },
  {
    id: 6,
    country: "Germany",
    state: "Bavaria",
    createdAt: "2024-05-15",
  },
];

// Available countries for the select box
const availableCountries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "India",
  "Brazil",
  "Mexico"
];

type SortField = keyof State | "";
type SortDirection = "asc" | "desc";

interface AddEditStateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stateData: { country: string; state: string }) => void;
  mode: "add" | "edit";
  initialData?: State;
}

const AddEditStateModal: React.FC<AddEditStateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    country: initialData?.country || "",
    state: initialData?.state || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        country: initialData.country,
        state: initialData.state,
      });
    } else {
      setFormData({
        country: "",
        state: "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country.trim() || !formData.state.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving state:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      country: initialData?.country || "",
      state: initialData?.state || "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-999999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {mode === "add" ? "Add New State" : "Edit State"}
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
            {/* Country Select */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Country *
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <MapPin size={18} />
                </span>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                >
                  <option value="">Select a country</option>
                  {availableCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* State Name */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                State Name *
              </label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="e.g., California, Ontario, England"
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
              disabled={isSubmitting || !formData.country.trim() || !formData.state.trim()}
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
                mode === "add" ? "Add State" : "Update State"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function StatesTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [states, setStates] = useState<State[]>(tableData);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = states.filter((state) => {
      const matchesSearch = 
        state.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        state.country.toLowerCase().includes(searchTerm.toLowerCase());
      
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
  }, [states, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof State) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof State) => {
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

  const handleAddState = async (stateData: { country: string; state: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newState: State = {
      id: Math.max(...states.map(s => s.id)) + 1,
      country: stateData.country,
      state: stateData.state,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setStates(prev => [...prev, newState]);
  };

  const handleEditState = async (stateData: { country: string; state: string }) => {
    if (!selectedState) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setStates(prev => prev.map(state =>
      state.id === selectedState.id
        ? { ...state, country: stateData.country, state: stateData.state }
        : state
    ));
    
    setSelectedState(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this state? This action cannot be undone.")) {
      setStates(prev => prev.filter(state => state.id !== id));
    }
  };

  const handleEditClick = (state: State) => {
    setSelectedState(state);
    setIsEditModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedState(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total States</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {filteredAndSortedData.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">United States</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {filteredAndSortedData.filter(s => s.country === 'United States').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Canada</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {filteredAndSortedData.filter(s => s.country === 'Canada').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Other Countries</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredAndSortedData.filter(s => !['United States', 'Canada'].includes(s.country)).length}
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
              placeholder="Search by state name or country..."
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
            Add State
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
                    { key: "state", label: "State" },
                    { key: "createdAt", label: "Created At" },
                    { key: "action", label: "Action" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => key !== "action" ? handleSort(key as keyof State) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== "action" && (
                          <span className="text-xs">{getSortIcon(key as keyof State)}</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((state) => (
                    <TableRow key={state.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          #{state.id}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {state.country}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <MapPin size={16} className="text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {state.state}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(state.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(state)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit State"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(state.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete State"
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
                      {searchTerm ? "No states found matching your search." : "No states available."}
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
        Showing {filteredAndSortedData.length} of {states.length} states
      </div>

      {/* Add Modal */}
      <AddEditStateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddState}
        mode="add"
      />

      {/* Edit Modal */}
      <AddEditStateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedState(null);
        }}
        onSave={handleEditState}
        mode="edit"
        initialData={selectedState || undefined}
      />
    </div>
  );
}