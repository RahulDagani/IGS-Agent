"use client"
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Badge from "@/components/ui/badge/Badge";
import { DockIcon, DollarSign, GraduationCap, MapPin, Calendar, Book, Building2, Star, X } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useParams } from "next/navigation";
import Link from "next/link";
import { Country, State } from "country-state-city";
import Image from "next/image";

// Interfaces matching the API response structure
interface Intake {
  intake_id: number;
  course_id: number;
  start_date: string;
  open_date: string;
  submission_deadline: string;
  seat_availability: string;
  turnaround_time: string;
  conversion_rate: string;
  overall_score_label: string;
  overall_score_intent: string;
  intake_created_at: string;
}

interface Course {
  id: number;
  tenant_id: number;
  university_id: number;
  study_level_id: number;
  discipline_id: number;
  partner_type_id: number;
  collaboration_type_id: number;
  university_type_id: number;
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
  created_at: string;
  updated_at: string;
  university_name: string;
  study_level_name: string;
  discipline_name: string;
  partner_type_name: string;
  university_type_name: string;
  collaboration_type_name: string;
  intakes: Intake[];
  country_code: string;
  state_code: string;
  city_code: string;
  university_logo: string;
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
  filters: {
    studyLevels: Array<{
      id: number;
      name: string;
    }>;
    disciplines: Array<{
      id: number;
      name: string;
    }>;
    universities: Array<{
      id: number;
      university: string;
      country_code: string;
      state_code: string;
      city_code: string;
    }>;
    locations: {
      countries: Array<{ country_code: string }>;
      states: Array<{ state_code: string }>;
      cities: Array<{ city_code: string }>;
    };
    tuitionRange: {
      min: string;
      max: string;
    };
  };
}

// Filter Options Interface for Student Portal
interface FilterOptions {
  discipline: string | number;
  study_level_id: string | number;
  university: string | number;
  country_code: string | number;
  state_code: string | number;
  city_code: string | number;
  search?: string;
}

