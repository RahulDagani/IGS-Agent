"use client"
import React, { useState, useMemo } from "react";
import Badge from "@/components/ui/badge/Badge";
import { User } from "lucide-react";

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
  country?: string;
  degree?: string;
  location?: string;
  externalEvaluation?: string;
  ielts?: number;
  pte?: number;
  duolingo?: number;
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
    country: "United States of America",
    degree: "Bachelors",
    location: "Massachusetts, United States of America",
    externalEvaluation: "Required (WES)",
    ielts: 7.0,
    pte: 68,
    duolingo: 120
  },
 

];

type SortField = keyof Application | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  agent: string;
  student: string;
  university: string;
  course: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
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
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      agent: selectedAgent,
      student: selectedStudent,
      university: selectedUniversity,
      course: selectedCourse,
    };
    onApply(filters);
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
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

// Icons component for the card
const CardIcons = {
  GraduationCap: () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l9-5M12 20l-9-5" />
    </svg>
  ),
  MapMarker: () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  FileAlt: () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

const ApplicationCard: React.FC<{ application: Application }> = ({ application }) => {
  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "Applied":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "Received":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Submitted to University":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "Documents Pending":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
      {/* Status Badge */}
        <div className="flex justify-end">
             <span className={`text-xs font-semibold px-3 py-1 rounded-full mb-2 ${getStatusColor(application.status)}`}>
          {application.status}
        </span>
        </div>
       
      {/* Top Section */}
      <div className="flex items-start justify-between">
        {/* University Info */}
        <div className="flex items-start gap-3">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
            {application.university.split(' ').map(word => word[0]).join('')}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white leading-snug">
              {application.course}
            </h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {application.university}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {application.country}
            </p>
          </div>
        </div>

        
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 space-y-3">
       
        {/* Degree */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <CardIcons.GraduationCap />
          <span>
            <strong className="font-semibold text-gray-800 dark:text-white">Degree:</strong>{" "}
            {application.degree}
          </span>
        </div>

        

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <CardIcons.MapMarker />
          <span>
            <strong className="font-semibold text-gray-800 dark:text-white">Location:</strong>{" "}
            {application.location}
          </span>
        </div>

        {/* External Evaluation */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <CardIcons.FileAlt />
          <span>
            <strong className="font-semibold text-gray-800 dark:text-white">
              External Evaluation:
            </strong>{" "}
            {application.externalEvaluation}
          </span>
        </div>
      </div>

      {/* Entry Requirements */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
          ENTRY REQUIREMENTS
        </h3>
        <div className="flex gap-2 flex-wrap">
          {application.ielts && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              IELTS: <span className="text-gray-900 dark:text-white">{application.ielts}</span>
            </span>
          )}
          {application.pte && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              PTE: <span className="text-gray-900 dark:text-white">{application.pte}</span>
            </span>
          )}
          {application.duolingo && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              Duolingo: <span className="text-gray-900 dark:text-white">{application.duolingo}</span>
            </span>
          )}
        </div>
      </div>
      
           {/* Student */}
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 space-y-3">
          <User size={16} className="mb-0 mr-2"/>
          <span>
            <strong className="font-semibold text-gray-800 dark:text-white">Student:</strong>{" "}
            {`${application.studentEmail}`}
          </span>
        </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-red-500 mb-3">Pending</p>
        <div className="flex justify-between items-center text-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
              <span className="text-red-500 text-lg font-bold">✕</span>
            </div>
            <p className="text-xs dark:text-white">Common Form</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
              <span className="text-red-500 text-lg font-bold">✕</span>
            </div>
            <p className="text-xs dark:text-white">Common Docs</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
              <span className="text-red-500 text-lg font-bold">✕</span>
            </div>
            <p className="text-xs dark:text-white ">Specific Docs</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm transition-all">
          LIVE CHAT
        </button>
        <button className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/30 font-semibold py-2 rounded-lg text-sm transition-all">
          Continue
        </button>
      </div>
    </div>
  );
};

export default function ApplicationsTable() {
  const [sortField] = useState<SortField>("");
  const [sortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
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
  const filtered = tableData.filter((application) => {
    
    const matchesAgent = filters.agent === "all" || application.agentEmail === filters.agent;
    const matchesStudent = filters.student === "all" || application.studentEmail === filters.student;
    const matchesUniversity = filters.university === "all" || application.university === filters.university;
    const matchesCourse = filters.course === "all" || application.course === filters.course;
    
    return matchesAgent && matchesStudent && matchesUniversity && matchesCourse;
  });

  // Sorting
  if (sortField) {
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === "asc" ? 1 : -1;
      if (bValue === undefined) return sortDirection === "asc" ? -1 : 1;
      
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
}, [filters, sortField, sortDirection]);

  // const handleSort = (field: keyof Application) => {
  //   if (sortField === field) {
  //     setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortField(field);
  //     setSortDirection("asc");
  //   }
  // };

  const handleApplyFilters = (newFilters: FilterOptions) => {
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedData.length > 0 ? (
          filteredAndSortedData.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No applications found matching your criteria.
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try adjusting your filters
            </p>
          </div>
        )}
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