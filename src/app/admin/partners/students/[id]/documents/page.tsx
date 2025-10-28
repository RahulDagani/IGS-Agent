"use client"
import React, { useState } from "react";
import { Upload, FileText, BookOpen, GraduationCap, X, Check, Clock, LucideIcon } from "lucide-react";

interface DocumentType {
  id: number;
  name: string;
  required: boolean;
  description?: string;
}

interface StudyLevel {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  documents: DocumentType[];
}

interface UploadProgress {
  [key: number]: {
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    file?: File;
  };
}

export default function CommonDocumentsUpload() {
  // const router = useRouter();
  const [selectedStudyLevel, setSelectedStudyLevel] = useState<StudyLevel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});

  const studyLevels: StudyLevel[] = [
    {
      slug: "masters",
      name: "Masters",
      description: "Postgraduate degree programs",
      icon: GraduationCap,
      documents: [
        { id: 1, name: "10th Marksheet", required: true },
        { id: 2, name: "12th Marksheet", required: true },
        { id: 3, name: "Bachelor's Degree Certificate", required: true },
        { id: 4, name: "Bachelor's Transcript", required: true },
        { id: 5, name: "Passport Copy", required: true },
        { id: 6, name: "English Proficiency Test", required: false },
        { id: 7, name: "Statement of Purpose", required: true },
        { id: 8, name: "Letters of Recommendation", required: true },
        { id: 9, name: "CV/Resume", required: true },
      ]
    },
    {
      slug: "bachelors",
      name: "Bachelors",
      description: "Undergraduate degree programs",
      icon: BookOpen,
      documents: [
        { id: 10, name: "10th Marksheet", required: true },
        { id: 11, name: "12th Marksheet", required: true },
        { id: 12, name: "Passport Copy", required: true },
        { id: 13, name: "English Proficiency Test", required: false },
        { id: 14, name: "Personal Statement", required: true },
        { id: 15, name: "School Leaving Certificate", required: true },
        { id: 16, name: "Extracurricular Certificates", required: false },
      ]
    },
    {
      slug: "phd",
      name: "PhD",
      description: "Doctoral research programs",
      icon: GraduationCap,
      documents: [
        { id: 17, name: "10th Marksheet", required: true },
        { id: 18, name: "12th Marksheet", required: true },
        { id: 19, name: "Bachelor's Degree Certificate", required: true },
        { id: 20, name: "Master's Degree Certificate", required: true },
        { id: 21, name: "All Academic Transcripts", required: true },
        { id: 22, name: "Passport Copy", required: true },
        { id: 23, name: "Research Proposal", required: true },
        { id: 24, name: "Letters of Recommendation", required: true },
        { id: 25, name: "CV/Resume", required: true },
        { id: 26, name: "Publications", required: false },
      ]
    }
  ];

  const handleStudyLevelClick = (studyLevel: StudyLevel) => {
    setSelectedStudyLevel(studyLevel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudyLevel(null);
    setUploadProgress({});
  };

  const simulateFileUpload = async (file: File, documentId: number) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve(true);
        }
        setUploadProgress(prev => ({
          ...prev,
          [documentId]: {
            ...prev[documentId],
            progress,
            status: progress === 100 ? 'completed' : 'uploading'
          }
        }));
      }, 200);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid file type (PDF, JPEG, PNG, DOC, DOCX)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // Set initial upload state
    setUploadProgress(prev => ({
      ...prev,
      [documentId]: {
        progress: 0,
        status: 'uploading',
        file
      }
    }));

    try {
      await simulateFileUpload(file, documentId);
      
      // Here you would typically make the actual API call
      // const formData = new FormData();
      // formData.append('document', file);
      // formData.append('documentTypeId', documentId.toString());
      // formData.append('studyLevel', selectedStudyLevel?.slug || '');
      
      // await fetch('/api/documents/upload', {
      //   method: 'POST',
      //   body: formData
      // });

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(prev => ({
        ...prev,
        [documentId]: {
          ...prev[documentId],
          status: 'error'
        }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check size={16} className="text-green-500" />;
      case 'uploading':
        return <Clock size={16} className="text-blue-500" />;
      case 'error':
        return <X size={16} className="text-red-500" />;
      default:
        return <Upload size={16} className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return "Completed";
      case 'uploading':
        return "Uploading...";
      case 'error':
        return "Error";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "text-green-600";
      case 'uploading':
        return "text-blue-600";
      case 'error':
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Common Documents Upload
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select your study level and upload the required documents for your application process.
          </p>
        </div>

        {/* Study Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {studyLevels.map((studyLevel) => {
            const IconComponent = studyLevel.icon;
            return (
              <div
                key={studyLevel.slug}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-theme-xs border border-gray-200 dark:border-gray-700 p-8 cursor-pointer hover:shadow-theme-sm transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-500"
                onClick={() => handleStudyLevelClick(studyLevel)}
              >
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-6">
                    <IconComponent size={32} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {studyLevel.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {studyLevel.description}
                  </p>
                  <div className="flex items-center justify-center text-sm text-brand-600 dark:text-brand-400">
                    <FileText size={16} className="mr-2" />
                    {studyLevel.documents.length} documents required
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload Guidelines
          </h2>
          <ul className="text-gray-600 dark:text-gray-400 space-y-2">
            <li>• All documents must be in PDF, JPEG, or PNG format</li>
            <li>• Maximum file size: 10MB per document</li>
            <li>• Ensure documents are clear and readable</li>
            <li>• Required documents are marked with an asterisk (*)</li>
            <li>• These documents will be used for all applications under that level.</li>
            <li>• You can upload or update them anytime.</li>
          </ul>
        </div>
      </div>

      {/* Document Upload Modal */}
      {isModalOpen && selectedStudyLevel && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-99999">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upload Documents - {selectedStudyLevel.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Please upload all required documents for your application
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedStudyLevel.documents.map((document) => (
                  <div key={document.id} className="mb-4">
                    <label className="doc-card w-full cursor-pointer">
                      <div className="upload-area border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="doc-title font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {document.name}
                              {document.required && (
                                <span className="text-red-500 text-sm">*</span>
                              )}
                            </div>
                            <div className={`doc-status text-sm mt-1 ${getStatusColor(uploadProgress[document.id]?.status || 'pending')}`}>
                              {getStatusText(uploadProgress[document.id]?.status || 'pending')}
                            </div>
                            {uploadProgress[document.id]?.file && (
  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
    {uploadProgress[document.id]?.file?.name}
  </div>
)}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(uploadProgress[document.id]?.status || 'pending')}
                            <Upload size={20} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {uploadProgress[document.id]?.status === 'uploading' && (
                        <div className="progress upload-progress mt-3">
                          <div 
                            className="progress-bar h-2 bg-brand-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[document.id].progress}%` }}
                          ></div>
                        </div>
                      )}

                      <input
                        type="file"
                        className="hidden-input"
                        onChange={(e) => handleFileUpload(e, document.id)}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        disabled={uploadProgress[document.id]?.status === 'uploading'}
                      />
                    </label>
                    
                    {document.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {document.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Check if all required documents are uploaded
                  const allRequiredUploaded = selectedStudyLevel.documents
                    .filter(doc => doc.required)
                    .every(doc => uploadProgress[doc.id]?.status === 'completed');
                  
                  if (allRequiredUploaded) {
                    alert('All documents uploaded successfully!');
                    handleCloseModal();
                  } else {
                    alert('Please upload all required documents before submitting.');
                  }
                }}
                className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                Submit Documents
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}