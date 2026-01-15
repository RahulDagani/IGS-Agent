"use client"
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Badge from "@/components/ui/badge/Badge";
import { DockIcon, DollarSign, GraduationCap, MapPin, Calendar, Book, Building2, Star, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Country, State } from "country-state-city";
import Image from "next/image";


// Interfaces matching the API response structure
interface StudyLevel {
  id: number;
  name: string;
}

interface Student {
  user_id: number;
  email: string;
  phone: string;
  status: string;
  first_name: string;
  last_name: string;
  passport_number: string;
  dob: string;
  created_at: string;
}

interface Discipline {
  id: number;
  name: string;
}

interface University {
  id: number;
  university: string;
  country_code: string;
  state_code: string;
  city_code: string;
}

interface LocationCountry {
  country_code: string;
}

interface LocationState {
  state_code: string;
}

interface LocationCity {
  city_code: string;
}

// interface Intake {
//   id: number;
//   intake: string;
// }

interface Deadline {
  id: number;
  deadline_type: string;
  deadline_date: string;
  extended_date: string | null;
  is_closed: number;
  notes: string | null;
}

interface Intake {
  id: number;
  intake_id: number;
  intake_name: string;
  intake_year: number;
  deadlines: Deadline[];
}

interface IntakeYear {
  intake_year: number;
}

interface FiltersData {
  studyLevels: StudyLevel[];
  disciplines: Discipline[];
  universities: University[];
  locations: {
    countries: LocationCountry[];
    states: LocationState[];
    cities: LocationCity[];
  };
  intakes: Intake[];
  intakeYears: IntakeYear[];
}

interface Course {
  id: number;
  tenant_id: number;
  university_id: number;
  study_level_id: number;
  discipline_id: number;
  course_name: string;
  course_slug: string;
  is_popular: number;
  duration_min: number;
  duration_max: number;
  duration_unit: string;
  tuition_fee: string;
  currency_code: string;
  application_fee: string;
  gre_score: string | null;
  gmat_score: string | null;
  ielts_score: string | null;
  toefl_score: string | null;
  pte_score: string | null;
  sat_score: string | null;
  act_score: string | null;
  duolingo_score: string | null;
  gpa_score: string | null;
  about_course: string;
  admission_requirements: string;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  university_name: string;
  country_code: string;
  state_code: string;
  city_code: string;
  university_logo: string;
  study_level_name: string;
  discipline_name: string;
  university_logo_url: string;
}

interface ApiResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: Course[];
}

// Filter Options Interface for Student Portal
interface FilterOptions {
  disciplines: number[];
  studyLevels: number[];
  universities: number[];
  countries: string[];
  states: string[];
  cities: string[];
  intakes: number[];
  intakeYears: number[];
  search?: string;
}

// Filter Modal Component for Student Portal
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterApply: (filters: FilterOptions) => void;
  filterOptions: FiltersData | null;
  appliedFilters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const getCountryName = (code: string | undefined | null) => {
  if (!code) return '';
  const country = Country.getCountryByCode(code);
  return country ? country.name : code;
};

