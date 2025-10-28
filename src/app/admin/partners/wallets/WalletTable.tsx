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

interface Agent {
  id: number;
  name: string;
  email: string;
  businessName: string;
  phoneNumber: string;
  verified: boolean;
  status: "active" | "inactive";
  createdAt: string;
}

// Define the table data using the interface
const tableData: Agent[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    businessName: "Global Education Consultants",
    phoneNumber: "+1 (555) 123-4567",
    verified: true,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    businessName: "Study Abroad Experts",
    phoneNumber: "+1 (555) 234-5678",
    verified: true,
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike.chen@example.com",
    businessName: "Future Pathways Agency",
    phoneNumber: "+1 (555) 345-6789",
    verified: false,
    status: "inactive",
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    businessName: "International Student Hub",
    phoneNumber: "+1 (555) 456-7890",
    verified: true,
    status: "active",
    createdAt: "2024-01-28",
  },
  {
    id: 5,
    name: "Robert Wilson",
    email: "r.wilson@example.com",
    businessName: "Education Bridge Consultants",
    phoneNumber: "+1 (555) 567-8901",
    verified: false,
    status: "inactive",
    createdAt: "2024-04-05",
  },
];

type SortField = keyof Agent | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  status: string;
  verified: string;
  businessName: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  businessNames: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  businessNames,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedVerified, setSelectedVerified] = useState<string>("all");
  const [selectedBusinessName, setSelectedBusinessName] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      status: selectedStatus,
      verified: selectedVerified,
      businessName: selectedBusinessName,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedStatus("all");
    setSelectedVerified("all");
    setSelectedBusinessName("all");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-999999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Agents
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

          {/* Verified Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Status
            </label>
            <select
              value={selectedVerified}
              onChange={(e) => setSelectedVerified(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="not-verified">Not Verified</option>
            </select>
          </div>

          {/* Business Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Name
            </label>
            <select
              value={selectedBusinessName}
              onChange={(e) => setSelectedBusinessName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Business Names</option>
              {businessNames.map((businessName) => (
                <option key={businessName} value={businessName}>
                  {businessName}
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

export default function AgentsWalletTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    verified: "all",
    businessName: "all",
  });

  // Get unique values for filters
  const businessNames = useMemo(() => {
    return Array.from(new Set(tableData.map(agent => agent.businessName)));
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = tableData.filter((agent) => {
      const matchesSearch = 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === "all" || agent.status === filters.status;
      const matchesVerified = filters.verified === "all" || 
        (filters.verified === "verified" && agent.verified) ||
        (filters.verified === "not-verified" && !agent.verified);
      const matchesBusinessName = filters.businessName === "all" || agent.businessName === filters.businessName;
      
      return matchesSearch && matchesStatus && matchesVerified && matchesBusinessName;
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

  const handleSort = (field: keyof Agent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Agent) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "primary";
    }
  };

  const getVerifiedColor = (verified: boolean) => {
    return verified ? "success" : "warning";
  };

  const getVerifiedText = (verified: boolean) => {
    return verified ? "Verified" : "Not Verified";
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

  const hasActiveFilters = filters.status !== "all" || filters.verified !== "all" || 
                          filters.businessName !== "all";

  const clearAllFilters = () => {
    setFilters({
      status: "all",
      verified: "all",
      businessName: "all",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, business name, or phone number..."
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
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== "all" && (
            <Badge size="sm" color="primary">
              Status: {filters.status}
            </Badge>
          )}
          {filters.verified !== "all" && (
            <Badge size="sm" color="primary">
              Verification: {filters.verified}
            </Badge>
          )}
          {filters.businessName !== "all" && (
            <Badge size="sm" color="primary">
              Business: {filters.businessName}
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
                    { key: "name", label: "Name" },
                    { key: "email", label: "Email" },
                    { key: "businessName", label: "Business Name" },
                    { key: "phoneNumber", label: "Phone Number" },
                    { key: "verified", label: "Verified" },
                    { key: "status", label: "Status" },
                    { key: "createdAt", label: "Created At" },
                    { key: "wallet", label: "Wallet History" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => key !== "wallet" ? handleSort(key as keyof Agent) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== "wallet" && (
                          <span className="text-xs">{getSortIcon(key as keyof Agent)}</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((agent) => (
                    <TableRow key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {agent.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-800 text-theme-sm dark:text-white/90">
                          {agent.email}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {agent.businessName}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90">
                        {agent.phoneNumber}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getVerifiedColor(agent.verified)}
                        >
                          {getVerifiedText(agent.verified)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getStatusColor(agent.status)}
                        >
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatDate(agent.createdAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Link
                          href={`/admin/partners/wallet-history/${agent.id}`}
                          className="text-brand-500 hover:text-brand-600 text-theme-sm font-medium"
                        >
                          View History
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                   
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      No agents found matching your criteria.
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
        Showing {filteredAndSortedData.length} of {tableData.length} agents
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        businessNames={businessNames}
      />
    </div>
  );
}