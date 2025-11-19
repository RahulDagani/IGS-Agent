"use client"
import React, { useState, useMemo, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/context/AuthContext";

interface Application {
  id: number;
  university: string;
  course: string;
  intake: string;
  status: "Applied" | "Received" | "Submitted to University" | "Documents Pending" | "Application Complete";
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
  profileStatus: string;
  commonDocumentsStatus: string;
  specificDocumentsStatus: string;
}

interface Agent {
  user_id: number;
  email: string;
  phone: string | null;
  name: string;
  business_name: string | null;
  is_agent_verified: number;
  is_payment_verified: number;
}

interface Student {
  user_id: number;
  email: string;
  phone: string;
  status: string;
  first_name: string;
  last_name: string;
  passport_number: string;
  dob: string;
  created_at: string;
}

interface ApplicationStatus {
  id: number;
  tenant_id: number;
  status_key: string;
  status_label: string;
  sort_order: number;
  is_default: number;
  is_active: number;
  created_at: string;
  updated_at: string | null;
}

interface FilterOptions {
  agent: string;
  student: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  agents: Agent[];
  students: Student[];
  loadingStudents: boolean;
}

interface ApiApplicationResponse {
  application: {
    id: number;
    uuid: string;
    tenant_id: number;
    student_user_id: number;
    course_id: number;
    study_level_id: number;
    current_status_id: number;
    assigned_to: string | null;
    remarks: string | null;
    is_submitted_to_university: number;
    role: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    is_deleted: number;
    status_key: string;
    status_label: string;
    status_sort_order: number;
    course_name: string;
    course_slug: string;
    duration_min: number;
    duration_max: number;
    duration_unit: string;
    tuition_fee: string;
    application_fee: string;
    currency_code: string;
    study_level_name: string;
    discipline_name: string;
    university_name: string;
    university_slug: string;
    university_logo: string | null;
    university_country: string;
    university_state: string;
    university_city: string;
  };
  student_profile: {
    id: number;
    uuid: string;
    tenant_id: number;
    user_id: number;
    passport_number: string;
    salutation: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    alternate_email: string | null;
    country_code: string;
    state_code: string;
    city_code: string;
    alternate_phone_number: string | null;
    dob: string;
    gender: string;
    citizenship: string;
    address: string;
    postal_code: string;
    emergency_c_name: string;
    emergency_c_relation: string;
    emergency_c_email: string;
    emergency_c_phone: string;
    profile: string | null;
    created_at: string;
    updated_at: string;
    is_deleted: number;
  };
  profile_status: string;
  common_documents: {
    list: Array<{
      id: number;
      student_id: number;
      study_level_id: number;
      document_name: string;
      is_mandatory: number;
      file_url: string | null;
      uploaded_at: string | null;
      uploaded_by: number | null;
      status: string;
      remarks: string | null;
      is_deleted: number;
      created_at: string;
    }>;
    status: string;
  };
  specific_documents: {
    list: Array<{
      id: number;
      application_id: number;
      document_name: string;
      document_type: string;
      is_mandatory: number;
      file_url: string | null;
      uploaded_at: string | null;
      uploaded_by: number | null;
      status: string;
      remarks: string | null;
      is_deleted: number;
      created_at: string;
    }>;
    status: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: ApiApplicationResponse[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  agents,
  students,
  loadingStudents,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      agent: selectedAgent,
      student: selectedStudent,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedAgent("all");
    setSelectedStudent("all");
  };

  useEffect(() => {
    if (selectedAgent === "all") {
      setSelectedStudent("all");
    }
  }, [selectedAgent]);

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
                <option key={agent.user_id} value={agent.user_id.toString()}>
                  {agent.name} ({agent.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={selectedAgent === "all" || loadingStudents}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">
                {selectedAgent === "all" 
                  ? "Please select an agent first" 
                  : loadingStudents 
                    ? "Loading students..." 
                    : "All Students"
                }
              </option>
              {students.map((student) => (
                <option key={student.user_id} value={student.user_id.toString()}>
                  {student.first_name} {student.last_name} ({student.email})
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

interface ApplicationCardProps {
  application: Application;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
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
      case "Application Complete":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    return status === "complete" ? "✓" : "✕";
  };

  const getDocumentStatusColor = (status: string) => {
    return status === "complete" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500";
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-end">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full mb-2 ${getStatusColor(application.status)}`}>
          {application.status}
        </span>
      </div>
     
      <div className="flex items-start justify-between">
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
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <CardIcons.GraduationCap />
          <span>
            <strong className="font-semibold text-gray-800 dark:text-white">Degree:</strong>{" "}
            {application.degree}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <CardIcons.MapMarker />
          <span>
            <strong className="font-semibold text-gray-800 dark:text-white">Location:</strong>{" "}
            {application.location}
          </span>
        </div>

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
      
      <div className="mt-4">
        <p className="text-sm font-semibold text-red-500 mb-3">Pending</p>
        <div className="flex justify-between items-center text-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              application.profileStatus === "complete" ? "bg-green-100" : "bg-red-100"
            }`}>
              <span className={`text-lg font-bold ${
                application.profileStatus === "complete" ? "text-green-500" : "text-red-500"
              }`}>
                {getDocumentStatusIcon(application.profileStatus)}
              </span>
            </div>
            <p className="text-xs dark:text-white">Common Form</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              application.commonDocumentsStatus === "complete" ? "bg-green-100" : "bg-red-100"
            }`}>
              <span className={`text-lg font-bold ${
                application.commonDocumentsStatus === "complete" ? "text-green-500" : "text-red-500"
              }`}>
                {getDocumentStatusIcon(application.commonDocumentsStatus)}
              </span>
            </div>
            <p className="text-xs dark:text-white">Common Docs</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
              application.specificDocumentsStatus === "complete" ? "bg-green-100" : "bg-red-100"
            }`}>
              <span className={`text-lg font-bold ${
                application.specificDocumentsStatus === "complete" ? "text-green-500" : "text-red-500"
              }`}>
                {getDocumentStatusIcon(application.specificDocumentsStatus)}
              </span>
            </div>
            <p className="text-xs dark:text-white">Specific Docs</p>
          </div>
        </div>
      </div>

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    agent: "all",
    student: "all",
  });
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState({
    agents: false,
    students: false,
    applications: false
  });
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(prev => ({ ...prev, agents: true }));
      try {
        const response = await fetch(`${BASE_URL}/tenant/agent/list`,{
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setAgents(data.data);
        } else {
          throw new Error('Failed to fetch agents');
        }
      } catch (err) {
        setError('Failed to load agents');
        console.error('Error fetching agents:', err);
      } finally {
        setLoading(prev => ({ ...prev, agents: false }));
      }
    };

    fetchAgents();
  }, [BASE_URL, token]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (filters.agent === "all") {
        setStudents([]);
        return;
      }

      setLoading(prev => ({ ...prev, students: true }));
      try {
        const response = await fetch(`${BASE_URL}/tenant/agent/student/list/${filters.agent}`,
          {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
        );
        const data = await response.json();
        
        if (data.success) {
          setStudents(data.data);
        } else {
          throw new Error('Failed to fetch students');
        }
      } catch (err) {
        setError('Failed to load students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(prev => ({ ...prev, students: false }));
      }
    };

    fetchStudents();
  }, [filters.agent, BASE_URL, token]);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(prev => ({ ...prev, applications: true }));
      try {
        let url = `${BASE_URL}/tenant/agent/application/list`;
        
        if (filters.agent !== "all" && filters.student !== "all") {
          url = `${BASE_URL}/tenant/agent/application/list/${filters.agent}/${filters.student}`;
        } else if (filters.agent !== "all") {
          url = `${BASE_URL}/tenant/agent/application/list/${filters.agent}`;
        }

        const response = await fetch(url,{
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data: ApiResponse = await response.json();
        
        if (data.success) {
          const transformedApplications: Application[] = data.data.map((app: ApiApplicationResponse) => ({
            id: app.application.id,
            university: app.application.university_name,
            course: app.application.course_name,
            intake: "Fall 2024", // You might want to get this from the API if available
            status: mapStatus(app.application.status_key),
            assignedTo: app.application.assigned_to || "Not Assigned",
            studentName: `${app.student_profile.first_name} ${app.student_profile.last_name}`,
            studentEmail: "student@example.com", // You might want to get this from student data
            agentName: "Agent Name", // You might want to get this from agent data
            agentEmail: "agent@example.com", // You might want to get this from agent data
            country: app.application.university_country,
            degree: app.application.study_level_name,
            location: `${app.application.university_city}, ${app.application.university_state}`,
            externalEvaluation: "Not Provided", // You might want to get this from the API if available
            profileStatus: app.profile_status,
            commonDocumentsStatus: app.common_documents.status,
            specificDocumentsStatus: app.specific_documents.status
          }));
          
          setApplications(transformedApplications);
        } else {
          throw new Error('Failed to fetch applications');
        }
      } catch (err) {
        setError('Failed to load applications');
        console.error('Error fetching applications:', err);
        setApplications([]);
      } finally {
        setLoading(prev => ({ ...prev, applications: false }));
      }
    };

    fetchApplications();
  }, [filters.agent, filters.student, BASE_URL, token]);

  const mapStatus = (statusKey: string): Application["status"] => {
    switch (statusKey) {
      case "applied":
        return "Applied";
      case "received":
        return "Received";
      case "submitted_to_university":
        return "Submitted to University";
      case "documents_pending":
        return "Documents Pending";
      default:
        return "Applied";
    }
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.agent !== "all" || filters.student !== "all";

  const clearAllFilters = () => {
    setFilters({
      agent: "all",
      student: "all",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
            disabled={loading.agents}
            className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            {loading.agents ? "Loading..." : "Apply Filters"}
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.agent !== "all" && (
            <Badge size="sm" color="primary">
              Agent: {agents.find(a => a.user_id.toString() === filters.agent)?.name}
            </Badge>
          )}
          {filters.student !== "all" && (
            <Badge size="sm" color="primary">
              Student: {students.find(s => s.user_id.toString() === filters.student)?.first_name} {students.find(s => s.user_id.toString() === filters.student)?.last_name}
            </Badge>
          )}
        </div>
      )}

      {loading.applications && (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading applications...</div>
        </div>
      )}

      {!loading.applications && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications && applications.length > 0 ? (
            applications.map((application, index) => (
              <ApplicationCard key={`${application.id}-${index}`} application={application} />
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
      )}

      {!loading.applications && applications && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {applications.length} application{applications.length !== 1 ? 's' : ''}
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        agents={agents}
        students={students}
        loadingStudents={loading.students}
      />
    </div>
  );
}