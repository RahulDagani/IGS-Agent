'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle,
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  Minus,
  XCircle,
  Clock,
  AlertCircle,
  Building,
  GraduationCap,
  Eye,
  Phone,
  Briefcase,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface BaseDocument {
  id: number;
  agent_id: number;
  student_id: number;
  document_name: string;
  is_mandatory: number;
  file_url: string | null;
  uploaded_at: string | null;
  uploaded_by: number | null;
  status: 'uploaded' | 'pending' | string;
  remarks: string | null;
  is_deleted: number;
  created_at: string;
}

interface CommonDocument extends BaseDocument {
  study_level_id: number;
  study_level_name: string;
}

interface SpecificDocument extends BaseDocument {
  tenant_id: number;
  application_id: number;
  document_type: string;
  course_name: string;
  university_name: string;
}

interface Document extends BaseDocument {
  study_level_id?: number;
  study_level_name?: string;
  tenant_id?: number;
  application_id?: number;
  document_type?: string;
  course_name?: string;
  university_name?: string;
  is_common?: boolean;
}

interface ApiResponse {
  success: number;
  data: {
    common_documents: {
      list: CommonDocument[];
      status: string;
    };
    specific_documents: {
      list: SpecificDocument[];
      status: string;
    };
  };
}

interface Application {
  id: number;
  course_name: string;
  university_name: string;
  university_logo: string;
  status_label: string;
}

interface StudyLevel {
  study_level_id: number;
  study_level_name: string;
}

interface RequestFormData {
  documentType: 'common' | 'application';
  applicationId: number | null;
  studyLevelId: number | null;
  documentName: string;
  isMandatory: number;
  documentTypeRole: 'self' | 'agency';
}

interface UploadState {
  [key: number]: boolean;
}

interface UploadProgress {
  [key: number]: number;
}

interface UploadError {
  [key: number]: string;
}

interface DocumentsPageProps {
  onDocumentUpload: () => void; // Optional if not always provided
}