const getStateName = (code: string | undefined | null) => {
  if (!code) return '';
  const state = State.getStateByCode(code);
  return state ? state.name : code;
};

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onFilterApply,
  filterOptions,
  appliedFilters,
  onFiltersChange,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(appliedFilters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    disciplines: true,
    locations: true,
    universities: true,
    studyLevels: true,
    intakes: true,
    intakeYears: true,
  });

  // Initialize local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle checkbox changes for arrays
  const handleCheckboxChange = (key: keyof FilterOptions, value: number | string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentArray = prev[key] as (number | string)[];
      let newArray: (number | string)[];
      
      if (checked) {
        // Add value to array
        newArray = [...currentArray, value];
      } else {
        // Remove value from array
        newArray = currentArray.filter(item => item !== value);
      }
      
      const newFilters = {
        ...prev,
        [key]: newArray
      };
      
      // Update parent component
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  // Handle select changes for arrays (multi-select)
  const handleMultiSelectChange = (key: keyof FilterOptions, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => {
      if (key === 'intakes' || key === 'intakeYears' || key === 'studyLevels') {
        return Number(option.value);
      }
      return option.value;
    });
    
    const newFilters = {
      ...localFilters,
      [key]: selectedOptions
    };
    
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      disciplines: [],
      studyLevels: [],
      universities: [],
      countries: [],
      states: [],
      cities: [],
      intakes: [],
      intakeYears: [],
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleApply = () => {
    onFilterApply(localFilters);
    onClose();
  };

  // Check if a value is selected in an array
  const isSelected = (key: keyof FilterOptions, value: number | string) => {
    const array = localFilters[key] as (number | string)[];
    return array.includes(value);
  };

  if (!isOpen || !filterOptions) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Programs
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* <div className="grid grid-cols-2 gap-6">
             
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection('intakes')}
                className="flex items-center justify-between w-full text-left"
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Intakes
                </h4>
                {expandedSections.intakes ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedSections.intakes && (
                <select
                  value={localFilters.intakes.map(String)}
                  onChange={(e) => handleMultiSelectChange('intakes', e)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  
                >
                  <option key="all" value={""}>All</option>
                  {filterOptions.intakes.map((intake) => (
                    <option key={intake.id} value={intake.id}>
                      {intake.intake_name}
                    </option>
                  ))}
                </select>
              )}
              {localFilters.intakes.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selected: {localFilters.intakes.length} intake(s)
                </p>
              )}
            </div>

          
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection('intakeYears')}
                className="flex items-center justify-between w-full text-left"
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Intake Years
                </h4>
                {expandedSections.intakeYears ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedSections.intakeYears && (
                <select
                  value={localFilters.intakeYears.map(String)}
                  onChange={(e) => handleMultiSelectChange('intakeYears', e)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  
                >
                  
                  {filterOptions.intakeYears.map((year) => (
                    <option key={year.intake_year} value={year.intake_year}>
                      {year.intake_year}
                    </option>
                  ))}
                </select>
              )}
              {localFilters.intakeYears.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selected: {localFilters.intakeYears.length} year(s)
                </p>
              )}
            </div>
          </div> */}


          {/* Study Levels Filter - Keep as Multi-Select */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('studyLevels')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="block text-lg font-medium text-gray-700 dark:text-gray-300 ">
                Study Levels
              </h4>
              {expandedSections.studyLevels ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.studyLevels && (
              <select
                value={localFilters.studyLevels.map(String)}
                onChange={(e) => handleMultiSelectChange('studyLevels', e)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {filterOptions.studyLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            )}
            {localFilters.studyLevels.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected: {localFilters.studyLevels.length} study level(s)
              </p>
            )}
          </div>

          {/* Disciplines Filter - Changed to Checkboxes */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('disciplines')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="block text-lg font-medium text-gray-700 dark:text-gray-300 ">
                Disciplines
              </h4>
              {expandedSections.disciplines ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.disciplines && (
              <div className="grid grid-cols-2 space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.disciplines.map((discipline) => (
                  <label
                    key={discipline.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected('disciplines', discipline.id)}
                      onChange={(e) => handleCheckboxChange('disciplines', discipline.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {discipline.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {localFilters.disciplines.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected: {localFilters.disciplines.length} discipline(s)
              </p>
            )}
          </div>

          {/* Universities Filter - Changed to Checkboxes */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('universities')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="block text-lg font-medium text-gray-700 dark:text-gray-300 ">
                Universities
              </h4>
              {expandedSections.universities ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.universities && (
              <div className="grid grid-cols-2 space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.universities.map((university) => (
                  <label
                    key={university.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected('universities', university.id)}
                      onChange={(e) => handleCheckboxChange('universities', university.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {university.university}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {localFilters.universities.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected: {localFilters.universities.length} university(ies)
              </p>
            )}
          </div>

          {/* Locations Filter - Changed to Checkboxes */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('locations')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="block text-lg font-medium text-gray-700 dark:text-gray-300 ">
                Locations
              </h4>
              {expandedSections.locations ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.locations && (
              <div className="space-y-4">
                {/* Countries */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Countries
                  </h5>
                  <div className="grid grid-cols-2 space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.locations.countries.map((country) => (
                      <label
                        key={country.country_code}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected('countries', country.country_code)}
                          onChange={(e) => handleCheckboxChange('countries', country.country_code, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {getCountryName(country.country_code)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* States */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    States
                  </h5>
                  <div className="grid grid-cols-2 space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.locations.states.map((state) => (
                      <label
                        key={state.state_code}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected('states', state.state_code)}
                          onChange={(e) => handleCheckboxChange('states', state.state_code, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                         {state.state_code}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cities */}
                {/* <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cities
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto p-2">
                    {filterOptions.locations.cities.map((city) => (
                      <label
                        key={city.city_code}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected('cities', city.city_code)}
                          onChange={(e) => handleCheckboxChange('cities', city.city_code, e.target.checked)}
                          className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {city.city_code}
                        </span>
                      </label>
                    ))}
                  </div>
                </div> */}
              </div>
            )}
            {(localFilters.countries.length > 0 || localFilters.states.length > 0 || localFilters.cities.length > 0) && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected: {localFilters.countries.length + localFilters.states.length + localFilters.cities.length} location(s)
              </p>
            )}
          </div>
         
         
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Application Confirmation Modal Component for Student Portal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: ( intakeId: number, appLogin: string, appPassword: string) => void;
  course: Course | null;
  loading: boolean;
  students: Student[];
  isFetchingStudents: boolean;
  studentError: string | null;
  courseId: string | string[];
  token: string | null;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  course,
  loading,
  students,
  isFetchingStudents,
  studentError,
  courseId,
  token
}) => {
  const [selectedIntakeId, setSelectedIntakeId] = useState<number>(0);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [isFetchingIntakes, setIsFetchingIntakes] = useState(false);
  const [intakesError, setIntakesError] = useState<string | null>(null);
  const [openIntakeDetails, setOpenIntakeDetails] = useState<number | null>(null);

  const [appLogin,setAppLogin] = useState<string>("");
  const [appPassword,setAppPassword] = useState<string>("");


  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  const formatFee = (fee: string, currency: string) => {
    if (!fee || fee === "0.00") return "Free";
    return `${currency} ${parseFloat(fee).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch intakes when modal opens
  useEffect(() => {
    if (isOpen && courseId && token) {
      fetchIntakes();
    }
  }, [isOpen, courseId, token]);

  const fetchIntakes = async () => {
    try {
      setIsFetchingIntakes(true);
      setIntakesError(null);
      
      const response = await fetch(`${BASE_URL}/student/course/intake/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch intakes: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setIntakes(data.data || []);
        
        // Select first open intake by default
        const firstOpenIntake = data.data.find((intake: Intake) => 
          intake.deadlines.some(deadline => deadline.is_closed === 0)
        );
        
        if (firstOpenIntake) {
          setSelectedIntakeId(firstOpenIntake.intake_id);
        }
      } else {
        throw new Error(data.message || 'Failed to load intakes');
      }
    } catch (err) {
      setIntakesError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching intakes:', err);
    } finally {
      setIsFetchingIntakes(false);
    }
  };
  
  
  const handleSubmit = () => {

    if (selectedIntakeId === 0) {
      // Show error alert for missing intake selection
      alert("Please select an intake");
      return;
    }
    onConfirm(selectedIntakeId, appLogin, appPassword);
  };

  const toggleIntakeDetails = (intakeId: number) => {
    setOpenIntakeDetails(openIntakeDetails === intakeId ? null : intakeId);
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl my-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Confirm Application
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Please review your application details before submitting:
          </p>

          <div className="space-y-6">
            {/* Course Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Course Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Course:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white text-right">{course.course_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">University:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white text-right">{course.university_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Study Level:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white text-right">{course.study_level_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Application Fee:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white text-right">
                    {formatFee(course.application_fee, course.currency_code)}
                  </span>
                </div>
              </div>
            </div>

            {/* Intake Selection */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Intake</h4>
              {isFetchingIntakes ? (
                <div className="flex items-center justify-center p-4">
                  <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Loading intakes...</span>
                </div>
              ) : intakesError ? (
                <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  Error loading intakes: {intakesError}
                </div>
              ) : intakes.length === 0 ? (
                <div className="text-sm text-yellow-600 dark:text-yellow-400 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  No intakes available for this course.
                </div>
              ) : (
                <div className="space-y-3">
                  {intakes.map((intake) => {
                    const isSelected = selectedIntakeId === intake.intake_id;
                    
                    return (
                      <div key={intake.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className={`p-3 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                id={`intake-${intake.id}`}
                                name="intake"
                                value={intake.intake_id}
                                checked={isSelected}
                                onChange={(e) => setSelectedIntakeId(Number(e.target.value))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <div>
                                <label 
                                  htmlFor={`intake-${intake.id}`}
                                  className={`font-medium text-gray-800 dark:text-white`}
                                >
                                  {intake.intake_name} {intake.intake_year}
                                </label>
                                
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleIntakeDetails(intake.id)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${openIntakeDetails === intake.id ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {openIntakeDetails === intake.id && (
                          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
                            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Deadlines:</h5>
                            <div className="space-y-2">
                              {intake.deadlines.map((deadline) => (
                                <div key={deadline.id} className="text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">{deadline.deadline_type}:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                      {formatDate(deadline.deadline_date)}
                                    </span>
                                  </div>
                                  {deadline.extended_date && (
                                    <div className="flex justify-between mt-1">
                                      <span className="text-gray-600 dark:text-gray-400">Extended Date:</span>
                                      <span className="text-yellow-600 dark:text-yellow-400">
                                        {formatDate(deadline.extended_date)}
                                      </span>
                                    </div>
                                  )}
                                  {deadline.notes && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                                      Note: {deadline.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            <div className="grid grid-cols-2  gap-4">
              <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Application Login
          </label>
          <input
            type="text"
            value={appLogin}
            onChange={(e)=>setAppLogin(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Enter application login"
           
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Application Password
          </label>
          <input
            type="text"
            value={appPassword}
            onChange={(e)=>setAppPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Enter application password"
            
          />
        </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                loading || 
                isFetchingIntakes || 
                selectedIntakeId === 0 ||
                intakes.length === 0 ||
                intakesError !== null
              }
              className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Applying...
                </>
              ) : (
                'Confirm Application'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success/Error Alert Component
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, type, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${
            type === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }`}>
            {type === 'success' ? (
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h3 className={`text-lg font-semibold text-center mb-2 ${
            type === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
          }`}>
            {type === 'success' ? 'Application Submitted!' : 'Application Failed'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            {message}
          </p>
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 text-sm text-white rounded-lg ${
              type === 'success' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            } focus:outline-hidden focus:ring-2 focus:ring-opacity-50`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard: React.FC<{ 
  course: Course;
  onApply: (course: Course) => void;
}> = ({ course, onApply }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  const formatDuration = () => {
    if (course.duration_min === course.duration_max) {
      return `${course.duration_min} ${course.duration_unit}`;
    }
    return `${course.duration_min} - ${course.duration_max} ${course.duration_unit}`;
  };

  const formatFee = (fee: string, currency: string) => {
    if (!fee || fee === "0.00") return "N/A";
    return `${currency} ${parseFloat(fee).toLocaleString()}`;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
      {/* Top Section */}
      <div className="flex items-start justify-between">
        {/* University Info */}
        <div className="flex items-start gap-3">
          <div className="logo w-20 h-20 flex justify-center items-center bg-white rounded-2xl">
            {course.university_logo_url ? (
              <Image 
                src={course.university_logo_url} 
                alt={`${course.university_name} logo`}
                height={80}
                width={80}
                className="rounded-md object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                {getInitials(course.university_name)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white leading-snug">
              {course.course_name}
            </h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {course.university_name}
            </p>
            {course.is_popular === 1 && (
              <Badge size="sm" color="warning">
                <Star size={12} className="mr-1" />
                Popular
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 space-y-3">
        {/* Degree */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <GraduationCap size={18}/>
          <div>
            <span className="block">Study Level</span>
            <strong className="block font-semibold text-gray-800 dark:text-white">{course.study_level_name}</strong>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <DockIcon size={18}/>
          <div>
            <span className="block">Duration</span>
            <strong className="block font-semibold text-gray-800 dark:text-white">{formatDuration()}</strong>
          </div>
        </div>

        {/* Fees */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <DollarSign size={18}/>
          <div>
            <span className="block">Fees</span>
            <div className="space-y-1">
              <strong className="block font-semibold text-gray-800 dark:text-white">
                Tuition: {formatFee(course.tuition_fee, course.currency_code)}
              </strong>
              <strong className="block font-semibold text-gray-800 dark:text-white">
                Application: {formatFee(course.application_fee, course.currency_code)}
              </strong>
            </div>
          </div>
        </div>

        {/* Discipline */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Book size={18}/>
          <div>
            <span className="block">Discipline</span>
            <strong className="block font-semibold text-gray-800 dark:text-white">{course.discipline_name}</strong>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Building2 size={18}/>
          <div>
            <span className="block">Location</span>
            <strong className="block font-semibold text-gray-800 dark:text-white">
              {getCountryName(course.country_code)}, {getStateName(course.state_code)}
            </strong>
          </div>
        </div>
      </div>

      {/* Entry Requirements */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
          ENTRY REQUIREMENTS
        </h3>
        <div className="flex gap-2 flex-wrap">
          {course.ielts_score && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              IELTS: <span className="text-gray-900 dark:text-white">{course.ielts_score}</span>
            </span>
          )}
          {course.pte_score && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              PTE: <span className="text-gray-900 dark:text-white">{course.pte_score}</span>
            </span>
          )}
          {course.duolingo_score && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              Duolingo: <span className="text-gray-900 dark:text-white">{course.duolingo_score}</span>
            </span>
          )}
          {course.toefl_score && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              TOEFL: <span className="text-gray-900 dark:text-white">{course.toefl_score}</span>
            </span>
          )}
          {course.gre_score && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              GRE: <span className="text-gray-900 dark:text-white">{course.gre_score}</span>
            </span>
          )}
          {course.gmat_score && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              GMAT: <span className="text-gray-900 dark:text-white">{course.gmat_score}</span>
            </span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <Link
          href={`/student/programs/${course.id}`}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-center dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm transition-all"
        >
          View Course Details
        </Link>
        <button
          onClick={() => onApply(course)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-center dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-2 rounded-lg text-sm transition-all"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function StudentProgramsPage() {
  const router = useRouter();
  const { token, logout, user } = useAuth();
  const studentId = user?.id;
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtersData, setFiltersData] = useState<FiltersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Application states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

    const [students, setStudents] = useState<Student[]>([]);
    const [isFetchingStudents, setIsFetchingStudents] = useState(false);
    const [studentError, setStudentError] = useState<string | null>(null);

    
    
    

  // Filters for Student Portal - Updated to use arrays
  const [filters, setFilters] = useState<FilterOptions>({
    disciplines: [],
    studyLevels: [],
    universities: [],
    countries: [],
    states: [],
    cities: [],
    intakes: [],
    intakeYears: [],
  });

  // Track modal filters separately
  const [modalFilters, setModalFilters] = useState<FilterOptions>(filters);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const observerRef = useRef<HTMLDivElement>(null);

  // Build query string for dynamic filters API
  const buildFilterQueryString = useCallback((filtersToBuild: FilterOptions) => {
    const params = new URLSearchParams();
    
    // Add all array filters (multiple params with same key)
    Object.entries(filtersToBuild).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((val) => {
          if (key === "studyLevels") {
            params.append("study_level_id", val.toString());
          } else if (key === "disciplines") {
            params.append("discipline_id", val.toString());
          } else if (key === "universities") {
            params.append("university_id", val.toString());
          } else if (key === "countries") {
            params.append("country_code", val.toString());
          } else if (key === "states") {
            params.append("state_code", val.toString());
          } else if (key === "cities") {
            params.append("city_code", val.toString());
          } else if (key === "intakes") {
            if(val == 0 || !val || val == ""){
              params.append("intake_id", "");
            }else{
              params.append("intake_id", val.toString());
            }
          } else if (key === "intakeYears") {
            params.append("intake_year", val.toString());
          } else {
            params.append(key, val.toString());
          }
        });
      }
    });
    
    return params.toString();
  }, []);

  // Fetch filter options from API
  const fetchFilters = useCallback(async (currentModalFilters?: FilterOptions) => {
    try {
      setLoadingFilters(true);
      const filtersToUse = currentModalFilters || filters;
      const queryString = buildFilterQueryString(filtersToUse);
      const url = `${BASE_URL}/student/course/filters/dynamic${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        throw new Error('Failed to fetch filter options');
      }

      const data = await response.json();
      
      if (data.success) {
        setFiltersData(data.data.filters);
      } else {
        throw new Error('Failed to load filter options');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingFilters(false);
    }
  }, [token, logout, buildFilterQueryString, filters]);

// Build query string for courses API
const buildCoursesQueryString = useCallback((page: number = 1, filtersToBuild: FilterOptions) => {
  const params = new URLSearchParams();
  
  // Add page parameter
  params.append('page', page.toString());
  params.append('limit', '10');
  
  // Add all array filters (multiple params with same key)
  Object.entries(filtersToBuild).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      value.forEach((val) => {
        // Map filter keys to API parameter names
        let paramKey = key;
        if (key === 'studyLevels') paramKey = 'study_level_id';
        else if (key === 'disciplines') paramKey = 'discipline_id';
        else if (key === 'universities') paramKey = 'university_id';
        else if (key === 'countries') paramKey = 'country_code';
        else if (key === 'states') paramKey = 'state_code';
        else if (key === 'cities') paramKey = 'city_code';
        else if (key === 'intakes') paramKey = 'intake_id';
        else if (key === 'intakeYears') paramKey = 'intake_year';
        
        params.append(paramKey, val.toString());
      });
    }
  });
  
  // Add search term
  if (searchTerm) {
    params.append('search', searchTerm);
  }
  
  return params.toString();
}, [searchTerm]);

  // Fetch courses from API
  const fetchCourses = useCallback(async (page: number = 1, loadMore: boolean = false, filtersToUse?: FilterOptions) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const filtersToApply = filtersToUse || filters;
      const queryString = buildCoursesQueryString(page, filtersToApply);
      const url = `${BASE_URL}/student/courses${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      
      if (data.success) {
        if (loadMore) {
          // Append new data for infinite scroll
          setCourses(prev => [...prev, ...data.data]);
        } else {
          // Replace data for initial load or filter change
          setCourses(data.data);
        }
        setCurrentPage(data.page || 1);
        setHasMore(data.hasNextPage || false);
        setTotalRecords(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        throw new Error('Failed to load courses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [token, logout, buildCoursesQueryString, filters]);

  // Initial fetch of filters and courses
  useEffect(() => {
    fetchFilters();
    fetchCourses(1, false, filters);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchCourses(1, false, filters);
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  // Handle modal filters change - refetch dynamic filters
  const handleModalFiltersChange = useCallback((newModalFilters: FilterOptions) => {
    setModalFilters(newModalFilters);
    // Refetch filters with new modal filters
    fetchFilters(newModalFilters);
  }, [fetchFilters]);

  // Handle filter apply from modal
  const handleFilterApply = (newFilters: FilterOptions) => {
    // Update the main filters
    setFilters(newFilters);
    setModalFilters(newFilters);
    
    // Reset pagination and fetch courses with new filters
    setCurrentPage(1);
    fetchCourses(1, false, newFilters);
    
    // Close modal
    setIsFilterModalOpen(false);
  };

  // Reset modal filters when modal opens
  const handleModalOpen = () => {
    setModalFilters(filters);
    setIsFilterModalOpen(true);
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isLoadingMore) {
          fetchCourses(currentPage + 1, true, filters);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loading, isLoadingMore, currentPage, fetchCourses]);


  // Handle Apply button click
  const handleApplyClick = async (course: Course) => {
   
    setSelectedCourse(course);
    setIsConfirmModalOpen(true);
  };

  // Handle application submission
  const handleConfirmApplication = async ( intakeId: number, appLogin: string, appPassword: string) => {
    if (!selectedCourse) return;

    setIsApplying(true);
    try {
      const payload = {
        course_id: selectedCourse.id,
        study_level_id: selectedCourse.study_level_id,
        remarks: "Student wants to apply for this course",
        course_intake_id: intakeId,
        student_user_id: studentId,
        application_login: appLogin,  
        application_password: appPassword
      };

      const response = await fetch(`${BASE_URL}/student/application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // if (!response.ok) {
      //   throw new Error('Failed to submit application');
      // }

      const result = await response.json();
      

      if (result.success) {
        const app_id = result.application_id;
        setAlertType('success');
        setAlertMessage(`Your application for ${selectedCourse.course_name} at ${selectedCourse.university_name} has been submitted successfully!`);

        setTimeout(()=>{
          router.push(`/student/editProfile/${studentId}?tab=applications&app=${app_id}`);
        },2000)
      } else {
        throw new Error(result.message || 'Application failed');
      }
    } catch (err) {
      setAlertType('error');
      setAlertMessage(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
      setIsConfirmModalOpen(false);
      setIsAlertModalOpen(true);
    }
  };

  // Close alert modal
  const handleCloseAlert = () => {
    setIsAlertModalOpen(false);
    setSelectedCourse(null);
  };

  // Handle remove filter
  const handleRemoveFilter = (key: keyof FilterOptions, value?: number | string) => {
    const newFilters = { ...filters };
    
    if (value) {
      // Remove specific value from array
      const array = newFilters[key] as (number | string)[];
      newFilters[key] = array.filter(item => item !== value) as any;
    } else {
      // Clear entire array
      newFilters[key] = [] as any;
    }
    
    setFilters(newFilters);
    setModalFilters(newFilters);
    setCurrentPage(1);
    fetchCourses(1, false, newFilters);
  };

  const clearAllFilters = () => {
    const resetFilters: FilterOptions = {
      disciplines: [],
      studyLevels: [],
      universities: [],
      countries: [],
      states: [],
      cities: [],
      intakes: [],
      intakeYears: [],
    };
    setFilters(resetFilters);
    setModalFilters(resetFilters);
    setCurrentPage(1);
    fetchCourses(1, false, resetFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    return Array.isArray(value) && value.length > 0 && key !== 'search';
  });

  // Get filter display name
  const getFilterDisplayName = (key: keyof FilterOptions, value: number | string) => {
    if (!filtersData) return '';
    
    switch (key) {
      case 'studyLevels':
        const level = filtersData.studyLevels.find(opt => opt.id === value);
        return level?.name || '';
      case 'disciplines':
        const discipline = filtersData.disciplines.find(opt => opt.id === value);
        return discipline?.name || '';
      case 'universities':
        const university = filtersData.universities.find(opt => opt.id === value);
        return university?.university || '';
      case 'countries':
        return getCountryName(value.toString());
      case 'states':
        return getStateName(value.toString());
      case 'cities':
        return value.toString();
      case 'intakes':
        const intake = filtersData.intakes.find(opt => opt.id === value);
        return intake?.intake_name || '';
      case 'intakeYears':
        return value.toString();
      default:
        return '';
    }
  };

  // Helper to get filter count
  const getFilterCount = () => {
    return Object.values(filters).reduce((total, value) => {
      if (Array.isArray(value)) {
        return total + value.length;
      }
      return total;
    }, 0);
  };

  if (loading && !isLoadingMore) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error && currentPage === 1) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">Error loading programs</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchFilters();
            fetchCourses(1, false, filters);
          }}
          className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Browse Programs
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Discover and apply to programs that match your interests
          </p>
        </div>
        
        {/* Programs Summary */}
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {totalRecords || 0}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Total Programs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {courses.filter(course => course.is_popular === 1).length}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Popular</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        

        {/* Filter Button */}
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          )}
          <button
            onClick={handleModalOpen}
            disabled={loadingFilters}
            className="h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filter Programs
            {hasActiveFilters && (
              <span className="ml-1 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getFilterCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {Object.entries(filters).map(([key, values]) => {
            if (!Array.isArray(values) || values.length === 0) return null;
            
            return values.map((value) => {
              const displayName = getFilterDisplayName(key as keyof FilterOptions, value);
              if (!displayName) return null;
              
              return (
                <Badge key={`${key}-${value}`} size="sm" color="primary">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {displayName}
                  <button 
                    onClick={() => handleRemoveFilter(key as keyof FilterOptions, value)}
                    className="ml-1 text-xs hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              );
            });
          })}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              onApply={handleApplyClick}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No programs found.
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Start browsing programs'}
            </p>
          </div>
        )}
      </div>

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="text-center py-4">
          <div className="inline-block">
            <svg className="animate-spin h-5 w-5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading more programs...</p>
          </div>
        </div>
      )}

      {/* Intersection Observer Target */}
      {hasMore && !isLoadingMore && courses.length > 0 && (
        <div ref={observerRef} className="h-10"></div>
      )}

      {/* Results Count */}
      {courses.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {courses.length} of {totalRecords} programs
          {totalPages > 1 && (
            <span className="ml-2">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onFilterApply={handleFilterApply}
        filterOptions={filtersData}
        appliedFilters={modalFilters}
        onFiltersChange={handleModalFiltersChange}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmApplication}
        course={selectedCourse}
        loading={isApplying}
        students={students}
        isFetchingStudents={isFetchingStudents}
        studentError={studentError}
        courseId={String(selectedCourse?.id)}
        token={token}
      />

      

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={handleCloseAlert}
        type={alertType}
        message={alertMessage}
      />
    </div>
  );
}