// Filter Modal Component for Student Portal
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterApply: (filters: FilterOptions) => void;
  filterOptions: {
    studyLevels: Array<{ id: number; name: string }>;
    disciplines: Array<{ id: number; name: string }>;
    universities: Array<{ id: number; university: string }>;
    locations: {
      countries: Array<{ country_code: string }>;
      states: Array<{ state_code: string }>;
      cities: Array<{ city_code: string }>;
    };
  } | null;
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

  // Initialize local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  const handleSelectChange = (key: keyof FilterOptions, value: string | number) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      discipline: "all",
      study_level_id: "all",
      university: "all",
      country_code: "all",
      state_code: "all",
      city_code: "all",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleApply = () => {
    onFilterApply(localFilters);
    onClose();
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

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Study Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Study Level
            </label>
            <select
              value={localFilters.study_level_id}
              onChange={(e) => handleSelectChange('study_level_id', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Study Levels</option>
              {filterOptions.studyLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          {/* Discipline Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Discipline
            </label>
            <select
              value={localFilters.discipline}
              onChange={(e) => handleSelectChange('discipline', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Disciplines</option>
              {filterOptions.disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </div>

          {/* University Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              University
            </label>
            <select
              value={localFilters.university}
              onChange={(e) => handleSelectChange('university', e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Universities</option>
              {filterOptions.universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.university}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <select
              value={localFilters.country_code}
              onChange={(e) => handleSelectChange('country_code', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Countries</option>
              {filterOptions.locations.countries.map((country) => (
                <option key={country.country_code} value={country.country_code}>
                  {getCountryName(country.country_code)}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            <select
              value={localFilters.state_code}
              onChange={(e) => handleSelectChange('state_code', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All States</option>
              {filterOptions.locations.states.map((state) => (
                <option key={state.state_code} value={state.state_code}>
                  {getStateName(state.state_code)}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <select
              value={localFilters.city_code}
              onChange={(e) => handleSelectChange('city_code', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Cities</option>
              {filterOptions.locations.cities.map((city) => (
                <option key={city.city_code} value={city.city_code}>
                  {city.city_code}
                </option>
              ))}
            </select>
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
  onConfirm: () => void;
  course: Course | null;
  loading: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  course,
  loading,
}) => {
  const formatFee = (fee: string, currency: string) => {
    if (!fee || fee === "0.00") return "Free";
    return `${currency} ${parseFloat(fee).toLocaleString()}`;
  };

  const handleSubmit = () => {
    onConfirm();
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Confirm Application
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please review your application details before submitting:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Course:</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{course.course_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">University:</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{course.university_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Study Level:</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{course.study_level_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Application Fee:</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {formatFee(course.application_fee, course.currency_code)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'very high':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'high':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'very low':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
      {/* Top Section */}
      <div className="flex items-start justify-between">
        {/* University Info */}
        <div className="flex items-start gap-3">
          <div className="logo w-24 h-24 shrink-0 ">
            {course.university_logo_url ? (
              <Image 
                src={course.university_logo_url} 
                alt={`${course.university_name} logo`}
                height={100}
                width={100}
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

        {/* Intakes */}
        {course.intakes && course.intakes.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar size={18}/>
            <div className="flex-1">
              <span className="block">Available Intakes</span>
              <div className="mt-1 space-y-1">
                {course.intakes.slice(0, 2).map((intake) => (
                  <div key={intake.intake_id} className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatDate(intake.start_date)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(intake.seat_availability)}`}>
                      {intake.seat_availability}
                    </span>
                  </div>
                ))}
                {course.intakes.length > 2 && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    +{course.intakes.length - 2} more intakes
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
          href={`/partner/programs/${course.id}`}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-center dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm transition-all"
          
        >
          View Course Details
        </Link>
        {/* <button
          onClick={() => onApply(course)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-center dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm transition-all"
        >
          Apply Now
        </button> */}
      </div>
    </div>
  );
};

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function StudentProgramsPage() {
  const { token, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtersData, setFiltersData] = useState<ApiResponse['filters'] | null>(null);
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

  // Filters for Student Portal
  const [filters, setFilters] = useState<FilterOptions>({
    discipline: "all",
    study_level_id: "all",
    university: "all",
    country_code: "all",
    state_code: "all",
    city_code: "all",
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
    
    // Add all filters that are not "all"
    Object.entries(filtersToBuild).forEach(([key, value]) => {
      if (value !== "all" && value !== undefined && value !== null && value !== "" && key !== 'search') {
        params.append(key, value.toString());
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
      const url = `${BASE_URL}/agent/course/filters/dynamic${queryString ? `?${queryString}` : ''}`;
      
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
    
    // Add all filters that are not "all"
    Object.entries(filtersToBuild).forEach(([key, value]) => {
      if (value !== "all" && value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
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
      const url = `${BASE_URL}/agent/courses${queryString ? `?${queryString}` : ''}`;
      
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
  const handleConfirmApplication = async () => {
    if (!selectedCourse) return;

    setIsApplying(true);
    try {
      const payload = {
        course_id: selectedCourse.id,
        study_level_id: selectedCourse.study_level_id,
        remarks: "Interested in this program"
      };

      const response = await fetch(`${BASE_URL}/agent/application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      
      if (result.success) {
        setAlertType('success');
        setAlertMessage(`Your application for ${selectedCourse.course_name} at ${selectedCourse.university_name} has been submitted successfully!`);
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
  const handleRemoveFilter = (key: keyof FilterOptions) => {
    const newFilters = {
      ...filters,
      [key]: "all"
    };
    setFilters(newFilters);
    setModalFilters(newFilters);
    setCurrentPage(1);
    fetchCourses(1, false, newFilters);
  };

  const clearAllFilters = () => {
    const resetFilters: FilterOptions = {
      discipline: "all",
      study_level_id: "all",
      university: "all",
      country_code: "all",
      state_code: "all",
      city_code: "all",
    };
    setFilters(resetFilters);
    setModalFilters(resetFilters);
    setCurrentPage(1);
    fetchCourses(1, false, resetFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    return value !== "all" && value !== "" && value !== undefined && value !== null && key !== 'search';
  });

  // Get filter display name
  const getFilterDisplayName = (key: keyof FilterOptions, value: string | number) => {
    if (!filtersData || value === "all") return '';
    
    switch (key) {
      case 'study_level_id':
        const level = filtersData.studyLevels.find(opt => opt.id === value);
        return level?.name || '';
      case 'discipline':
        const discipline = filtersData.disciplines.find(opt => opt.id === value);
        return discipline?.name || '';
      case 'university':
        const university = filtersData.universities.find(opt => opt.id === value);
        return university?.university || '';
      case 'country_code':
        return getCountryName(value.toString());
      case 'state_code':
        return getStateName(value.toString());
      case 'city_code':
        return value.toString();
      default:
        return '';
    }
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
        {/* <div className="relative">
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div> */}

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
                {Object.values(filters).filter(v => v !== "all" && v !== "" && v !== undefined && v !== null && v !== filters.search).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {Object.entries(filters).map(([key, value]) => {
            if (value === "all" || value === "" || value === undefined || value === null || key === 'search') return null;
            
            const displayName = getFilterDisplayName(key as keyof FilterOptions, value);
            if (!displayName) return null;
            
            return (
              <Badge key={key} size="sm" color="primary">
                {key.replace('_', ' ')}: {displayName}
                <button 
                  onClick={() => handleRemoveFilter(key as keyof FilterOptions)}
                  className="ml-1 text-xs hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            );
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
        filterOptions={filtersData ? {
          studyLevels: filtersData.studyLevels,
          disciplines: filtersData.disciplines,
          universities: filtersData.universities.map(u => ({
            id: u.id,
            university: u.university
          })),
          locations: filtersData.locations
        } : null}
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