export default function DocumentsPage({ onDocumentUpload }: DocumentsPageProps) {
  const params = useParams();
  const studentId = params.studentId as string;
  const agentId = params.id as string;

  
  const [activeTab, setActiveTab] = useState<'your' | 'Igs' | 'requested'>('your');
  const [mandatoryOpen, setMandatoryOpen] = useState(true);
  const [nonMandatoryOpen, setNonMandatoryOpen] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<UploadState>({});
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploadErrors, setUploadErrors] = useState<UploadError>({});
  const [selectedFile, setSelectedFile] = useState<{ [key: number]: File | null }>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

    // New states for requested documents tab
  const [applications, setApplications] = useState<Application[]>([]);
  const [studyLevels, setStudyLevels] = useState<StudyLevel[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingStudyLevels, setLoadingStudyLevels] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  
  const [requestForm, setRequestForm] = useState<RequestFormData>({
    documentType: 'common',
    applicationId: null,
    studyLevelId: null,
    documentName: '',
    isMandatory: 1,
    documentTypeRole: 'self'
  });

  const BASE_URL = 'https://api.applystore.org/api';
  const { token } = useAuth();

  // Fetch applications for the student
  useEffect(() => {
    const fetchApplications = async () => {
      if (!studentId) return;
      
      try {
        setLoadingApplications(true);
        const response = await fetch(
          `${BASE_URL}/tenant/agent/applications/student/${studentId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setApplications(data.data);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoadingApplications(false);
      }
    };

    if (activeTab === 'requested') {
      fetchApplications();
    }
  }, [studentId, token, activeTab]);



  // Fetch study levels for the student
  useEffect(() => {
    const fetchStudyLevels = async () => {
      if (!studentId) return;
      
      try {
        setLoadingStudyLevels(true);
        const response = await fetch(
          `${BASE_URL}/tenant/agent/student/studylevel/${studentId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setStudyLevels(data.data);
          // Set default study level if available
          if (data.data.length > 0 && !requestForm.studyLevelId) {
            setRequestForm(prev => ({
              ...prev,
              studyLevelId: data.data[0].study_level_id
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching study levels:', err);
      } finally {
        setLoadingStudyLevels(false);
      }
    };

    if (activeTab === 'requested' && requestForm.documentType === 'common') {
      fetchStudyLevels();
    }
  }, [studentId, token, activeTab, requestForm.documentType]);

  // Fetch documents from API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/tenant/agent/student/commondocs/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        
        if (data.success) {
          // Combine common and specific documents
          const commonDocs = data.data.common_documents.list.map(doc => ({
            ...doc,
            is_common: true
          }));
          
          const specificDocs = data.data.specific_documents.list.map(doc => ({
            ...doc,
            is_common: false
          }));
          
          // Merge both lists
          setDocuments([...commonDocs, ...specificDocs]);
        } else {
          throw new Error('Failed to fetch documents');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchDocuments();
    }
  }, [studentId, token, refreshTrigger]);


    // Handle form input changes
  const handleFormChange = (
    field: keyof RequestFormData,
    value: string | number | boolean
  ) => {
    setRequestForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear success/error messages when form changes
    if (submitError) setSubmitError(null);
    if (submitSuccess) setSubmitSuccess(null);
  };

  // Handle form submission
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestForm.documentName.trim()) {
      setSubmitError('Document name is required');
      return;
    }
    
    if (requestForm.documentType === 'application' && !requestForm.applicationId) {
      setSubmitError('Please select an application');
      return;
    }
    
    if (requestForm.documentType === 'common' && !requestForm.studyLevelId) {
      setSubmitError('Please select a study level');
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    
    try {
      
      let endpoint = '';
      let payload: any = {
        student_id: parseInt(studentId),
        agent_id: agentId,
        document_name: requestForm.documentName.trim(),
        document_type: requestForm.documentTypeRole
      };
      
      if (requestForm.documentType === 'application') {
        endpoint = `${BASE_URL}/tenant/agent/application/request/document`;
        payload.application_id = requestForm.applicationId;
      } else {
        endpoint = `${BASE_URL}/tenant/agent/student/request/document`;
        payload.study_level_id = requestForm.studyLevelId;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitSuccess('Document request submitted successfully!');
        // Reset form
        setRequestForm({
          documentType: 'common',
          applicationId: null,
          studyLevelId: studyLevels.length > 0 ? studyLevels[0].study_level_id : null,
          documentName: '',
          isMandatory: 1,
          documentTypeRole: 'self'
        });
        
        // Trigger refresh of documents list
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(data.message || 'Failed to submit request');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Group documents by mandatory status and type
  const mandatoryDocuments = documents.filter(doc => doc.is_mandatory === 1);
  const nonMandatoryDocuments = documents.filter(doc => doc.is_mandatory === 0);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not uploaded yet';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  // Get status icon and color
  const getStatusIcon = (status: string, isMandatory: number) => {
    if (status === 'uploaded') {
      return {
        icon: <CheckCircle className="text-green-600 dark:text-green-400" />,
        borderColor: 'border-green-500 dark:border-green-400',
        bgColor: 'bg-gray-50 dark:bg-gray-700/50'
      };
    } else if (isMandatory === 1) {
      return {
        icon: <XCircle className="text-red-600 dark:text-red-400" />,
        borderColor: 'border-red-500 dark:border-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
      };
    } else {
      return {
        icon: <Clock className="text-blue-600 dark:text-blue-400" />,
        borderColor: 'border-blue-500 dark:border-blue-400',
        bgColor: 'bg-gray-50 dark:bg-gray-700/50'
      };
    }
  };

  // Handle file selection
  const handleFileSelect = (documentId: number, file: File | null) => {
    setSelectedFile(prev => ({ ...prev, [documentId]: file }));
    // Clear any previous errors
    if (uploadErrors[documentId]) {
      setUploadErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[documentId];
        return newErrors;
      });
    }
  };

  // Upload file function - handles both common and specific documents
  const uploadFile = async (documentId: number, isCommon: boolean, applicationId: number | null, agentId: number) => {
    const file = selectedFile[documentId];
    if (!file) {
      setUploadErrors(prev => ({ 
        ...prev, 
        [documentId]: 'Please select a file first' 
      }));
      return;
    }

    const formData = new FormData();
    formData.append('document_id', documentId.toString());
    formData.append('agent_id', String(agentId));
    formData.append('file', file);

    setUploading(prev => ({ ...prev, [documentId]: true }));
    setUploadProgress(prev => ({ ...prev, [documentId]: 0 }));
    setUploadErrors(prev => ({ ...prev, [documentId]: '' }));

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
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve(response);
              } else {
                reject(new Error(response.message || 'Upload failed'));
              }
            } catch {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error occurred'));
      });

      
      const endpoint = isCommon 
        ? `${BASE_URL}/tenant/agent/application/upload/common/document/${studentId}`
        : `${BASE_URL}/tenant/agent/application/upload/document/${applicationId}`;
      
      xhr.open('PUT', endpoint);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

      await uploadPromise;
      
      
      setSelectedFile(prev => ({ ...prev, [documentId]: null }));
      
      
      if (onDocumentUpload) {
        onDocumentUpload(); // Call the callback if provided
      }
      setRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
      setUploadErrors(prev => ({ 
        ...prev, 
        [documentId]: err instanceof Error ? err.message : 'Upload failed' 
      }));
      console.error('Upload error:', err);
    } finally {
      setUploading(prev => ({ ...prev, [documentId]: false }));
      setUploadProgress(prev => ({ ...prev, [documentId]: 0 }));
    }
  };

  // File input component
  const FileInput = ({ documentId, isCommon, currentFileName, applicationId = null, agentId }: { 
    documentId: number, 
    isCommon: boolean,
    currentFileName?: string,
    applicationId?: number | null,
    agentId: number
  }) => {
    const isUploading = uploading[documentId];
    const progress = uploadProgress[documentId];
    const fileError = uploadErrors[documentId];
    const selectedFileForDoc = selectedFile[documentId];

    return (
      <div className="flex flex-col gap-3 min-w-[250px]">
        {fileError && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
            <AlertCircle size={16} />
            {fileError}
          </div>
        )}

        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer border dark:text-white border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
            <UploadCloud size={16} />
            Choose File
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(documentId, e.target.files?.[0] || null)}
              disabled={isUploading}
            />
          </label>
          
          <button
            onClick={() => uploadFile(documentId, isCommon, applicationId, agentId)}
            disabled={isUploading || !selectedFileForDoc}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              isUploading || !selectedFileForDoc
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
            } text-white`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                Upload
              </>
            )}
          </button>
        </div>

        {selectedFileForDoc && !isUploading && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Selected: <span className="font-medium">{selectedFileForDoc.name}</span>
          </div>
        )}

        {currentFileName && !selectedFileForDoc && !isUploading && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current: <span className="font-medium">{currentFileName}</span>
          </div>
        )}

        {isUploading && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Uploading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Document card component
  const DocumentCard = ({ doc }: { doc: Document }) => {
    const statusConfig = getStatusIcon(doc.status, doc.is_mandatory);
    const fileName = doc.file_url ? doc.file_url.split('/').pop() : 'No file uploaded';
    const isCommon = doc.is_common === true;
    
    return (
      <div 
        className={`border-l-4 ${statusConfig.borderColor} ${statusConfig.bgColor} p-5 rounded-md mb-4`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {statusConfig.icon}
              <span className="font-semibold dark:text-white">
                {doc.document_name} {doc.is_mandatory === 1 && '*'}
              </span>
              {!isCommon && (
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                  Specific
                </span>
              )}
            </div>

            {/* University and course info for specific documents */}
            {!isCommon && doc.university_name && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Building size={14} />
                <span className="font-medium">{doc.university_name}</span>
                {doc.course_name && (
                  <>
                    <span className="mx-1">•</span>
                    <GraduationCap size={14} />
                    <span>{doc.course_name}</span>
                  </>
                )}
              </div>
            )}

            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>
                <strong className="dark:text-gray-200">Status:</strong>{' '}
                <span className={`capitalize ${doc.status === 'uploaded' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {doc.status}
                </span>
              </p>
              {doc.uploaded_at && (
                <p>
                  <strong className="dark:text-gray-200">Uploaded On:</strong>{' '}
                  {formatDate(doc.uploaded_at)}
                </p>
              )}
              {doc.uploaded_by && (
                <p>
                  <strong className="dark:text-gray-200">Uploaded By:</strong>{' '}
                  User ID: {doc.uploaded_by}
                </p>
              )}
              {isCommon && doc.study_level_name && (
                <p>
                  <strong className="dark:text-gray-200">Study Level:</strong>{' '}
                  {doc.study_level_name}
                </p>
              )}
            </div>
          </div>

          <div className="ml-4">
            <FileInput 
              documentId={doc.id} 
              isCommon={isCommon}
              currentFileName={fileName !== 'No file uploaded' ? fileName : undefined}
              applicationId={!isCommon ? doc.application_id : null}
              agentId={doc.agent_id}
            />
          </div>
        </div>

        {doc.file_url && (
          <div className="mt-4 flex items-center gap-3">
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 border flex items-center dark:border-gray-600 px-3 py-1 rounded-md text-sm dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {fileName}
              <Eye size={16} className='ml-2'/>
            </a>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Tabs */}
      <div className="flex justify-center gap-10 border-b dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('your')}
          className={`pb-3 font-medium ${
            activeTab === 'your'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Your Documents
        </button>
        <button
          onClick={() => setActiveTab('Igs')}
          className={`pb-3 font-medium ${
            activeTab === 'Igs'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Igs Documents
        </button>
        <button
          onClick={() => setActiveTab('requested')}
          className={`pb-3 font-medium ${
            activeTab === 'requested'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Request Documents
        </button>
      </div>

      {activeTab === 'your' && (
        <>
          {/* Mandatory Documents */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md mb-6">
            <div
              onClick={() => setMandatoryOpen(!mandatoryOpen)}
              className="flex justify-between items-center px-6 py-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold">
                <FileText />
                Mandatory Documents ({mandatoryDocuments.length})
                <span className={`text-sm font-normal ${
                  mandatoryDocuments.every(d => d.status === 'uploaded') 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ({mandatoryDocuments.filter(d => d.status === 'uploaded').length}/{mandatoryDocuments.length} uploaded)
                </span>
              </div>
              {mandatoryOpen ? <Minus className="dark:text-gray-300" /> : <Plus className="dark:text-gray-300" />}
            </div>

            {mandatoryOpen && (
              <div className="px-6 pb-6">
                {mandatoryDocuments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No mandatory documents found
                  </p>
                ) : (
                  mandatoryDocuments.map((doc) => (
                    <DocumentCard key={doc.application_id ? doc.id + doc.application_id : doc.id} doc={doc} />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Non Mandatory Documents */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md">
            <div
              onClick={() => setNonMandatoryOpen(!nonMandatoryOpen)}
              className="flex justify-between items-center px-6 py-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold">
                <FileText />
                Non-Mandatory Documents ({nonMandatoryDocuments.length})
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({nonMandatoryDocuments.filter(d => d.status === 'uploaded').length}/{nonMandatoryDocuments.length} uploaded)
                </span>
              </div>
              {nonMandatoryOpen ? <Minus className="dark:text-gray-300" /> : <Plus className="dark:text-gray-300" />}
            </div>

            {nonMandatoryOpen && (
              <div className="px-6 pb-6">
                {nonMandatoryDocuments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No non-mandatory documents found
                  </p>
                ) : (
                  nonMandatoryDocuments.map((doc) => (
                    <DocumentCard key={doc.application_id ? doc.id + doc.application_id : doc.id} doc={doc} />

                   
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'Igs' && (
        <div className="space-y-6">
          {/* Your existing Igs Documents content */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md">
            {/* Program Header */}
            <div className="flex justify-between items-start px-6 py-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="dark:text-gray-300">📄</span>
                </div>
                <div>
                  <h3 className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    MBM (MSc) with specialization in Applied Artificial Intelligence
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Wittenborg University of Applied Sciences
                    <span className="mx-2 text-gray-400">•</span>
                    Netherlands
                    <span className="mx-2 text-gray-400">•</span>
                    May-2026
                  </p>
                </div>
              </div>

              <button className="text-xl text-gray-500 dark:text-gray-400">−</button>
            </div>

            {/* Visa Related Document */}
            <div className="mx-6 mb-6 border-l-4 border-green-500 dark:border-green-400 bg-gray-50 dark:bg-gray-700/50 rounded-md p-5">
              {/* Header Row */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 font-semibold dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xs">
                    ✓
                  </span>
                  Visa Related Document
                </div>

                {/* <div className="flex gap-3">
                  <button className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    + Add all to Student Platform
                  </button>
                  <button className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    ⬇ Download All
                  </button>
                </div> */}
              </div>

              {/* File Card */}
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md p-5 flex justify-between items-start">
                <div>
                  <p className="font-semibold mb-2 dark:text-white">Netherland Visa.png</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="dark:text-gray-300">Uploaded on:</strong> 16-12-2025 04:34 PM
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="dark:text-gray-300">Uploaded by:</strong> Swaranjali Gaikwad
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* <button className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                    + Add to Student Platform
                  </button> */}
                  <button className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    ⬇ Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requested' && (
         <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold dark:text-white">
                Request New Document
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Select document type and fill in the details
              </p>
            </div>

            <div className="p-6">
              {/* Success/Error Messages */}
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle size={20} />
                    <span className="font-medium">{submitSuccess}</span>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle size={20} />
                    <span className="font-medium">{submitError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitRequest}>
                {/* Document Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium dark:text-gray-300 mb-3">
                    Document Type
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleFormChange('documentType', 'common')}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border ${
                        requestForm.documentType === 'common'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FileText size={20} />
                      <div className="text-left">
                        <div className="font-medium">Common Document</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          For all applications
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFormChange('documentType', 'application')}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border ${
                        requestForm.documentType === 'application'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Briefcase size={20} />
                      <div className="text-left">
                        <div className="font-medium">Application Document</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          For specific application
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Application Selection (for application documents) */}
                {requestForm.documentType === 'application' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                      Select Application *
                    </label>
                    {loadingApplications ? (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Loading applications...
                      </div>
                    ) : applications.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        No applications found for this student
                      </p>
                    ) : (
                      <select
                        value={requestForm.applicationId || ''}
                        onChange={(e) => handleFormChange('applicationId', parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select an application</option>
                        {applications.map((app) => (
                          <option key={app.id} value={app.id}>
                            {app.course_name} - {app.university_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Study Level Selection (for common documents) */}
                {requestForm.documentType === 'common' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                      Study Level *
                    </label>
                    {loadingStudyLevels ? (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Loading study levels...
                      </div>
                    ) : studyLevels.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        No study levels found for this student
                      </p>
                    ) : (
                      <select
                        value={requestForm.studyLevelId || ''}
                        onChange={(e) => handleFormChange('studyLevelId', parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                        required
                      >
                        {studyLevels.map((level) => (
                          <option key={level.study_level_id} value={level.study_level_id}>
                            {level.study_level_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Document Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    value={requestForm.documentName}
                    onChange={(e) => handleFormChange('documentName', e.target.value)}
                    placeholder="e.g., Passport, Transcript, Bank Statement"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* Document Type Role */}
                <div className="mb-6">
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Who will upload this document? *
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleFormChange('documentTypeRole', 'self')}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border ${
                        requestForm.documentTypeRole === 'self'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <User size={20} />
                      <div className="text-left">
                        <div className="font-medium">Self</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Student will upload
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFormChange('documentTypeRole', 'agency')}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border ${
                        requestForm.documentTypeRole === 'agency'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Briefcase size={20} />
                      <div className="text-left">
                        <div className="font-medium">Agency</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Agency will upload
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Mandatory Status */}
                {/* <div className="mb-8">
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Is this document mandatory? *
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleFormChange('isMandatory', 1)}
                      className={`flex-1 p-4 rounded-lg border ${
                        requestForm.isMandatory === 1
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">Mandatory</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Required for processing
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFormChange('isMandatory', 0)}
                      className={`flex-1 p-4 rounded-lg border ${
                        requestForm.isMandatory === 0
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">Optional</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Not required for processing
                      </div>
                    </button>
                  </div>
                </div> */}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                      submitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}