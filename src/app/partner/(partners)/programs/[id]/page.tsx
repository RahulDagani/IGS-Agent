"use client"
import React, { useState, useEffect } from "react";
import { Heart, DollarSign, Play, Download } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import { useParams } from "next/navigation";
import { City, Country, State } from "country-state-city";
import { useAuth } from "@/context/AuthContext";

interface Course {
  id: number;
  course_name: string;
  course_slug: string;
  study_level_name: string;
  discipline_name: string;
  duration_min: number;
  duration_max: number;
  duration_unit: string;
  tuition_fee: string;
  currency_code: string;
  application_fee: string;
  about_course: string;
  study_level_id: number;
  admission_requirements: string;
  is_popular: number;
  university: string;
  university_slug: string;
  university_country: string;
  university_state: string;
  university_city: string;
  university_logo: string;
  university_logo_url: string;
  university_website: string;
  gre_score: string | null;
  gmat_score: string | null;
  ielts_score: string | null;
  toefl_score: string | null;
  pte_score: string | null;
  sat_score: string | null;
  act_score: string | null;
  duolingo_score: string | null;
  gpa_score: string | null;
}

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

interface CourseDetailsResponse {
  course: Course;
  intakes: Intake[];
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

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (studentId: number, intakeId: number, studyLevelId: number) => void;
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
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [selectedIntakeId, setSelectedIntakeId] = useState<number>(0);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [isFetchingIntakes, setIsFetchingIntakes] = useState(false);
  const [intakesError, setIntakesError] = useState<string | null>(null);
  const [openIntakeDetails, setOpenIntakeDetails] = useState<number | null>(null);

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
      
      const response = await fetch(`${BASE_URL}/agent/course/intake/${courseId}`, {
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
  if (!course) return null;
  console.log(course)
  let studyLevelId = course.study_level_id;
  const handleSubmit = () => {
    if (selectedStudentId === 0) {
      alert("Please select a student");
      return;
    }
    if (selectedIntakeId === 0) {
      alert("Please select an intake");
      return;
    }
    onConfirm(selectedStudentId, selectedIntakeId, studyLevelId);
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

            {/* Student Selection Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Student
              </label>
              {isFetchingStudents ? (
                <div className="flex items-center justify-center p-4">
                  <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Loading students...</span>
                </div>
              ) : studentError ? (
                <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  Error loading students: {studentError}
                </div>
              ) : students.length === 0 ? (
                <div className="text-sm text-yellow-600 dark:text-yellow-400 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  No students found. Please add students first.
                </div>
              ) : (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  disabled={loading}
                >
                  <option value={0}>-- Select a student --</option>
                  {students.map((student) => (
                    <option key={student.user_id} value={student.user_id}>
                      {student.first_name} {student.last_name} - {student.email}
                    </option>
                  ))}
                </select>
              )}
              {/* {students.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {students.length} student(s) available
                </p>
              )} */}
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
                isFetchingStudents || 
                isFetchingIntakes || 
                students.length === 0 || 
                selectedStudentId === 0 || 
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

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen = false, onToggle }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors rounded-lg"
        onClick={onToggle}
      >
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h4>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 text-black dark:text-white bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
};

const CourseDetailsPage: React.FC = () => {
  const params = useParams();
  const courseId = params?.id;
  
const [courseData, setCourseData] = useState<CourseDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const {token} = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/agent/course/${courseId}`,{
          headers:{
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setCourseData(data.data);
        } else {
          throw new Error(data.message || 'Failed to load course data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Fetch students
  const fetchStudents = async () => {
    try {
      setIsFetchingStudents(true);
      setStudentError(null);
      
      const response = await fetch(`${BASE_URL}/agent/student`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load students');
      }
    } catch (err) {
      setStudentError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching students:', err);
    } finally {
      setIsFetchingStudents(false);
    }
  };

  const toggleAccordion = (accordion: string) => {
    setOpenAccordion(openAccordion === accordion ? null : accordion);
  };

  const handleApply = async () => {
    await fetchStudents();
    setShowConfirmModal(true);
  };

const handleConfirmApplication = async (studentId: number, intakeId: number, studyLevelId: number) => {
    try {
      setIsApplying(true);
      
      // Replace with your actual application submission API
      const response = await fetch(`${BASE_URL}/agent/application`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_user_id: studentId,
          course_id: courseId,
          course_intake_id: intakeId,
          study_level_id: studyLevelId,
          remarks: "Student wants to apply for this course"
        })
      });
      
      if (!response.ok) {
        throw new Error(`Application failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert('Application submitted successfully!');
        setShowConfirmModal(false);
      } else {
        throw new Error(data.message || 'Application failed');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Application failed');
      console.error('Error submitting application:', err);
    } finally {
      setIsApplying(false);
    }
  };

  // Helper function to get location names
  const getLocationNames = () => {
    if (!courseData) return { country: '', state: '', city: '' };
    
    const country = Country.getCountryByCode(courseData.course.university_country)?.name || courseData.course.university_country;
    const state = State.getStateByCodeAndCountry(courseData.course.university_state, courseData.course.university_country)?.name || courseData.course.university_state;
    const city = City.getCitiesOfState(courseData.course.university_country, courseData.course.university_state)
      .find(city => city.name === courseData.course.university_city)?.name || courseData.course.university_city;
    
    return { country, state, city };
  };

