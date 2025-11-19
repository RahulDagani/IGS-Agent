"use client"
import React, { useState, useMemo, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import { User, Upload, FileText, X, ArrowBigRight, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from "next/link";

interface Application {
  id: number;
  university: string;
  course: string;
  intake: string;
  status: "Applied" | "Received" | "Submitted to University" | "Documents Pending";
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

// API Response Interfaces
interface ApiApplication {
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

interface ApiResponse {
  success: boolean;
  data: ApiApplication[];
}

type SortField = keyof Application | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  university: string;
  course: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  universities: string[];
  courses: string[];
}

// Document Upload Modal Component
interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  documents: Document[];
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

      xhr.open('PUT', `${BASE_URL}/agent/student/application/${applicationId}/upload/document`);
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
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

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  universities,
  courses,
}) => {
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      university: selectedUniversity,
      course: selectedCourse,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
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
  onContinue: (application: Application, documentType?: 'common' | 'specific') => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onContinue }) => {
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
          <div className="flex flex-col items-center">
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
        <button 
          onClick={() => onContinue(application)}
          className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/30 font-semibold py-2 rounded-lg text-sm transition-all"
        >
          {isAllComplete ? 'View Details' : 'Continue'}
        </button>
      </div>

      {/* Quick Action Buttons */}
      {!isAllComplete && (
        <div className="mt-3 flex gap-2">
          {docStatus.commonDocs === 'pending' && (
            <button 
              onClick={() => onContinue(application, 'common')}
              className="flex-1 px-3 py-1 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 rounded"
            >
              Upload Common Docs
            </button>
          )}
          {docStatus.specificDocs === 'pending' && (
            <button 
              onClick={() => onContinue(application, 'specific')}
              className="flex-1 px-3 py-1 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 rounded"
            >
              Upload Specific Docs
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function ApplicationsTable() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField] = useState<SortField>("");
  const [sortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState<boolean>(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<'common' | 'specific'>('specific');
  const [filters, setFilters] = useState<FilterOptions>({
    university: "all",
    course: "all",
  });

  // Fetch applications from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/agent/student/application/all/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        throw new Error('Failed to fetch applications');
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setApiData(data);
      } else {
        throw new Error('Failed to load applications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token, logout]);

  // Transform API data to match the Application interface
  const tableData: Application[] = useMemo(() => {
    if (!apiData?.data) return [];

    return apiData.data.map((app) => {
      // Map status from API to our Application status
      const getStatus = (): Application["status"] => {
        const statusKey = app.application.status_key;
        const profileStatus = app.profile_status;
        const commonDocsStatus = app.common_documents.status;
        const specificDocsStatus = app.specific_documents.status;
        
        if (profileStatus === "incomplete" || commonDocsStatus === "incomplete" || specificDocsStatus === "incomplete") {
          return "Documents Pending";
        }
        if (statusKey === "applied") return "Applied";
        if (statusKey === "received") return "Received";
        if (app.application.is_submitted_to_university === 1) return "Submitted to University";
        
        return "Applied";
      };

      // Format duration
      const formatDuration = () => {
        const { duration_min, duration_max, duration_unit } = app.application;
        if (duration_min === duration_max) {
          return `${duration_min} ${duration_unit}`;
        }
        return `${duration_min}-${duration_max} ${duration_unit}`;
      };

      // Format intake from created_at
      const formatIntake = (createdAt: string) => {
        const date = new Date(createdAt);
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Determine intake based on month
        if (month >= 8) return `Fall ${year + 1}`;
        if (month >= 5) return `Summer ${year + 1}`;
        return `Spring ${year + 1}`;
      };

      // Get country name from country code
      const getCountryName = (countryCode: string) => {
        const countryMap: { [key: string]: string } = {
          'US': 'United States',
          'CA': 'Canada',
          'UK': 'United Kingdom',
          'AU': 'Australia',
          'IN': 'India'
        };
        return countryMap[countryCode] || countryCode;
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

      return {
        id: app.application.id,
        university: app.application.university_name,
        course: app.application.course_name,
        intake: formatIntake(app.application.created_at),
        status: getStatus(),
        country: getCountryName(app.application.university_country),
        degree: app.application.study_level_name,
        location: formatLocation(),
        externalEvaluation: "Required (WES)",
        duration: formatDuration(),
        tuitionFee: app.application.tuition_fee,
        applicationFee: app.application.application_fee,
        currencyCode: app.application.currency_code,
        student_user_id: app.application.student_user_id,
        profile_status: app.profile_status,
        common_documents: app.common_documents,
        specific_documents: app.specific_documents,
        // Placeholder language scores
        ielts: 6.5 + (app.application.id % 3 * 0.5),
        pte: 60 + (app.application.id % 4 * 3),
        duolingo: 110 + (app.application.id % 5 * 5)
      };
    });
  }, [apiData]);

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
      setSelectedDocumentType('specific'); // Use specific as default for view
      setIsDocumentModalOpen(true);
    }
  };

  // Handle upload success - this will refresh the data and update the status
  const handleUploadSuccess = () => {
    fetchApplications(); // This will refresh the applications data and update the status
  };

  // Get unique values for filters
  const universities = useMemo(() => {
    return Array.from(new Set(tableData.map(app => app.university)));
  }, [tableData]);

  const courses = useMemo(() => {
    return Array.from(new Set(tableData.map(app => app.course)));
  }, [tableData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = tableData.filter((application) => {
      const matchesUniversity = filters.university === "all" || application.university === filters.university;
      const matchesCourse = filters.course === "all" || application.course === filters.course;
      
      return matchesUniversity && matchesCourse;
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
  }, [tableData, filters, sortField, sortDirection]);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.university !== "all" || filters.course !== "all";

  const clearAllFilters = () => {
    setFilters({
      university: "all",
      course: "all",
    });
  };

  if (loading) {
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
        {apiData && (
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {apiData.data?.length}
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
            <ApplicationCard 
              key={application.id} 
              application={application} 
              onContinue={handleContinue}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No applications found.
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
              Try adjusting your filters
            </p>
            <Link
            href={'/partner/students'}
             className="flex justify-center text-sm text-blue-400 dark:text-blue-500 mt-3">
              <p>Apply for Students </p> <ArrowRight size={20} />
            </Link>
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
        universities={universities}
        courses={courses}
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
          documents={
            selectedDocumentType === 'common' 
              ? selectedApplication.common_documents?.list || []
              : selectedApplication.specific_documents?.list || []
          }
          documentType={selectedDocumentType}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}