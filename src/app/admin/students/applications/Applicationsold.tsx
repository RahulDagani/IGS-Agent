"use client"
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";


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

interface CommonDocument {
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
}

interface SpecificDocument {
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
}

interface Application {
  id: number;
  university: string;
  course: string;
  intake: string;
  status: string;
  assignedTo: string;
  studentName: string;
  studentEmail: string;
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
  current_status_id?: number;
  student_user_id?: number;
  created_by?: number;
  commonDocuments?: CommonDocument[];
  specificDocuments?: SpecificDocument[];
}

interface FilterOption {
  id: string | number;
  name: string | null;
  email?: string;
}

interface FilterOptions {
  students: FilterOption[];
  universities: FilterOption[];
  studyLevels: FilterOption[];
  disciplines: FilterOption[];
  courses: FilterOption[];
  intakes: FilterOption[];
  years: FilterOption[];
  applicationStatus: FilterOption[];
}

interface AppliedFilters {
  course?: string;
  student?: string;
  university?: string;
  status?: string;
  year?: string;
  intake?: string;
  discipline?: string;
  study_level?: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: FilterOptions | null;
  appliedFilters: AppliedFilters;
  onFilterChange: (filters: AppliedFilters) => void;
}

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  statuses: ApplicationStatus[];
  onUpdateStatus: (applicationId: number, statusId: number) => Promise<void>;
  loading: boolean;
}

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documents: CommonDocument[] | SpecificDocument[] | undefined;
  loading: boolean;
  onRequestDocument?: (documentData: DocumentRequestData) => Promise<void>;
  showRequestButton?: boolean;
  applicationId?: number;
}

interface DocumentRequestData {
  document_name: string;
  is_mandatory: number;
  remarks: string;
}

