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
  Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { openSecureFile } from "@/utils/fileUrl";

interface BaseDocument {
  id: number;
  agent_id: number;
  student_id: number;
  document_name: string;
  is_mandatory: number;
  file_url: string | null;
  uploaded_at: string | null;
  uploaded_by: number | null;
  status: 'uploaded' | 'pending' | 'verified' | string;
  verifier_email: string | null;
  verification_email_sent_at: string | null;
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
  country_code?: string;
  tenant_id?: number;
  application_id?: number;
  document_type?: string;
  course_name?: string;
  university_name?: string;
  is_common?: boolean;
  doc_category?: 'study_level' | 'country' | 'specific';
}

interface ApiResponse {
  success: number;
  data: {
    study_level_documents: {
      list: CommonDocument[];
      status: string;
    };
    country_wise_documents: {
      list: BaseDocument[];
      status: string;
    };
    application_specific_documents: {
      list: SpecificDocument[];
      status: string;
    };
  };
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

interface UploadSuccess {
  [key: number]: boolean;
}

interface DocumentsPageProps {
  onDocumentUpload: () => void;
}

// ── FileInput ──────────────────────────────────────────────────────────────
interface FileInputProps {
  documentId: number;
  isCommon: boolean;
  currentFileName?: string;
  applicationId?: number | null;
  doc_category?: string;
  isUploading: boolean;
  progress: number;
  fileError: string;
  uploadSuccess: boolean;
  selectedFileForDoc: File | null;
  verifierEmail: string;
  onVerifierEmailChange: (email: string) => void;
  onFileSelect: (file: File | null) => void;
  onUpload: () => void;
}

function FileInput({
  isUploading,
  progress,
  fileError,
  uploadSuccess,
  selectedFileForDoc,
  verifierEmail,
  onVerifierEmailChange,
  onFileSelect,
  onUpload,
}: FileInputProps) {
  return (
    <div className="w-64 flex flex-col gap-2">
      {/* Success message */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
          <CheckCircle size={15} />
          Uploaded successfully
        </div>
      )}

      {/* Error message */}
      {fileError && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
          <AlertCircle size={15} />
          {fileError}
        </div>
      )}

      {/* Verifier email input */}
      <div className="flex flex-col gap-1.5">
        <input
          type="email"
          placeholder="Verifier email (e.g. bank@example.com)"
          value={verifierEmail}
          onChange={(e) => onVerifierEmailChange(e.target.value)}
          disabled={isUploading}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">Email of the authority who can verify this document</p>
      </div>

      {/* Buttons row — fixed height, never changes */}
      <div className="flex gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer border dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 shrink-0">
          <UploadCloud size={14} />
          {selectedFileForDoc
            ? <span className="max-w-[80px] truncate">{selectedFileForDoc.name}</span>
            : 'Choose File'}
          <input
            type="file"
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
            disabled={isUploading}
          />
        </label>

