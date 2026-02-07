"use client"
import React, { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import { DockIcon, DollarSign, GraduationCap, Book, Building2, Star, Heart, Trash2 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Country, State } from "country-state-city";
import Image from "next/image";

// Interfaces for shortlisted courses
interface ShortlistedCourse {
  shortlist_id: number;
  shortlisted_at: string;
  id: number;
  university_id: number;
  study_level_id: number;
  discipline_id: number;
  course_name: string;
  course_slug: string;
  is_popular: number;
  duration_min: number | null;
  duration_max: number | null;
  duration_unit: string;
  tuition_fee: string | null;
  tuition_fee_url: string | null;
  currency_code: string;
  application_fee: string | null;
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
  external_evaluation: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  university: string;
  university_slug: string;
  university_country: string;
  university_state: string;
  university_city: string;
  university_logo: string;
  university_website: string | null;
  study_level_name: string;
  discipline_name: string;
  university_logo_url: string;
}

interface ApiResponse {
  success: boolean;
  data: ShortlistedCourse[];
}

// Application Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (intakeId: number, appLogin: string, appPassword: string) => void;
  course: ShortlistedCourse | null;
  loading: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  course,
  loading,
}) => {
  const [selectedIntakeId, setSelectedIntakeId] = useState<number>(0);
  const [appLogin, setAppLogin] = useState<string>("");
  const [appPassword, setAppPassword] = useState<string>("");
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Mock intakes data (you should fetch this from your API)
  const mockIntakes = [
    { id: 1, intake_name: "Fall 2024", intake_year: 2024 },
    { id: 2, intake_name: "Spring 2025", intake_year: 2025 },
    { id: 3, intake_name: "Fall 2025", intake_year: 2025 },
  ];

  const formatFee = (fee: string | null, currency: string) => {
    if (!fee || fee === "0.00") return "Free";
    return `${currency} ${parseFloat(fee).toLocaleString()}`;
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl my-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Apply to Shortlisted Course
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
                  <span className="text-sm font-medium text-gray-800 dark:text-white text-right">{course.university}</span>
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
            {/* <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Intake</h4>
              <div className="space-y-3">
                {mockIntakes.map((intake) => (
                  <div key={intake.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id={`intake-${intake.id}`}
                        name="intake"
                        value={intake.id}
                        checked={selectedIntakeId === intake.id}
                        onChange={(e) => setSelectedIntakeId(Number(e.target.value))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <label 
                          htmlFor={`intake-${intake.id}`}
                          className="font-medium text-gray-800 dark:text-white cursor-pointer"
                        >
                          {intake.intake_name} {intake.intake_year}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Application Credentials */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Login
                </label>
                <input
                  type="text"
                  value={appLogin}
                  onChange={(e) => setAppLogin(e.target.value)}
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
                  onChange={(e) => setAppPassword(e.target.value)}
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
              onClick={() => onConfirm(selectedIntakeId, appLogin, appPassword)}
              disabled={
                loading || 
                selectedIntakeId === 0
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

// Alert Modal Component
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, type, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
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
            {type === 'success' ? 'Success!' : 'Error'}
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

// Helper functions
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

// Shortlisted Course Card Component
const ShortlistedCourseCard: React.FC<{ 
  course: ShortlistedCourse;
  onApply: (course: ShortlistedCourse) => void;
  onRemove: (courseId: number) => Promise<void>;
  isRemoving: boolean;
}> = ({ course, onApply, onRemove, isRemoving }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  const formatDuration = () => {
    if (course.duration_min === null || course.duration_max === null) {
      return "N/A";
    }
    if (course.duration_min === course.duration_max) {
      return `${course.duration_min} ${course.duration_unit}`;
    }
    return `${course.duration_min} - ${course.duration_max} ${course.duration_unit}`;
  };

  const formatFee = (fee: string | null, currency: string) => {
    if (!fee || fee === "0.00") return "N/A";
    return `${currency} ${parseFloat(fee).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
      {/* Top Section */}
      <div className="flex items-start justify-between">
        {/* University Info */}
        <div className="flex items-start">
          <div className="logo w-24 h-24 flex shrink-0 justify-center items-center bg-white rounded-2xl">
            {course.university_logo_url ? (
              <Image 
                src={course.university_logo_url} 
                alt={`${course.university} logo`}
                height={100}
                width={100}
                className="rounded-md object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                {getInitials(course.university)}
              </div>
            )}
          </div>
          <div className="ml-2">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white leading-snug">
              {course.course_name}
            </h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {course.university}
            </p>
            {course.is_popular === 1 && (
              <Badge size="sm" color="warning">
                <Star size={12} className="mr-1" />
                Popular
              </Badge>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Shortlisted on {formatDate(course.shortlisted_at)}
            </p>
          </div>
        </div>
        
        {/* Remove Button */}
        <button
          onClick={() => onRemove(course.id)}
          disabled={isRemoving}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove from shortlist"
        >
          {isRemoving ? (
            <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Trash2 size={20} className="text-red-500 hover:text-red-600" />
          )}
        </button>
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
              {getCountryName(course.university_country)}, {getStateName(course.university_state)}
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
          href={`/student/courses/${course.id}`}
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

export default function ShortlistedCoursesPage() {
  const router = useRouter();
  const { token, logout, user } = useAuth();
  const studentId = user?.id;
  
  const [shortlistedCourses, setShortlistedCourses] = useState<ShortlistedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Application states
  const [selectedCourse, setSelectedCourse] = useState<ShortlistedCourse | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState<number | null>(null);

  // Fetch shortlisted courses
  const fetchShortlistedCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/student/shortlist/courses`, {
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
        throw new Error('Failed to fetch shortlisted courses');
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setShortlistedCourses(data.data || []);
      } else {
        throw new Error('Failed to load shortlisted courses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  // Initial fetch
  useEffect(() => {
    fetchShortlistedCourses();
  }, [fetchShortlistedCourses]);

  // Handle Remove from shortlist
  const handleRemoveFromShortlist = async (courseId: number) => {
    if (!token) return;

    setRemovingCourseId(courseId);
    try {
      const response = await fetch(`${BASE_URL}/student/shortlist/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove from shortlist');
      }

      const result = await response.json();
      if (result.success) {
        // Remove the course from UI
        setShortlistedCourses(prev => prev.filter(course => course.id !== courseId));
        
        setAlertType('success');
        setAlertMessage('Course removed from shortlist successfully!');
        setIsAlertModalOpen(true);
      } else {
        throw new Error(result.message || 'Failed to remove from shortlist');
      }
    } catch (err) {
      setAlertType('error');
      setAlertMessage(err instanceof Error ? err.message : 'Failed to remove from shortlist');
      setIsAlertModalOpen(true);
    } finally {
      setRemovingCourseId(null);
    }
  };

  // Handle Apply button click
  const handleApplyClick = (course: ShortlistedCourse) => {
    setSelectedCourse(course);
    setIsConfirmModalOpen(true);
  };

  // Handle application submission
  const handleConfirmApplication = async (intakeId: number, appLogin: string, appPassword: string) => {
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

      const result = await response.json();

      if (result.success) {
        const app_id = result.application_id;
        setAlertType('success');
        setAlertMessage(`Your application for ${selectedCourse.course_name} at ${selectedCourse.university} has been submitted successfully!`);

        setTimeout(() => {
          router.push(`/student/editProfile/${studentId}?tab=applications&app=${app_id}`);
        }, 2000);
      } else {
        throw new Error(result.message || 'Application failed');
      }
    } catch (err) {
      setAlertType('error');
      setAlertMessage(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
      setIsAlertModalOpen(true);
    } finally {
      setIsApplying(false);
      setIsConfirmModalOpen(false);
    }
  };

  // Close alert modal
  const handleCloseAlert = () => {
    setIsAlertModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading shortlisted courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">Error loading shortlisted courses</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchShortlistedCourses();
          }}
          className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            My Shortlisted Courses
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your saved courses ready for application
          </p>
        </div>
        
        {/* Summary */}
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {shortlistedCourses.length || 0}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Total Shortlisted</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {shortlistedCourses.filter(course => course.is_popular === 1).length}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Popular</div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {shortlistedCourses.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No shortlisted courses yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Start browsing programs and click the heart icon to add them to your shortlist
          </p>
          <Link
            href="/student/courses"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {/* Cards Grid */}
      {shortlistedCourses.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortlistedCourses.map((course) => (
              <ShortlistedCourseCard 
                key={course.shortlist_id} 
                course={course}
                onApply={handleApplyClick}
                onRemove={handleRemoveFromShortlist}
                isRemoving={removingCourseId === course.id}
              />
            ))}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {shortlistedCourses.length} shortlisted course(s)
          </div>
        </>
      )}

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