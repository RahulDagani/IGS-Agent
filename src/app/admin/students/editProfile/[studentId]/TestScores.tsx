
"use client"

import React, { useState, useEffect } from "react";
import { Award, ChevronDown, ChevronUp, Check, Loader2, Edit2, Save, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "next/navigation";

interface TestFormData {
  [key: string]: any;
  overall_score?: number | null;
  date_of_examination?: string;
  test_waiver?: boolean;
  ielts_waiver?: boolean;
  yet_to_receive?: boolean;
  yet_to_receive_date?: string;
  english_marks_12_checked?: boolean;
  english_marks_12?: number | null;
  moi_checked?: boolean;
  is_active?: boolean;
  // Test-specific fields
  reading?: number | null;
  math?: number | null;
  science?: number | null;
  english?: number | null;
  writing?: number | null;
  literacy?: number | null;
  conversation?: number | null;
  comprehension?: number | null;
  production?: number | null;
  quantitative?: number | null;
  verbal?: number | null;
  integrated_reasoning?: number | null;
  analytical_writing?: number | null;
  listening?: number | null;
  speaking?: number | null;
  trf_no?: string;
  reading_and_writing?: number | null;
  essay?: number | null;
}

interface TestScore {
  test_type_id: number;
  test_type: string;
  display_name: string;
  has_score?: boolean;
  has_saved?: boolean;
  form_data: TestFormData;
}

interface TestScoresResponse {
  view_type: string;
  tests: TestScore[];
  has_scores: boolean;
  show_edit_button: boolean;
}

interface EditResponse {
  tests: TestScore[];
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

// Custom DatePicker input component
const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onClick, onChange, disabled, ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      type="text"
      value={value}
      onClick={onClick}
      onChange={onChange}
      readOnly
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    />
  )
);
CustomDateInput.displayName = "CustomDateInput";

