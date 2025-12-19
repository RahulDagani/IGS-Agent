"use client"
import React, { useState, useEffect } from "react";
import { Heart, DollarSign, Play, Download } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { City, Country, State } from "country-state-city";
import { useAuth } from "@/context/AuthContext";

interface CourseDetails {
  id: number;
  course_name: string;
  course_slug: string;
  study_level: {
    id: number;
    name: string;
  };
  discipline: {
    id: number;
    name: string;
  };
  duration_min: number;
  duration_max: number;
  duration_unit: string;
  tuition_fee: string;
  currency_code: string;
  application_fee: string;
  about_course: string;
  admission_requirements: string;
  is_popular: number;
  university: {
    id: number;
    name: string;
    slug: string;
    description: string;
    country_code: string;
    state_code: string;
    city_code: string;
    address: string | null;
    map_url: string | null;
    location_url: string | null;
    kind_of_partner_id: number;
    type_of_university_id: number;
    collaboration_type_id: number;
    logo: string;
    image: string;
    brochure: string;
    video_link: string;
    tuition_url: string | null;
    email: string;
  };
  intakes: Array<{
    intake_id: number;
    start_date: string;
    open_date: string;
    submission_deadline: string;
    seat_availability: string;
    turnaround_time: string;
    conversion_rate: string;
    overall_score_label: string;
    overall_score_intent: string;
    intake_created_at: string;
  }>;
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
  onConfirm: () => void;
  course: CourseDetails | null;
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

          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Course:</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{course.course_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">University:</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{course.university.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Study Level:</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{course.study_level.name}</span>
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
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
};

const CourseDetailsPage: React.FC = () => {
  const params = useParams();
  const courseId = params?.programId;
  const studentUserId = params?.id;

  
  const [courseData, setCourseData] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [isShortlisted, setIsShortlisted] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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



  const toggleAccordion = (accordion: string) => {
    setOpenAccordion(openAccordion === accordion ? null : accordion);
  };

  // const handleShortlist = () => {
  //   setIsShortlisted(!isShortlisted);
  //   // Here you would typically make an API call to update the shortlist status
  // };

  const handleApply = async () => {
    setShowConfirmModal(true);
  };

  const handleConfirmApplication = async () => {
    try {
      setIsApplying(true);
      
      // Replace with your actual application submission API
      const response = await fetch(`${BASE_URL}/agent/student/application/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_user_id: studentUserId,
          course_id: courseId,
          
          intake_id: courseData?.intakes[0]?.intake_id,
          study_level_id: courseData?.study_level.id,
        remarks: "Student wants Jan 2026 intake"
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
    
    const country = Country.getCountryByCode(courseData.university.country_code)?.name || courseData.university.country_code;
    const state = State.getStateByCodeAndCountry(courseData.university.state_code, courseData.university.country_code)?.name || courseData.university.state_code;
    const city = City.getCitiesOfState(courseData.university.country_code, courseData.university.state_code)
      .find(city => city.name === courseData.university.city_code)?.name || courseData.university.city_code;
    
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
                  src={"/images/university.jpg"}
                  alt={courseData.university.name}
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
                    {courseData.course_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    at {courseData.university.name} • {locationNames.city}, {locationNames.state}, {locationNames.country}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
                    {courseData.university.description || "No description available."}
                  </p>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Study Level</p>
                    <p className="font-medium text-gray-800 dark:text-white">{courseData.study_level.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {courseData.duration_min}-{courseData.duration_max} {courseData.duration_unit}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tuition Fee</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatCurrency(courseData.tuition_fee, courseData.currency_code)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Application Fee</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatCurrency(courseData.application_fee, courseData.currency_code)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons and Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a
                    href={courseData.university.video_link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Play size={16} />
                    Video Link
                  </a>
                  
                  <a
                    href={courseData.university.brochure || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <Download size={16} />
                    Brochure
                  </a>
                  
                  <a
                    href={courseData.university.tuition_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <DollarSign size={16} />
                    Tuition URL
                  </a>
                  
                  <div className="hidden md:block"></div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-4">
                  {/* <button
                    onClick={handleShortlist}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full border transition-all ${
                      isShortlisted
                        ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Heart size={18} fill={isShortlisted ? "currentColor" : "none"} />
                    {isShortlisted ? "Shortlisted" : "Shortlist"}
                  </button> */}
                  
                  <button
                    onClick={handleApply}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Info Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 px-3 relative">
            <span className="mb-2">Course info</span>
            <span className="absolute bottom-0 left-3 w-6 h-1.5 bg-blue-500 rounded-full mt-1"></span>
          </h2>

          {/* Intakes Section */}
          {courseData.intakes && courseData.intakes.length > 0 && (
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Available Intakes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseData.intakes.map((intake, index) => (
                  <div key={intake.intake_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Start Date:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {formatDate(intake.start_date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Deadline:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {formatDate(intake.submission_deadline)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Availability:</span>
                        <span className={`text-sm font-medium ${
                          intake.seat_availability === "Very High" ? "text-green-600" :
                          intake.seat_availability === "High" ? "text-green-500" :
                          intake.seat_availability === "Medium" ? "text-yellow-500" :
                          "text-red-500"
                        }`}>
                          {intake.seat_availability}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                dangerouslySetInnerHTML={{ __html: courseData.about_course || "No course description available." }}
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
                  dangerouslySetInnerHTML={{ __html: courseData.admission_requirements || "No admission requirements specified." }}
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
                  <h5 className="font-semibold text-gray-800 dark:text-white mb-2">Contact Information</h5>
                  <p className="text-gray-700 dark:text-gray-300">
                    Email: {courseData.university.email || "Not specified"}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Location: {locationNames.city}, {locationNames.state}, {locationNames.country}
                  </p>
                  {courseData.university.address && (
                    <p className="text-gray-700 dark:text-gray-300">
                      Address: {courseData.university.address}
                    </p>
                  )}
                </div>
              </div>
            </AccordionItem>
          </div>

          {/* Map Section */}
          {courseData.university.map_url && (
            <div className="mt-12 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={courseData.university.map_url}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Location of ${courseData.university.name}`}
              />
            </div>
          )}
        </div>
      </section>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmApplication}
        course={courseData}
        loading={isApplying}
      />
    </div>
  );
};

export default CourseDetailsPage;