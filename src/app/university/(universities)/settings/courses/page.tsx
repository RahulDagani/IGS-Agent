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
import { Edit, Trash, Book, Building2, GraduationCap, Star, DollarSign } from "lucide-react";
// import { Eye } from "lucide-react";


interface Course {
  id: number;
  courseName: string;
  universityName: string;
  discipline: string;
  studyLevel: string;
  // intake: string;
  applicationFee: string;
  externalEvaluation: "yes" | "no";
  popular: "yes" | "no";
  status: "active" | "inactive";
  createdAt: string;
}

// Define the table data using the interface
const tableData: Course[] = [
  {
    id: 1,
    courseName: "Master of Computer Science",
    universityName: "Stanford University",
    discipline: "Computer Science",
    studyLevel: "Postgraduate",
    // intake: "Fall 2024",
    applicationFee: "$100",
    externalEvaluation: "yes",
    popular: "yes",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    courseName: "MBA",
    universityName: "Harvard University",
    discipline: "Business Administration",
    studyLevel: "Postgraduate",
    // intake: "Fall 2024",
    applicationFee: "$250",
    externalEvaluation: "yes",
    popular: "yes",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    courseName: "Bachelor of Engineering",
    universityName: "MIT",
    discipline: "Engineering",
    studyLevel: "Undergraduate",
    // intake: "Spring 2025",
    applicationFee: "$75",
    externalEvaluation: "no",
    popular: "no",
    status: "active",
    createdAt: "2024-01-28",
  },
  {
    id: 4,
    courseName: "PhD in Physics",
    universityName: "University of Oxford",
    discipline: "Physics",
    studyLevel: "PhD",
    // intake: "Fall 2024",
    applicationFee: "$120",
    externalEvaluation: "yes",
    popular: "no",
    status: "inactive",
    createdAt: "2024-03-10",
  },
  {
    id: 5,
    courseName: "Diploma in Data Science",
    universityName: "University of Toronto",
    discipline: "Data Science",
    studyLevel: "Diploma",
    // intake: "Summer 2025",
    applicationFee: "$80",
    externalEvaluation: "no",
    popular: "yes",
    status: "active",
    createdAt: "2024-02-05",
  },
  {
    id: 6,
    courseName: "Bachelor of Arts",
    universityName: "University of Cambridge",
    discipline: "Arts & Humanities",
    studyLevel: "Undergraduate",
    // intake: "Fall 2024",
    applicationFee: "$90",
    externalEvaluation: "no",
    popular: "no",
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: 7,
    courseName: "Master of Public Health",
    universityName: "Johns Hopkins University",
    discipline: "Medicine",
    studyLevel: "Postgraduate",
    // intake: "Spring 2025",
    applicationFee: "$150",
    externalEvaluation: "yes",
    popular: "yes",
    status: "active",
    createdAt: "2024-03-15",
  },
  {
    id: 8,
    courseName: "Certificate in Digital Marketing",
    universityName: "University of Sydney",
    discipline: "Marketing",
    studyLevel: "Certificate",
    // intake: "Rolling",
    applicationFee: "$60",
    externalEvaluation: "no",
    popular: "yes",
    status: "inactive",
    createdAt: "2024-02-28",
  },
];

