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
import { Edit, Trash } from "lucide-react";

interface Commission {
  id: number;
  country: string;
  universityName: string;
  studyLevel: string;
  agentCommission: string;
  remark: string;
}

// Define the table data using the interface
const tableData: Commission[] = [
  {
    id: 1,
    country: "USA",
    universityName: "Harvard University",
    studyLevel: "Undergraduate",
    agentCommission: "15%",
    remark: "Standard commission rate",
  },
  {
    id: 2,
    country: "USA",
    universityName: "Stanford University",
    studyLevel: "Postgraduate",
    agentCommission: "12%",
    remark: "Reduced rate for MBA programs",
  },
  {
    id: 3,
    country: "UK",
    universityName: "University of Oxford",
    studyLevel: "Undergraduate",
    agentCommission: "10%",
    remark: "Fixed commission for all courses",
  },
  {
    id: 4,
    country: "Canada",
    universityName: "University of Toronto",
    studyLevel: "Postgraduate",
    agentCommission: "18%",
    remark: "Premium commission for research programs",
  },
  {
    id: 5,
    country: "Australia",
    universityName: "University of Sydney",
    studyLevel: "Undergraduate",
    agentCommission: "14%",
    remark: "Standard Australian rate",
  },
  {
    id: 6,
    country: "USA",
    universityName: "MIT",
    studyLevel: "PhD",
    agentCommission: "8%",
    remark: "Limited commission for doctoral programs",
  },
  {
    id: 7,
    country: "UK",
    universityName: "Imperial College London",
    studyLevel: "Postgraduate",
    agentCommission: "11%",
    remark: "Engineering programs only",
  },
  {
    id: 8,
    country: "Canada",
    universityName: "UBC",
    studyLevel: "Undergraduate",
    agentCommission: "16%",
    remark: "All undergraduate courses",
  },
];

type SortField = keyof Commission | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  studyLevel: string;
  universityName: string;
  country: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  studyLevels: string[];
  universityNames: string[];
  countries: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  studyLevels,
  universityNames,
  countries,
}) => {
  const [selectedStudyLevel, setSelectedStudyLevel] = useState<string>("all");
  const [selectedUniversityName, setSelectedUniversityName] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      studyLevel: selectedStudyLevel,
      universityName: selectedUniversityName,
      country: selectedCountry,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedStudyLevel("all");
    setSelectedUniversityName("all");
    setSelectedCountry("all");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-999999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    studyLevel: "all",
    universityName: "all",
    country: "all",
  });

  // Get unique values for filters
  const studyLevels = useMemo(() => {
    return Array.from(new Set(tableData.map(commission => commission.studyLevel)));
  }, []);

  const universityNames = useMemo(() => {
    return Array.from(new Set(tableData.map(commission => commission.universityName)));
  }, []);

  const countries = useMemo(() => {
    return Array.from(new Set(tableData.map(commission => commission.country)));
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = tableData.filter((commission) => {
      const matchesSearch = 
        commission.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.studyLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.agentCommission.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.remark.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStudyLevel = filters.studyLevel === "all" || commission.studyLevel === filters.studyLevel;
      const matchesUniversityName = filters.universityName === "all" || commission.universityName === filters.universityName;
      const matchesCountry = filters.country === "all" || commission.country === filters.country;
      
      return matchesSearch && matchesStudyLevel && matchesUniversityName && matchesCountry;
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

  const getCommissionColor = (commission: string) => {
    const percentage = parseInt(commission);
    if (percentage >= 15) return "success";
    if (percentage >= 10) return "warning";
    return "error";
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.studyLevel !== "all" || filters.universityName !== "all" || 
                          filters.country !== "all";

  const clearAllFilters = () => {
    setFilters({
      studyLevel: "all",
      universityName: "all",
      country: "all",
    });
  };

  const handleDelete = (id: number) => {
    // Handle delete action
    console.log("Delete commission:", id);
  };

  return (
    <div className="space-y-4">
         {/* Summary Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Commissions</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {filteredAndSortedData.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Countries</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Array.from(new Set(filteredAndSortedData.map(c => c.country))).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Universities</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Array.from(new Set(filteredAndSortedData.map(c => c.universityName))).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Study Levels</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Array.from(new Set(filteredAndSortedData.map(c => c.studyLevel))).length}
          </div>
        </div>
      </div> */}
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by country, university, study level, commission, or remark..."
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
          <Link href={"/admin/partners/commissions/add"}>
           <button
           
            className="dark:border-green-500 h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2"
          >
            <svg
  className="w-4 h-4"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M12 4v16m8-8H4"
  />
</svg>

            
            Add
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
          {filters.universityName !== "all" && (
            <Badge size="sm" color="primary">
              University: {filters.universityName}
            </Badge>
          )}
          {filters.studyLevel !== "all" && (
            <Badge size="sm" color="primary">
              Study Level: {filters.studyLevel}
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
                    { key: "country", label: "Country" },
                    { key: "universityName", label: "University Name" },
                    { key: "studyLevel", label: "Study Level" },
                    { key: "agentCommission", label: "Agent Commission" },
                    { key: "remark", label: "Remark" },
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
                        <Badge size="sm" color="primary">
                          {commission.country}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {commission.universityName}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color="info">
                          {commission.studyLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getCommissionColor(commission.agentCommission)}
                        >
                          {commission.agentCommission}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-600 text-theme-sm dark:text-gray-400 max-w-[200px] truncate">
                          {commission.remark}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Link
                            href={'/admin/partners/commissions/edit/'+commission.id}
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
        Showing {filteredAndSortedData.length} of {tableData.length} commissions
      </div>

     

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        studyLevels={studyLevels}
        universityNames={universityNames}
        countries={countries}
      />
    </div>
  );
}