  // Format currency
  const formatCurrency = (amount: string, currencyCode: string) => {
    if (!amount || amount === "0.00") return "Free";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to render test scores
  const renderTestScores = () => {
    if (!courseData) return null;
    
    const { course } = courseData;
    const scores = [
      { label: 'IELTS', value: course.ielts_score },
      { label: 'TOEFL', value: course.toefl_score },
      { label: 'Duolingo', value: course.duolingo_score },
      { label: 'GRE', value: course.gre_score },
      { label: 'GMAT', value: course.gmat_score },
      { label: 'PTE', value: course.pte_score },
      { label: 'SAT', value: course.sat_score },
      { label: 'ACT', value: course.act_score },
      { label: 'GPA', value: course.gpa_score },
    ].filter(score => score.value !== null);

    if (scores.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Test Score Requirements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {scores.map((score, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{score.label}</p>
              <p className="font-medium text-gray-800 dark:text-white">{score.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading course</div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Course not found</p>
        </div>
      </div>
    );
  }

  const { course } = courseData;
  const locationNames = getLocationNames();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="course-details-head bg-white dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* University Logo */}
              <div className="lg:col-span-1 flex justify-center items-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Image
                  width={500}
                  height={500}
                  src={course.university_logo_url ? course.university_logo_url : "/images/university.jpg"}
                  alt={course.university}
                  className="max-w-full h-auto max-h-32 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/university.jpg";
                  }}
                />
              </div>

              {/* Course Info */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {course.course_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    at {course.university} • {locationNames.city}, {locationNames.state}, {locationNames.country}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
                    {course.study_level_name} in {course.discipline_name}
                  </p>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Study Level</p>
                    <p className="font-medium text-gray-800 dark:text-white">{course.study_level_name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {course.duration_min}-{course.duration_max} {course.duration_unit}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tuition Fee</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatCurrency(course.tuition_fee, course.currency_code)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Application Fee</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatCurrency(course.application_fee, course.currency_code)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons and Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {courseData.intakes[0]?.deadlines[0] && (
                    <a
                      href={course.university_website || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Play size={16} />
                      University Website
                    </a>
                  )}
                  
                  <button
                    onClick={() => window.open(course.university_website, '_blank')}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <Download size={16} />
                    Visit Website
                  </button>
                  
                  <div className="hidden md:block col-span-2"></div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <button
                    onClick={handleApply}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Info Section */}
      <section className="py-6">
        <div className="">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 relative">
            <span className="mb-2">Course info</span>
            <span className="absolute top-6 left-0 w-6 h-1.5 bg-blue-500 rounded-full mt-1"></span>
          </h2>

          

          {/* Intakes Section */}
          {courseData.intakes && courseData.intakes.length > 0 && (
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Available Intakes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseData.intakes.map((intake) => (
                  <div key={intake.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">
                          {intake.intake_name} {intake.intake_year}
                        </h4>
                      </div>
                      
                      {intake.deadlines && intake.deadlines.length > 0 && (
                        <div className="space-y-2">
                          {intake.deadlines.map((deadline) => (
                            <div key={deadline.id} className="border-t border-gray-100 dark:border-gray-700 pt-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {deadline.deadline_type}:
                                </span>
                                <span className="text-sm font-medium text-gray-800 dark:text-white">
                                  {formatDate(deadline.deadline_date)} {deadline.is_closed == 0 ?  <Badge size="sm" color="success">
                                   Open
                
              </Badge> :  <Badge size="sm" color="error">
                
                Closed
              </Badge>}
                                </span>
                              </div>
                              {deadline.extended_date && (
                                <div className="flex justify-between mt-1">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Extended Date:
                                  </span>
                                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                    {formatDate(deadline.extended_date)}
                                  </span>
                                </div>
                              )}
                              {deadline.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Note: {deadline.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Scores Section */}
          {renderTestScores()}

          {/* Accordion Section */}
          <div className="space-y-4">
            {/* About the Course Accordion */}
            <AccordionItem
              title="About the course"
              isOpen={openAccordion === 'about'}
              onToggle={() => toggleAccordion('about')}
            >
              <div 
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: course.about_course || "No course description available." }}
              />
            </AccordionItem>

            {/* Admission Requirements Accordion */}
            <AccordionItem
              title="Admission Requirements"
              isOpen={openAccordion === 'admission'}
              onToggle={() => toggleAccordion('admission')}
            >
              <div className="space-y-4">
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: course.admission_requirements || "No admission requirements specified." }}
                />
              </div>
            </AccordionItem>

            {/* University Details Accordion */}
            <AccordionItem
              title="University Information"
              isOpen={openAccordion === 'university'}
              onToggle={() => toggleAccordion('university')}
            >
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-white mb-2">University Details</h5>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Name:</strong> {course.university}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Location:</strong> {locationNames.city}, {locationNames.state}, {locationNames.country}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Website:</strong>{' '}
                    <a 
                      href={course.university_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {course.university_website}
                    </a>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Discipline:</strong> {course.discipline_name}
                  </p>
                </div>
              </div>
            </AccordionItem>
          </div>
        </div>
      </section>

      {/* Confirm Modal */}
      <ConfirmModal
         isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmApplication}
        course={courseData?.course || null}
        loading={isApplying}
        students={students}
        isFetchingStudents={isFetchingStudents}
        studentError={studentError}
        courseId={String(courseId)}
        token={token}
      />
    </div>
  );
};

export default CourseDetailsPage;