// Field configuration for each test type
const TEST_FIELD_CONFIGS: { [key: string]: { 
  fields: string[]; 
  sections: { [key: string]: string[] };
  conditionalFields?: { [key: string]: string[] }; // Fields that depend on other fields
} } = {
  ACT: {
    fields: ['overall_score', 'date_of_examination', 'reading', 'math', 'science', 'english', 'writing'],
    sections: {
      main: ['overall_score', 'date_of_examination'],
      sections: ['reading', 'math', 'science', 'english', 'writing']
    }
  },
  DUOLINGO: {
    fields: ['test_waiver', 'overall_score', 'date_of_examination', 'literacy', 'conversation', 'comprehension', 'production', 'is_active'],
    sections: {
      waiver: ['test_waiver'],
      main: ['overall_score', 'date_of_examination'],
      subscores: ['literacy', 'conversation', 'comprehension', 'production']
    },
    conditionalFields: {
      test_waiver: ['overall_score', 'date_of_examination', 'literacy', 'conversation', 'comprehension', 'production']
    }
  },
  DET: {
    fields: ['test_waiver', 'overall_score', 'date_of_examination', 'yet_to_receive', 'yet_to_receive_date', 'english_marks_12_checked', 'english_marks_12', 'moi_checked'],
    sections: {
      waiver: ['test_waiver'],
      main: ['overall_score', 'date_of_examination'],
      pending: ['yet_to_receive', 'yet_to_receive_date'],
      alternative: ['english_marks_12_checked', 'english_marks_12', 'moi_checked']
    },
    conditionalFields: {
      test_waiver: ['overall_score', 'date_of_examination', 'yet_to_receive', 'yet_to_receive_date'],
      yet_to_receive: ['yet_to_receive_date'],
      english_marks_12_checked: ['english_marks_12']
    }
  },
  GMAT: {
    fields: ['overall_score', 'date_of_examination', 'quantitative', 'verbal', 'integrated_reasoning', 'analytical_writing'],
    sections: {
      main: ['overall_score', 'date_of_examination'],
      sections: ['quantitative', 'verbal', 'integrated_reasoning', 'analytical_writing']
    }
  },
  GRE: {
    fields: ['overall_score', 'date_of_examination', 'quantitative', 'verbal', 'analytical_writing'],
    sections: {
      main: ['overall_score', 'date_of_examination'],
      sections: ['quantitative', 'verbal', 'analytical_writing']
    }
  },
  IELTS: {
    fields: ['ielts_waiver', 'overall_score', 'date_of_examination', 'listening', 'reading', 'writing', 'speaking', 'trf_no', 'yet_to_receive', 'yet_to_receive_date', 'english_marks_12_checked', 'english_marks_12', 'moi_checked'],
    sections: {
      waiver: ['ielts_waiver'],
      main: ['overall_score', 'date_of_examination', 'trf_no'],
      subscores: ['listening', 'reading', 'writing', 'speaking'],
      pending: ['yet_to_receive', 'yet_to_receive_date'],
      alternative: ['english_marks_12_checked', 'english_marks_12', 'moi_checked']
    },
    conditionalFields: {
      ielts_waiver: ['overall_score', 'date_of_examination', 'listening', 'reading', 'writing', 'speaking', 'trf_no'],
      yet_to_receive: ['yet_to_receive_date'],
      english_marks_12_checked: ['english_marks_12']
    }
  },
  PTE: {
    fields: ['test_waiver', 'overall_score', 'date_of_examination', 'listening', 'reading', 'writing', 'speaking', 'yet_to_receive', 'yet_to_receive_date', 'english_marks_12_checked', 'english_marks_12', 'moi_checked'],
    sections: {
      waiver: ['test_waiver'],
      main: ['overall_score', 'date_of_examination'],
      subscores: ['listening', 'reading', 'writing', 'speaking'],
      pending: ['yet_to_receive', 'yet_to_receive_date'],
      alternative: ['english_marks_12_checked', 'english_marks_12', 'moi_checked']
    },
    conditionalFields: {
      test_waiver: ['overall_score', 'date_of_examination', 'listening', 'reading', 'writing', 'speaking'],
      yet_to_receive: ['yet_to_receive_date'],
      english_marks_12_checked: ['english_marks_12']
    }
  },
  SAT: {
    fields: ['overall_score', 'date_of_examination', 'reading_and_writing', 'math', 'essay'],
    sections: {
      main: ['overall_score', 'date_of_examination'],
      sections: ['reading_and_writing', 'math', 'essay']
    }
  },
  TOEFL: {
    fields: ['test_waiver', 'overall_score', 'date_of_examination', 'listening', 'reading', 'writing', 'speaking', 'yet_to_receive', 'yet_to_receive_date', 'english_marks_12_checked', 'english_marks_12', 'moi_checked'],
    sections: {
      waiver: ['test_waiver'],
      main: ['overall_score', 'date_of_examination'],
      subscores: ['listening', 'reading', 'writing', 'speaking'],
      pending: ['yet_to_receive', 'yet_to_receive_date'],
      alternative: ['english_marks_12_checked', 'english_marks_12', 'moi_checked']
    },
    conditionalFields: {
      test_waiver: ['overall_score', 'date_of_examination', 'listening', 'reading', 'writing', 'speaking'],
      yet_to_receive: ['yet_to_receive_date'],
      english_marks_12_checked: ['english_marks_12']
    }
  }
};

// Field labels mapping
const FIELD_LABELS: { [key: string]: string } = {
  overall_score: 'Overall Score',
  date_of_examination: 'Date of Examination',
  test_waiver: 'Test Waiver',
  ielts_waiver: 'IELTS Waiver',
  yet_to_receive: 'Yet to Receive Score',
  yet_to_receive_date: 'Expected Score Date',
  english_marks_12_checked: 'English Marks in 12th',
  english_marks_12: '12th English Marks',
  moi_checked: 'Medium of Instruction (English)',
  is_active: 'Is Active',
  reading: 'Reading',
  math: 'Math',
  science: 'Science',
  english: 'English',
  writing: 'Writing',
  literacy: 'Literacy',
  conversation: 'Conversation',
  comprehension: 'Comprehension',
  production: 'Production',
  quantitative: 'Quantitative',
  verbal: 'Verbal',
  integrated_reasoning: 'Integrated Reasoning',
  analytical_writing: 'Analytical Writing',
  listening: 'Listening',
  speaking: 'Speaking',
  trf_no: 'TRF Number',
  reading_and_writing: 'Reading & Writing',
  essay: 'Essay'
};