interface DocumentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentRequestData) => Promise<void>;
  loading: boolean;
  applicationId: number;
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
    intake_date: string | null;
    intake_id: number | null;
    submission_deadline: string | null;
    seat_availability: string | null;
    turnaround_time: string | null;
    conversion_rate: string | null;
    overall_score_label: string | null;
    overall_score_intent: string | null;
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
    list: CommonDocument[];
    status: string;
  };
  specific_documents: {
    list: SpecificDocument[];
    status: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: ApiApplicationResponse[];
  filterOptions: FilterOptions;
  appliedFilters: AppliedFilters;
  count: number;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filterOptions,
  appliedFilters,
  onFilterChange,
}) => {
  const [localFilters, setLocalFilters] = useState<AppliedFilters>(appliedFilters);

  // Initialize local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  const handleFilterChange = (key: keyof AppliedFilters, value: string) => {
    const newFilters = {
      ...localFilters,
      [key]: value === "all" ? undefined : value
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: AppliedFilters = {};
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Student Applications
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

        {!filterOptions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student
                </label>
                <select
                  value={localFilters.student || "all"}
                  onChange={(e) => handleFilterChange('student', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {filterOptions?.students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.id === "all" ? student.name : `${student.name || ""} (${student.email})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* University Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  University
                </label>
                <select
                  value={localFilters.university || "all"}
                  onChange={(e) => handleFilterChange('university', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {filterOptions?.universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.id === "all" ? university.name : university.name || `University ${university.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course
                </label>
                <select
                  value={localFilters.course || "all"}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {filterOptions?.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.id === "all" ? course.name : course.name || `Course ${course.id}`}
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
                  value={localFilters.study_level || "all"}
                  onChange={(e) => handleFilterChange('study_level', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {filterOptions?.studyLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.id === "all" ? level.name : level.name || `Level ${level.id}`}
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
                  value={localFilters.discipline || "all"}
                  onChange={(e) => handleFilterChange('discipline', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {filterOptions?.disciplines.map((discipline) => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.id === "all" ? discipline.name : discipline.name || `Discipline ${discipline.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Intake Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intake
                </label>
                <select
                  value={localFilters.intake || "all"}
                  onChange={(e) => handleFilterChange('intake', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {filterOptions?.intakes.map((intake) => (
                    <option key={intake.id} value={intake.id}>
                      {intake.id === "all" ? intake.name : intake.name || `Intake ${intake.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={localFilters.year || "all"}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {filterOptions?.years.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.id === "all" ? year.name : year.name || `Year ${year.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Application Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Status
                </label>
                <select
                  value={localFilters.status || "all"}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {filterOptions?.applicationStatus.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.id === "all" ? status.name : status.name || `Status ${status.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Reset All
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              >
                Apply
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface FlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

const FlowModal: React.FC<FlowModalProps> = ({
  isOpen,
  onClose,
  application
}) => {
  
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Application Status Flow
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

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>University:</strong> {application.university}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Course:</strong> {application.course}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Student:</strong> {application.studentName}
          </p>
        </div>

        {/* Application Status Flow */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Application Status History
          </h4>
          
          <div className="space-y-4">
            {/* Application Submitted */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Application Submitted
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted on: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Application Reviewed */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Application Reviewed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reviewed by: Admin • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Assigned to User */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {application.assignedTo !== "Not Assigned" 
                    ? `Assigned to ${application.assignedTo}`
                    : "Not Assigned Yet"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status: {application.assignedTo === "Not Assigned" ? "Pending" : "Assigned"}
                </p>
              </div>
            </div>

            {/* Document Status */}
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                application.commonDocumentsStatus === "complete" 
                  ? "bg-green-100 dark:bg-green-900" 
                  : "bg-yellow-100 dark:bg-yellow-900"
              }`}>
                <svg className={`w-4 h-4 ${
                  application.commonDocumentsStatus === "complete" 
                    ? "text-green-600 dark:text-green-300" 
                    : "text-yellow-600 dark:text-yellow-300"
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {application.commonDocumentsStatus === "complete" 
                    ? "Documents Verified" 
                    : "Documents Pending"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {application.commonDocumentsStatus === "complete" 
                    ? "All documents verified" 
                    : "Waiting for document upload"}
                </p>
              </div>
            </div>

            {/* Current Status */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {application.status}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current Status • Updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  application,
  statuses,
  onUpdateStatus,
  loading,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    if (application && statuses.length > 0) {
      const currentStatus = statuses.find(status => status.id === application.current_status_id);
      setSelectedStatus(currentStatus ? currentStatus.id.toString() : "");
    }
  }, [application, statuses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !selectedStatus) return;

    await onUpdateStatus(application.id, parseInt(selectedStatus));
    onClose();
  };

  const handleClose = () => {
    setSelectedStatus("");
    onClose();
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Update Application Status
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

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>University:</strong> {application.university}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Course:</strong> {application.course}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Student:</strong> {application.studentName}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="">Select a status</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id.toString()}>
                  {status.status_label || `Status ${status.id}`}
                </option>
              ))}
            </select>
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
              disabled={loading || !selectedStatus}
              className="flex-1 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DocumentRequestModal: React.FC<DocumentRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [documentName, setDocumentName] = useState<string>("");
  const [isMandatory, setIsMandatory] = useState<number>(1);
  const [remarks, setRemarks] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentName.trim()) {
      alert("Please enter a document name");
      return;
    }

    const documentData: DocumentRequestData = {
      document_name: documentName,
      is_mandatory: isMandatory,
      remarks: remarks.trim() || "Please upload the requested document",
    };

    await onSubmit(documentData);
    
    // Reset form
    setDocumentName("");
    setIsMandatory(1);
    setRemarks("");
  };

  const handleClose = () => {
    setDocumentName("");
    setIsMandatory(1);
    setRemarks("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Request Additional Document
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Name *
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., IELTS Certificate, Work Experience Letter"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Requirement
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="1"
                    checked={isMandatory === 1}
                    onChange={() => setIsMandatory(1)}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mandatory</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="0"
                    checked={isMandatory === 0}
                    onChange={() => setIsMandatory(0)}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Optional</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remarks / Instructions
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Please provide clear instructions for the document..."
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending Request..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  title,
  documents,
  loading,
  onRequestDocument,
  showRequestButton = false,
  applicationId,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  if (!isOpen) return null;
  const handleRequestDocument = async (documentData: DocumentRequestData) => {
    if (onRequestDocument) {
      await onRequestDocument(documentData);
      setShowRequestModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDocumentType = (doc: CommonDocument | SpecificDocument) => {
    if ('document_type' in doc) {
      return doc.document_type;
    }
    return 'Common';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {title}
            </h3>
            <div className="flex items-center gap-3">
              {showRequestButton && onRequestDocument && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-hidden focus:ring-2 focus:ring-green-500/10 transition-colors"
                >
                  + Request Document
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading documents...</div>
              </div>
            ) : !documents || documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No documents found
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {doc.document_name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Type: {getDocumentType(doc)} | 
                          {doc.is_mandatory ? ' Required' : ' Optional'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </div>
                    
                    {doc.uploaded_at && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                    
                    {doc.remarks && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <strong>Remarks:</strong> {doc.remarks}
                      </p>
                    )}
                    
                    {doc.file_url ? (
                      <div className="mt-3">
                        <a
                          href={`https://api.applystore.org/${doc.file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Document
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        No file uploaded
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showRequestModal && applicationId && (
        <DocumentRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleRequestDocument}
          loading={loading}
          applicationId={applicationId}
        />
      )}
    </>
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
  onUpdateStatus: (application: Application) => void;
  onViewCommonDocs: (application: Application) => void;
  onViewSpecificDocs: (application: Application) => void;
  onRequestAdditionalDoc: (application: Application) => void;
  setShowFlowModal: (application: Application) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ 
  application, 
  onUpdateStatus,
  onViewCommonDocs,
  onViewSpecificDocs,
  onRequestAdditionalDoc,
  setShowFlowModal
}) => {
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
          <Link href={"/admin/students/" + application.student_user_id + "/details"}>
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
          </Link>
          
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => onViewCommonDocs(application)}
          >
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
          
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => onViewSpecificDocs(application)}
          >
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
        <button 
          onClick={() => onUpdateStatus(application)}
          className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/30 font-semibold py-2 rounded-lg text-sm transition-all"
        >
          Update Status
        </button>
      </div>
      <div className="mt-6 flex gap-3">
        <button 
          onClick={() => onRequestAdditionalDoc(application)}
          className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/30 font-semibold py-2 rounded-lg text-sm transition-all"
        >
          Req Doc
        </button>

        <button 
          onClick={() => setShowFlowModal(application)}
          className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/30 font-semibold py-2 rounded-lg text-sm transition-all"
        >
          Application flow
        </button>
      </div>
    </div>
  );
};

export default function ApplicationsTable() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState<boolean>(false);
  const [isCommonDocsModalOpen, setIsCommonDocsModalOpen] = useState<boolean>(false);
  const [isSpecificDocsModalOpen, setIsSpecificDocsModalOpen] = useState<boolean>(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<CommonDocument[] | SpecificDocument[] | undefined>([]);
  const [selectedModalTitle, setSelectedModalTitle] = useState<string>("");
  const [isFlowModalOpen, setIsFlowModalOpen] = useState<boolean>(false);

      const [applicationStatuses, setApplicationStatuses] = useState<ApplicationStatus[]>([]);
  
  
  const [filters, setFilters] = useState<AppliedFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState({
    applications: false,
    updatingStatus: false,
    requestingDocument: false
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();

  // Build query string from filters
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add all filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
          if(key == "status"){
            key = "applicationStatus"
            params.append(key, value);
          }else if(key == "study_level"){
            key = "level"
            params.append(key, value);
          }else{
            params.append(key, value);
          }
          
        
      }
    });
    
    return params.toString();
  }, [filters]);

  // Fetch applications with filters
  const fetchApplications = useCallback(async () => {
    if (!token) {
      setError("Authentication token not found");
      setLoading(prev => ({ ...prev, applications: false }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, applications: true }));
      setError(null);
      
      const queryString = buildQueryString();
      const url = `${BASE_URL}/tenant/student/applications/filters/dynamic${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        // Transform API data to match Application interface
        const transformedApplications: Application[] = result.data.map((apiApp: ApiApplicationResponse) => ({
          id: apiApp.application.id,
          university: apiApp.application.university_name,
          course: apiApp.application.course_name,
          intake: apiApp.application.intake_date 
            ? new Date(apiApp.application.intake_date).getFullYear().toString()
            : "Fall 2024",
          status: apiApp.application.status_label,
          assignedTo: apiApp.application.assigned_to || "Not Assigned",
          studentName: `${apiApp.student_profile.first_name} ${apiApp.student_profile.last_name}`,
          studentEmail: apiApp.student_profile.alternate_email || "student@example.com",
          country: apiApp.application.university_country,
          degree: apiApp.application.study_level_name,
          location: `${apiApp.application.university_city}, ${apiApp.application.university_state}`,
          externalEvaluation: "Not Provided",
          profileStatus: apiApp.profile_status,
          commonDocumentsStatus: apiApp.common_documents.status,
          specificDocumentsStatus: apiApp.specific_documents.status,
          commonDocuments: apiApp.common_documents.list,
          specificDocuments: apiApp.specific_documents.list,
          current_status_id: apiApp.application.current_status_id,
          student_user_id: apiApp.application.student_user_id,
          created_by: apiApp.application.created_by
        }));

        setApplications(transformedApplications);
        setFilterOptions(result.filterOptions);
      } else {
        setApplications([]);
        setFilterOptions(null);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
      setApplications([]);
      setFilterOptions(null);
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  }, [token, buildQueryString, BASE_URL]);


  
      // Fetch application statuses
      useEffect(() => {
        const fetchApplicationStatuses = async () => {
          setLoading(prev => ({ ...prev, statuses: true }));
          try {
            const response = await fetch(`${BASE_URL}/tenant/application/statuses`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
            const data = await response.json();
            
            if (data.success) {
              setApplicationStatuses(data.data);
            } else {
              throw new Error('Failed to fetch application statuses');
            }
          } catch (err) {
            setError('Failed to load application statuses');
            console.error('Error fetching application statuses:', err);
          } finally {
            setLoading(prev => ({ ...prev, statuses: false }));
          }
        };
    
        fetchApplicationStatuses();
      }, [BASE_URL, token]);

  // Initial fetch
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle filter changes with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchApplications();
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: AppliedFilters) => {
    setFilters(newFilters);
  };

  // Filter removal functions
  const handleRemoveFilter = (key: keyof AppliedFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const handleUpdateStatusClick = (application: Application) => {
    setSelectedApplication(application);
    setIsUpdateStatusModalOpen(true);
  };

  const handleViewCommonDocs = (application: Application) => {
    setSelectedApplication(application);
    setSelectedDocuments(application.commonDocuments);
    setSelectedModalTitle(`Common Documents - ${application.studentName}`);
    setIsCommonDocsModalOpen(true);
  };

  const handleViewSpecificDocs = (application: Application) => {
    setSelectedApplication(application);
    setSelectedDocuments(application.specificDocuments);
    setSelectedModalTitle(`Specific Documents - ${application.studentName}`);
    setIsSpecificDocsModalOpen(true);
  };

  const handleRequestAdditionalDoc = (application: Application) => {
    setSelectedApplication(application);
    handleViewSpecificDocs(application);
  };

  const handleShowFlowModal = (application: Application) => {
    setSelectedApplication(application);
    setIsFlowModalOpen(true);
  };

  const handleRequestDocument = async (documentData: DocumentRequestData) => {
    if (!selectedApplication) return;

    setLoading(prev => ({ ...prev, requestingDocument: true }));
    try {
      const response = await fetch(
        `${BASE_URL}/tenant/application/document/request/${selectedApplication.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(documentData)
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Document request sent successfully!');
        fetchApplications(); // Refresh applications
      } else {
        throw new Error(data.message || 'Failed to request document');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send document request';
      setError(errorMessage);
      console.error('Error requesting document:', err);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, requestingDocument: false }));
    }
  };

  const handleUpdateStatus = async (applicationId: number, statusId: number) => {
    if (!selectedApplication) return;

    setLoading(prev => ({ ...prev, updatingStatus: true }));
    try {
      const { student_user_id } = selectedApplication;
      
      const response = await fetch(
        `${BASE_URL}/tenant/student/application/status/${student_user_id}/${applicationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            current_status_id: statusId
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchApplications(); // Refresh applications
      } else {
        throw new Error('Failed to update application status');
      }
    } catch (err) {
      setError('Failed to update application status');
      console.error('Error updating application status:', err);
    } finally {
      setLoading(prev => ({ ...prev, updatingStatus: false }));
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  // Get filter display name
  const getFilterDisplayName = (key: keyof AppliedFilters, value: string): string => {
    if (!filterOptions) return value;
    
    const optionMap: Record<keyof AppliedFilters, FilterOption[]> = {
      course: filterOptions.courses,
      student: filterOptions.students,
      university: filterOptions.universities,
      status: filterOptions.applicationStatus,
      year: filterOptions.years,
      intake: filterOptions.intakes,
      discipline: filterOptions.disciplines,
      study_level: filterOptions.studyLevels,
    };

    const option = optionMap[key]?.find(opt => opt.id.toString() === value);
    return option?.name || value;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Applications</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {applications.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Applications</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {applications.filter(a => a.status === 'Applied').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Pending Documents</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {applications.filter(a => a.commonDocumentsStatus === 'incomplete').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Universities</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {new Set(applications.map(a => a.university)).size}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Button and Active Filters */}
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All Filters
            </button>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filter Applications
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {Object.entries(filters).map(([key, value]) => (
            <Badge key={key} size="sm" color="primary">
              {key}: {getFilterDisplayName(key as keyof AppliedFilters, value)}
              <button 
                onClick={() => handleRemoveFilter(key as keyof AppliedFilters)}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {loading.applications && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      )}

      {!loading.applications && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications && applications.length > 0 ? (
            applications.map((application, index) => (
              <ApplicationCard 
                key={`${application.id}-${index}`} 
                application={application} 
                onUpdateStatus={handleUpdateStatusClick}
                onViewCommonDocs={handleViewCommonDocs}
                onViewSpecificDocs={handleViewSpecificDocs}
                onRequestAdditionalDoc={handleRequestAdditionalDoc}
                setShowFlowModal={handleShowFlowModal}
              />
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
        filterOptions={filterOptions}
        appliedFilters={filters}
        onFilterChange={handleFilterChange}
      />

      <UpdateStatusModal
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
        application={selectedApplication}
        statuses={applicationStatuses}
        onUpdateStatus={handleUpdateStatus}
        loading={loading.updatingStatus}
      />

      <DocumentsModal
        isOpen={isCommonDocsModalOpen}
        onClose={() => setIsCommonDocsModalOpen(false)}
        title={selectedModalTitle}
        documents={selectedDocuments}
        loading={false}
      />

      <FlowModal
        isOpen={isFlowModalOpen}
        onClose={() => setIsFlowModalOpen(false)}
        application={selectedApplication}
      />

      <DocumentsModal
        isOpen={isSpecificDocsModalOpen}
        onClose={() => setIsSpecificDocsModalOpen(false)}
        title={selectedModalTitle}
        documents={selectedDocuments}
        loading={false}
        onRequestDocument={handleRequestDocument}
        showRequestButton={true}
        applicationId={selectedApplication?.id || 0}
      />
    </div>
  );
}