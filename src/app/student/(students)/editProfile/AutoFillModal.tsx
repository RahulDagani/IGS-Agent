"use client"

import React, { useState, useRef } from "react"
import { X, Upload, FileText, Briefcase, School, FileCheck, Sparkles, CheckCircle, AlertCircle, File, ExternalLink, Eye, Save, Building2, Calendar, MapPin, DollarSign, Clock, Edit2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export type DocumentType = "10th_marksheet" | "12th_marksheet" | "undergraduate_marksheet" | "resume" | "passport" | "transcripts"

// Academic document types from the API
const allowedAcademicDocumentTypes = [
  "Grade 10",
  "Grade 12",
  "Undergraduate",
];

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
  apiDocumentType?: string // Maps to the API's document_type
}

interface ExtractedPersonalData {
  salutation?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  passport_number?: string;
  dob?: string;
  gender?: string;
  citizenship?: string;
  country_code?: string;
  state_code?: string;
  city_code?: string;
  address?: string;
  postal_code?: string;
  emergency_c_name?: string | null;
  emergency_c_relation?: string | null;
  emergency_c_email?: string | null;
  emergency_c_phone?: string | null;
}

interface ExtractedAcademicData {
  country_of_study?: string;
  state_of_study?: string;
  city_of_study?: string;
  level_of_study?: string;
  board_name?: string;
  qualification_awarded?: string;
  institution_name?: string;
  grading_system?: string;
  score?: string;
  primary_language_of_instruction?: string;
  start_date?: string;
  end_date?: string;
}

interface ExtractedWorkExperience {
  organisation_name: string;
  organisation_address: string | null;
  position_title: string;
  job_profile: string;
  salary_mode: string | null;
  employment_type: string | null;
  working_from: string;
  working_upto: string;
  is_currently_working: boolean;
}

interface UploadedDocument {
  id: DocumentType
  name: string
  size: string
  date: string
  status: "uploaded" | "processing" | "completed" | "failed"
  extractedData?: ExtractedPersonalData | ExtractedAcademicData | ExtractedWorkExperience[]
  documentType?: string // The API document type
}

interface AIAutofillModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: (data?: ExtractedPersonalData | ExtractedAcademicData | ExtractedWorkExperience[]) => void
}

// Employment type options
const employmentTypeOptions = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Internship", label: "Internship" },
  { value: "Contract", label: "Contract" },
  { value: "Freelance", label: "Freelance" }
];

// Salary mode options
const salaryModeOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cheque", label: "Cheque" },
  { value: "UPI", label: "UPI" },
  { value: "Other", label: "Other" }
];