type SortField = keyof Course | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  universityName: string;
  discipline: string;
  studyLevel: string;
  status: string;
  popular: string;
  externalEvaluation: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  universities: string[];
  disciplines: string[];
  studyLevels: string[];
  statuses: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  universities,
  disciplines,
  studyLevels,
  statuses,
}) => {
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [selectedStudyLevel, setSelectedStudyLevel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPopular, setSelectedPopular] = useState<string>("all");
  const [selectedExternalEvaluation, setSelectedExternalEvaluation] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      universityName: selectedUniversity,
      discipline: selectedDiscipline,
      studyLevel: selectedStudyLevel,
      status: selectedStatus,
      popular: selectedPopular,
      externalEvaluation: selectedExternalEvaluation,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedUniversity("all");
    setSelectedDiscipline("all");
    setSelectedStudyLevel("all");
    setSelectedStatus("all");
    setSelectedPopular("all");
    setSelectedExternalEvaluation("all");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-999999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Courses
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
          {/* University Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              University
            </label>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Universities</option>
              {universities.map((university) => (
                <option key={university} value={university}>
                  {university}
                </option>
              ))}
            </select>
          </div>

          {/* Discipline Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Discipline
            </label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Disciplines</option>
              {disciplines.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {discipline}
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

          {/* Popular Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Popular Course
            </label>
            <select
              value={selectedPopular}
              onChange={(e) => setSelectedPopular(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Courses</option>
              <option value="yes">Popular Only</option>
              <option value="no">Not Popular</option>
            </select>
          </div>

          {/* External Evaluation Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              External Evaluation
            </label>
            <select
              value={selectedExternalEvaluation}
              onChange={(e) => setSelectedExternalEvaluation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Courses</option>
              <option value="yes">Required</option>
              <option value="no">Not Required</option>
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

export default function CoursesTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    universityName: "all",
    discipline: "all",
    studyLevel: "all",
    status: "all",
    popular: "all",
    externalEvaluation: "all",
  });

  // Get unique values for filters
  const universities = useMemo(() => {
    return Array.from(new Set(tableData.map(course => course.universityName)));
  }, []);

  const disciplines = useMemo(() => {
    return Array.from(new Set(tableData.map(course => course.discipline)));
  }, []);

  const studyLevels = useMemo(() => {
    return Array.from(new Set(tableData.map(course => course.studyLevel)));
  }, []);

  const statuses = useMemo(() => {
    return Array.from(new Set(tableData.map(course => course.status)));
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = tableData.filter((course) => {
      const matchesSearch = 
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.studyLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // course.intake.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.applicationFee.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUniversity = filters.universityName === "all" || course.universityName === filters.universityName;
      const matchesDiscipline = filters.discipline === "all" || course.discipline === filters.discipline;
      const matchesStudyLevel = filters.studyLevel === "all" || course.studyLevel === filters.studyLevel;
      const matchesStatus = filters.status === "all" || course.status === filters.status;
      const matchesPopular = filters.popular === "all" || course.popular === filters.popular;
      const matchesExternalEvaluation = filters.externalEvaluation === "all" || course.externalEvaluation === filters.externalEvaluation;
      
      return matchesSearch && matchesUniversity && matchesDiscipline && matchesStudyLevel && 
             matchesStatus && matchesPopular && matchesExternalEvaluation;
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

  const handleSort = (field: keyof Course) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Course) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusColor = (status: Course["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "primary";
    }
  };

  const getPopularColor = (popular: Course["popular"]) => {
    return popular === "yes" ? "warning" : "primary";
  };

  const getExternalEvaluationColor = (externalEvaluation: Course["externalEvaluation"]) => {
    return externalEvaluation === "yes" ? "info" : "primary";
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

  const hasActiveFilters = filters.universityName !== "all" || filters.discipline !== "all" || 
                          filters.studyLevel !== "all" || filters.status !== "all" ||
                          filters.popular !== "all" || filters.externalEvaluation !== "all";

  const clearAllFilters = () => {
    setFilters({
      universityName: "all",
      discipline: "all",
      studyLevel: "all",
      status: "all",
      popular: "all",
      externalEvaluation: "all",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      console.log("Delete course:", id);
      // Perform delete operation
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Courses</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {filteredAndSortedData.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Courses</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredAndSortedData.filter(c => c.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Popular Courses</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {filteredAndSortedData.filter(c => c.popular === 'yes').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Universities</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Array.from(new Set(filteredAndSortedData.map(c => c.universityName))).length}
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
              placeholder="Search by course name, university, discipline, study level, or fee..."
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
          <Link href="/admin/courses/add">
            <button className="dark:border-green-500 h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Course
            </button>
          </Link>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.universityName !== "all" && (
            <Badge size="sm" color="primary">
              University: {filters.universityName}
            </Badge>
          )}
          {filters.discipline !== "all" && (
            <Badge size="sm" color="primary">
              Discipline: {filters.discipline}
            </Badge>
          )}
          {filters.studyLevel !== "all" && (
            <Badge size="sm" color="primary">
              Study Level: {filters.studyLevel}
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge size="sm" color="primary">
              Status: {filters.status}
            </Badge>
          )}
          {filters.popular !== "all" && (
            <Badge size="sm" color="primary">
              Popular: {filters.popular === "yes" ? "Yes" : "No"}
            </Badge>
          )}
          {filters.externalEvaluation !== "all" && (
            <Badge size="sm" color="primary">
              External Evaluation: {filters.externalEvaluation === "yes" ? "Required" : "Not Required"}
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1400px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    { key: "id", label: "ID" },
                    { key: "courseName", label: "Course Name" },
                    { key: "universityName", label: "University" },
                    { key: "discipline", label: "Discipline" },
                    { key: "studyLevel", label: "Study Level" },
                    // { key: "intake", label: "Intake" },
                    { key: "applicationFee", label: "Application Fee" },
                    { key: "externalEvaluation", label: "Ext. Evaluation" },
                    { key: "popular", label: "Popular" },
                    { key: "status", label: "Status" },
                    { key: "createdAt", label: "Created At" },
                    { key: "action", label: "Action" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => key !== "action" ? handleSort(key as keyof Course) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== "action" && (
                          <span className="text-xs">{getSortIcon(key as keyof Course)}</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((course) => (
                    <TableRow key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          #{course.id}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Book size={16} className="text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {course.courseName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-gray-400" />
                          <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                            {course.universityName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color="info">
                          {course.discipline}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} className="text-gray-400" />
                          <Badge size="sm" color="primary">
                            {course.studyLevel}
                          </Badge>
                        </div>
                      </TableCell>
                      {/* <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                            {course.intake}
                          </span>
                        </div>
                      </TableCell> */}
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-gray-400" />
                          <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                            {course.applicationFee}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getExternalEvaluationColor(course.externalEvaluation)}
                        >
                          {course.externalEvaluation === "yes" ? "Required" : "Not Required"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getPopularColor(course.popular)}
                        >
                          {course.popular === "yes" ? (
                            <div className="flex items-center gap-1">
                              <Star size={12} className="fill-current" />
                              Popular
                            </div>
                          ) : (
                            "Standard"
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getStatusColor(course.status)}
                        >
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(course.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          {/* <Link
                            href={`/admin/courses/view/${course.id}`}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="View Course"
                          >
                            <Eye size={18} />
                          </Link> */}
                          <Link
                            href={`/admin/universities/courses/edit/${course.id}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit Course"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Course"
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
                      No courses found matching your criteria.
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
        Showing {filteredAndSortedData.length} of {tableData.length} courses
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        universities={universities}
        disciplines={disciplines}
        studyLevels={studyLevels}
        statuses={statuses}
      />
    </div>
  );
}