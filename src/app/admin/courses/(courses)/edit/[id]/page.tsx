"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Book, Building2, GraduationCap, Calendar, Upload, DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import IntakesManager from "./IntakeManager"; 

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

type Tab = "basics" | "scores" | "details" | "intakes";

interface EditCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

interface CourseIntake {
  id: number;
  intake_id: number;
  course_id: number;
  tenant_id: number;
  intake_year: number;
  is_deleted: number;
  created_at: string;
  intake_name: string;
  deadlines: {
    id: number;
    tenant_id: number;
    course_intake_id: number;
    deadline_type_id: number;
    deadline_date: string;
    extended_date: string | null;
    notes: string;
    is_deleted: number;
    deadline_type: string;
  }[];
}

export default function EditCourse({ params }: EditCoursePageProps) {
  const searchParams = useSearchParams();
  const activeTabFromUrl = searchParams.get("tab");

  const resolvedParams = React.use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false);

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
    
  });

  useEffect(() => {
    if (activeTabFromUrl) {
      setActiveTab(activeTabFromUrl);
    }
  }, [activeTabFromUrl]);

  // Show message and auto-hide after 5 seconds
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Add state to track when all data is loaded
  const [isDataLoaded, setIsDataLoaded] = useState(false);


  // Update your useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setIsLoadingOptions(true);
        setIsDataLoaded(false);
        

        // Fetch all options first
        const optionsPromises = [
          fetch(`${BASE_URL}/tenant/university/names`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/tenant/option/apply_tenant_study_levels`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/tenant/option/apply_tenant_disciplines`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ];

        

        // Wait for all options to load first
        const optionsResults = await Promise.all(optionsPromises);
        
        // Process options data
        const [
          universitiesRes,
          studyLevelsRes,
          disciplinesRes,
        ] = optionsResults;

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

        // Process disciplines
        if (disciplinesRes.ok) {
          const disciplinesData = await disciplinesRes.json();
          setDisciplines(disciplinesData.data || []);
        }

        // Now fetch course data after options are loaded
        const courseRes = await fetch(`${BASE_URL}/tenant/course/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (courseRes.ok) {
          const {data: courseData} = await courseRes.json();
      
         
          const course = courseData?.course;
          const intakes = courseData?.intakes;
     
          if (course) {
            setFormData({
              university_id: course.university_id?.toString() || "",
              study_level_id: course.study_level_id?.toString() || "",
              discipline_id: course.discipline_id?.toString() || "",
              course_name: course.course_name || "",
              is_popular: course.is_popular?.toString() || "0",
              duration_min: course.duration_min?.toString() || "",
              duration_max: course.duration_max?.toString() || "",
              duration_unit: course.duration_unit || "months",
              tuition_fee: course.tuition_fee?.toString() || "",
              currency_code: course.currency_code || "USD",
              application_fee: course.application_fee?.toString() || "",
              
              // Scores
              gre_score: course.gre_score?.toString() || "",
              gmat_score: course.gmat_score?.toString() || "",
              ielts_score: course.ielts_score?.toString() || "",
              toefl_score: course.toefl_score?.toString() || "",
              pte_score: course.pte_score?.toString() || "",
              sat_score: course.sat_score?.toString() || "",
              act_score: course.act_score?.toString() || "",
              duolingo_score: course.duolingo_score?.toString() || "",
              gpa_score: course.gpa_score?.toString() || "",
              
              // Course Details
              about_course: course.about_course || "",
              admission_requirements: course.admission_requirements || "",
              
            });
            
          }

          
          
          setIsDataLoaded(true);
        } else {
          throw new Error('Failed to fetch course data');
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        showMessage('error', 'Failed to load course data. Please try again.');
      } finally {
        setIsLoading(false);
        setIsLoadingOptions(false);
      }
    };

    fetchData();
  }, [token, courseId]);

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
       
      };

      const response = await fetch(`${BASE_URL}/tenant/course/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      showMessage('success', 'Course updated successfully!');
      
      // Redirect back to courses list after 2 seconds
      setTimeout(() => {
        router.push('/admin/courses');
        router.refresh();
      }, 2000);

    } catch (error) {
      console.error('Error updating course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error updating course. Please try again.';
      showMessage('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "basics", label: "Basics", icon: Book },
    { id: "scores", label: "Scores", icon: GraduationCap },
    { id: "details", label: "Details", icon: Calendar },
    { id: "intakes", label: "Intakes", icon: Calendar },
  ];

  // Render loading state
  if (isLoading || !isDataLoaded) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading course data...</p>
        </div>
      </div>
    );
  }

  const renderBasicsTab = () => (
    <div className="space-y-5">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

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
            Duration Min (months)
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
            Duration Max (months)
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
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

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
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

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

  const renderIntakesTab = () => (
     <div className="space-y-5">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <IntakesManager 
        courseId={courseId}
        token={token}
      />
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Edit Course
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update course information and details.
        </p>
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
            {activeTab === "intakes" && renderIntakesTab()}
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

              {activeTab !== "intakes" && (
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

              {activeTab === "intakes" && (
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
                    Updating Course...
                  </>
                ) : (
                  <>
                    Update Course
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
  );
}