// components/AIAutofillModal.tsx
"use client"

import React, { useState, useRef } from "react"
import { X, Upload, FileText, Briefcase, School, FileCheck, Sparkles, CheckCircle, AlertCircle, File, ExternalLink } from "lucide-react"

export type DocumentType = "10th_marksheet" | "12th_marksheet" | "undergraduate_marksheet" | "resume" | "passport" | "transcripts"

interface DocumentOption {
  id: DocumentType
  label: string
  description: string
  icon: React.ComponentType<any>
  fields: {
    personal?: number
    academics?: number
    work?: number
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documentOptions: DocumentOption[] = [
    {
      id: "passport",
      label: "Passport",
      description: "Personal identification",
      icon: FileCheck,
      fields: { personal: 23 }
    },
    {
      id: "10th_marksheet",
      label: "10th Marksheet",
      description: "High school completion certificate",
      icon: School,
      fields: { academics: 10}
    },
    {
      id: "12th_marksheet",
      label: "12th Marksheet",
      description: "Higher secondary school marks",
      icon: School,
      fields: { academics: 15}
    },
    {
      id: "undergraduate_marksheet",
      label: "Undergrad Marksheet",
      description: "Bachelor's degree transcripts",
      icon: FileText,
      fields: { academics: 25 }
    },
    {
      id: "resume",
      label: "Resume/CV",
      description: "Professional experience",
      icon: Briefcase,
      fields: { work: 32 }
    },
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
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!selectedDocType) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const getStatusColor = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'uploaded': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'processing': return <div className="animate-spin rounded-full border border-current border-t-transparent w-3 h-3" />
      case 'uploaded': return <Upload className="w-3 h-3" />
      case 'failed': return <AlertCircle className="w-3 h-3" />
    }
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
        <div className="relative w-full max-w-6xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Document Autofill
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload documents to automatically fill your profile
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Document Selection */}
              <div className="lg:col-span-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                  Select Document Type
                </h3>
                <div className="space-y-2">
                  {documentOptions.map((doc) => {
                    const Icon = doc.icon
                    const isSelected = selectedDocType === doc.id
                    const isUploaded = uploadedDocs.some(d => d.id === doc.id)
                    
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocType(doc.id)}
                        className={`w-full p-3 rounded-lg border transition-all duration-200 text-left flex items-start gap-3 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        } ${isUploaded ? 'opacity-80' : ''}`}
                      >
                        <div className={`p-2 rounded-md ${
                          isSelected
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {doc.label}
                            </h4>
                            {isUploaded && (
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {doc.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            {doc.fields?.personal && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              Personal Information: Fill {doc.fields.personal} fields
                            </span> }
                            {doc.fields?.academics && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              Academic Qualifications: Fill {doc.fields.academics} fields
                            </span> }
                            {doc.fields?.work && (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                Work Experience: Fill {doc.fields.work} fields
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

               
              </div>

              {/* Right Column - Upload Area */}
              <div className="lg:col-span-2">
                {selectedDocType && selectedDocOption ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        Upload {selectedDocOption.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Expected to fill:{" "}
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                            {selectedDocOption.fields.personal && (selectedDocOption.fields.personal + " fields of Personal Information")}
                            {selectedDocOption.fields.academics && (selectedDocOption.fields.academics + " fields of Academic Qualification")}
                            {selectedDocOption.fields.work && (selectedDocOption.fields.work + " fields of Work Experience")}
                        </span>
                      </p>
                    </div>

                    

                    {/* Upload Area */}
                    <div 
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        uploading 
                          ? 'border-purple-300 dark:border-purple-800'
                          : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <div className="space-y-4">
                          <div className="w-12 h-12 mx-auto rounded-full border-3 border-gray-200 dark:border-gray-800 border-t-purple-500 animate-spin" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Processing...</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              AI is extracting information
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {uploadProgress}% complete
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                            <Upload className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Drop file here or click to browse
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Upload your {selectedDocOption.label.toLowerCase()}
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            disabled={uploading}
                          />
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-2 text-xs font-medium text-white hover:from-purple-700 hover:to-blue-600 transition-all duration-200"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Select File
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            PDF, JPG, PNG (Max 10MB)
                          </p>
                        </>
                      )}
                    </div>

                    {/* Cancel Button */}
                    {!uploading && (
                      <button
                        onClick={() => setSelectedDocType(null)}
                        className="w-full mt-3 px-4 py-2 mb-3 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                      >
                        Choose Different Document
                      </button>
                    )}

                    {/* Instructions */}
                    <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Upload Guidelines
                      </h4>
                      <ul className="space-y-1.5 text-xs text-blue-700 dark:text-blue-400">
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5">•</span>
                          Ensure document is clear and readable
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5">•</span>
                          Max file size: 10MB
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5">•</span>
                          Supported: PDF, JPG, PNG
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* Initial State - No document selected */
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <File className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Select a Document Type
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                      Choose a document type from the left panel to begin uploading and extracting information.
                    </p>
                  </div>
                )}

                {/* Progress Summary */}
             
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>AI-powered extraction • Secure upload • No data stored</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
              {uploadedDocs.length > 0 && (
                <button
                  onClick={() => {
                    // Handle applying all extracted data
                    onClose()
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-lg transition-all duration-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Apply All Data
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}