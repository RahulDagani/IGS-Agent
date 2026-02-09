"use client"
import React, { useState, useEffect } from "react";
import { BookOpen, GraduationCap, MapPin, Calendar, Award, Globe, Edit, Plus, Save, X, AlertCircle, School, Hash } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/context/AuthContext";
import { Country, State, City } from "country-state-city";
import { useParams } from "next/navigation";

interface AcademicRecord {
  id?: number;
  student_id?: number;
  country_of_study: string;
  state_of_study: string;
  city_of_study: string;
  level_of_study: string;
  board_name: string;
  qualification_awarded: string;
  institution_name: string;
  grading_system: string;
  score: string;
  primary_language_of_instruction: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

interface AcademicFormData {
  country_of_study: string;
  state_of_study: string;
  city_of_study: string;
  level_of_study: string;
  board_name: string;
  qualification_awarded: string;
  institution_name: string;
  grading_system: string;
  score: string;
  primary_language_of_instruction: string;
  start_date: string;
  end_date: string;
}

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const CustomDateInput = React.forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ value, onClick, disabled }, ref) => (
    <input
      type="text"
      value={value || ""}
      onClick={onClick}
      ref={ref}
      readOnly
      disabled={disabled}
      placeholder="Select date"
      className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  )
);
CustomDateInput.displayName = "CustomDateInput";

