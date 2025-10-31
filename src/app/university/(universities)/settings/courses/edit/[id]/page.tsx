"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Book, Building2, GraduationCap, Calendar, Upload, DollarSign, X } from "lucide-react";

interface CourseFormData {
  // Basics
  courseName: string;
  applicationFee: string;
  universityName: string;
  discipline: string;
  studyLevel: string;
  // intake: string;
  externalEvaluation: "yes" | "no";
  popular: "yes" | "no";
  
  // Scores
  greScore: string;
  gmatScore: string;
  ieltsScore: string;
  toeflScore: string;
  pteScore: string;
  satScore: string;
  actScore: string;
  duolingoScore: string;
  gpaScore: string;
  
  // Gallery
  image1: File | null;
  image2: File | null;
  image3: File | null;
  image4: File | null;
  existingImage1?: string;
  existingImage2?: string;
  existingImage3?: string;
  existingImage4?: string;
  
  // Course Details
  aboutCourse: string;
  applicationDeadline: string;
  applicationProcedure: string;
  admissionRequirements: string;
}

// Mock function to fetch course data
const fetchCourse = async (id: string): Promise<CourseFormData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(id);
  const mockData: CourseFormData = {
    courseName: "Master of Computer Science",
    applicationFee: "$100",
    universityName: "Stanford University",
    discipline: "Computer Science",
    studyLevel: "Postgraduate",
    // intake: "Fall 2024",
    externalEvaluation: "yes",
    popular: "yes",
    greScore: "320",
    gmatScore: "",
    ieltsScore: "7.5",
    toeflScore: "100",
    pteScore: "65",
    satScore: "",
    actScore: "",
    duolingoScore: "120",
    gpaScore: "3.5/4.0",
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    existingImage1: "/images/course1.jpg",
    existingImage2: "/images/course2.jpg",
    aboutCourse: "This Master of Computer Science program provides advanced knowledge in computer science principles and practical applications. Students will engage with cutting-edge research and develop expertise in areas such as artificial intelligence, machine learning, data science, and software engineering. The program is designed for students who want to deepen their technical skills and pursue careers in technology leadership, research, or specialized technical roles.",
    applicationDeadline: "January 15, 2024",
    applicationProcedure: "1. Complete the online application form\n2. Submit official transcripts from all previous institutions\n3. Provide three letters of recommendation\n4. Submit a statement of purpose\n5. Include your resume/CV\n6. Pay the application fee of $100\n7. Submit required test scores (GRE, IELTS/TOEFL)",
    admissionRequirements: "- Bachelor's degree in Computer Science or related field\n- Minimum GPA of 3.0/4.0\n- GRE general test scores (recommended 320+)\n- English proficiency test (IELTS 7.5 or TOEFL 100)\n- Three letters of recommendation\n- Statement of purpose\n- Resume/CV\n- Prerequisite coursework in programming, algorithms, and mathematics",
  };
  
  return mockData;
};

type Tab = "basics" | "scores" | "gallery" | "details";

