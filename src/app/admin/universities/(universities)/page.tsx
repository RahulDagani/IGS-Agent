"use client"
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import { Edit, Trash, Globe, Building2, Mail, MapPin } from "lucide-react";

interface University {
  id: number;
  name: string;
  country: string;
  type: string;
  email: string;
  address: string;
  status: "active" | "inactive";
  partnerType: string;
  createdAt: string;
}

// Define the table data using the interface
const tableData: University[] = [
  {
    id: 1,
    name: "Harvard University",
    country: "USA",
    type: "Private",
    email: "admissions@harvard.edu",
    address: "Cambridge, Massachusetts",
    status: "active",
    partnerType: "Exclusive Partner",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Stanford University",
    country: "USA",
    type: "Private",
    email: "admissions@stanford.edu",
    address: "Stanford, California",
    status: "active",
    partnerType: "Preferred Partner",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "University of Oxford",
    country: "UK",
    type: "Public",
    email: "admissions@ox.ac.uk",
    address: "Oxford, England",
    status: "active",
    partnerType: "Standard Partner",
    createdAt: "2024-01-28",
  },
  {
    id: 4,
    name: "University of Toronto",
    country: "Canada",
    type: "Public",
    email: "admissions@utoronto.ca",
    address: "Toronto, Ontario",
    status: "inactive",
    partnerType: "Tier 1 Partner",
    createdAt: "2024-03-10",
  },
  {
    id: 5,
    name: "University of Sydney",
    country: "Australia",
    type: "Public",
    email: "admissions@sydney.edu.au",
    address: "Sydney, NSW",
    status: "active",
    partnerType: "Tier 2 Partner",
    createdAt: "2024-02-05",
  },
  {
    id: 6,
    name: "MIT",
    country: "USA",
    type: "Private",
    email: "admissions@mit.edu",
    address: "Cambridge, Massachusetts",
    status: "active",
    partnerType: "Exclusive Partner",
    createdAt: "2024-01-20",
  },
  {
    id: 7,
    name: "Imperial College London",
    country: "UK",
    type: "Public",
    email: "admissions@imperial.ac.uk",
    address: "London, England",
    status: "inactive",
    partnerType: "Preferred Partner",
    createdAt: "2024-03-15",
  },
  {
    id: 8,
    name: "UBC",
    country: "Canada",
    type: "Public",
    email: "admissions@ubc.ca",
    address: "Vancouver, BC",
    status: "active",
    partnerType: "Standard Partner",
    createdAt: "2024-02-28",
  },
];

type SortField = keyof University | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  country: string;
  type: string;
  status: string;
  partnerType: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  countries: string[];
  types: string[];
  statuses: string[];
  partnerTypes: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  countries,
  types,
  statuses,
  partnerTypes,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPartnerType, setSelectedPartnerType] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      country: selectedCountry,
      type: selectedType,
      status: selectedStatus,
      partnerType: selectedPartnerType,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedCountry("all");
    setSelectedType("all");
    setSelectedStatus("all");
    setSelectedPartnerType("all");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-999999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Universities
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
          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* University Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              University Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Partner Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Partner Type
            </label>
            <select
              value={selectedPartnerType}
              onChange={(e) => setSelectedPartnerType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Partner Types</option>
              {partnerTypes.map((partnerType) => (
                <option key={partnerType} value={partnerType}>
                  {partnerType}
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

export default function UniversitiesTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    country: "all",
    type: "all",
    status: "all",
    partnerType: "all",
  });

  // Get unique values for filters
  const countries = useMemo(() => {
    return Array.from(new Set(tableData.map(university => university.country)));
  }, []);

  const types = useMemo(() => {
    return Array.from(new Set(tableData.map(university => university.type)));
  }, []);

  const statuses = useMemo(() => {
    return Array.from(new Set(tableData.map(university => university.status)));
  }, []);

  const partnerTypes = useMemo(() => {
    return Array.from(new Set(tableData.map(university => university.partnerType)));
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = tableData.filter((university) => {
      const matchesSearch = 
        university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.partnerType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = filters.country === "all" || university.country === filters.country;
      const matchesType = filters.type === "all" || university.type === filters.type;
      const matchesStatus = filters.status === "all" || university.status === filters.status;
      const matchesPartnerType = filters.partnerType === "all" || university.partnerType === filters.partnerType;
      
      return matchesSearch && matchesCountry && matchesType && matchesStatus && matchesPartnerType;
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
  }, [searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: keyof University) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof University) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusColor = (status: University["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "primary";
    }
  };

  const getPartnerTypeColor = (partnerType: string) => {
    switch (partnerType) {
      case "Exclusive Partner":
        return "success";
      case "Preferred Partner":
        return "warning";
      case "Tier 1 Partner":
        return "info";
      case "Tier 2 Partner":
        return "primary";
      default:
        return "primary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.country !== "all" || filters.type !== "all" || 
                          filters.status !== "all" || filters.partnerType !== "all";

  const clearAllFilters = () => {
    setFilters({
      country: "all",
      type: "all",
      status: "all",
      partnerType: "all",
    });
  };

  const handleDelete = (id: number) => {
    // Handle delete action
    console.log("Delete university:", id);
    // You can add confirmation modal here
    if (confirm("Are you sure you want to delete this university?")) {
      // Perform delete operation
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Universities</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {filteredAndSortedData.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredAndSortedData.filter(u => u.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Countries</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Array.from(new Set(filteredAndSortedData.map(u => u.country))).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Partner Types</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Array.from(new Set(filteredAndSortedData.map(u => u.partnerType))).length}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, country, email, address, or partner type..."
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

        {/* Filter Button and Active Filters */}
        <div className="flex items-center gap-3">
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
          <Link href="/admin/universities/add">
            <button className="dark:border-green-500 h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add University
            </button>
          </Link>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.country !== "all" && (
            <Badge size="sm" color="primary">
              Country: {filters.country}
            </Badge>
          )}
          {filters.type !== "all" && (
            <Badge size="sm" color="primary">
              Type: {filters.type}
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge size="sm" color="primary">
              Status: {filters.status}
            </Badge>
          )}
          {filters.partnerType !== "all" && (
            <Badge size="sm" color="primary">
              Partner: {filters.partnerType}
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    { key: "id", label: "ID" },
                    { key: "name", label: "University Name" },
                    { key: "country", label: "Country" },
                    { key: "type", label: "Type" },
                    { key: "email", label: "Email" },
                    { key: "address", label: "Address" },
                    { key: "status", label: "Status" },
                    { key: "partnerType", label: "Partner Type" },
                    { key: "createdAt", label: "Created At" },
                    { key: "action", label: "Action" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => key !== "action" ? handleSort(key as keyof University) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== "action" && (
                          <span className="text-xs">{getSortIcon(key as keyof University)}</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((university) => (
                    <TableRow key={university.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          #{university.id}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Building2 size={16} className="text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {university.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-gray-400" />
                          <Badge size="sm" color="primary">
                            {university.country}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color="info">
                          {university.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                            {university.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-gray-600 text-theme-sm dark:text-gray-400 max-w-[150px] truncate">
                            {university.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getStatusColor(university.status)}
                        >
                          {university.status.charAt(0).toUpperCase() + university.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getPartnerTypeColor(university.partnerType)}
                        >
                          {university.partnerType}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(university.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/universities/edit/${university.id}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(university.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                      No universities found matching your criteria.
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
        Showing {filteredAndSortedData.length} of {tableData.length} universities
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        countries={countries}
        types={types}
        statuses={statuses}
        partnerTypes={partnerTypes}
      />
    </div>
  );
}