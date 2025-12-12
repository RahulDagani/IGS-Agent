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
import Link from "next/link";
import { Edit, Trash, Globe, Building2, Mail, MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Country } from "country-state-city";
import Image from "next/image";

interface University {
  id: number;
  uuid: string;
  tenant_id: number;
  university: string;
  university_slug: string;
  description: string;
  country_code: string;
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
  logo_url: string | null;
  image_url: string | null;
  brochure_url: string | null;
}

interface CountryFilter {
  country_code: string;
}

interface PartnerTypeFilter {
  id: number;
  name: string;
}

interface CollaborationTypeFilter {
  id: number;
  name: string;
}

interface UniversityTypeFilter {
  id: number;
  name: string;
}

interface FiltersData {
  countries: CountryFilter[];
  partnerTypes: PartnerTypeFilter[];
  collaborationTypes: CollaborationTypeFilter[];
  universityTypes: UniversityTypeFilter[];
}

interface ApiResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: University[];
  filters: FiltersData;
}

type SortField = keyof University | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  country: string;
  type: string;
  status: string;
  partnerType: string;
  collaborationType: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  filtersData: FiltersData;
}

const getCountryName = (code: string | undefined | null) => {
  if (!code) return '';
  const country = Country.getCountryByCode(code);
  return country ? country.name : code;
};

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  filtersData,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPartnerType, setSelectedPartnerType] = useState<string>("all");
  const [selectedCollaborationType, setSelectedCollaborationType] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      country: selectedCountry,
      type: selectedType,
      status: selectedStatus,
      partnerType: selectedPartnerType,
      collaborationType: selectedCollaborationType,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedCountry("all");
    setSelectedType("all");
    setSelectedStatus("all");
    setSelectedPartnerType("all");
    setSelectedCollaborationType("all");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-99999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              {filtersData.countries.map((country) => (
                <option key={country.country_code} value={country.country_code.trim()}>
                  {getCountryName(country.country_code.trim())}
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
              {filtersData.universityTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              {filtersData.partnerTypes.map((partnerType) => (
                <option key={partnerType.id} value={partnerType.name}>
                  {partnerType.name}
                </option>
              ))}
            </select>
          </div>

          {/* Collaboration Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Collaboration Type
            </label>
            <select
              value={selectedCollaborationType}
              onChange={(e) => setSelectedCollaborationType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Collaboration Types</option>
              {filtersData.collaborationTypes.map((collabType) => (
                <option key={collabType.id} value={collabType.name}>
                  {collabType.name}
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
    collaborationType: "all",
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [filtersData, setFiltersData] = useState<FiltersData>({
    countries: [],
    partnerTypes: [],
    collaborationTypes: [],
    universityTypes: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const { token } = useAuth();

  // Helper functions to find IDs from names
  const findTypeId = (typeName: string): string => {
    const type = filtersData.universityTypes.find(t => t.name === typeName);
    return type ? type.id.toString() : '';
  };

  const findPartnerTypeId = (partnerName: string): string => {
    const partner = filtersData.partnerTypes.find(p => p.name === partnerName);
    return partner ? partner.id.toString() : '';
  };

  const findCollaborationTypeId = (collabName: string): string => {
    const collab = filtersData.collaborationTypes.find(c => c.name === collabName);
    return collab ? collab.id.toString() : '';
  };

  // Fetch data from API with pagination and filters
  const fetchUniversities = async (page: number = 1, search: string = "", filters: FilterOptions = {
    country: "all",
    type: "all",
    status: "all",
    partnerType: "all",
    collaborationType: "all",
  }) => {
    try {
      setLoading(true);
      const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
      
      // Build query parameters with correct API parameter names
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }), // search parameter stays the same
        ...(filters.country !== "all" && { country_code: filters.country }),
        ...(filters.type !== "all" && { type_of_university_id: findTypeId(filters.type) }),
        ...(filters.status !== "all" && { is_deleted: filters.status === "active" ? "0" : "1" }),
        ...(filters.partnerType !== "all" && { kind_of_partner_id: findPartnerTypeId(filters.partnerType) }),
        ...(filters.collaborationType !== "all" && { collaboration_type_id: findCollaborationTypeId(filters.collaborationType) }),
      });

      const response = await fetch(`${BASE_URL}/tenant/university/list?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch universities: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setUniversities(data.data);
        setFiltersData(data.filters);
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage
        });
      } else {
        throw new Error("Failed to fetch universities");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching universities:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and fetch when filters change
  useEffect(() => {
    fetchUniversities(1, searchTerm, filters);
  }, [searchTerm, filters]);

  // Filter and sort data client-side (for immediate UI updates)
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...universities];

    // Apply client-side filtering (in addition to server-side)
    if (filters.status !== "all") {
      filtered = filtered.filter(university => 
        filters.status === "active" ? university.is_deleted === 0 : university.is_deleted === 1
      );
    }

    // Apply client-side search (in addition to server-side)
    if (searchTerm) {
      filtered = filtered.filter((university) => {
        return (
          university.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (university.country_code && university.country_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (university.university_type_name && university.university_type_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (university.email && university.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (university.address && university.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (university.kind_of_partner_name && university.kind_of_partner_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
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
  }, [universities, searchTerm, filters, sortField, sortDirection]);

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

  const getStatusColor = (isDeleted: number) => {
    return isDeleted === 0 ? "success" : "error";
  };

  const getStatusText = (isDeleted: number) => {
    return isDeleted === 0 ? "Active" : "Inactive";
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
    // Reset to page 1 when filters change
    fetchUniversities(1, searchTerm, newFilters);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUniversities(newPage, searchTerm, filters);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Reset to page 1 on search
    fetchUniversities(1, value, filters);
  };

  const hasActiveFilters = filters.country !== "all" || filters.type !== "all" || 
                          filters.status !== "all" || filters.partnerType !== "all" || 
                          filters.collaborationType !== "all";

  const clearAllFilters = () => {
    const defaultFilters: FilterOptions = {
      country: "all",
      type: "all",
      status: "all",
      partnerType: "all",
      collaborationType: "all",
    };
    setFilters(defaultFilters);
    fetchUniversities(1, searchTerm, defaultFilters);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this university?")) {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
        const response = await fetch(`${BASE_URL}/tenant/university/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Refresh the data
          fetchUniversities(pagination.page, searchTerm, filters);
        } else {
          throw new Error("Failed to delete university");
        }
      } catch (err) {
        console.error("Error deleting university:", err);
        alert("Failed to delete university. Please try again.");
      }
    }
  };

  if (loading && universities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading universities...</div>
      </div>
    );
  }

  if (error && universities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Universities</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {pagination.total}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {universities.filter(u => u.is_deleted === 0).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Countries</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {filtersData.countries.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Page</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {pagination.page} / {pagination.totalPages}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, country, email, address, or partner type..."
              value={searchTerm}
              onChange={handleSearch}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
              Country: {getCountryName(filters.country)}
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
          {filters.collaborationType !== "all" && (
            <Badge size="sm" color="primary">
              Collaboration: {filters.collaborationType}
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
                    { key: "university", label: "University Name" },
                    { key: "country_code", label: "Country" },
                    { key: "university_type_name", label: "Type" },
                    { key: "email", label: "Email" },
                    { key: "address", label: "Address" },
                    { key: "is_deleted", label: "Status" },
                    { key: "kind_of_partner_name", label: "Partner Type" },
                    { key: "created_at", label: "Created At" },
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
                        <div className="flex justify-center items-center">
                          <Image
                            className="mx-auto"
                            src={university.logo_url || '/images/no-image.png'}
                            alt="Logo"
                            width={85}
                            height={65}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Building2 size={16} className="text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {university.university}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-gray-400" />
                          <Badge size="sm" color="primary">
                            {getCountryName(university.country_code)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color="info">
                          {university.university_type_name}
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
                            {university.address || "No address provided"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getStatusColor(university.is_deleted)}
                        >
                          {getStatusText(university.is_deleted)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={"primary"}
                        >
                          {university.kind_of_partner_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(university.created_at)}
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

      {/* Pagination and Results Count */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredAndSortedData.length} universities on page {pagination.page} of {pagination.totalPages}
          {pagination.total > 0 && ` (Total: ${pagination.total} universities)`}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={!pagination.hasPrevPage}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              if (pageNum < 1 || pageNum > pagination.totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium ${
                    pagination.page === pageNum
                      ? "bg-brand-500 text-white border-brand-500"
                      : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        filtersData={filtersData}
      />
    </div>
  );
}