export default function AcademicQualifications() {

  const {studentId} = useParams();
  const { token } = useAuth();
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  const [formData, setFormData] = useState<AcademicFormData>({
    country_of_study: "",
    state_of_study: "",
    city_of_study: "",
    level_of_study: "",
    board_name: "",
    qualification_awarded: "",
    institution_name: "",
    grading_system: "",
    score: "",
    primary_language_of_instruction: "",
    start_date: "",
    end_date: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Study levels mapping
  const studyLevels = [
    { value: "", label: "Select Level" },
    { value: "Grade 9", label: "Grade 9" },
    { value: "Grade 10", label: "Grade 10" },
    { value: "Grade 11", label: "Grade 11" },
    { value: "Grade 12", label: "Grade 12" },
    { value: "Diploma", label: "Diploma" },
    { value: "Undergraduate", label: "Undergraduate" },
    { value: "Postgraduate", label: "Postgraduate" },
    { value: "Doctorate", label: "Doctorate" },
    { value: "Other", label: "Other" }
  ];

  // Grading systems
  const gradingSystems = [
    { value: "", label: "Select Grading System" },
    { value: "Percentage", label: "Percentage" },
    { value: "CGPA", label: "CGPA" },
    { value: "GPA", label: "GPA" },
    { value: "Grade", label: "Grade" },
    { value: "Marks", label: "Marks" }
  ];

  // Common languages
  const languages = [
    "English",
    "Hindi",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Other"
  ];

  // Get all countries
  const countries = Country.getAllCountries();
  
  // Get states based on selected country
  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry) : [];
  
  // Get cities based on selected state
  const cities = selectedState && selectedCountry ? City.getCitiesOfState(selectedCountry, selectedState) : [];

  // Check if board/uni field should be shown (for study levels 9, 10, 11, 12)
  const shouldShowBoardField = () => {
    // Assuming level_of_study values: "2" = Grade 9th, "4" = Grade 11th
    // Add other grade levels if needed
    const gradeLevels = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"]; // Add "3", "5" etc. for 10th and 12th if they exist
    return gradeLevels.includes(formData.level_of_study);
  };

  useEffect(() => {
    fetchAcademicRecords();
  }, []);

  const fetchAcademicRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/tenant/student/academic/records/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch academic records');
      }

      const result = await response.json();
      if (result.success) {
        // Format dates to extract only the date part
        const formattedRecords = (result.data || []).map((record: AcademicRecord) => ({
          ...record,
          start_date: record.start_date ? record.start_date.split('T')[0] : '',
          end_date: record.end_date ? record.end_date.split('T')[0] : '',
        }));
        setRecords(formattedRecords);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch academic records');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.country_of_study.trim()) {
      errors.country_of_study = "Country of study is required";
    }

    if (!formData.state_of_study.trim()) {
      errors.state_of_study = "State/Province is required";
    }

    if (!formData.city_of_study.trim()) {
      errors.city_of_study = "City of study is required";
    }

    if (!formData.level_of_study.trim()) {
      errors.level_of_study = "Level of study is required";
    }

    // Only validate board name if it should be shown
    if (shouldShowBoardField() && !formData.board_name.trim()) {
      errors.board_name = "Board/University name is required";
    }

    if (!formData.qualification_awarded.trim()) {
      errors.qualification_awarded = "Qualification awarded is required";
    }

    if (!formData.institution_name.trim()) {
      errors.institution_name = "Institution name is required";
    }

    if (!formData.grading_system.trim()) {
      errors.grading_system = "Grading system is required";
    }

    if (!formData.score.trim()) {
      errors.score = "Score/GPA is required";
    } else {
      const scoreNum = parseFloat(formData.score);
      if (isNaN(scoreNum)) {
        errors.score = "Please enter a valid number";
      } else {
        // Validate score based on grading system
        const maxScore = parseInt(formData.grading_system);
        if (maxScore && scoreNum > maxScore) {
          errors.score = `Score cannot exceed ${maxScore}`;
        }
      }
    }

    if (!formData.primary_language_of_instruction.trim()) {
      errors.primary_language_of_instruction = "Primary language is required";
    }

    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      errors.end_date = "End date is required";
    }

    // Validate end date is after start date
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        errors.end_date = "End date must be after start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Handle country change
    if (name === 'country_of_study') {
      setSelectedCountry(value);
      setSelectedState("");
      setFormData(prev => ({
        ...prev,
        country_of_study: value,
        state_of_study: "",
        city_of_study: ""
      }));
      return;
    }

    // Handle state change
    if (name === 'state_of_study') {
      setSelectedState(value);
      setFormData(prev => ({
        ...prev,
        state_of_study: value,
        city_of_study: ""
      }));
      return;
    }

    // Handle study level change - clear board name if not needed
    if (name === 'level_of_study') {
      const newFormData = {
        ...formData,
        [name]: value
      };
      if (!shouldShowBoardField()) {
        newFormData.board_name = "";
      }
      setFormData(newFormData);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null, field: 'start_date' | 'end_date') => {
    const value = date ? date.toISOString().split('T')[0] : '';
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear date error when user selects a date
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setFormData({
      country_of_study: "",
      state_of_study: "",
      city_of_study: "",
      level_of_study: "",
      board_name: "",
      qualification_awarded: "",
      institution_name: "",
      grading_system: "",
      score: "",
      primary_language_of_instruction: "",
      start_date: "",
      end_date: "",
    });
    setSelectedCountry("");
    setSelectedState("");
    setFormErrors({});
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (record: AcademicRecord) => {
    setFormData({
      country_of_study: record.country_of_study,
      state_of_study: record.state_of_study,
      city_of_study: record.city_of_study,
      level_of_study: record.level_of_study,
      board_name: record.board_name,
      qualification_awarded: record.qualification_awarded,
      institution_name: record.institution_name,
      grading_system: record.grading_system,
      score: record.score,
      primary_language_of_instruction: record.primary_language_of_instruction,
      start_date: record.start_date.split('T')[0],
      end_date: record.end_date.split('T')[0],
    });
    setSelectedCountry(record.country_of_study);
    setSelectedState(record.state_of_study);
    setEditingId(record.id || null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${BASE_URL}/tenant/student/academic/records/${studentId}/${editingId}`
        : `${BASE_URL}/tenant/student/academic/records/${studentId}`;

      const payload = {
        ...formData,
        score: parseFloat(formData.score) // Convert score to number
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save academic record');
      }

      setSuccessMessage(result.message || 'Academic record saved successfully');
      resetForm();
      fetchAcademicRecords();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save academic record');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Extract date part if it's in ISO format
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const date = new Date(datePart);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getCountryName = (countryCode: string) => {
    const country = Country.getCountryByCode(countryCode);
    return country ? country.name : countryCode;
  };

  const getStateName = (stateCode: string, countryCode: string) => {
    if (!countryCode) return stateCode;
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);
    return state ? state.name : stateCode;
  };

  const getStudyLevelLabel = (value: string) => {
    const level = studyLevels.find(l => l.value === value);
    return level ? level.label : value;
  };

  const getGradingSystemLabel = (value: string) => {
    const system = gradingSystems.find(g => g.value === value);
    return system ? system.label : value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading academic records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Academic Qualifications</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add your academic qualifications and educational background
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus size={16} />
          Add Qualification
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-400">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId !== null) && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                {editingId ? 'Edit Academic Record' : 'Add New Academic Record'}
              </h3>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Institution Name */}
              <div className="md:col-span-2">
                <label htmlFor="institution_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Institution Name *
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <School size={18} />
                  </span>
                  <input
                    type="text"
                    id="institution_name"
                    name="institution_name"
                    value={formData.institution_name}
                    onChange={handleInputChange}
                    placeholder="Enter institution name (e.g., Delhi Public School)"
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                      formErrors.institution_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  />
                </div>
                {formErrors.institution_name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.institution_name}</p>
                )}
              </div>

              {/* Level of Study */}
              <div>
                <label htmlFor="level_of_study" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Level of Study *
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <BookOpen size={18} />
                  </span>
                  <select
                    id="level_of_study"
                    name="level_of_study"
                    value={formData.level_of_study}
                    onChange={handleInputChange}
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
                      formErrors.level_of_study ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {studyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                {formErrors.level_of_study && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.level_of_study}</p>
                )}
              </div>

              {/* Qualification Awarded */}
              <div>
                <label htmlFor="qualification_awarded" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Qualification Awarded *
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <Award size={18} />
                  </span>
                  <input
                    type="text"
                    id="qualification_awarded"
                    name="qualification_awarded"
                    value={formData.qualification_awarded}
                    onChange={handleInputChange}
                    placeholder="e.g., Secondary School, Bachelor of Science"
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                      formErrors.qualification_awarded ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  />
                </div>
                {formErrors.qualification_awarded && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.qualification_awarded}</p>
                )}
              </div>

              {/* Board/University Name - Conditionally shown */}
              {shouldShowBoardField() && (
                <div>
                  <label htmlFor="board_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Board/University *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <GraduationCap size={18} />
                    </span>
                    <input
                      type="text"
                      id="board_name"
                      name="board_name"
                      value={formData.board_name}
                      onChange={handleInputChange}
                      placeholder="e.g., CBSE, University of Delhi"
                      className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                        formErrors.board_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                    />
                  </div>
                  {formErrors.board_name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.board_name}</p>
                  )}
                </div>
              )}

              {/* Grading System */}
              <div>
                <label htmlFor="grading_system" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Grading System *
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <Hash size={18} />
                  </span>
                  <select
                    id="grading_system"
                    name="grading_system"
                    value={formData.grading_system}
                    onChange={handleInputChange}
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
                      formErrors.grading_system ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {gradingSystems.map(system => (
                      <option key={system.value} value={system.value}>{system.label}</option>
                    ))}
                  </select>
                </div>
                {formErrors.grading_system && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.grading_system}</p>
                )}
              </div>

              {/* Score/GPA */}
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Score/GPA *
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <Award size={18} />
                  </span>
                  <input
                    type="number"
                    id="score"
                    name="score"
                    value={formData.score}
                    onChange={handleInputChange}
                    placeholder={formData.grading_system === "100" ? "e.g., 82.50" : 
                               formData.grading_system === "10" ? "e.g., 8.5" :
                               formData.grading_system === "7" ? "e.g., 5.5" :
                               formData.grading_system === "5" ? "e.g., 4.0" :
                               formData.grading_system === "4" ? "e.g., 3.5" : "Enter score"}
                    step="0.01"
                    min="0"
                    max={formData.grading_system || "100"}
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                      formErrors.score ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  />
                </div>
                {formErrors.score && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.score}</p>
                )}
                
              </div>

              {/* Country of Study */}
              <div>
                <label htmlFor="country_of_study" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Country of Study *
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <Globe size={18} />
                  </span>
                  <select
                    id="country_of_study"
                    name="country_of_study"
                    value={formData.country_of_study}
                    onChange={handleInputChange}
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
                      formErrors.country_of_study ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.country_of_study && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.country_of_study}</p>
                )}
              </div>

              {/* State/Province */}
              <div>
                <label htmlFor="state_of_study" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  State/Province *
                </label>
                <select
                  id="state_of_study"
                  name="state_of_study"
                  value={formData.state_of_study}
                  onChange={handleInputChange}
                  disabled={!selectedCountry}
                  className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
                    formErrors.state_of_study ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } ${!selectedCountry ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select State/Province</option>
                  {states.map(state => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {formErrors.state_of_study && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.state_of_study}</p>
                )}
              </div>

              {/* City of Study */}
              <div>
                <label htmlFor="city_of_study" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  City of Study *
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <MapPin size={18} />
                  </span>
                  <select
                    id="city_of_study"
                    name="city_of_study"
                    value={formData.city_of_study}
                    onChange={handleInputChange}
                    disabled={!selectedState}
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
                      formErrors.city_of_study ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } ${!selectedState ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.city_of_study && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.city_of_study}</p>
                )}
              </div>

              {/* Primary Language of Instruction */}
              <div>
                <label htmlFor="primary_language_of_instruction" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Primary Language *
                </label>
                <select
                  id="primary_language_of_instruction"
                  name="primary_language_of_instruction"
                  value={formData.primary_language_of_instruction}
                  onChange={handleInputChange}
                  className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
                    formErrors.primary_language_of_instruction ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <option value="">Select Language</option>
                  {languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
                {formErrors.primary_language_of_instruction && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.primary_language_of_instruction}</p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Start Date *
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10">
                    <Calendar size={18} />
                  </span>
                  <DatePicker
                    selected={formData.start_date ? new Date(formData.start_date) : null}
                    onChange={(date) => handleDateChange(date, 'start_date')}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={20}
                    scrollableYearDropdown
                    isClearable
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 pl-11 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    customInput={<CustomDateInput />}
                  />
                </div>
                {formErrors.start_date && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.start_date}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  End Date *
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10">
                    <Calendar size={18} />
                  </span>
                  <DatePicker
                    selected={formData.end_date ? new Date(formData.end_date) : null}
                    onChange={(date) => handleDateChange(date, 'end_date')}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={20}
                    scrollableYearDropdown
                    isClearable
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    customInput={<CustomDateInput />}
                  />
                </div>
                {formErrors.end_date && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.end_date}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                <Save size={16} />
                {editingId ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Academic Records List */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <GraduationCap className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">No academic records added</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding your first academic qualification.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              <Plus size={16} />
              Add Qualification
            </button>
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {getStudyLevelLabel(record.level_of_study)}
                      </h3>
                      <div className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {record.qualification_awarded}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <School className="mr-2 h-4 w-4" />
                        {record.institution_name}
                      </div>
                      {record.board_name && (
                        <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          {record.board_name}
                        </div>
                      )}
                      <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="mr-2 h-4 w-4" />
                        {record.city_of_study}, {getStateName(record.state_of_study, record.country_of_study)}, {getCountryName(record.country_of_study)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(record)}
                      className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Score</div>
                      <div className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                        {record.score} <span className="text-sm font-normal text-gray-600 dark:text-gray-400">({getGradingSystemLabel(record.grading_system)})</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration</div>
                      <div className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatDate(record.start_date)} - {formatDate(record.end_date)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Language</div>
                      <div className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                        {record.primary_language_of_instruction}
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</div>
                      <div className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                        {getCountryName(record.country_of_study)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}