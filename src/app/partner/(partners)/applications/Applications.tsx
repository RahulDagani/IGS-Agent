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

interface Application {
  id: number;
  university: string;
  course: string;
  intake: string;
  status: "Applied" | "Received" | "Submitted to University" | "Documents Pending";
  assignedTo: string;
  studentName: string;
  studentEmail: string;
  agentName: string;
  agentEmail: string;
}

// Define the table data using the interface
const tableData: Application[] = [
  {
    id: 1,
    university: "Harvard University",
    course: "Computer Science",
    intake: "Fall 2024",
    status: "Applied",
    assignedTo: "John Doe",
    studentName: "Alice Johnson",
    studentEmail: "alice.johnson@example.com",
    agentName: "John Smith",
    agentEmail: "john.smith@example.com",
  },
  {
    id: 2,
    university: "Stanford University",
    course: "Business Administration",
    intake: "Spring 2024",
    status: "Received",
    assignedTo: "Sarah Wilson",
    studentName: "Bob Wilson",
    studentEmail: "bob.wilson@example.com",
    agentName: "Sarah Johnson",
    agentEmail: "sarah.j@example.com",
  },
  {
    id: 3,
    university: "MIT",
    course: "Data Science",
    intake: "Fall 2024",
    status: "Submitted to University",
    assignedTo: "Mike Chen",
    studentName: "Carol Davis",
    studentEmail: "carol.davis@example.com",
    agentName: "Mike Chen",
    agentEmail: "mike.chen@example.com",
  },
  {
    id: 4,
    university: "University of Toronto",
    course: "Mechanical Engineering",
    intake: "Winter 2024",
    status: "Documents Pending",
    assignedTo: "Emily Davis",
    studentName: "David Brown",
    studentEmail: "david.brown@example.com",
    agentName: "Emily Davis",
    agentEmail: "emily.davis@example.com",
  },
  {
    id: 5,
    university: "UBC",
    course: "Psychology",
    intake: "Fall 2024",
    status: "Applied",
    assignedTo: "Robert Wilson",
    studentName: "Eva Martinez",
    studentEmail: "eva.martinez@example.com",
    agentName: "Robert Wilson",
    agentEmail: "r.wilson@example.com",
  },
];

type SortField = keyof Application | "";
type SortDirection = "asc" | "desc";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  agents: Array<{ email: string; name: string }>;
  students: Array<{ email: string; name: string }>;
  universities: string[];
  courses: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  agents,
  students,
  universities,
  courses,
}) => {
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const handleApply = () => {
    onApply({
      agent: selectedAgent,
      student: selectedStudent,
      university: selectedUniversity,
      course: selectedCourse,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedAgent("all");
    setSelectedStudent("all");
    setSelectedUniversity("all");
    setSelectedCourse("all");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-999999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Apply Filters
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
          {/* Agent Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Agents</option>
              {agents.map((agent) => (
                <option key={agent.email} value={agent.email}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Students</option>
              {students.map((student) => (
                <option key={student.email} value={student.email}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {/* University Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select University
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

          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
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

export default function ApplicationsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    agent: "all",
    student: "all",
    university: "all",
    course: "all",
  });

  // Get unique values for filters
  const agents = useMemo(() => {
    return Array.from(
      new Map(
        tableData.map(app => [app.agentEmail, {
          email: app.agentEmail,
          name: app.agentName
        }])
      ).values()
    );
  }, []);

  const students = useMemo(() => {
    return Array.from(
      new Map(
        tableData.map(app => [app.studentEmail, {
          email: app.studentEmail,
          name: app.studentName
        }])
      ).values()
    );
  }, []);

  const universities = useMemo(() => {
    return Array.from(new Set(tableData.map(app => app.university)));
  }, []);

  const courses = useMemo(() => {
    return Array.from(new Set(tableData.map(app => app.course)));
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = tableData.filter((application) => {
      const matchesSearch = 
        application.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAgent = filters.agent === "all" || application.agentEmail === filters.agent;
      const matchesStudent = filters.student === "all" || application.studentEmail === filters.student;
      const matchesUniversity = filters.university === "all" || application.university === filters.university;
      const matchesCourse = filters.course === "all" || application.course === filters.course;
      
      return matchesSearch && matchesAgent && matchesStudent && matchesUniversity && matchesCourse;
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

  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Application) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "Applied":
        return "primary";
      case "Received":
        return "warning";
      case "Submitted to University":
        return "success";
      case "Documents Pending":
        return "error";
      default:
        return "primary";
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.agent !== "all" || filters.student !== "all" || 
                          filters.university !== "all" || filters.course !== "all";

  const clearAllFilters = () => {
    setFilters({
      agent: "all",
      student: "all",
      university: "all",
      course: "all",
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
              placeholder="Search by university, course, student, or assigned to..."
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
          {filters.agent !== "all" && (
            <Badge size="sm" color="primary">
              Agent: {agents.find(a => a.email === filters.agent)?.name}
            </Badge>
          )}
          {filters.student !== "all" && (
            <Badge size="sm" color="primary">
              Student: {students.find(s => s.email === filters.student)?.name}
            </Badge>
          )}
          {filters.university !== "all" && (
            <Badge size="sm" color="primary">
              University: {filters.university}
            </Badge>
          )}
          {filters.course !== "all" && (
            <Badge size="sm" color="primary">
              Course: {filters.course}
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
                    { key: "student", label: "Student" },
                    { key: "agent", label: "Agent" },

                    { key: "university", label: "University" },
                    { key: "course", label: "Course" },
                    { key: "intake", label: "Intake" },
                    { key: "status", label: "Status" },
                    { key: "assignedTo", label: "Assigned" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort(key as keyof Application)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <span className="text-xs">{getSortIcon(key as keyof Application)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((application) => (
                    <TableRow key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {application.studentName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {application.agentName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {application.university}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90">
                        {application.course}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {application.intake}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getStatusColor(application.status)}
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div>
                          <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {application.assignedTo}
                          </div>
                          
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      No applications found matching your criteria.
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
        Showing {filteredAndSortedData.length} of {tableData.length} applications
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        agents={agents}
        students={students}
        universities={universities}
        courses={courses}
      />
    </div>
  );
}