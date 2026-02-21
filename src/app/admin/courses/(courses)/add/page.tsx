"use client"
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Book, Building2, GraduationCap, Calendar, Upload, DollarSign, Download, X, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CourseFormData {
  // Basics
  university_id: string;
  study_level_id: string;
  discipline_id: string;
  course_name: string;
  is_popular: string;
  duration_min: string;
  duration_max: string;
  duration_unit: string;
  tuition_fee: string;
  currency_code: string;
  application_fee: string;
  
  // Scores
  gre_score: string;
  gmat_score: string;
  ielts_score: string;
  toefl_score: string;
  pte_score: string;
  sat_score: string;
  act_score: string;
  duolingo_score: string;
  gpa_score: string;
  
  // Course Details
  about_course: string;
  admission_requirements: string;
  
  // Intakes - Updated structure
  intakes: {
    intake_id: string;
    intake_year: string;
    is_active: boolean;
    deadlines: {
      deadline_type_id: string;
      deadline_date: string;
      notes: string;
    }[];
  }[];
}

interface University {
  id: number;
  university: string;
}

interface Option {
  id: number;
  name: string;
}

interface IntakeOption {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface DeadlineTypeOption {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// Import Modal Types
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onSuccess: () => void;
}

interface ImportResponse {
  status: string;
  message: string;
  data: {
    file_info: {
      filename: string;
      size: number;
      type: string;
    };
    total_rows: number;
    inserted: number;
    updated: number;
    errors: number;
    details: {
      new_universities_created?: number;
      new_study_levels_created?: number;
      new_disciplines_created?: number;
      new_intakes_created?: number;
      new_deadline_types_created?: number;
      inserted_courses: Array<{
        id: number;
        course_name: string;
        university_name?: string;
      }>;
      updated_courses: any[];
      errors: any[];
    };
  };
}

type Tab = "basics" | "scores" | "details" | "intakes";

// Import Modal Component
const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, token, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setImportResult(null);
    }
  };

  const handleDownloadSample = async () => {
    try {
      // Create a link to download the sample file
      const link = document.createElement('a');
      link.href = '/samples/course_feilds.xlsx';
      link.download = 'course_import_sample.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading sample file:', error);
      setError('Failed to download sample file');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
      const response = await fetch(`${BASE_URL}/tenant/import/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to import courses');
      }

      setImportResult(result as ImportResponse);
      
      // Call onSuccess callback to refresh the course list
      if (result.status === 'success') {
        onSuccess();
        
        // Auto close after 3 seconds on success
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-black-800/50 transition-opacity" onClick={handleClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Courses</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-4">
            {/* Sample Download Section */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Download className="text-blue-600 dark:text-blue-400 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Download Sample File</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 mb-2">
                    Download our sample Excel file to see the required format and fields.
                  </p>
                  <button
                    onClick={handleDownloadSample}
                    className="inline-flex items-center gap-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
                  >
                    <Download size={14} />
                    Download Sample
                  </button>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Excel File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white dark:bg-gray-900 font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Excel files only (.xlsx, .xls) up to 10MB
                  </p>
                </div>
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="text-red-600 dark:text-red-400" size={18} />
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
              </div>
            )}

            {/* Import Result - Success */}
            {importResult && importResult.status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                    Import Successful!
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total Rows</p>
                    <p className="font-medium text-gray-900 dark:text-white">{importResult.data.total_rows}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Inserted</p>
                    <p className="font-medium text-green-600">{importResult.data.inserted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Updated</p>
                    <p className="font-medium text-blue-600">{importResult.data.updated}</p>
                  </div>
                </div>
                
                {/* New entities created */}
                {importResult.data.details && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {importResult.data.details.new_universities_created !== undefined && (
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                        <span className="text-gray-600 dark:text-gray-400">New Universities:</span>
                        <span className="ml-2 font-medium text-green-700 dark:text-green-300">
                          {importResult.data.details.new_universities_created}
                        </span>
                      </div>
                    )}
                    {importResult.data.details.new_study_levels_created !== undefined && (
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                        <span className="text-gray-600 dark:text-gray-400">New Study Levels:</span>
                        <span className="ml-2 font-medium text-green-700 dark:text-green-300">
                          {importResult.data.details.new_study_levels_created}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {importResult.data.details && importResult.data.details.inserted_courses && 
                 importResult.data.details.inserted_courses.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Inserted Courses:</p>
                    <div className="max-h-24 overflow-y-auto">
                      {importResult.data.details.inserted_courses.map((course, idx) => (
                        <p key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                          • {course.course_name} {course.university_name ? `(${course.university_name})` : ''}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Import Result - Fail */}
            {importResult && importResult.status === "fail" && (
              <div className="mt-4 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                  {importResult.message}
                </p>
                <div className="text-xs text-red-700 dark:text-red-400 space-y-1 mb-3">
                  <p>Total Rows: {importResult.data?.total_rows}</p>
                  <p>Inserted: {importResult.data?.inserted}</p>
                  <p>Updated: {importResult.data?.updated}</p>
                  <p>Total Errors: {importResult.data?.errors}</p>
                </div>
                {importResult.data?.details?.errors?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                      Row Errors:
                    </p>
                    <ul className="list-disc pl-4 max-h-40 overflow-y-auto text-xs text-red-600 dark:text-red-400 space-y-1">
                      {importResult.data.details.errors.map((error: string, idx: number) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Import Courses
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AddCourse() {
  const router = useRouter();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [intakeOptions, setIntakeOptions] = useState<IntakeOption[]>([]);
  const [deadlineTypeOptions, setDeadlineTypeOptions] = useState<DeadlineTypeOption[]>([]);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  
  // Options state
  const [universities, setUniversities] = useState<University[]>([]);
  const [studyLevels, setStudyLevels] = useState<Option[]>([]);
  const [disciplines, setDisciplines] = useState<Option[]>([]);
  const [formData, setFormData] = useState<CourseFormData>({
    // Basics
    university_id: "",
    study_level_id: "",
    discipline_id: "",
    course_name: "",
    is_popular: "0",
    duration_min: "",
    duration_max: "",
    duration_unit: "months",
    tuition_fee: "",
    currency_code: "USD",
    application_fee: "",
    
    // Scores
    gre_score: "",
    gmat_score: "",
    ielts_score: "",
    toefl_score: "",
    pte_score: "",
    sat_score: "",
    act_score: "",
    duolingo_score: "",
    gpa_score: "",
    
    // Course Details
    about_course: "",
    admission_requirements: "",
    
    // Intakes - Updated structure
    intakes: [{
      intake_id: "",
      intake_year: "",
      is_active: true,
      deadlines: [{
        deadline_type_id: "",
        deadline_date: "",
        notes: ""
      }]
    }],
  });


  // Show message and auto-hide after 5 seconds
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch intake options on component mount
  useEffect(() => {
    const fetchIntakeOptions = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_intakes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setIntakeOptions(data.data);
        }
      } catch (error) {
        console.error('Error fetching intake options:', error);
      } 
    };

    const fetchDeadlineTypeOptions = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tenant/option/apply_tenant_deadline_types`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setDeadlineTypeOptions(data.data);
        }
      } catch (error) {
        console.error('Error fetching deadline type options:', error);
      }
    };

    if (token) {
      fetchIntakeOptions();
      fetchDeadlineTypeOptions();
    }
  }, [token]);

  // Fetch all static options except disciplines
  useEffect(() => {
    const fetchOptions = async () => {
      if (!token) return;

      try {
        setIsLoadingOptions(true);

        // Fetch all options except disciplines in parallel
        const [
          universitiesRes,
          studyLevelsRes,
        ] = await Promise.all([
          fetch(`${BASE_URL}/tenant/university/list`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/tenant/option/apply_tenant_study_levels`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        // Process universities response
        if (universitiesRes.ok) {
          const universitiesData = await universitiesRes.json();
          setUniversities(universitiesData.data || []);
        }

        // Process study levels
        if (studyLevelsRes.ok) {
          const studyLevelsData = await studyLevelsRes.json();
          setStudyLevels(studyLevelsData.data || []);
        }

      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [token]);

  // Fetch disciplines when study_level_id changes
  const fetchDisciplines = async (studyLevelId: string) => {
    if (!token || !studyLevelId) {
      setDisciplines([]);
      setFormData(prev => ({ ...prev, discipline_id: "" }));
      return;
    }

    try {
      setIsLoadingDisciplines(true);

      const response = await fetch(
        `${BASE_URL}/tenant/course/get/disciplines/${studyLevelId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setDisciplines(data.data);
        } else {
          setDisciplines([]);
        }
      } else {
        setDisciplines([]);
      }
    } catch (error) {
      console.error('Error fetching disciplines:', error);
      setDisciplines([]);
    } finally {
      setIsLoadingDisciplines(false);
    }
  };

  // Effect to fetch disciplines when study_level_id changes
  useEffect(() => {
    if (formData.study_level_id) {
      fetchDisciplines(formData.study_level_id);
    } else {
      setDisciplines([]);
      setFormData(prev => ({ ...prev, discipline_id: "" }));
    }
  }, [formData.study_level_id, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If study level is changing, reset discipline_id
    if (name === "study_level_id") {
      setFormData(prev => ({
        ...prev,
        study_level_id: value,
        discipline_id: "" // Reset discipline when study level changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleIntakeChange = (intakeIndex: number, field: string, value: string | boolean) => {
    const updatedIntakes = [...formData.intakes];
    updatedIntakes[intakeIndex] = {
      ...updatedIntakes[intakeIndex],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      intakes: updatedIntakes
    }));
  };

  const handleDeadlineChange = (intakeIndex: number, deadlineIndex: number, field: string, value: string) => {
    const updatedIntakes = [...formData.intakes];
    const updatedDeadlines = [...updatedIntakes[intakeIndex].deadlines];
    updatedDeadlines[deadlineIndex] = {
      ...updatedDeadlines[deadlineIndex],
      [field]: value
    };
    updatedIntakes[intakeIndex] = {
      ...updatedIntakes[intakeIndex],
      deadlines: updatedDeadlines
    };
    setFormData(prev => ({
      ...prev,
      intakes: updatedIntakes
    }));
  };

  const addIntake = () => {
    setFormData(prev => ({
      ...prev,
      intakes: [
        ...prev.intakes,
        {
          intake_id: "",
          intake_year: "",
          is_active: true,
          deadlines: [{
            deadline_type_id: "",
            deadline_date: "",
            notes: ""
          }]
        }
      ]
    }));
  };

  const removeIntake = (index: number) => {
    if (formData.intakes.length > 1) {
      const updatedIntakes = formData.intakes.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        intakes: updatedIntakes
      }));
    }
  };

  const addDeadline = (intakeIndex: number) => {
    const updatedIntakes = [...formData.intakes];
    updatedIntakes[intakeIndex].deadlines.push({
      deadline_type_id: "",
      deadline_date: "",
      notes: ""
    });
    setFormData(prev => ({
      ...prev,
      intakes: updatedIntakes
    }));
  };

  const removeDeadline = (intakeIndex: number, deadlineIndex: number) => {
    const updatedIntakes = [...formData.intakes];
    if (updatedIntakes[intakeIndex].deadlines.length > 1) {
      updatedIntakes[intakeIndex].deadlines = updatedIntakes[intakeIndex].deadlines.filter((_, i) => i !== deadlineIndex);
      setFormData(prev => ({
        ...prev,
        intakes: updatedIntakes
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'university_id', 'study_level_id', 'discipline_id', 
      'course_name', 'tuition_fee', 
      'currency_code', 'application_fee', 'about_course', 
      'admission_requirements'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof CourseFormData]) {
        showMessage('error', `Please fill in all required fields`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    if (!token) {
      showMessage('error', "Please log in to update the course");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API with new intakes structure
      const submitData = {
        university_id: parseInt(formData.university_id),
        study_level_id: parseInt(formData.study_level_id),
        discipline_id: parseInt(formData.discipline_id),
        course_name: formData.course_name,
        is_popular: parseInt(formData.is_popular),
        duration_min: parseInt(formData.duration_min) || 0,
        duration_max: parseInt(formData.duration_max) || 0,
        duration_unit: formData.duration_unit,
        tuition_fee: parseFloat(formData.tuition_fee) || 0,
        currency_code: formData.currency_code,
        application_fee: parseFloat(formData.application_fee) || 0,
        gre_score: formData.gre_score ? parseFloat(formData.gre_score) : null,
        gmat_score: formData.gmat_score ? parseFloat(formData.gmat_score) : null,
        ielts_score: formData.ielts_score ? parseFloat(formData.ielts_score) : null,
        toefl_score: formData.toefl_score ? parseFloat(formData.toefl_score) : null,
        pte_score: formData.pte_score ? parseFloat(formData.pte_score) : null,
        sat_score: formData.sat_score ? parseFloat(formData.sat_score) : null,
        act_score: formData.act_score ? parseFloat(formData.act_score) : null,
        duolingo_score: formData.duolingo_score ? parseFloat(formData.duolingo_score) : null,
        gpa_score: formData.gpa_score ? parseFloat(formData.gpa_score) : null,
        about_course: formData.about_course,
        admission_requirements: formData.admission_requirements,
        intakes: formData.intakes.map(intake => ({
          intake_id: parseInt(intake.intake_id),
          intake_year: parseInt(intake.intake_year),
          is_active: intake.is_active,
          deadlines: intake.deadlines
            .filter(deadline => deadline.deadline_type_id && deadline.deadline_date)
            .map(deadline => ({
              deadline_type_id: parseInt(deadline.deadline_type_id),
              deadline_date: deadline.deadline_date,
              notes: deadline.notes || ""
            }))
        })).filter(intake => intake.intake_id && intake.intake_year && intake.deadlines.length > 0),
      };

      const response = await fetch(`${BASE_URL}/tenant/course/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const {id} = result;
     
      if(id){
        router.push(`/admin/courses/edit/${id}?tab=intakes`);
      }else{
        router.push(`/admin/courses`);
      }
      router.refresh();
    } catch (error) {
      console.error('Error adding course:', error);
      showMessage('error', 'Error adding course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful import
  const handleImportSuccess = () => {
    showMessage('success', 'Courses imported successfully!');
    // You can refresh the course list or redirect if needed
  };

  const tabs = [
    { id: "basics", label: "Basics", icon: Book },
    { id: "scores", label: "Scores", icon: GraduationCap },
    { id: "details", label: "Details", icon: Calendar },
    // { id: "intakes", label: "Intakes", icon: Calendar },
  ];

  const renderBasicsTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Course Name */}
        <div>
          <label htmlFor="course_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Course Name *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Book size={18} />
            </span>
            <input
              type="text"
              id="course_name"
              name="course_name"
              value={formData.course_name}
              onChange={handleInputChange}
              placeholder="Enter course name"
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>

        {/* University */}
        <div>
          <label htmlFor="university_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            University *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Building2 size={18} />
            </span>
            <select
              id="university_id"
              name="university_id"
              value={formData.university_id}
              onChange={handleInputChange}
              required
              disabled={isLoadingOptions}
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50"
            >
              <option value="">{isLoadingOptions ? "Loading..." : "Select University"}</option>
              {universities && universities.map(university => (
                <option key={university.id} value={university.id}>{university.university}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Study Level */}
        <div>
          <label htmlFor="study_level_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Study Level *
          </label>
          <select
            id="study_level_id"
            name="study_level_id"
            value={formData.study_level_id}
            onChange={handleInputChange}
            required
            disabled={isLoadingOptions}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50"
          >
            <option value="">{isLoadingOptions ? "Loading..." : "Select Study Level"}</option>
            {studyLevels.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
        </div>

        {/* Discipline */}
        <div>
          <label htmlFor="discipline_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Discipline *
          </label>
          <select
            id="discipline_id"
            name="discipline_id"
            value={formData.discipline_id}
            onChange={handleInputChange}
            required
            disabled={!formData.study_level_id || isLoadingDisciplines}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none disabled:opacity-50"
          >
            <option value="">
              {!formData.study_level_id 
                ? "Select Study Level First"
                : isLoadingDisciplines 
                ? "Loading Disciplines..." 
                : disciplines.length === 0
                ? "No disciplines available"
                : "Select Discipline"}
            </option>
            {disciplines.map(discipline => (
              <option key={discipline.id} value={discipline.id}>{discipline.name}</option>
            ))}
          </select>
          {!formData.study_level_id && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Please select a study level first to load available disciplines
            </p>
          )}
        </div>

        {/* Popular Course */}
        <div>
          <label htmlFor="is_popular" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Popular Course
          </label>
          <select
            id="is_popular"
            name="is_popular"
            value={formData.is_popular}
            onChange={handleInputChange}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          >
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Duration Unit */}
        <div>
          <label htmlFor="duration_unit" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Duration Unit
          </label>
          <select
            id="duration_unit"
            name="duration_unit"
            value={formData.duration_unit}
            onChange={handleInputChange}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          >
            <option value="months">Months</option>
            <option value="years">Years</option>
            <option value="weeks">Weeks</option>
          </select>
        </div>

        {/* Duration Min */}
        <div>
          <label htmlFor="duration_min" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Duration Min
          </label>
          <input
            type="number"
            id="duration_min"
            name="duration_min"
            value={formData.duration_min}
            onChange={handleInputChange}
            placeholder="e.g., 12"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* Duration Max */}
        <div>
          <label htmlFor="duration_max" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Duration Max
          </label>
          <input
            type="number"
            id="duration_max"
            name="duration_max"
            value={formData.duration_max}
            onChange={handleInputChange}
            placeholder="e.g., 24"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Currency Code */}
        <div>
          <label htmlFor="currency_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Currency Code *
          </label>
          <select
            id="currency_code"
            name="currency_code"
            value={formData.currency_code}
            onChange={handleInputChange}
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          >
            <option value="USD">USD</option>
            <option value="CAD">CAD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
        
        {/* Tuition Fee */}
        <div>
          <label htmlFor="tuition_fee" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Tuition Fee *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <DollarSign size={18} />
            </span>
            <input
              type="number"
              id="tuition_fee"
              name="tuition_fee"
              value={formData.tuition_fee}
              onChange={handleInputChange}
              placeholder="e.g., 17475"
              required
              step="0.01"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Application Fee */}
        <div>
          <label htmlFor="application_fee" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Application Fee *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <DollarSign size={18} />
            </span>
            <input
              type="number"
              id="application_fee"
              name="application_fee"
              value={formData.application_fee}
              onChange={handleInputChange}
              placeholder="e.g., 100"
              required
              step="0.01"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderScoresTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* GRE Score */}
        <div>
          <label htmlFor="gre_score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            GRE Score
          </label>
          <input
            type="number"
            id="gre_score"
            name="gre_score"
            value={formData.gre_score}
            onChange={handleInputChange}
            placeholder="e.g., 320"
            step="0.1"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* GMAT Score */}
        <div>
          <label htmlFor="gmat_score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            GMAT Score
          </label>
          <input
            type="number"
            id="gmat_score"
            name="gmat_score"
            value={formData.gmat_score}
            onChange={handleInputChange}
            placeholder="e.g., 700"
            step="0.1"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* IELTS Score */}
        <div>
          <label htmlFor="ielts_score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            IELTS Score
          </label>
          <input
            type="number"
            id="ielts_score"
            name="ielts_score"
            value={formData.ielts_score}
            onChange={handleInputChange}
            placeholder="e.g., 7.5"
            step="0.1"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* TOEFL Score */}
        <div>
          <label htmlFor="toefl_score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            TOEFL Score
          </label>
          <input
            type="number"
            id="toefl_score"
            name="toefl_score"
            value={formData.toefl_score}
            onChange={handleInputChange}
            placeholder="e.g., 100"
            step="0.1"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* PTE Score */}
        <div>
          <label htmlFor="pte_score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            PTE Score
          </label>
          <input
            type="number"
            id="pte_score"
            name="pte_score"
            value={formData.pte_score}
            onChange={handleInputChange}
            placeholder="e.g., 65"
            step="0.1"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* SAT Score */}
        <div>
          <label htmlFor="sat_score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            SAT Score
          </label>
          <input
            type="number"
            id="sat_score"
            name="sat_score"
            value={formData.sat_score}
            onChange={handleInputChange}
            placeholder="e.g., 1400"
            step="0.1"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* ACT Score */}
        <div>
          <label htmlFor="act_score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            ACT Score
          </label>
          <input
            type="number"
            id="act_score"
            name="act_score"
            value={formData.act_score}
            onChange={handleInputChange}
            placeholder="e.g., 30"
            step="0.1"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* Duolingo Score */}
        <div>
          <label htmlFor="duolingo_score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Duolingo Score
          </label>
          <input
            type="number"
            id="duolingo_score"
            name="duolingo_score"
            value={formData.duolingo_score}
            onChange={handleInputChange}
            placeholder="e.g., 120"
            step="0.1"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* GPA Score */}
        <div>
          <label htmlFor="gpa_score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            GPA Score
          </label>
          <input
            type="number"
            id="gpa_score"
            name="gpa_score"
            value={formData.gpa_score}
            onChange={handleInputChange}
            placeholder="e.g., 3.5"
            step="0.1"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="space-y-5">
      {/* About Course */}
      <div>
        <label htmlFor="about_course" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          About the Course *
        </label>
        <textarea
          id="about_course"
          name="about_course"
          value={formData.about_course}
          onChange={handleInputChange}
          placeholder="Describe the course, curriculum, and key features..."
          rows={6}
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
        />
      </div>

      {/* Admission Requirements */}
      <div>
        <label htmlFor="admission_requirements" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Admission Requirements *
        </label>
        <textarea
          id="admission_requirements"
          name="admission_requirements"
          value={formData.admission_requirements}
          onChange={handleInputChange}
          placeholder="List all admission requirements, documents needed, and eligibility criteria..."
          rows={6}
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
        />
      </div>
    </div>
  );

  return (
    <>
      {message && (
        <div className={`p-4 rounded-lg mb-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-4 sm:px-6 sm:py-5 flex justify-between items-center">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Add New Course
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create a new course with comprehensive information.
            </p>
          </div>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Upload size={18} />
            Import Excel
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-t border-gray-100 dark:border-gray-800">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-brand-500 text-brand-600 dark:text-brand-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <IconComponent size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            {/* Tab Content */}
            <div className="mb-8">
              {activeTab === "basics" && renderBasicsTab()}
              {activeTab === "scores" && renderScoresTab()}
              {activeTab === "details" && renderDetailsTab()}
              {/* {activeTab === "intakes" && renderIntakesTab()} */}
            </div>

            {/* Navigation and Submit Buttons */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-3">
                {activeTab !== "basics" && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabIndex = tabs.findIndex(tab => tab.id === activeTab);
                      if (tabIndex > 0) {
                        setActiveTab(tabs[tabIndex - 1].id as Tab);
                      }
                    }}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Previous
                  </button>
                )}
                {activeTab !== "details" && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabIndex = tabs.findIndex(tab => tab.id === activeTab);
                      if (tabIndex < tabs.length - 1) {
                        setActiveTab(tabs[tabIndex + 1].id as Tab);
                      }
                    }}
                    className="flex items-center gap-2 rounded-lg border border-brand-500 bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    Next
                    <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                {activeTab === "details" && (
                  <button
                    type="submit"
                    disabled={isSubmitting || !token || isLoadingOptions}
                    className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                        Adding Course...
                      </>
                    ) : (
                      <>
                        Add Course
                        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z" fill="white"/>
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        token={token}
        onSuccess={handleImportSuccess}
      />
    </>
  );
}