        <button
          type="button"
          onClick={onUpload}
          disabled={isUploading || !selectedFileForDoc}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm shrink-0 ${
            isUploading || !selectedFileForDoc
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
          } text-white`}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
              Uploading...
            </>
          ) : (
            <>
              <UploadCloud size={14} />
              Upload
            </>
          )}
        </button>
      </div>

      {/* Progress bar — only shown while uploading, same fixed width */}
      {isUploading && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── DocumentCard ───────────────────────────────────────────────────────────
interface DocumentCardProps {
  doc: Document;
  activeTab: string;
  uploading: UploadState;
  uploadErrors: UploadError;
  uploadSuccess: UploadSuccess;
  selectedFile: { [key: number]: File | null };
  verifierEmail: { [key: number]: string };
  onFileSelect: (documentId: number, file: File | null) => void;
  onVerifierEmailChange: (documentId: number, email: string) => void;
  onUpload: (documentId: number, isCommon: boolean, applicationId: number | null, doc_category?: string) => void;
}

function getStatusIcon(status: string, isMandatory: number) {
  if (status === 'verified') {
    return {
      icon: <CheckCircle className="text-blue-600 dark:text-blue-400" />,
      borderColor: 'border-blue-500 dark:border-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    };
  } else if (status === 'uploaded') {
    return {
      icon: <CheckCircle className="text-green-600 dark:text-green-400" />,
      borderColor: 'border-green-500 dark:border-green-400',
      bgColor: 'bg-gray-50 dark:bg-gray-700/50',
    };
  } else if (isMandatory === 1) {
    return {
      icon: <XCircle className="text-red-600 dark:text-red-400" />,
      borderColor: 'border-red-500 dark:border-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    };
  } else {
    return {
      icon: <Clock className="text-blue-600 dark:text-blue-400" />,
      borderColor: 'border-blue-500 dark:border-blue-400',
      bgColor: 'bg-gray-50 dark:bg-gray-700/50',
    };
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Not uploaded yet';
  const date = new Date(dateString);
  return date
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '');
}

function DocumentCard({
  doc,
  activeTab,
  uploading,
  uploadErrors,
  uploadSuccess,
  selectedFile,
  verifierEmail,
  onFileSelect,
  onVerifierEmailChange,
  onUpload,
}: DocumentCardProps) {
  const statusConfig = getStatusIcon(doc.status, doc.is_mandatory);
  const fileName = doc.file_url ? doc.file_url.split('/').pop() : 'No file uploaded';
  const isCommon = doc.is_common === true;

  return (
    <div className={`border-l-4 ${statusConfig.borderColor} ${statusConfig.bgColor} p-5 rounded-md mb-4`}>
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
              <span className={`capitalize ${doc.status === 'verified' ? 'text-blue-600 dark:text-blue-400' : doc.status === 'uploaded' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {doc.status}
              </span>
            </p>
            {doc.uploaded_at && (
              <p>
                <strong className="dark:text-gray-200">Uploaded On:</strong>{' '}
                {formatDate(doc.uploaded_at)}
              </p>
            )}
            {doc.verifier_email && (
              <p>
                <strong className="dark:text-gray-200">Verifier Email:</strong>{' '}
                <span className="text-gray-600 dark:text-gray-400">{doc.verifier_email}</span>
              </p>
            )}
            {doc.verification_email_sent_at && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Verification email sent on {formatDate(doc.verification_email_sent_at)}
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

        {activeTab !== 'Igs' && doc.status !== 'verified' && (
          <div className="ml-4">
            <FileInput
              documentId={doc.id}
              isCommon={isCommon}
              currentFileName={fileName !== 'No file uploaded' ? fileName : undefined}
              applicationId={!isCommon ? doc.application_id : null}
              doc_category={doc.doc_category}
              isUploading={uploading[doc.id] ?? false}
              progress={0}
              fileError={uploadErrors[doc.id] ?? ''}
              uploadSuccess={uploadSuccess[doc.id] ?? false}
              selectedFileForDoc={selectedFile[doc.id] ?? null}
              verifierEmail={verifierEmail[doc.id] ?? ''}
              onVerifierEmailChange={(email) => onVerifierEmailChange(doc.id, email)}
              onFileSelect={(file) => onFileSelect(doc.id, file)}
              onUpload={() => onUpload(doc.id, isCommon, !isCommon ? (doc.application_id ?? null) : null, doc.doc_category)}
            />
          </div>
        )}
      </div>

      {doc.file_url && (
        <div className="mt-4 flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); openSecureFile(doc.file_url); }}
            className="bg-white dark:bg-gray-800 border flex items-center dark:border-gray-600 px-3 py-1 rounded-md text-sm dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {fileName}
            <Eye size={16} className="ml-2" />
          </a>

          {activeTab === 'Igs' && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); openSecureFile(doc.file_url); }}
              className="inline-flex items-center justify-center rounded-md border bg-white px-3 py-[2px] text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              title="Download file"
            >
              Download
              <Download size={16} className="ml-2" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function DocumentsPage({ onDocumentUpload }: DocumentsPageProps) {
  const params = useParams();
  const studentId = params.id as string;

  const [activeTab, setActiveTab] = useState<'your' | 'Igs'>('your');
  const [mandatoryOpen, setMandatoryOpen] = useState(true);
  const [nonMandatoryOpen, setNonMandatoryOpen] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<UploadState>({});
  const [uploadErrors, setUploadErrors] = useState<UploadError>({});
  const [uploadSuccess, setUploadSuccess] = useState<UploadSuccess>({});
  const [selectedFile, setSelectedFile] = useState<{ [key: number]: File | null }>({});
  const [verifierEmail, setVerifierEmail] = useState<{ [key: number]: string }>({});

  const BASE_URL = 'https://api.applystore.org/api';
  const { token } = useAuth();

  const fetchDocuments = async (showLoader = true) => {
    const tabType = activeTab === 'your' ? 'student' : 'self';
    try {
      if (showLoader) setLoading(true);
      const response = await fetch(`${BASE_URL}/agent/student/commondocs/${studentId}?document_type=${tabType}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data: ApiResponse = await response.json();

      if (data.success) {
        const commonDocs = (data.data.study_level_documents?.list ?? []).map(doc => ({
          ...doc,
          is_common: true,
          doc_category: 'study_level' as const,
        }));

        const countryDocs = (data.data.country_wise_documents?.list ?? []).map(doc => ({
          ...doc,
          is_common: true,
          doc_category: 'country' as const,
        }));

        const specificDocs = (data.data.application_specific_documents?.list ?? []).map(doc => ({
          ...doc,
          is_common: false,
          doc_category: 'specific' as const,
        }));

        setDocuments([...commonDocs, ...countryDocs, ...specificDocs]);
      } else {
        throw new Error('Failed to fetch documents');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchDocuments();
  }, [studentId, token, activeTab]);

  const mandatoryDocuments = documents.filter(doc => doc.is_mandatory === 1);
  const nonMandatoryDocuments = documents.filter(doc => doc.is_mandatory === 0);

  const handleFileSelect = (documentId: number, file: File | null) => {
    setSelectedFile(prev => ({ ...prev, [documentId]: file }));
    if (uploadErrors[documentId]) {
      setUploadErrors(prev => {
        const next = { ...prev };
        delete next[documentId];
        return next;
      });
    }
  };

  const uploadFile = async (documentId: number, isCommon: boolean, applicationId: number | null, doc_category?: string) => {
    const file = selectedFile[documentId];
    if (!file) {
      setUploadErrors(prev => ({ ...prev, [documentId]: 'Please select a file first' }));
      return;
    }

    const formData = new FormData();
    formData.append('document_id', documentId.toString());
    formData.append('file', file);
    if (verifierEmail[documentId]) formData.append('verifier_email', verifierEmail[documentId]);

    setUploading(prev => ({ ...prev, [documentId]: true }));
    setUploadErrors(prev => ({ ...prev, [documentId]: '' }));

    try {
      const endpoint = isCommon
        ? (doc_category === 'country'
            ? `${BASE_URL}/agent/student/upload/country-document/${studentId}`
            : `${BASE_URL}/agent/student/upload/document/${studentId}`)
        : `${BASE_URL}/agent/application/upload/document/${applicationId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Upload failed (${response.status})`);
      }

      // Refetch to get the real updated file_url from the server
      await fetchDocuments(false);

      setSelectedFile(prev => ({ ...prev, [documentId]: null }));
      setVerifierEmail(prev => { const n = { ...prev }; delete n[documentId]; return n; });
      setUploadSuccess(prev => ({ ...prev, [documentId]: true }));
      setTimeout(() => setUploadSuccess(prev => ({ ...prev, [documentId]: false })), 3000);

      if (onDocumentUpload) onDocumentUpload();
    } catch (err) {
      setUploadErrors(prev => ({
        ...prev,
        [documentId]: err instanceof Error ? err.message : 'Upload failed',
      }));
    } finally {
      setUploading(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const handleVerifierEmailChange = (documentId: number, email: string) => {
    setVerifierEmail(prev => ({ ...prev, [documentId]: email }));
  };

  const cardProps = {
    activeTab,
    uploading,
    uploadErrors,
    uploadSuccess,
    selectedFile,
    verifierEmail,
    onFileSelect: handleFileSelect,
    onVerifierEmailChange: handleVerifierEmailChange,
    onUpload: uploadFile,
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
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderDocumentList = (docs: Document[]) =>
    docs.map(doc => <DocumentCard key={doc.id} doc={doc} {...cardProps} />);

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Tabs */}
      <div className="flex justify-center gap-10 border-b dark:border-gray-700 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('your')}
          className={`pb-3 font-medium ${
            activeTab === 'your'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Student Documents
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('Igs')}
          className={`pb-3 font-medium ${
            activeTab === 'Igs'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Igs Documents
        </button>
      </div>

      {/* Mandatory section */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md mb-6">
        <div
          onClick={() => setMandatoryOpen(!mandatoryOpen)}
          className="flex justify-between items-center px-6 py-4 cursor-pointer"
        >
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold">
            <FileText />
            Mandatory Documents ({mandatoryDocuments.length})
            <span className={`text-sm font-normal ${
              mandatoryDocuments.every(d => d.status === 'uploaded' || d.status === 'verified')
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              ({mandatoryDocuments.filter(d => d.status === 'uploaded' || d.status === 'verified').length}/{mandatoryDocuments.length} uploaded)
            </span>
          </div>
          {mandatoryOpen ? <Minus className="dark:text-gray-300" /> : <Plus className="dark:text-gray-300" />}
        </div>

        {mandatoryOpen && (
          <div className="px-6 pb-6">
            {mandatoryDocuments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No mandatory documents found</p>
            ) : (
              renderDocumentList(mandatoryDocuments)
            )}
          </div>
        )}
      </div>

      {/* Non-mandatory section */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md">
        <div
          onClick={() => setNonMandatoryOpen(!nonMandatoryOpen)}
          className="flex justify-between items-center px-6 py-4 cursor-pointer"
        >
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold">
            <FileText />
            Non-Mandatory Documents ({nonMandatoryDocuments.length})
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({nonMandatoryDocuments.filter(d => d.status === 'uploaded' || d.status === 'verified').length}/{nonMandatoryDocuments.length} uploaded)
            </span>
          </div>
          {nonMandatoryOpen ? <Minus className="dark:text-gray-300" /> : <Plus className="dark:text-gray-300" />}
        </div>

        {nonMandatoryOpen && (
          <div className="px-6 pb-6">
            {nonMandatoryDocuments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No non-mandatory documents found</p>
            ) : (
              renderDocumentList(nonMandatoryDocuments)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
