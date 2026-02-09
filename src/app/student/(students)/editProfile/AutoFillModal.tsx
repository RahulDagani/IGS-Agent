// components/AIAutofillModal.tsx
"use client"

import React, { useState } from "react"
import { X, Upload, FileText, Briefcase, School, FileCheck, Sparkles, CheckCircle, AlertCircle } from "lucide-react"

export type DocumentType = "10th_marksheet" | "12th_marksheet" | "undergraduate_marksheet" | "resume" | "passport" | "transcripts"

interface DocumentOption {
  id: DocumentType
  label: string
  description: string
  icon: React.ComponentType<any>
  fields: {
    personal: number
    academics: number
    work: number
  }
}

interface UploadedDocument {
  id: DocumentType
  name: string
  size: string
  date: string
  status: "uploaded" | "processing" | "completed" | "failed"
  extractedFields: {
    personal: number
    academics: number
    work: number
    total: number
  }
}

interface AIAutofillModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: () => void
}

export default function AIAutofillModal({ isOpen, onClose, onUploadComplete }: AIAutofillModalProps) {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([
    {
      id: "10th_marksheet",
      name: "10th_Marksheet.pdf",
      size: "2.4 MB",
      date: "2024-01-15",
      status: "completed",
      extractedFields: {
        personal: 12,
        academics: 8,
        work: 0,
        total: 20
      }
    }
  ])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const documentOptions: DocumentOption[] = [
    {
      id: "10th_marksheet",
      label: "10th Marksheet",
      description: "High school completion certificate and marks",
      icon: School,
      fields: { personal: 5, academics: 10, work: 0 }
    },
    {
      id: "12th_marksheet",
      label: "12th Marksheet",
      description: "Higher secondary school marks and details",
      icon: School,
      fields: { personal: 8, academics: 15, work: 0 }
    },
    {
      id: "undergraduate_marksheet",
      label: "Undergraduate Marksheet",
      description: "Bachelor's degree transcripts and certificates",
      icon: FileText,
      fields: { personal: 10, academics: 25, work: 2 }
    },
    {
      id: "resume",
      label: "Resume/CV",
      description: "Professional experience and qualifications",
      icon: Briefcase,
      fields: { personal: 15, academics: 8, work: 32 }
    },
    {
      id: "passport",
      label: "Passport",
      description: "Personal identification and nationality details",
      icon: FileCheck,
      fields: { personal: 23, academics: 0, work: 0 }
    },
    {
      id: "transcripts",
      label: "Academic Transcripts",
      description: "Complete academic records from institutions",
      icon: FileText,
      fields: { personal: 12, academics: 36, work: 0 }
    }
  ]

  const handleFileUpload = async (file: File) => {
    if (!selectedDocType) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval)
      
      const newDoc: UploadedDocument = {
        id: selectedDocType,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0],
        status: "completed",
        extractedFields: {
          personal: Math.floor(Math.random() * 15) + 10,
          academics: Math.floor(Math.random() * 20) + 15,
          work: selectedDocType === "resume" ? Math.floor(Math.random() * 15) + 10 : 0,
          total: 0
        }
      }

      newDoc.extractedFields.total = 
        newDoc.extractedFields.personal + 
        newDoc.extractedFields.academics + 
        newDoc.extractedFields.work

      setUploadedDocs(prev => [...prev, newDoc])
      setUploading(false)
      setUploadProgress(0)
      setSelectedDocType(null)
      
      if (onUploadComplete) {
        onUploadComplete()
      }
    }, 2000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedDocType) {
      handleFileUpload(file)
    }
  }

  const getStatusColor = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'processing': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
      case 'uploaded': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'failed': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
    }
  }

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
      case 'uploaded': return <Upload className="w-4 h-4" />
      case 'failed': return <AlertCircle className="w-4 h-4" />
    }
  }

  const getDocFieldsText = (doc: UploadedDocument) => {
    const fields = []
    if (doc.extractedFields.personal > 0) {
      fields.push(`Fills ${doc.extractedFields.personal}/32 fields of Personal Information`)
    }
    if (doc.extractedFields.academics > 0) {
      fields.push(`Fills ${doc.extractedFields.academics}/36 fields of Academic Qualifications`)
    }
    if (doc.extractedFields.work > 0) {
      fields.push(`Fills ${doc.extractedFields.work}/28 fields of Work Experience`)
    }
    return fields
  }

  const selectedDocOption = selectedDocType 
    ? documentOptions.find(doc => doc.id === selectedDocType)
    : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-99999 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Autofill Assistant
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload documents to automatically fill your profile
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Document Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Document Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentOptions.map((doc) => {
                  const Icon = doc.icon
                  const isSelected = selectedDocType === doc.id
                  const isUploaded = uploadedDocs.some(d => d.id === doc.id)
                  
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocType(doc.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      } ${isUploaded ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {doc.label}
                            </h4>
                            {isUploaded && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {doc.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                              Personal: {doc.fields.personal}
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">
                              Academic: {doc.fields.academics}
                            </span>
                            {doc.fields.work > 0 && (
                              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                                Work: {doc.fields.work}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Upload Section */}
            {selectedDocType && selectedDocOption && (
              <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Upload {selectedDocOption.label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload your document to extract information
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Expected to fill:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {selectedDocOption.fields.personal + selectedDocOption.fields.academics + selectedDocOption.fields.work} fields
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Upload Instructions:
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-500 mt-2" />
                      Ensure the document is clear and readable
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-500 mt-2" />
                      Upload PDF, JPG, or PNG files (Max 10MB)
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-500 mt-2" />
                      Make sure all text is visible and not cropped
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-500 mt-2" />
                      For transcripts, include all pages in one file
                    </li>
                  </ul>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
                  {uploading ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-purple-500 animate-spin" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Processing document...</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Extracting information with AI
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {uploadProgress}% complete
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="mb-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Drag & drop your file here
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          or click to browse files
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            disabled={uploading}
                          />
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-3 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-600 transition-all duration-200">
                            <Upload className="w-4 h-4" />
                            Browse Files
                          </span>
                        </label>
                        <button
                          onClick={() => setSelectedDocType(null)}
                          className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Uploaded Documents */}
            {uploadedDocs.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Uploaded Documents
                </h3>
                <div className="space-y-4">
                  {uploadedDocs.map((doc) => {
                    const docOption = documentOptions.find(d => d.id === doc.id)
                    const fieldTexts = getDocFieldsText(doc)
                    
                    return (
                      <div
                        key={`${doc.id}-${doc.date}`}
                        className="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                              {docOption?.icon && (
                                <docOption.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {doc.name}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(doc.status)}
                                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                  </span>
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {docOption?.label} • {doc.size} • Uploaded on {doc.date}
                              </p>
                              <div className="mt-3 space-y-2">
                                {fieldTexts.map((text, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-gray-700 dark:text-gray-300">{text}</span>
                                  </div>
                                ))}
                                {doc.extractedFields.total > 0 && (
                                  <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                                    <Sparkles className="w-4 h-4" />
                                    Total {doc.extractedFields.total} fields extracted
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Progress Summary */}
            {uploadedDocs.length > 0 && (
              <div className="mt-8 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Auto-fill Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {uploadedDocs.reduce((sum, doc) => sum + doc.extractedFields.personal, 0)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Personal Information Fields</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (uploadedDocs.reduce((sum, doc) => sum + doc.extractedFields.personal, 0) / 32) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {uploadedDocs.reduce((sum, doc) => sum + doc.extractedFields.academics, 0)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Academic Fields</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (uploadedDocs.reduce((sum, doc) => sum + doc.extractedFields.academics, 0) / 36) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {uploadedDocs.reduce((sum, doc) => sum + doc.extractedFields.work, 0)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Work Experience Fields</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (uploadedDocs.reduce((sum, doc) => sum + doc.extractedFields.work, 0) / 28) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>AI-powered document parsing extracts information automatically</p>
              <p className="mt-1">Supported documents: Marksheets, Transcripts, Resume, Passport</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Handle applying all extracted data
                  onClose()
                }}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-lg transition-all duration-200"
              >
                Apply All Extracted Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}