export default function EditCourse() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [activeTab, setActiveTab] = useState<Tab>("basics");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CourseFormData>({
    // Basics
    courseName: "",
    applicationFee: "",
    universityName: "",
    discipline: "",
    studyLevel: "",
    // intake: "",
    externalEvaluation: "no",
    popular: "no",
    
    // Scores
    greScore: "",
    gmatScore: "",
    ieltsScore: "",
    toeflScore: "",
    pteScore: "",
    satScore: "",
    actScore: "",
    duolingoScore: "",
    gpaScore: "",
    
    // Gallery
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    existingImage1: "",
    existingImage2: "",
    existingImage3: "",
    existingImage4: "",
    
    // Course Details
    aboutCourse: "",
    applicationDeadline: "",
    applicationProcedure: "",
    admissionRequirements: "",
  });

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await fetchCourse(id);
        setFormData(data);
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadCourse();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleRemoveFile = (fieldName: 'image1' | 'image2' | 'image3' | 'image4') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null,
      [`existing${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` as keyof CourseFormData]: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Updated course data:", formData);
      // Here you would typically make an API call to update the course
      // await fetch(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(formData) });
      
      // Redirect back to courses list
      router.push('/admin/courses');
      router.refresh();
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const universities = [
    "Harvard University",
    "Stanford University",
    "MIT",
    "University of Oxford",
    "University of Cambridge",
    "University of Toronto",
    "University of Sydney",
    "Imperial College London"
  ];

  const disciplines = [
    "Computer Science",
    "Business Administration",
    "Engineering",
    "Medicine",
    "Law",
    "Arts & Humanities",
    "Social Sciences",
    "Natural Sciences",
    "Data Science",
    "Marketing"
  ];

  const studyLevels = [
    "Undergraduate",
    "Postgraduate",
    "PhD",
    "Diploma",
    "Certificate",
    "Foundation"
  ];

  // const intakes = [
  //   "Fall 2024",
  //   "Spring 2025",
  //   "Summer 2025",
  //   "Fall 2025",
  //   "Spring 2026",
  //   "Rolling"
  // ];

  const tabs = [
    { id: "basics", label: "Basics", icon: Book },
    { id: "scores", label: "Scores", icon: GraduationCap },
    { id: "gallery", label: "Gallery", icon: Upload },
    { id: "details", label: "Details", icon: Calendar },
  ];

  const renderBasicsTab = () => (
    <div className="space-y-5">
      {/* Course Name */}
      <div>
        <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Course Name *
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Book size={18} />
          </span>
          <input
            type="text"
            id="courseName"
            name="courseName"
            value={formData.courseName}
            onChange={handleInputChange}
            placeholder="Enter course name"
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Application Fee */}
        <div>
          <label htmlFor="applicationFee" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Application Fee *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <DollarSign size={18} />
            </span>
            <input
              type="text"
              id="applicationFee"
              name="applicationFee"
              value={formData.applicationFee}
              onChange={handleInputChange}
              placeholder="e.g., $100 or Free"
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        </div>

        {/* University Name */}
        <div>
          <label htmlFor="universityName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            University Name *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Building2 size={18} />
            </span>
            <select
              id="universityName"
              name="universityName"
              value={formData.universityName}
              onChange={handleInputChange}
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
            >
              <option value="">Select University</option>
              {universities.map(university => (
                <option key={university} value={university}>{university}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Discipline */}
        <div>
          <label htmlFor="discipline" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Discipline *
          </label>
          <select
            id="discipline"
            name="discipline"
            value={formData.discipline}
            onChange={handleInputChange}
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
          >
            <option value="">Select Discipline</option>
            {disciplines.map(discipline => (
              <option key={discipline} value={discipline}>{discipline}</option>
            ))}
          </select>
        </div>

        {/* Study Level */}
        <div>
          <label htmlFor="studyLevel" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Study Level *
          </label>
          <select
            id="studyLevel"
            name="studyLevel"
            value={formData.studyLevel}
            onChange={handleInputChange}
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
          >
            <option value="">Select Study Level</option>
            {studyLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Intake */}
        {/* <div>
          <label htmlFor="intake" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Intake *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Calendar size={18} />
            </span>
            <select
              id="intake"
              name="intake"
              value={formData.intake}
              onChange={handleInputChange}
              required
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
            >
              <option value="">Select Intake</option>
              {intakes.map(intake => (
                <option key={intake} value={intake}>{intake}</option>
              ))}
            </select>
          </div>
        </div> */}

        {/* Popular */}
        <div>
          <label htmlFor="popular" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Popular Course
          </label>
          <select
            id="popular"
            name="popular"
            value={formData.popular}
            onChange={handleInputChange}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>

      {/* External Evaluation */}
      <div>
        <label htmlFor="externalEvaluation" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          External Evaluation Required
        </label>
        <select
          id="externalEvaluation"
          name="externalEvaluation"
          value={formData.externalEvaluation}
          onChange={handleInputChange}
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
    </div>
  );

  const renderScoresTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* GRE Score */}
        <div>
          <label htmlFor="greScore" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            GRE Score
          </label>
          <input
            type="text"
            id="greScore"
            name="greScore"
            value={formData.greScore}
            onChange={handleInputChange}
            placeholder="e.g., 320"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* GMAT Score */}
        <div>
          <label htmlFor="gmatScore" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            GMAT Score
          </label>
          <input
            type="text"
            id="gmatScore"
            name="gmatScore"
            value={formData.gmatScore}
            onChange={handleInputChange}
            placeholder="e.g., 700"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* IELTS Score */}
        <div>
          <label htmlFor="ieltsScore" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            IELTS Score
          </label>
          <input
            type="text"
            id="ieltsScore"
            name="ieltsScore"
            value={formData.ieltsScore}
            onChange={handleInputChange}
            placeholder="e.g., 7.5"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* TOEFL Score */}
        <div>
          <label htmlFor="toeflScore" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            TOEFL Score
          </label>
          <input
            type="text"
            id="toeflScore"
            name="toeflScore"
            value={formData.toeflScore}
            onChange={handleInputChange}
            placeholder="e.g., 100"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* PTE Score */}
        <div>
          <label htmlFor="pteScore" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            PTE Score
          </label>
          <input
            type="text"
            id="pteScore"
            name="pteScore"
            value={formData.pteScore}
            onChange={handleInputChange}
            placeholder="e.g., 65"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* SAT Score */}
        <div>
          <label htmlFor="satScore" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            SAT Score
          </label>
          <input
            type="text"
            id="satScore"
            name="satScore"
            value={formData.satScore}
            onChange={handleInputChange}
            placeholder="e.g., 1400"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* ACT Score */}
        <div>
          <label htmlFor="actScore" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            ACT Score
          </label>
          <input
            type="text"
            id="actScore"
            name="actScore"
            value={formData.actScore}
            onChange={handleInputChange}
            placeholder="e.g., 30"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* Duolingo Score */}
        <div>
          <label htmlFor="duolingoScore" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Duolingo Score
          </label>
          <input
            type="text"
            id="duolingoScore"
            name="duolingoScore"
            value={formData.duolingoScore}
            onChange={handleInputChange}
            placeholder="e.g., 120"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* GPA Score */}
        <div>
          <label htmlFor="gpaScore" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            GPA Score
          </label>
          <input
            type="text"
            id="gpaScore"
            name="gpaScore"
            value={formData.gpaScore}
            onChange={handleInputChange}
            placeholder="e.g., 3.5/4.0"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>
    </div>
  );

  const renderGalleryTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Image 1 */}
        <div>
          <label htmlFor="image1" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Image 1
          </label>
          <div className="flex items-center gap-4">
            {(formData.existingImage1 || formData.image1) ? (
              <div className="relative">
                <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  {formData.image1 ? (
                    <div className="text-center">
                      <Upload size={24} className="text-green-500 mb-2 mx-auto" />
                      <p className="text-xs text-green-600 dark:text-green-400">New image selected</p>
                      <p className="text-xs text-gray-500 truncate px-2">{formData.image1.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={24} className="text-brand-500 mb-2 mx-auto" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Current image</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('image1')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload Image</p>
                </div>
                <input
                  id="image1"
                  name="image1"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recommended: JPG, PNG, min 800x600px
              </p>
              {formData.image1 && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  New file selected: {formData.image1.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Image 2 */}
        <div>
          <label htmlFor="image2" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Image 2
          </label>
          <div className="flex items-center gap-4">
            {(formData.existingImage2 || formData.image2) ? (
              <div className="relative">
                <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  {formData.image2 ? (
                    <div className="text-center">
                      <Upload size={24} className="text-green-500 mb-2 mx-auto" />
                      <p className="text-xs text-green-600 dark:text-green-400">New image selected</p>
                      <p className="text-xs text-gray-500 truncate px-2">{formData.image2.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={24} className="text-brand-500 mb-2 mx-auto" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Current image</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('image2')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload Image</p>
                </div>
                <input
                  id="image2"
                  name="image2"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recommended: JPG, PNG, min 800x600px
              </p>
              {formData.image2 && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  New file selected: {formData.image2.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Image 3 */}
        <div>
          <label htmlFor="image3" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Image 3
          </label>
          <div className="flex items-center gap-4">
            {(formData.existingImage3 || formData.image3) ? (
              <div className="relative">
                <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  {formData.image3 ? (
                    <div className="text-center">
                      <Upload size={24} className="text-green-500 mb-2 mx-auto" />
                      <p className="text-xs text-green-600 dark:text-green-400">New image selected</p>
                      <p className="text-xs text-gray-500 truncate px-2">{formData.image3.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={24} className="text-brand-500 mb-2 mx-auto" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Current image</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('image3')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload Image</p>
                </div>
                <input
                  id="image3"
                  name="image3"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recommended: JPG, PNG, min 800x600px
              </p>
              {formData.image3 && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  New file selected: {formData.image3.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Image 4 */}
        <div>
          <label htmlFor="image4" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Image 4
          </label>
          <div className="flex items-center gap-4">
            {(formData.existingImage4 || formData.image4) ? (
              <div className="relative">
                <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  {formData.image4 ? (
                    <div className="text-center">
                      <Upload size={24} className="text-green-500 mb-2 mx-auto" />
                      <p className="text-xs text-green-600 dark:text-green-400">New image selected</p>
                      <p className="text-xs text-gray-500 truncate px-2">{formData.image4.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={24} className="text-brand-500 mb-2 mx-auto" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Current image</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('image4')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload Image</p>
                </div>
                <input
                  id="image4"
                  name="image4"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recommended: JPG, PNG, min 800x600px
              </p>
              {formData.image4 && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  New file selected: {formData.image4.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="space-y-5">
      {/* About Course */}
      <div>
        <label htmlFor="aboutCourse" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          About the Course *
        </label>
        <textarea
          id="aboutCourse"
          name="aboutCourse"
          value={formData.aboutCourse}
          onChange={handleInputChange}
          placeholder="Describe the course, curriculum, and key features..."
          rows={6}
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
        />
      </div>

      {/* Application Deadline */}
      <div>
        <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Application Deadline *
        </label>
        <input
          type="text"
          id="applicationDeadline"
          name="applicationDeadline"
          value={formData.applicationDeadline}
          onChange={handleInputChange}
          placeholder="e.g., Rolling admission or specific date"
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        />
      </div>

      {/* Application Procedure */}
      <div>
        <label htmlFor="applicationProcedure" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Application Procedure *
        </label>
        <textarea
          id="applicationProcedure"
          name="applicationProcedure"
          value={formData.applicationProcedure}
          onChange={handleInputChange}
          placeholder="Step-by-step application process..."
          rows={4}
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
        />
      </div>

      {/* Admission Requirements */}
      <div>
        <label htmlFor="admissionRequirements" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Admission Requirements *
        </label>
        <textarea
          id="admissionRequirements"
          name="admissionRequirements"
          value={formData.admissionRequirements}
          onChange={handleInputChange}
          placeholder="List all admission requirements, documents needed, and eligibility criteria..."
          rows={6}
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading course data...</p>
          </div>
        </div>
      </div>
    );
  }

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
            {activeTab === "gallery" && renderGalleryTab()}
            {activeTab === "details" && renderDetailsTab()}
          </div>

          {/* Navigation and Submit Buttons */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
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
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}