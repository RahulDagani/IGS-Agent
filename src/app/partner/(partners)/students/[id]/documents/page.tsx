"use client"
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle, XCircle, Clock, FileText, UploadCloud, Eye,
  Plus, Minus, AlertCircle, Building, GraduationCap
} from "lucide-react";

interface CommonDocument {
  id: number;
  student_id: number;
  study_level_id: number;
  document_name: string;
  document_type: string;
  is_mandatory: number;
  file_url: string | null;
  uploaded_at: string | null;
  uploaded_by: number | null;
  status: string;
  remarks: string | null;
  study_level_name: string;
}

interface SpecificDocument {
  id: number;
  student_id: number;
  application_id: number;
  document_name: string;
  document_type: string;
  is_mandatory: number;
  file_url: string | null;
  uploaded_at: string | null;
  uploaded_by: number | null;
  status: string;
  remarks: string | null;
  course_name: string;
  university_name: string;
}

export default function DocumentsPage() {
  const { id: studentId } = useParams();
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  const [activeTab, setActiveTab] = useState<"common" | "specific">("common");
  const [commonDocs, setCommonDocs] = useState<CommonDocument[]>([]);
  const [specificDocs, setSpecificDocs] = useState<SpecificDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mandatoryOpen, setMandatoryOpen] = useState(true);
  const [nonMandatoryOpen, setNonMandatoryOpen] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedFile, setSelectedFile] = useState<{ [key: string]: File | null }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchDocs = async () => {
      if (!studentId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${BASE_URL}/agent/student/commondocs/${studentId}?document_type=student`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.data) {
          setCommonDocs(data.data.common_documents?.list || []);
          setSpecificDocs(data.data.specific_documents?.list || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [studentId, token, refreshTrigger]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not uploaded yet";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  const getStatusConfig = (status: string, isMandatory: number) => {
    if (status === "uploaded") {
      return {
        icon: <CheckCircle className="text-green-600 dark:text-green-400" size={20} />,
        borderColor: "border-green-500",
        bgColor: "bg-gray-50 dark:bg-gray-700/50",
      };
    } else if (isMandatory === 1) {
      return {
        icon: <XCircle className="text-red-600 dark:text-red-400" size={20} />,
        borderColor: "border-red-500",
        bgColor: "bg-red-50 dark:bg-red-900/20",
      };
    }
    return {
      icon: <Clock className="text-blue-600 dark:text-blue-400" size={20} />,
      borderColor: "border-blue-500",
      bgColor: "bg-gray-50 dark:bg-gray-700/50",
    };
  };

  const handleFileSelect = (key: string, file: File | null) => {
    setSelectedFile(prev => ({ ...prev, [key]: file }));
    setUploadErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const uploadCommonDoc = async (documentId: number) => {
    const key = `common-${documentId}`;
    const file = selectedFile[key];
    if (!file) { setUploadErrors(prev => ({ ...prev, [key]: "Please select a file first" })); return; }

    const formData = new FormData();
    formData.append("document_id", documentId.toString());
    formData.append("file", file);

    setUploading(prev => ({ ...prev, [key]: true }));
    setUploadProgress(prev => ({ ...prev, [key]: 0 }));

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setUploadProgress(prev => ({ ...prev, [key]: (e.loaded / e.total) * 100 }));
      });
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const r = JSON.parse(xhr.responseText);
              if (r.success) resolve(); else reject(new Error(r.message || "Upload failed"));
            } catch { resolve(); }
          } else reject(new Error(`Upload failed: HTTP ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("PUT", `${BASE_URL}/application/upload/common/document/${studentId}`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });
      setSelectedFile(prev => ({ ...prev, [key]: null }));
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setUploadErrors(prev => ({ ...prev, [key]: err instanceof Error ? err.message : "Upload failed" }));
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
      setUploadProgress(prev => ({ ...prev, [key]: 0 }));
    }
  };

  const uploadSpecificDoc = async (documentId: number, applicationId: number) => {
    const key = `specific-${documentId}`;
    const file = selectedFile[key];
    if (!file) { setUploadErrors(prev => ({ ...prev, [key]: "Please select a file first" })); return; }

    const formData = new FormData();
    formData.append("document_id", documentId.toString());
    formData.append("file", file);

    setUploading(prev => ({ ...prev, [key]: true }));
    setUploadProgress(prev => ({ ...prev, [key]: 0 }));

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setUploadProgress(prev => ({ ...prev, [key]: (e.loaded / e.total) * 100 }));
      });
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const r = JSON.parse(xhr.responseText);
              if (r.success) resolve(); else reject(new Error(r.message || "Upload failed"));
            } catch { resolve(); }
          } else reject(new Error(`Upload failed: HTTP ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("PUT", `${BASE_URL}/application/upload/document/${applicationId}`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });
      setSelectedFile(prev => ({ ...prev, [key]: null }));
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setUploadErrors(prev => ({ ...prev, [key]: err instanceof Error ? err.message : "Upload failed" }));
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
      setUploadProgress(prev => ({ ...prev, [key]: 0 }));
    }
  };

  const FileInput = ({
    uploadKey,
    onUpload,
    fileUrl,
  }: {
    uploadKey: string;
    onUpload: () => void;
    fileUrl: string | null;
  }) => {
    const isUploading = uploading[uploadKey];
    const progress = uploadProgress[uploadKey] || 0;
    const fileError = uploadErrors[uploadKey];
    const selected = selectedFile[uploadKey];
    const fileName = fileUrl ? fileUrl.split("/").pop() : null;

    return (
      <div className="flex flex-col gap-2 min-w-[220px]">
        {fileError && (
          <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            <AlertCircle size={14} />{fileError}
          </div>
        )}
        <div className="flex gap-2">
          <label className="flex items-center gap-1 cursor-pointer border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
            <UploadCloud size={14} />Choose File
            <input type="file" className="hidden" onChange={(e) => handleFileSelect(uploadKey, e.target.files?.[0] || null)} disabled={isUploading} />
          </label>
          <button
            onClick={onUpload}
            disabled={isUploading || !selected}
            className={`flex items-center gap-1 px-3 py-2 rounded text-sm text-white ${isUploading || !selected ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isUploading ? <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />Uploading</> : <><UploadCloud size={14} />Upload</>}
          </button>
        </div>
        {selected && !isUploading && <p className="text-xs text-gray-500 dark:text-gray-400">Selected: {selected.name}</p>}
        {fileName && !selected && !isUploading && (
          <a href={fileUrl!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600">
            <Eye size={12} />{fileName}
          </a>
        )}
        {isUploading && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Uploading...</span><span>{Math.round(progress)}%</span></div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const CommonDocCard = ({ doc }: { doc: CommonDocument }) => {
    const cfg = getStatusConfig(doc.status, doc.is_mandatory);
    const key = `common-${doc.id}`;
    return (
      <div className={`border-l-4 ${cfg.borderColor} ${cfg.bgColor} p-4 rounded mb-3`}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {cfg.icon}
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {doc.document_name}{doc.is_mandatory === 1 && " *"}
              </span>
              <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                {doc.study_level_name}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
              <p>
                <span className="font-medium">Status: </span>
                <span className={doc.status === "uploaded" ? "text-green-600" : "text-red-600"}>
                  {doc.status}
                </span>
              </p>
              {doc.uploaded_at && <p><span className="font-medium">Uploaded: </span>{formatDate(doc.uploaded_at)}</p>}
            </div>
          </div>
          <FileInput uploadKey={key} onUpload={() => uploadCommonDoc(doc.id)} fileUrl={doc.file_url} />
        </div>
      </div>
    );
  };

  const SpecificDocCard = ({ doc }: { doc: SpecificDocument }) => {
    const cfg = getStatusConfig(doc.status, doc.is_mandatory);
    const key = `specific-${doc.id}`;
    return (
      <div className={`border-l-4 ${cfg.borderColor} ${cfg.bgColor} p-4 rounded mb-3`}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {cfg.icon}
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {doc.document_name}{doc.is_mandatory === 1 && " *"}
              </span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                Application
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
              <Building size={13} /><span className="font-medium">{doc.university_name}</span>
              {doc.course_name && <><span>•</span><GraduationCap size={13} /><span>{doc.course_name}</span></>}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
              <p>
                <span className="font-medium">Status: </span>
                <span className={doc.status === "uploaded" ? "text-green-600" : "text-red-600"}>{doc.status}</span>
              </p>
              {doc.uploaded_at && <p><span className="font-medium">Uploaded: </span>{formatDate(doc.uploaded_at)}</p>}
            </div>
          </div>
          <FileInput uploadKey={key} onUpload={() => uploadSpecificDoc(doc.id, doc.application_id)} fileUrl={doc.file_url} />
        </div>
      </div>
    );
  };

  const renderDocList = <T extends { id: number; is_mandatory: number; status: string }>(
    docs: T[],
    renderCard: (doc: T) => React.ReactNode
  ) => {
    if (docs.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No documents found.</p>
        </div>
      );
    }
    const mandatory = docs.filter(d => d.is_mandatory === 1);
    const optional = docs.filter(d => d.is_mandatory === 0);

    return (
      <>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded mb-4">
          <button
            onClick={() => setMandatoryOpen(!mandatoryOpen)}
            className="w-full flex justify-between items-center px-5 py-4 text-left"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
              <FileText size={18} />
              Mandatory Documents ({mandatory.length})
              <span className={`text-sm font-normal ${mandatory.every(d => d.status === "uploaded") ? "text-green-600" : "text-red-600"}`}>
                ({mandatory.filter(d => d.status === "uploaded").length}/{mandatory.length} uploaded)
              </span>
            </div>
            {mandatoryOpen ? <Minus className="text-gray-500" size={18} /> : <Plus className="text-gray-500" size={18} />}
          </button>
          {mandatoryOpen && (
            <div className="px-5 pb-5">
              {mandatory.length === 0
                ? <p className="text-sm text-gray-500 text-center py-4">No mandatory documents</p>
                : mandatory.map(doc => <React.Fragment key={doc.id}>{renderCard(doc)}</React.Fragment>)
              }
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded">
          <button
            onClick={() => setNonMandatoryOpen(!nonMandatoryOpen)}
            className="w-full flex justify-between items-center px-5 py-4 text-left"
          >
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
              <FileText size={18} />
              Optional Documents ({optional.length})
              <span className="text-sm font-normal text-gray-500">
                ({optional.filter(d => d.status === "uploaded").length}/{optional.length} uploaded)
              </span>
            </div>
            {nonMandatoryOpen ? <Minus className="text-gray-500" size={18} /> : <Plus className="text-gray-500" size={18} />}
          </button>
          {nonMandatoryOpen && (
            <div className="px-5 pb-5">
              {optional.length === 0
                ? <p className="text-sm text-gray-500 text-center py-4">No optional documents</p>
                : optional.map(doc => <React.Fragment key={doc.id}>{renderCard(doc)}</React.Fragment>)
              }
            </div>
          )}
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <XCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
          <button onClick={() => setRefreshTrigger(p => p + 1)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalDocs = commonDocs.length + specificDocs.length;
  const uploadedDocs = [...commonDocs, ...specificDocs].filter(d => d.status === "uploaded").length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalDocs}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Documents</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{uploadedDocs}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Uploaded</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalDocs - uploadedDocs}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("common")}
          className={`pb-3 font-medium text-sm ${activeTab === "common" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400"}`}
        >
          Study Level Documents ({commonDocs.length})
        </button>
        <button
          onClick={() => setActiveTab("specific")}
          className={`pb-3 font-medium text-sm ${activeTab === "specific" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400"}`}
        >
          Application Documents ({specificDocs.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "common"
        ? renderDocList(commonDocs, (doc) => <CommonDocCard doc={doc as CommonDocument} />)
        : renderDocList(specificDocs, (doc) => <SpecificDocCard doc={doc as SpecificDocument} />)
      }
    </div>
  );
}