export default function AIAutofillModal({ 
  isOpen, 
  onClose, 
  onUploadComplete, 
}: AIAutofillModalProps) {
  const router = useRouter();
  const {token} = useAuth();
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showExtractedPreview, setShowExtractedPreview] = useState<ExtractedPersonalData | ExtractedAcademicData | ExtractedWorkExperience[] | null>(null)
  const [previewDocumentType, setPreviewDocumentType] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [editableWorkExperiences, setEditableWorkExperiences] = useState<ExtractedWorkExperience[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  const documentOptions: DocumentOption[] = [
    {
      id: "passport",
      label: "Passport",
      description: "Personal identification",
      icon: FileCheck,
      fields: { personal: 13 }
    },
    {
      id: "10th_marksheet",
      label: "10th Marksheet",
      description: "High school completion certificate",
      icon: School,
      fields: { academics: 12 },
      apiDocumentType: "Grade 10"
    },
    {
      id: "12th_marksheet",
      label: "12th Marksheet",
      description: "Higher secondary school marks",
      icon: School,
      fields: { academics: 12 },
      apiDocumentType: "Grade 12"
    },
    {
      id: "undergraduate_marksheet",
      label: "Undergrad Marksheet",
      description: "Bachelor's degree transcripts",
      icon: FileText,
      fields: { academics: 12 },
      apiDocumentType: "Undergraduate"
    },
    {
      id: "resume",
      label: "Resume/CV",
      description: "Professional experience",
      icon: Briefcase,
      fields: { work: 32 }
    },
  ]

  const isAcademicDocument = (docType: DocumentType): boolean => {
    return ["10th_marksheet", "12th_marksheet", "undergraduate_marksheet"].includes(docType);
  }

  const isResumeDocument = (docType: DocumentType): boolean => {
    return docType === "resume";
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedDocType) return

    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Create form data for API
      const formData = new FormData()
      formData.append('document', file)

      let response;
      let selectedOption = documentOptions.find(doc => doc.id === selectedDocType);

      // Determine which API to call based on document type
      if (isAcademicDocument(selectedDocType) && selectedOption?.apiDocumentType) {
        // Academic document API
        formData.append('document_type', selectedOption.apiDocumentType);
        
        response = await fetch(`${BASE_URL}/academic/document/analyze`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else if (selectedDocType === "passport") {
        formData.append('document_type', "passport");
        // Passport API - using existing endpoint
        response = await fetch(`${BASE_URL}/documents/analyze`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else if (isResumeDocument(selectedDocType)) {
        // Resume API - New endpoint
        response = await fetch(`${BASE_URL}/documents/analyze-resume`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        throw new Error('Unsupported document type');
      }

      clearInterval(progressInterval)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to analyze document')
      }

      const result = await response.json()
      setUploadProgress(100)

      if (result.success) {
        // Create the uploaded document record
        const newDoc: UploadedDocument = {
          id: selectedDocType,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          date: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          status: "completed",
          extractedData: isResumeDocument(selectedDocType) ? result.extracted_data : result.extracted_data,
          documentType: result.document_type || (isResumeDocument(selectedDocType) ? 'Resume' : null)
        }

        setUploadedDocs(prev => [...prev, newDoc])
        
        // Show the extracted data preview
        if (result.extracted_data) {
          if (isResumeDocument(selectedDocType)) {
            // For resume, we get an array of work experiences
            setShowExtractedPreview(result.extracted_data);
            setEditableWorkExperiences(result.extracted_data);
            setPreviewDocumentType('Resume');
          } else {
            setShowExtractedPreview(result.extracted_data);
            setPreviewDocumentType(result.document_type || null);
          }
        }
        
        if (onUploadComplete) {
          onUploadComplete(result.extracted_data)
        }
      } else {
        throw new Error(result.message || 'Failed to process document')
      }

    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload and analyze document')
      
      // Add failed document record
      const failedDoc: UploadedDocument = {
        id: selectedDocType,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        status: "failed"
      }
      
      setUploadedDocs(prev => [...prev, failedDoc])
    } finally {
      setUploading(false)
      setSelectedDocType(null)
    }
  }

const handleSaveExtractedData = async () => {
  if (!showExtractedPreview) return

  setIsSaving(true)
  setUploadError(null)

  let redirectUrl = "/student/editProfile";

  try {
    let response;

    // Determine which save API to call based on the type of data we're saving
    if (Array.isArray(showExtractedPreview)) {
      // This is work experience data from resume
      const workExperiences = editableWorkExperiences.length > 0 
        ? editableWorkExperiences 
        : showExtractedPreview;

      // Clean up the data - remove any empty/null values and ensure proper format
      const cleanedExperiences = workExperiences.map(exp => ({
        organisation_name: exp.organisation_name || '',
        organisation_address: exp.organisation_address || '',
        position_title: exp.position_title || '',
        job_profile: exp.job_profile || '',
        salary_mode: exp.salary_mode || null,
        employment_type: exp.employment_type || null,
        working_from: exp.working_from || '',
        working_upto: exp.is_currently_working ? null : (exp.working_upto || ''),
        is_currently_working: exp.is_currently_working || false
      }));

      response = await fetch(`${BASE_URL}/documents/save-work-experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ work_experiences: cleanedExperiences })
      });

      redirectUrl = "/student/editProfile?profileTab=workexperience";
    } 
    // Check for academic data FIRST (more specific)
    else if (previewDocumentType && allowedAcademicDocumentTypes.includes(previewDocumentType)) {
      // This is academic data
      const filteredData = Object.entries(showExtractedPreview).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      response = await fetch(`${BASE_URL}/academic/document/records/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filteredData)
      });
      redirectUrl = "/student/editProfile?profileTab=academics";
    } 
    else if (previewDocumentType === 'passport' || 'passport_number' in showExtractedPreview || 'first_name' in showExtractedPreview) {
      // This is passport/personal data
      const filteredData = Object.entries(showExtractedPreview).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      response = await fetch(`${BASE_URL}/documents/save/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filteredData)
      });
    }
    else {
      // Fallback - try to determine based on data structure
      if ('level_of_study' in showExtractedPreview || 'board_name' in showExtractedPreview) {
        // Academic data
        const filteredData = Object.entries(showExtractedPreview).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        response = await fetch(`${BASE_URL}/academic/document/records/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(filteredData)
        });
        redirectUrl = "/student/editProfile?profileTab=academics";
      } else {
        // Personal data
        const filteredData = Object.entries(showExtractedPreview).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            acc[key] = value;
          }
          return acc; 
        }, {} as Record<string, any>);

        response = await fetch(`${BASE_URL}/documents/save/details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(filteredData)
        });
      }
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save data');
    }

      setSaveSuccess(true)
      
      // Close modal after successful save
      setTimeout(() => {
        onClose()
        // Reset state
        setShowExtractedPreview(null)
        setPreviewDocumentType(null)
        setEditableWorkExperiences([])
        setSaveSuccess(false)

        router.push(redirectUrl);
      }, 1500)

    } catch (error) {
      console.error('Save error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to save extracted data')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle work experience field changes
  const handleWorkExperienceChange = (index: number, field: keyof ExtractedWorkExperience, value: any) => {
    setEditableWorkExperiences(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };

      // If currently working is true, set working_upto to null
      if (field === 'is_currently_working' && value === true) {
        updated[index].working_upto = '';
      }

      return updated;
    });
  };

  // Add new work experience entry
  const handleAddWorkExperience = () => {
    const newExperience: ExtractedWorkExperience = {
      organisation_name: '',
      organisation_address: null,
      position_title: '',
      job_profile: '',
      salary_mode: null,
      employment_type: null,
      working_from: '',
      working_upto: '',
      is_currently_working: false
    };

    setEditableWorkExperiences(prev => [...prev, newExperience]);
  };

  // Remove work experience entry
  const handleRemoveWorkExperience = (index: number) => {
    setEditableWorkExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedDocType) {
      handleFileUpload(file)
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  const handleClose = () => {
    // Reset all state when closing
    setSelectedDocType(null)
    setUploadError(null)
    setShowExtractedPreview(null)
    setPreviewDocumentType(null)
    setSaveSuccess(false)
    setUploadProgress(0)
    setEditableWorkExperiences([])
    onClose()
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

  // Render work experience preview
  const renderWorkExperiencePreview = (experiences: ExtractedWorkExperience[]) => {
    const displayExperiences = editableWorkExperiences.length > 0 ? editableWorkExperiences : experiences;

    return (
      <div className="mb-6 p-5 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              Extracted Work Experience from Resume
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full text-xs flex items-center gap-1">
              <Edit2 className="w-3 h-3" />
              Editable
            </span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs">
              {displayExperiences.length} {displayExperiences.length === 1 ? 'Experience' : 'Experiences'}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {displayExperiences.map((exp, index) => (
            <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-100 dark:border-orange-900 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  Work Experience #{index + 1}
                </h4>
                {displayExperiences.length > 1 && (
                  <button
                    onClick={() => handleRemoveWorkExperience(index)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Organisation Name
                  </label>
                  <input
                    type="text"
                    value={exp.organisation_name || ''}
                    onChange={(e) => handleWorkExperienceChange(index, 'organisation_name', e.target.value)}
                    className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 p-0"
                    placeholder="Company name"
                  />
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Organisation Address
                  </label>
                  <input
                    type="text"
                    value={exp.organisation_address || ''}
                    onChange={(e) => handleWorkExperienceChange(index, 'organisation_address', e.target.value)}
                    className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 p-0"
                    placeholder="Company address"
                  />
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block">
                    Position Title
                  </label>
                  <input
                    type="text"
                    value={exp.position_title || ''}
                    onChange={(e) => handleWorkExperienceChange(index, 'position_title', e.target.value)}
                    className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 p-0"
                    placeholder="Job title"
                  />
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg md:col-span-2 lg:col-span-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block">
                    Job Profile / Description
                  </label>
                  <textarea
                    value={exp.job_profile || ''}
                    onChange={(e) => handleWorkExperienceChange(index, 'job_profile', e.target.value)}
                    className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 p-0 resize-y min-h-[60px]"
                    placeholder="Describe your responsibilities and achievements"
                  />
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Salary Mode
                  </label>
                  <select
                    value={exp.salary_mode || ''}
                    onChange={(e) => handleWorkExperienceChange(index, 'salary_mode', e.target.value || null)}
                    className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 p-0"
                  >
                    <option value="">Select Salary Mode</option>
                    {salaryModeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Employment Type
                  </label>
                  <select
                    value={exp.employment_type || ''}
                    onChange={(e) => handleWorkExperienceChange(index, 'employment_type', e.target.value || null)}
                    className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 p-0"
                  >
                    <option value="">Select Employment Type</option>
                    {employmentTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Working From
                  </label>
                  <input
                    type="date"
                    value={exp.working_from || ''}
                    onChange={(e) => handleWorkExperienceChange(index, 'working_from', e.target.value)}
                    className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 p-0"
                  />
                </div>
                
                {!exp.is_currently_working && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Working Upto
                    </label>
                    <input
                      type="date"
                      value={exp.working_upto || ''}
                      onChange={(e) => handleWorkExperienceChange(index, 'working_upto', e.target.value)}
                      className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 p-0"
                    />
                  </div>
                )}
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.is_currently_working || false}
                      onChange={(e) => handleWorkExperienceChange(index, 'is_currently_working', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      I currently work here
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add more experience button */}
        <div className="mt-4">
          <button
            onClick={handleAddWorkExperience}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Add Another Work Experience
          </button>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={() => setShowExtractedPreview(null)}
            className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveExtractedData}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-3 h-3" />
                Saving Work Experience...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Work Experience ({displayExperiences.length})
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Render academic preview
  const renderAcademicPreview = (data: ExtractedAcademicData) => {
    return (
      <div className="mb-6 p-5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300">
              Extracted Information from {previewDocumentType || 'Academic Document'}
            </h3>
          </div>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs">
            Editable Preview
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Country of Study</label>
            <input
              type="text"
              value={data.country_of_study || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    country_of_study: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">State of Study</label>
            <input
              type="text"
              value={data.state_of_study || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    state_of_study: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">City of Study</label>
            <input
              type="text"
              value={data.city_of_study || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    city_of_study: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          {/* ... rest of the academic preview fields ... */}
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Level of Study</label>
            <input
              type="text"
              value={data.level_of_study || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    level_of_study: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Board Name</label>
            <input
              type="text"
              value={data.board_name || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    board_name: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Qualification</label>
            <input
              type="text"
              value={data.qualification_awarded || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    qualification_awarded: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900 md:col-span-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Institution Name</label>
            <input
              type="text"
              value={data.institution_name || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    institution_name: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Grading System</label>
            <select
              value={data.grading_system || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    grading_system: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            >
              <option value="">Select</option>
              <option value="Percentage">Percentage</option>
              <option value="CGPA">CGPA</option>
              <option value="GPA">GPA</option>
              <option value="Letter Grade">Letter Grade</option>
            </select>
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Score</label>
            <input
              type="text"
              value={data.score || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    score: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Language of Instruction</label>
            <input
              type="text"
              value={data.primary_language_of_instruction || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    primary_language_of_instruction: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Start Date</label>
            <input
              type="date"
              value={data.start_date || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    start_date: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">End Date</label>
            <input
              type="date"
              value={data.end_date || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    end_date: e.target.value
                  } as ExtractedAcademicData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={() => setShowExtractedPreview(null)}
            className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveExtractedData}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-3 h-3" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Academic Information
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Render personal data preview (existing passport preview)
  const renderPersonalPreview = (data: ExtractedPersonalData) => {
    return (
      <div className="mb-6 p-5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300">
              Extracted Information from Passport
            </h3>
          </div>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs">
            Editable Preview
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Personal fields with edit capability */}
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Salutation</label>
            <select
              value={data.salutation || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    salutation: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            >
              <option value="">Select</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Dr.">Dr.</option>
            </select>
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">First Name</label>
            <input
              type="text"
              value={data.first_name || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    first_name: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Middle Name</label>
            <input
              type="text"
              value={data.middle_name || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    middle_name: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Last Name</label>
            <input
              type="text"
              value={data.last_name || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    last_name: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Date of Birth</label>
            <input
              type="date"
              value={data.dob || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    dob: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Gender</label>
            <select
              value={data.gender || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    gender: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Passport Number</label>
            <input
              type="text"
              value={data.passport_number || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    passport_number: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Citizenship</label>
            <input
              type="text"
              value={data.citizenship || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    citizenship: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900 md:col-span-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Address</label>
            <input
              type="text"
              value={data.address || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    address: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Country</label>
            <input
              type="text"
              value={data.country_code || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    country_code: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">State</label>
            <input
              type="text"
              value={data.state_code || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    state_code: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">City</label>
            <input
              type="text"
              value={data.city_code || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    city_code: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900">
            <label className="text-xs text-gray-500 dark:text-gray-400 block">Postal Code</label>
            <input
              type="text"
              value={data.postal_code || ''}
              onChange={(e) => {
                if (!Array.isArray(showExtractedPreview)) {
                  setShowExtractedPreview({
                    ...showExtractedPreview,
                    postal_code: e.target.value
                  } as ExtractedPersonalData);
                }
              }}
              className="text-sm font-medium text-gray-900 dark:text-white mt-1 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-0 p-0"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={() => setShowExtractedPreview(null)}
            className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveExtractedData}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-3 h-3" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Personal Information
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-99999 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
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
              onClick={handleClose}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Success Message */}
            {saveSuccess && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                      Data Saved Successfully!
                    </h3>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                      Your information has been updated.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Data Preview - Conditional Rendering */}
            {showExtractedPreview && Array.isArray(showExtractedPreview) 
              ? renderWorkExperiencePreview(showExtractedPreview)
              : showExtractedPreview && 'level_of_study' in showExtractedPreview 
                ? renderAcademicPreview(showExtractedPreview as ExtractedAcademicData)
                : showExtractedPreview && renderPersonalPreview(showExtractedPreview as ExtractedPersonalData)
            }

            {/* Error Message */}
            {uploadError && !showExtractedPreview && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                      Upload Failed
                    </h3>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                      {uploadError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Only show document selection if no preview is showing */}
            {!showExtractedPreview && (
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
                          disabled={uploading}
                          className={`w-full p-3 rounded-lg border transition-all duration-200 text-left flex items-start gap-3 ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          } ${isUploaded ? 'opacity-80' : ''} ${
                            uploading ? 'cursor-not-allowed' : ''
                          }`}
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
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {doc.fields?.personal && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                  Personal: {doc.fields.personal} fields
                                </span>
                              )}
                              {doc.fields?.academics && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                  Academics: {doc.fields.academics} fields
                                </span>
                              )}
                              {doc.fields?.work && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                  Work: {doc.fields.work} fields
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
                          {isResumeDocument(selectedDocType) 
                            ? "We'll extract your work experience information from your resume"
                            : "We'll extract information from your document and fill the relevant fields"
                          }
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
                                AI is extracting information from your document
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
                            Supported formats: PDF, JPG, PNG
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
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>AI-powered extraction • Secure upload • Your data is encrypted</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}