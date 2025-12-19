"use client"
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Badge from "@/components/ui/badge/Badge";
import { User, Upload, FileText, X, ArrowBigRight, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Country } from "country-state-city";

import ApplicationFormModal from "./ApplicationFormModal";

interface Application {
  id: number;
  university: string;
  course: string;
  intake: string;
  status: string;
  country?: string;
  degree?: string;
  location?: string;
  externalEvaluation?: string;
  ielts?: number;
  pte?: number;
  duolingo?: number;
  tuitionFee?: string;
  applicationFee?: string;
  currencyCode?: string;
  duration?: string;
  student_user_id?: number;
  profile_status?: string;
  common_documents?: {
    list: Array<{
      id: number;
      document_name: string;
      is_mandatory: number;
      file_url: string | null;
      uploaded_at: string | null;
      status: string;
    }>;
    status: string;
  };
  specific_documents?: {
    list: Array<{
      id: number;
      document_name: string;
      is_mandatory: number;
      file_url: string | null;
      uploaded_at: string | null;
      status: string;
    }>;
    status: string;
  };
}

// New API Response Interfaces
interface ApiApplication {
  application: {
    id: number;
    uuid: string;
    tenant_id: number;
    agent_id: number;
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
    updated_at: string | null;
    is_deleted: number;
    status_key: string | null;
    status_label: string | null;
    status_sort_order: number | null;
    course_name: string;
    course_slug: string;
    duration_min: number;
    duration_max: number;
    duration_unit: string;
    tuition_fee: string;
    application_fee: string;
    currency_code: string;
    study_level_name: string;
    discipline_id: number;
    discipline_name: string;
    university_name: string;
    university_slug: string;
    university_id: number;
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
    agent_id: number;
    user_id: number;
    passport_number: string;
    salutation: string | null;
    first_name: string;
    middle_name: string;
    last_name: string;
    alternate_email: string | null;
    country_code: string | null;
    state_code: string | null;
    city_code: string | null;
    alternate_phone_number: string | null;
    dob: string;
    gender: string | null;
    citizenship: string | null;
    address: string | null;
    postal_code: string | null;
    emergency_c_name: string | null;
    emergency_c_relation: string | null;
    emergency_c_email: string | null;
    emergency_c_phone: string | null;
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

interface FilterOption {
  id: string | number;
  name: string;
  email?: string;
  start_date?: string;
}

// API 1 Response Interface
interface FilterApiResponse {
  success: boolean;
  data: {
    filterOptions: {
      students: FilterOption[];
      universities: FilterOption[];
      studyLevels: FilterOption[];
      disciplines: FilterOption[];
      courses: FilterOption[];
      intakes: FilterOption[];
      years: FilterOption[];
      applicationStatus: FilterOption[];
    };
    appliedFilters: Record<string, any>;
    count: number;
  };
}

// API 2 Response Interface
interface ApplicationsApiResponse {
  success: boolean;
  data: ApiApplication[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

type SortField = keyof Application | "";
type SortDirection = "asc" | "desc";

// New Filter Options Interface
interface FilterOptions {
  student: string | number;
  university: string | number;
  study_level_id: string | number;
  discipline: string | number;
  course: string | number;
  intake: string | number;
  year: string | number;
  applicationStatus: string | number;
  search?: string;
}

// Filter Modal Component
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterApply: (filters: FilterOptions) => void;
  filterOptions: FilterApiResponse['data']['filterOptions'] | null;
  appliedFilters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

// Helper function to get country name
const getCountryName = (code: string | undefined | null) => {
  if (!code) return '';
  const country = Country.getCountryByCode(code);
  return country ? country.name : code;
};

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onFilterApply,
  filterOptions,
  appliedFilters,
  onFiltersChange,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(appliedFilters);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  const handleSelectChange = (key: keyof FilterOptions, value: string | number) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    setLocalFilters(newFilters);
    // Immediately notify parent about filter change
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      student: "all",
      university: "all",
      study_level_id: "all",
      discipline: "all",
      course: "all",
      intake: "all",
      year: "all",
      applicationStatus: "all",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleApply = () => {
    onFilterApply(localFilters);
    onClose();
  };

  if (!isOpen || !filterOptions) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Applications
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Student
            </label>
            <select
              value={localFilters.student}
              onChange={(e) => handleSelectChange('student', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {filterOptions.students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name || student.email}
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
              value={localFilters.university}
              onChange={(e) => handleSelectChange('university', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {filterOptions.universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
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
              value={localFilters.study_level_id}
              onChange={(e) => handleSelectChange('study_level_id', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {filterOptions.studyLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
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
              value={localFilters.discipline}
              onChange={(e) => handleSelectChange('discipline', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {filterOptions.disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
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
              value={localFilters.course}
              onChange={(e) => handleSelectChange('course', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {filterOptions.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
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
              value={localFilters.intake}
              onChange={(e) => handleSelectChange('intake', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {filterOptions.intakes.map((intake) => (
                <option key={intake.id} value={intake.id}>
                  {intake.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Status
            </label>
            <select
              value={localFilters.applicationStatus}
              onChange={(e) => handleSelectChange('applicationStatus', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {filterOptions.applicationStatus.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
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
              value={localFilters.year}
              onChange={(e) => handleSelectChange('year', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {filterOptions.years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Document Upload Modal Component
interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  documents: Document[];
  studentId: number,
  documentType: 'common' | 'specific';
  onUploadSuccess: () => void;
}

interface Document {
  id: number;
  document_name: string;
  is_mandatory: number;
  file_url: string | null;
  uploaded_at: string | null;
  status: string;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  documents,
  studentId,
  documentType,
  onUploadSuccess,
}) => {
  const { token } = useAuth();
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const handleFileUpload = async (documentId: number, file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('document_id', documentId.toString());
    formData.append('file', file);

    setUploading(prev => ({ ...prev, [documentId]: true }));
    setUploadProgress(prev => ({ ...prev, [documentId]: 0 }));

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(prev => ({ ...prev, [documentId]: progress }));
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      if(documentType == "common"){
        xhr.open('PUT', `${BASE_URL}/agent/application/upload/common/document/${studentId}`);
        
      }else{
        xhr.open('PUT', `${BASE_URL}/agent/application/upload/document/${applicationId}`);
        
      }

      
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

      await uploadPromise;
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [documentId]: false }));
      setUploadProgress(prev => ({ ...prev, [documentId]: 0 }));
    }
  };

  const handleFileChange = (documentId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        alert('Please select a valid file type (PDF, JPG, PNG, DOC, DOCX)');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      handleFileUpload(documentId, file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded': return 'Uploaded';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Upload {documentType === 'common' ? 'Common' : 'Specific'} Documents
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {documentType === 'common' 
                ? 'These documents are common across all your applications.'
                : 'These documents are specific to this university application.'
              }
            </p>
          </div>

          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="mb-4">
                <label className="doc-card w-full cursor-pointer">
                  <div className="upload-area border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="doc-title font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {doc.document_name}
                          {doc.is_mandatory === 1 && (
                            <span className="text-red-500 text-sm">*</span>
                          )}
                        </div>
                        <div className={`doc-status text-sm mt-1 ${getStatusColor(doc.status)}`}>
                          {getStatusText(doc.status)}
                          {uploading[doc.id] && (
                            <span className="ml-2">
                              Uploading... {Math.round(uploadProgress[doc.id])}%
                            </span>
                          )}
                        </div>
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 text-sm hover:underline mt-1 inline-block"
                          >
                            View uploaded file
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {uploading[doc.id] ? (
                          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Upload className="text-gray-400" size={16} />
                            <FileText className="text-gray-400" size={20} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <input
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    type="file"
                    onChange={(e) => handleFileChange(doc.id, e)}
                    disabled={uploading[doc.id]}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>
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
  ),
  Calendar: () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Dollar: () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  )
};

interface ApplicationCardProps {
  application: Application;
  showApplicationForm: (studentId : number) => void;
  onContinue: (application: Application, documentType?: 'common' | 'specific') => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onContinue, showApplicationForm }) => {
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

  const getDocumentStatus = () => {
    const commonFormComplete = application.profile_status === 'complete';
    const commonDocsComplete = application.common_documents?.status === 'complete';
    const specificDocsComplete = application.specific_documents?.status === 'complete';

    return {
      commonForm: commonFormComplete ? 'completed' : 'pending',
      commonDocs: commonDocsComplete ? 'completed' : 'pending',
      specificDocs: specificDocsComplete ? 'completed' : 'pending'
    };
  };

  const docStatus = getDocumentStatus();
  const getStepStatus = (step: 'commonForm' | 'commonDocs' | 'specificDocs') => {
    if (step === 'commonForm') {
      return application.profile_status === 'complete' ? 'completed' : 'pending';
    }
    if (step === 'commonDocs') {
      return application.common_documents?.status === 'complete' ? 'completed' : 'pending';
    }
    if (step === 'specificDocs') {
      return application.specific_documents?.status === 'complete' ? 'completed' : 'pending';
    }
    return 'pending';
  };

  const getStepIcon = (status: 'completed' | 'pending') => {
    return status === 'completed' ? '✓' : '✕';
  };

  const getStepColor = (status: 'completed' | 'pending') => {
    return status === 'completed' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500';
  };

  const handleFormModal = (studentId : number) => {
    showApplicationForm(studentId);
  }

  const isAllComplete = docStatus.commonForm === 'completed' && 
                       docStatus.commonDocs === 'completed' && 
                       docStatus.specificDocs === 'completed';

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

        {/* Duration */}
        {application.duration && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <CardIcons.Calendar />
            <span>
              <strong className="font-semibold text-gray-800 dark:text-white">Duration:</strong>{" "}
              {application.duration}
            </span>
          </div>
        )}

        {/* Tuition Fee */}
        {application.tuitionFee && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <CardIcons.Dollar />
            <span>
              <strong className="font-semibold text-gray-800 dark:text-white">Tuition:</strong>{" "}
              {application.currencyCode} {application.tuitionFee}
            </span>
          </div>
        )}

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

      {/* Status Steps */}
      <div className="mt-4">
        <p className={`text-sm font-semibold mb-3 ${
          isAllComplete ? 'text-green-500' : 'text-red-500'
        }`}>
          {isAllComplete ? 'All documents submitted' : 'Pending'}
        </p>
        <div className="flex justify-between items-center text-center">
          <div className="flex flex-col items-center cursor-pointer" onClick={()=>handleFormModal(application.student_user_id || 0)}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${getStepColor(getStepStatus('commonForm'))}`}>
              <span className="text-lg font-bold">{getStepIcon(getStepStatus('commonForm'))}</span>
            </div>
            <p className="text-xs dark:text-white">Common Form</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${getStepColor(getStepStatus('commonDocs'))}`}>
              <span className="text-lg font-bold">{getStepIcon(getStepStatus('commonDocs'))}</span>
            </div>
            <p className="text-xs dark:text-white">Common Docs</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${getStepColor(getStepStatus('specificDocs'))}`}>
              <span className="text-lg font-bold">{getStepIcon(getStepStatus('specificDocs'))}</span>
            </div>
            <p className="text-xs dark:text-white">Specific Docs</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm transition-all">
          LIVE CHAT
        </button>
        {isAllComplete ? null : <button 
          onClick={() => onContinue(application)}
          className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/30 font-semibold py-2 rounded-lg text-sm transition-all"
        >
          {'Continue'}
        </button>}
        
      </div>

      {/* Quick Action Buttons */}
     
        <div className="mt-3 flex gap-2">
         
            <button 
              onClick={() => onContinue(application, 'common')}
              className="flex-1 px-3 py-1 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 rounded"
            >
              Upload Common Docs
            </button>
         
            <button 
              onClick={() => onContinue(application, 'specific')}
              className="flex-1 px-3 py-1 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 rounded"
            >
              Upload Specific Docs
            </button>
        </div>
    </div>
  );
};

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function ApplicationsTable() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [filterData, setFilterData] = useState<FilterApiResponse | null>(null);
  const [applicationsData, setApplicationsData] = useState<ApplicationsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState<boolean>(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<'common' | 'specific'>('specific');

  const [showApplicationFormModal, setShowApplicationFormModal] = useState<boolean>(false);
  const [activeStudentId, setActiveStudentId] = useState<number>(0);


  const handleCloseModal = () => {
  setShowApplicationFormModal(false);
  setActiveStudentId(0);
};


  
  // New filters state
  const [filters, setFilters] = useState<FilterOptions>({
    student: "all",
    university: "all",
    study_level_id: "all",
    discipline: "all",
    course: "all",
    intake: "all",
    year: "all",
    applicationStatus: "all",
  });

  // Track modal filters separately
  const [modalFilters, setModalFilters] = useState<FilterOptions>(filters);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  // Build query string for dynamic filters API
  const buildFilterQueryString = useCallback((filtersToBuild: FilterOptions) => {
    const params = new URLSearchParams();
    
    // Add all filters that are not "all"
    Object.entries(filtersToBuild).forEach(([key, value]) => {
      if (value !== "all" && value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  }, []);

  // Fetch filter options from API 1 with current modal filters
  const fetchFilters = useCallback(async (currentModalFilters?: FilterOptions) => {
    try {
      setLoadingFilters(true);
      const filtersToUse = currentModalFilters || filters;
      const queryString = buildFilterQueryString(filtersToUse);
      const url = `${BASE_URL}/agent/application/filters/dynamic${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        throw new Error('Failed to fetch filter options');
      }

      const data: FilterApiResponse = await response.json();
      
      if (data.success) {
        setFilterData(data);
      } else {
        throw new Error('Failed to load filter options');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingFilters(false);
    }
  }, [token, logout, buildFilterQueryString, filters]);

  // Build query string for applications API
  const buildApplicationsQueryString = useCallback((page: number = 1, filtersToBuild: FilterOptions) => {
    const params = new URLSearchParams();
    
    // Add page parameter
    params.append('page', page.toString());
    params.append('limit', '10');
    
    // Add all filters that are not "all"
    Object.entries(filtersToBuild).forEach(([key, value]) => {
      if (value !== "all" && value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    // Add search term
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    return params.toString();
  }, [searchTerm]);

  // Fetch applications from API 2
  const fetchApplications = useCallback(async (page: number = 1, loadMore: boolean = false, filtersToUse?: FilterOptions) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const filtersToApply = filtersToUse || filters;
      const queryString = buildApplicationsQueryString(page, filtersToApply);
      const url = `${BASE_URL}/agent/applications${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        throw new Error('Failed to fetch applications');
      }

      const data: ApplicationsApiResponse = await response.json();
      
      if (data.success) {
        if (loadMore && applicationsData) {
          // Append new data for infinite scroll
          setApplicationsData(prev => ({
            ...data,
            data: [...(prev?.data || []), ...data.data]
          }));
        } else {
          // Replace data for initial load or filter change
          setApplicationsData(data);
        }
        setCurrentPage(page);
        setHasMore(data.pagination.hasNextPage);
      } else {
        throw new Error('Failed to load applications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token, logout, buildApplicationsQueryString, filters, applicationsData]);

  // Initial fetch of filters and applications
  useEffect(() => {
    fetchFilters();
    fetchApplications(1, false, filters);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchApplications(1, false, filters);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  // Handle modal filters change - refetch dynamic filters
  const handleModalFiltersChange = useCallback((newModalFilters: FilterOptions) => {
    setModalFilters(newModalFilters);
    // Refetch filters with new modal filters
    fetchFilters(newModalFilters);
  }, [fetchFilters]);

  // Handle filter apply from modal
  const handleFilterApply = (newFilters: FilterOptions) => {
    // Update the main filters
    setFilters(newFilters);
    setModalFilters(newFilters);
    
    // Reset pagination and fetch applications with new filters
    setCurrentPage(1);
    fetchApplications(1, false, newFilters);
    
    // Close modal
    setIsFilterModalOpen(false);
  };

  // Reset modal filters when modal opens
  const handleModalOpen = () => {
    setModalFilters(filters);
    setIsFilterModalOpen(true);
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchApplications(currentPage + 1, true, filters);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loading, loadingMore, currentPage, fetchApplications]);

  // Transform API data to match the Application interface
  const tableData: Application[] = useMemo(() => {
    if (!applicationsData?.data) return [];

    return applicationsData.data.map((app) => {
     
     
      // Format duration
      const formatDuration = () => {
        const { duration_min, duration_max, duration_unit } = app.application;
        if (duration_min === duration_max) {
          return `${duration_min} ${duration_unit}`;
        }
        return `${duration_min}-${duration_max} ${duration_unit}`;
      };

      // Format intake from intake_date or created_at
      const formatIntake = () => {
        if (app.application.intake_date) {
          const date = new Date(app.application.intake_date);
          const year = date.getFullYear();
          const month = date.toLocaleString('default', { month: 'short' });
          return `${month} ${year}`;
        }
        
        // Fallback to created_at if no intake_date
        const date = new Date(app.application.created_at);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'short' });
        return `${month} ${year}`;
      };

      // Format location
      const formatLocation = () => {
        const { university_city, university_state, university_country } = app.application;
        const locationParts = [];
        if (university_city && university_city !== 'STF') locationParts.push(university_city);
        if (university_state && university_state !== 'CA') locationParts.push(university_state);
        if (university_country) locationParts.push(getCountryName(university_country));
        return locationParts.join(', ') || 'Location not specified';
      };

      // Format external evaluation requirement
      const getExternalEvaluation = () => {
        // Based on course or discipline, you can add logic here
        return "Required (WES)";
      };

      return {
        id: app.application.id,
        university: app.application.university_name,
        course: app.application.course_name,
        intake: formatIntake(),
        status: app.application.status_label || "Applied",
        country: getCountryName(app.application.university_country),
        degree: app.application.study_level_name,
        location: formatLocation(),
        externalEvaluation: getExternalEvaluation(),
        duration: formatDuration(),
        tuitionFee: app.application.tuition_fee,
        applicationFee: app.application.application_fee,
        currencyCode: app.application.currency_code,
        student_user_id: app.application.student_user_id,
        profile_status: app.profile_status,
        common_documents: app.common_documents,
        specific_documents: app.specific_documents,
        // Language scores - you can fetch these from API if available
        ielts: 6.5 + (app.application.id % 3 * 0.5),
        pte: 60 + (app.application.id % 4 * 3),
        duolingo: 110 + (app.application.id % 5 * 5)
      };
    });
  }, [applicationsData]);

  // Handle continue button click
  const handleContinue = (application: Application, documentType?: 'common' | 'specific') => {
    if (application.profile_status === 'incomplete') {
      // Redirect to application form
      router.push(`/partner/students/${application.student_user_id}/application-form`);
    } else if (application.common_documents?.status === 'incomplete' && !documentType) {
      // Open common documents modal if no specific type provided
      setSelectedApplication(application);
      setSelectedDocumentType('common');
      setIsDocumentModalOpen(true);
    } else if (application.specific_documents?.status === 'incomplete' && !documentType) {
      // Open specific documents modal if no specific type provided
      setSelectedApplication(application);
      setSelectedDocumentType('specific');
      setIsDocumentModalOpen(true);
    } else if (documentType) {
      // Open the specified document type modal
      setSelectedApplication(application);
      setSelectedDocumentType(documentType);
      setIsDocumentModalOpen(true);
    } else {
      // All steps are complete - show view details
      setSelectedApplication(application);
      setSelectedDocumentType('specific');
      setIsDocumentModalOpen(true);
    }
  };

  // Handle upload success
  const handleUploadSuccess = () => {
    fetchApplications(currentPage, false, filters);
  };

  // Handle remove filter
  const handleRemoveFilter = (key: keyof FilterOptions) => {
    const newFilters = {
      ...filters,
      [key]: "all"
    };
    setFilters(newFilters);
    setModalFilters(newFilters);
    setCurrentPage(1);
    fetchApplications(1, false, newFilters);
  };

  const clearAllFilters = () => {
    const resetFilters: FilterOptions = {
      student: "all",
      university: "all",
      study_level_id: "all",
      discipline: "all",
      course: "all",
      intake: "all",
      year: "all",
      applicationStatus: "all",
    };
    setFilters(resetFilters);
    setModalFilters(resetFilters);
    setCurrentPage(1);
    fetchApplications(1, false, resetFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    return value !== "all" && value !== "" && value !== undefined && value !== null;
  });

  // Get filter display name
  const getFilterDisplayName = (key: keyof FilterOptions, value: string | number) => {
    if (!filterData?.data.filterOptions || value === "all") return '';
    
    const filterOptionGroup = filterData.data.filterOptions[key as keyof FilterApiResponse['data']['filterOptions']];
    if (!filterOptionGroup) return '';
    
    const option = filterOptionGroup.find(opt => opt.id === value);
    return option?.name || option?.email || '';
  };

  const showApplicationForm = (studentId: number) => {
    setShowApplicationFormModal(true);
    setActiveStudentId(studentId);
  }

  if (loading && !loadingMore) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">Error loading applications</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchFilters();
            fetchApplications(1, false, filters);
          }}
          className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Student Applications
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage and track all student applications
          </p>
        </div>
        
        {/* Applications Summary */}
        {applicationsData && (
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {applicationsData.pagination?.totalRecords || 0}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {tableData.filter(app => app.status === "Applied").length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Applied</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {tableData.filter(app => app.status === "Documents Pending").length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Pending Docs</div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* <div className="relative">
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div> */}

        {/* Filter Button */}
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
            onClick={handleModalOpen}
            disabled={loadingFilters}
            className="h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filter Applications
            {hasActiveFilters && (
              <span className="ml-1 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {Object.values(filters).filter(v => v !== "all" && v !== "" && v !== undefined && v !== null).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {Object.entries(filters).map(([key, value]) => {
            if (value === "all" || value === "" || value === undefined || value === null) return null;
            
            const displayName = getFilterDisplayName(key as keyof FilterOptions, value);
            if (!displayName) return null;
            
            return (
              <Badge key={key} size="sm" color="primary">
                {key.replace('_', ' ')}: {displayName}
                <button 
                  onClick={() => handleRemoveFilter(key as keyof FilterOptions)}
                  className="ml-1 text-xs hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tableData.length > 0 ? (
          tableData.map((application) => (
            <ApplicationCard 
              key={application.id} 
              application={application}
              onContinue={handleContinue}
              showApplicationForm={showApplicationForm}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No applications found.
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Start by applying for a student'}
            </p>
            <Link
              href={'/partner/students'}
              className="flex justify-center text-sm text-blue-400 dark:text-blue-500 mt-3"
            >
              <p>Apply for Students </p> <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="text-center py-4">
          <div className="inline-block">
            <svg className="animate-spin h-5 w-5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading more applications...</p>
          </div>
        </div>
      )}

      {/* Intersection Observer Target */}
      {hasMore && !loadingMore && tableData.length > 0 && (
        <div ref={observerRef} className="h-10"></div>
      )}

      {/* Results Count */}
      {tableData.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {tableData.length} of {applicationsData?.pagination?.totalRecords || 0} applications
          {applicationsData?.pagination && (
            <span className="ml-2">
              (Page {applicationsData.pagination.page} of {applicationsData.pagination.totalPages})
            </span>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onFilterApply={handleFilterApply}
        filterOptions={filterData?.data.filterOptions || null}
        appliedFilters={modalFilters}
        onFiltersChange={handleModalFiltersChange}
      />

      {/* Document Upload Modal */}
      {selectedApplication && (
        <DocumentUploadModal
          isOpen={isDocumentModalOpen}
          onClose={() => {
            setIsDocumentModalOpen(false);
            setSelectedApplication(null);
          }}
          applicationId={selectedApplication.id}
          // documents={
          //   selectedDocumentType === 'common' 
          //     ? selectedApplication.common_documents?.list || []
          //     : selectedApplication.specific_documents?.list || []
          // }
          documents={
            // Get fresh data from updated applications
            selectedDocumentType === 'common' 
              ? tableData.find(app => app.id === selectedApplication.id)?.common_documents?.list || []
              : tableData.find(app => app.id === selectedApplication.id)?.specific_documents?.list || []
          }
          studentId={selectedApplication.student_user_id || 0}
          documentType={selectedDocumentType}
          onUploadSuccess={handleUploadSuccess}
        />
          )}

        {showApplicationFormModal && (
          <ApplicationFormModal
            studentId={String(activeStudentId)}
            isOpen={showApplicationFormModal}
            onClose={handleCloseModal}
            onSuccess={()=>{}}
          />
        )}
      
    </div>
  );
}