// Section titles
const SECTION_TITLES: { [key: string]: string } = {
  main: 'Test Information',
  waiver: 'Waiver',
  subscores: 'Subscores',
  sections: 'Section Scores',
  pending: 'Pending Score',
  alternative: 'Alternative Qualifications'
};

const TestScores: React.FC = () => {
  const { token } = useAuth();
  const { studentId } = useParams();
  const [testScores, setTestScores] = useState<TestScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [expandedTest, setExpandedTest] = useState<number | null>(null);
  const [formData, setFormData] = useState<{ [key: number]: TestFormData }>({});
  const [errors, setErrors] = useState<{ [key: number]: { [key: string]: string } }>({});
  const [isRefreshingEditData, setIsRefreshingEditData] = useState(false);
  const [originalData, setOriginalData] = useState<TestScore[]>([]);

  useEffect(() => {
    fetchTestScores();
  }, []);

  const fetchTestScores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/tenant/student/test/initial/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch test scores');
      
      const result = await response.json();
      if (result.success) {
        const data = (result.data as TestScoresResponse).tests;
        setTestScores(data);
        setOriginalData(data); // Store original data
        
        // Initialize form data
        const initialFormData: { [key: number]: TestFormData } = {};
        data.forEach((test: TestScore) => {
          initialFormData[test.test_type_id] = { ...test.form_data };
        });
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Error fetching test scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEditData = async () => {
    setIsRefreshingEditData(true);
    try {
      const response = await fetch(`${BASE_URL}/tenant/student/test/edit/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch edit data');
      
      const result = await response.json();
      if (result.success) {
        const editData = (result.data as EditResponse).tests;
        setTestScores(editData);
        
        // Update form data with edit response
        const updatedFormData: { [key: number]: TestFormData } = {};
        editData.forEach((test: TestScore) => {
          updatedFormData[test.test_type_id] = { ...test.form_data };
        });
        setFormData(updatedFormData);
        
        // Reset expanded test
        setExpandedTest(null);
      }
    } catch (error) {
      console.error('Error fetching edit data:', error);
    } finally {
      setIsRefreshingEditData(false);
    }
  };

  const toggleAccordion = (testId: number) => {
    if (expandedTest === testId) {
      setExpandedTest(null);
      // Reset form data for this test
      const test = testScores.find(t => t.test_type_id === testId);
      if (test) {
        setFormData(prev => ({
          ...prev,
          [testId]: { ...test.form_data }
        }));
      }
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[testId];
        return newErrors;
      });
    } else {
      setExpandedTest(testId);
    }
  };

  const handleInputChange = (testId: number, field: string, value: any) => {
    const currentData = formData[testId] || {};
    
    // Special handling for checkbox fields that have dependent fields
    if (field === 'test_waiver' || field === 'ielts_waiver') {
      if (value === false) {
        // If waiver is unchecked, reset dependent fields to null/empty
        const test = testScores.find(t => t.test_type_id === testId);
        const config = TEST_FIELD_CONFIGS[test?.test_type || ''];
        const dependentFields = config?.conditionalFields?.[field] || [];
        
        const updatedData = { ...currentData, [field]: value };
        dependentFields.forEach(depField => {
          if (depField.includes('date')) {
            updatedData[depField] = '';
          } else if (depField.includes('score') || depField.includes('marks')) {
            updatedData[depField] = null;
          } else if (depField !== field) {
            updatedData[depField] = '';
          }
        });
        
        setFormData(prev => ({
          ...prev,
          [testId]: updatedData
        }));
        return;
      }
    }
    
    // Handle "yet_to_receive" checkbox
    if (field === 'yet_to_receive') {
      const updatedData = { ...currentData, [field]: value };
      if (value === false) {
        // If unchecked, clear the date
        updatedData.yet_to_receive_date = '';
      }
      setFormData(prev => ({
        ...prev,
        [testId]: updatedData
      }));
      return;
    }
    
    // Handle "english_marks_12_checked" checkbox
    if (field === 'english_marks_12_checked') {
      const updatedData = { ...currentData, [field]: value };
      if (value === false) {
        // If unchecked, clear the marks
        updatedData.english_marks_12 = null;
      }
      setFormData(prev => ({
        ...prev,
        [testId]: updatedData
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value
      }
    }));

    // Clear error for this field
    if (errors[testId]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          [field]: ''
        }
      }));
    }
  };

  const handleCheckboxChange = (testId: number, field: string, checked: boolean) => {
    handleInputChange(testId, field, checked);
  };

  const validateTest = (testId: number, testType: string): boolean => {
    const test = testScores.find(t => t.test_type_id === testId);
    if (!test) return false;

    const currentForm = formData[testId] || {};
    const newErrors: { [key: string]: string } = {};

    const config = TEST_FIELD_CONFIGS[testType];
    if (!config) return false;

    // Check required fields based on waiver status
    const hasWaiver = currentForm.test_waiver || currentForm.ielts_waiver;
    
    // If no waiver, check if "yet_to_receive" is checked
    const isPendingScore = currentForm.yet_to_receive;
    
    if (!hasWaiver && !isPendingScore) {
      // If no waiver and not pending score, require overall score and date
      if (!currentForm.overall_score && currentForm.overall_score !== 0) {
        newErrors.overall_score = 'Overall score is required';
      }
      
      if (!currentForm.date_of_examination) {
        newErrors.date_of_examination = 'Date of examination is required';
      } else {
        const examDate = new Date(currentForm.date_of_examination);
        const today = new Date();
        if (examDate > today) {
          newErrors.date_of_examination = 'Date cannot be in the future';
        }
      }
    }
    
    // If "yet_to_receive" is checked, require the date
    if (currentForm.yet_to_receive && !currentForm.yet_to_receive_date) {
      newErrors.yet_to_receive_date = 'Expected score date is required';
    }
    
    // If "english_marks_12_checked" is checked, require the marks
    if (currentForm.english_marks_12_checked && 
        !currentForm.english_marks_12 && 
        currentForm.english_marks_12 !== 0) {
      newErrors.english_marks_12 = '12th English marks are required';
    }

    // Validate numeric fields - EXCLUDE checkbox fields from numeric validation!
    config.fields.forEach(field => {
      const value = currentForm[field];
      
      // Skip validation for checkbox/boolean fields
      if (field === 'test_waiver' || field === 'ielts_waiver' || 
          field === 'yet_to_receive' || field === 'english_marks_12_checked' || 
          field === 'moi_checked' || field === 'is_active') {
        return; // Skip numeric validation for checkbox fields
      }
      
      if (value !== undefined && value !== null && value !== '') {
        if (field.includes('score') || field.includes('marks') || 
            ['reading', 'math', 'science', 'english', 'writing', 
             'quantitative', 'verbal', 'analytical_writing', 
             'listening', 'speaking', 'reading_and_writing', 'essay',
             'literacy', 'conversation', 'comprehension', 'production',
             'integrated_reasoning'].includes(field)) {
          // Convert to number for validation
          const numValue = parseFloat(String(value));
          if (isNaN(numValue)) {
            newErrors[field] = 'Please enter a valid number';
          } else if (numValue < 0) {
            newErrors[field] = 'Value cannot be negative';
          }
        }
      }
    });

    setErrors(prev => ({
      ...prev,
      [testId]: newErrors
    }));

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTest = async (testId: number) => {
    const test = testScores.find(t => t.test_type_id === testId);
    if (!test) return;

    if (!validateTest(testId, test.test_type)) {
      return;
    }

    setSaving(testId);
    try {
      const payload = {
        tests: [
          {
            test_type_id: testId,
            form_data: formData[testId]
          }
        ]
      };

      const response = await fetch(`${BASE_URL}/tenant/student/test/save/${studentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save test scores');

      const result = await response.json();
      if (result.success) {
        // Update the test scores with new data
        await fetchTestScores(); // Refresh all data
        setExpandedTest(null);
      }
    } catch (error) {
      console.error('Error saving test scores:', error);
      setErrors(prev => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          submit: 'Failed to save test scores. Please try again.'
        }
      }));
    } finally {
      setSaving(null);
    }
  };

  const handleResetToOriginal = () => {
    // Reset to original data from initial fetch
    setTestScores(originalData);
    
    const resetFormData: { [key: number]: TestFormData } = {};
    originalData.forEach((test: TestScore) => {
      resetFormData[test.test_type_id] = { ...test.form_data };
    });
    setFormData(resetFormData);
    
    setErrors({});
    setExpandedTest(null);
  };

  const renderField = (testId: number, field: string, value: any, testType: string) => {
    const error = errors[testId]?.[field];
    const disabled = saving === testId;
    const currentForm = formData[testId] || {};
    const config = TEST_FIELD_CONFIGS[testType];
    
    // Check if field should be disabled based on waiver
    const hasWaiver = currentForm.test_waiver || currentForm.ielts_waiver;
    const conditionalFields = config?.conditionalFields || {};
    
    // Check if this field depends on another field that's checked
    // BUT REVERSED LOGIC: We want to DISABLE dependent fields when the parent is TRUE
    let isDisabledByCondition = false;
    
    for (const [conditionField, dependentFields] of Object.entries(conditionalFields)) {
  if (dependentFields.includes(field)) {
    if (conditionField === 'test_waiver' || conditionField === 'ielts_waiver') {
      // REMOVE the disabling logic - waiver should not disable fields
      // Keep this empty or remove this condition entirely
      // isDisabledByCondition = false; // Explicitly set to false
    } else if (conditionField === 'yet_to_receive') {
      // For yet_to_receive: yet_to_receive_date should be ENABLED when yet_to_receive is TRUE
      if (field === 'yet_to_receive_date') {
        isDisabledByCondition = !currentForm[conditionField];
      }
    } else if (conditionField === 'english_marks_12_checked') {
      // For english_marks_12_checked: english_marks_12 should be ENABLED when checked is TRUE
      if (field === 'english_marks_12') {
        isDisabledByCondition = !currentForm[conditionField];
      }
    }
    break;
  }
}
    


    const isDisabled = disabled || isDisabledByCondition;
    
    const commonProps = {
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
        handleInputChange(testId, field, e.target.value),
      className: `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
        error 
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/10 dark:border-gray-600'
      } dark:bg-gray-700 dark:text-white ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      disabled: isDisabled
    };

    // Handle boolean fields (waivers and checkboxes)
    if (field === 'test_waiver' || field === 'ielts_waiver' || 
        field === 'yet_to_receive' || field === 'english_marks_12_checked' || 
        field === 'moi_checked' || field === 'is_active') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`${testId}-${field}`}
            checked={!!value}
            onChange={(e) => handleCheckboxChange(testId, field, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isDisabled}
          />
          <label 
            htmlFor={`${testId}-${field}`}
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            {FIELD_LABELS[field] || field}
          </label>
        </div>
      );
    }

    // Handle date fields
    if (field === 'date_of_examination' || field === 'yet_to_receive_date') {
      return (
        <DatePicker
          selected={value ? new Date(value) : null}
          onChange={(date) => handleInputChange(testId, field, date ? date.toISOString().split('T')[0] : '')}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select date"
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          yearDropdownItemNumber={50}
          scrollableYearDropdown
          isClearable
          className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-blue-500/10 focus:border-blue-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90"
          customInput={<CustomDateInput disabled={isDisabled} />}
          disabled={isDisabled}
        />
      );
    }

    // Handle numeric fields
    if (field.includes('score') || field.includes('marks') || 
        ['reading', 'math', 'science', 'english', 'writing', 
         'quantitative', 'verbal', 'analytical_writing', 
         'listening', 'speaking', 'reading_and_writing', 'essay',
         'literacy', 'conversation', 'comprehension', 'production',
         'integrated_reasoning'].includes(field)) {
      return (
        <input
          type="number"
          {...commonProps}
          step="0.1"
          min="0"
          placeholder="Enter score"
          onBlur={(e) => {
            // Ensure the value is properly converted to number
            if (e.target.value === '') {
              handleInputChange(testId, field, null);
            } else {
              handleInputChange(testId, field, parseFloat(e.target.value));
            }
          }}
        />
      );
    }

    // Handle text fields
    return (
      <input
        type="text"
        {...commonProps}
        placeholder={`Enter ${FIELD_LABELS[field] || field}`}
      />
    );
  };

  const renderTestForm = (test: TestScore) => {
    const config = TEST_FIELD_CONFIGS[test.test_type];
    if (!config) return null;

    const currentForm = formData[test.test_type_id] || {};
    const hasWaiver = currentForm.test_waiver || currentForm.ielts_waiver;

    return (
      <div className="space-y-6">
        {Object.entries(config.sections).map(([section, fields]) => {
          // Filter fields based on conditions
          const visibleFields = fields.filter(field => {
            // Check if field should be shown based on conditions
            
            
            
            
            
            // For "yet_to_receive_date", only show if "yet_to_receive" is checked
            if (field === 'yet_to_receive_date' && !currentForm.yet_to_receive) {
              return false;
            }
            
            // For "english_marks_12", only show if "english_marks_12_checked" is checked
            if (field === 'english_marks_12' && !currentForm.english_marks_12_checked) {
              return false;
            }
            
            return true;
          });

          if (visibleFields.length === 0) return null;

          return (
            <div key={section} className="space-y-4">
              {/* <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {SECTION_TITLES[section] || section}
              </h4> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleFields.map(field => {
                  if (!config.fields.includes(field)) return null;
                  
                  // Determine if field is required
                  const isPendingScore = currentForm.yet_to_receive;
                  let isRequired = false;
                  
                  if (!hasWaiver && !isPendingScore) {
                    isRequired = ['overall_score', 'date_of_examination'].includes(field);
                  }
                  
                  if (field === 'yet_to_receive_date' && currentForm.yet_to_receive) {
                    isRequired = true;
                  }
                  
                  if (field === 'english_marks_12' && currentForm.english_marks_12_checked) {
                    isRequired = true;
                  }
                  
                  return (
                    <div key={field} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {FIELD_LABELS[field] || field}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderField(test.test_type_id, field, currentForm[field], test.test_type)}
                      {/* Show error message - but only for the actual field, not for checkboxes with dependent fields */}
                      {errors[test.test_type_id]?.[field] && field !== 'english_marks_12_checked' && field !== 'yet_to_receive' && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {errors[test.test_type_id][field]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Show errors for dependent fields that might be hidden */}
        {(errors[test.test_type_id]?.english_marks_12 || errors[test.test_type_id]?.yet_to_receive_date) && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            {errors[test.test_type_id]?.english_marks_12 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">
                ⚠️ {errors[test.test_type_id].english_marks_12}
              </p>
            )}
            {errors[test.test_type_id]?.yet_to_receive_date && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ {errors[test.test_type_id].yet_to_receive_date}
              </p>
            )}
          </div>
        )}
        
        {errors[test.test_type_id]?.submit && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors[test.test_type_id].submit}
            </p>
          </div>
        )}
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => toggleAccordion(test.test_type_id)}
            disabled={saving === test.test_type_id}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSaveTest(test.test_type_id)}
            disabled={saving === test.test_type_id}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving === test.test_type_id ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderTestSummary = (test: TestScore) => {
    const hasScore = test.has_score || test.has_saved;
    const hasWaiver = test.form_data.test_waiver || test.form_data.ielts_waiver;
    const overallScore = test.form_data.overall_score;
    const testDate = test.form_data.date_of_examination;

    if (!hasScore) {
      return (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Click to expand and enter your test scores
          </p>
        </div>
      );
    }

    // if (hasWaiver) {
    //   return (
    //     <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-blue-700 dark:text-blue-300 font-medium">
    //             Waiver Applied
    //           </p>
    //           <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
    //             No test score required for this test type
    //           </p>
    //         </div>
    //         <Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    //       </div>
    //     </div>
    //   );
    // }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {overallScore !== null && overallScore !== undefined && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallScore}</p>
          </div>
        )}
        {testDate && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Exam Date</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{formatDate(testDate)}</p>
          </div>
        )}
        {/* Render other scores */}
        {Object.entries(test.form_data).map(([key, value]) => {
          if (key !== 'overall_score' && key !== 'date_of_examination' && 
              key !== 'test_waiver' && key !== 'ielts_waiver' && 
              value !== null && value !== '' && value !== false) {
            return (
              <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {FIELD_LABELS[key] || key}
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Award size={20} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Test Scores
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Expand any test to add or edit scores
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToOriginal}
            disabled={isRefreshingEditData || loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <X size={16} />
            Reset
          </button>
          <button
            onClick={fetchEditData}
            disabled={isRefreshingEditData || loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRefreshingEditData ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <Edit2 size={16} />
                 Edit Data
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {testScores.map((test) => {
            const isExpanded = expandedTest === test.test_type_id;
            const hasScore = test.has_score || test.has_saved;
            const hasWaiver = test.form_data.test_waiver || test.form_data.ielts_waiver;
            const overallScore = test.form_data.overall_score;
            const testDate = test.form_data.date_of_examination;

            return (
              <div 
                key={test.test_type_id}
                className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                  isExpanded 
                    ? 'border-blue-300 dark:border-blue-700 shadow-sm' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${hasScore ? 'bg-green-50/30 dark:bg-green-900/5' : 'bg-gray-50/50 dark:bg-gray-900/20'}`}
              >
                {/* Header */}
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleAccordion(test.test_type_id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      hasScore 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {hasScore ? (
                        <Check size={16} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Award size={16} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {test.display_name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {hasScore ? (
                          <>
                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                              Completed
                            </span>
                            {hasWaiver && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
                                Waiver Applied
                              </span>
                            )}
                          </>
                        ) : (
                          <></>
                          // <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded-full">
                          //   Not Taken
                          // </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* {!hasWaiver && overallScore && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {overallScore}
                        </div>
                        {testDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(testDate)}
                          </div>
                        )}
                      </div>
                    )} */}

                     <button
            
            className="px-2 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            
              <>
                <Edit2 size={16} />
                 
              </>
            
          </button>
                    
                    <div className="flex items-center space-x-2">
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Content - Always show form when expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {renderTestForm(test)}
                  </div>
                )}
                
                {/* Show summary when not expanded and has score */}
                {!isExpanded && hasScore && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {renderTestSummary(test)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click on any test to expand and edit scores directly.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Check size={12} className="text-green-500" />
              Completed
            </span>
            {/* <span className="mx-2">•</span>
            <span className="flex items-center gap-1">
              <Award size={12} className="text-gray-500" />
              Not Taken
            </span> */}
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Use "Edit Data" to fetch the latest data from server, or "Reset" to revert to original data.
        </p>
      </div>
    </div>
  );
};

export default TestScores;