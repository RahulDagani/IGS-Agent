'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/site/Header';
import Select from 'react-select';
import Footer from '@/components/site/Footer';
import { Search } from 'lucide-react';

interface University {
  logo: string;
  university: string;
  address: string;
  description: string;
  video_link: string;
  brocher: string;
  tution_url: string;
  kind_of_partners: string;
  type_of_university: string;
  university_slug: string;
}

interface Article {
  id: number;
  slug: string;
  title: string;
  image_url: string;
  url: string;
}

interface Discipline {
  discipline_slug: string;
  discipline: string;
}

interface Course {
  course_slug: string;
  course: string;
}

interface Country {
  country_slug: string;
  country: string;
}

interface State {
  state_slug: string;
  state: string;
}

interface Intake {
  intake: string;
}

interface UniversitySearchComponentProps {
  initialData?: {
    universities: University[];
    news: Article[];
    webinars: Article[];
    disciplines: Discipline[];
    courses: Course[];
    countries: Country[];
    states: State[];
    intakes: Intake[];
    current_page: number;
    total_pages: number;
    limit: number;
  };
  initialParams?: {
    study_level?: string;
    discipline?: string;
    country?: string;
    course?: string[];
  };
}

// Default/fallback data
const defaultData = {
  universities: [],
  news: [],
  webinars: [],
  disciplines: [],
  courses: [],
  countries: [],
  states: [],
  intakes: [],
  current_page: 1,
  total_pages: 1,
  limit: 10,
};

// Custom styles for react-select
const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '48px',
    borderRadius: '8px',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#3b82f6',
    },
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    zIndex: 50,
  }),
  menuList: (base: any) => ({
    ...base,
    padding: 0,
    borderRadius: '8px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:active': {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#eff6ff',
    borderRadius: '20px',
    padding: '2px 6px',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: '#1e40af',
    fontWeight: '500',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#1e40af',
    ':hover': {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
    },
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#9ca3af',
  }),
};

const UniversitySearchComponent = ({ initialData, initialParams }: UniversitySearchComponentProps) => {
  const router = useRouter();
  
  // Merge provided data with defaults
  const data = initialData || defaultData;
  
  // State for filters
  const [universalSearch, setUniversalSearch] = useState('');
  const [selectedStudyLevel, setSelectedStudyLevel] = useState<{ value: string; label: string }[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<{ value: string; label: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<{ value: string; label: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string }[]>([]);
  const [selectedState, setSelectedState] = useState<{ value: string; label: string }[]>([]);
  const [selectedIntake, setSelectedIntake] = useState<{ value: string; label: string }[]>([]);
  const [selectedUniversityType, setSelectedUniversityType] = useState<{ value: string; label: string }[]>([]);
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(data.current_page);
  const [universities, setUniversities] = useState<University[]>(data.universities || []);
  const [totalPages, setTotalPages] = useState(data.total_pages || 1);

  // Static study level options
  const studyLevelOptions = [
    { value: 'bachelors', label: "Bachelor's Degree" },
    { value: 'masters', label: "Master's Degree" },
    { value: 'phd', label: 'PhD' },
    { value: 'diploma', label: 'Diploma' },
  ];

  // Transform data for react-select
  const disciplineOptions = (data.disciplines || []).map(discipline => ({
    value: discipline.discipline_slug,
    label: discipline.discipline
  }));

  const courseOptions = (data.courses || []).map(course => ({
    value: course.course_slug,
    label: course.course
  }));

  const countryOptions = (data.countries || []).map(country => ({
    value: country.country_slug,
    label: country.country
  }));

  const stateOptions = (data.states || []).map(state => ({
    value: state.state_slug,
    label: state.state
  }));

  const intakeOptions = (data.intakes || []).map(intake => ({
    value: intake.intake,
    label: intake.intake
  }));

  const universityTypeOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' }
  ];

  // Get initial values from initialParams (instead of useSearchParams)
  useEffect(() => {
    if (initialParams) {
      const { study_level, discipline, country, course } = initialParams;
      
      if (study_level) {
        const option = studyLevelOptions.find(opt => opt.value === study_level);
        if (option) setSelectedStudyLevel([option]);
      }
      if (discipline) {
        const option = disciplineOptions.find(opt => opt.value === discipline);
        if (option) setSelectedDiscipline([option]);
      }
      if (country) {
        const option = countryOptions.find(opt => opt.value === country);
        if (option) setSelectedCountry([option]);
      }
      if (course && course.length > 0) {
        const selectedCourses = course
          .map(c => courseOptions.find(opt => opt.value === c))
          .filter(Boolean) as { value: string; label: string }[];
        setSelectedCourse(selectedCourses);
      }
    }
  }, [initialParams]);

  // Update local state when data prop changes
  useEffect(() => {
    if (initialData) {
      setUniversities(initialData.universities || []);
      setCurrentPage(initialData.current_page || 1);
      setTotalPages(initialData.total_pages || 1);
    }
  }, [initialData]);

  // Handle filter submission
  const handleFilterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Build query params
    const params = new URLSearchParams();
    
    if (universalSearch) params.append('universal_search', universalSearch);
    selectedStudyLevel.forEach(level => params.append('study_level[]', level.value));
    selectedDiscipline.forEach(disc => params.append('discipline[]', disc.value));
    selectedCourse.forEach(course => params.append('course[]', course.value));
    selectedCountry.forEach(country => params.append('country[]', country.value));
    selectedState.forEach(state => params.append('state[]', state.value));
    selectedIntake.forEach(intake => params.append('intake[]', intake.value));
    selectedUniversityType.forEach(type => params.append('type[]', type.value));
    
    // Simulate filtering
    setTimeout(() => {
      const filtered = data.universities.filter(uni => {
        let match = true;
        
        // Filter by search term
        if (universalSearch) {
          const searchTerm = universalSearch.toLowerCase();
          match = match && (
            uni.university.toLowerCase().includes(searchTerm) ||
            uni.description.toLowerCase().includes(searchTerm) ||
            uni.address.toLowerCase().includes(searchTerm)
          );
        }
        
        // Filter by selected values (simulated logic)
        if (selectedCountry.length > 0) {
          // In real app, you would check university.country against selectedCountry
          // match = match && selectedCountry.some(country => uni.country === country.value);
        }
        
        return match;
      });
      
      setUniversities(filtered);
      setCurrentPage(1);
      setLoading(false);
      setShowFilterForm(false);
    }, 500);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    setLoading(true);
    
    setTimeout(() => {
      const startIndex = (page - 1) * data.limit;
      const endIndex = startIndex + data.limit;
      const paginatedData = data.universities.slice(startIndex, endIndex);
      
      setUniversities(paginatedData);
      setLoading(false);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  // Reset filters
  const handleResetFilters = () => {
    setUniversalSearch('');
    setSelectedStudyLevel([]);
    setSelectedDiscipline([]);
    setSelectedCourse([]);
    setSelectedCountry([]);
    setSelectedState([]);
    setSelectedIntake([]);
    setSelectedUniversityType([]);
    setUniversities(data.universities || []);
    setCurrentPage(1);
  };

  // Toggle filter form on mobile
  const toggleFilterForm = () => {
    setShowFilterForm(!showFilterForm);
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    pages.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="page-link px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
          disabled={currentPage === 1}
        >
          Previous
        </button>
      </li>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <li key={1} className="page-item">
          <button
            onClick={() => handlePageChange(1)}
            className="page-link px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            1
          </button>
        </li>
      );
      if (startPage > 2) {
        pages.push(
          <li key="dots-start" className="page-item disabled">
            <span className="page-link px-4 py-2 bg-white border border-gray-300">...</span>
          </li>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button
            onClick={() => handlePageChange(i)}
            className={`page-link px-4 py-2 ${
              currentPage === i
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <li key="dots-end" className="page-item disabled">
            <span className="page-link px-4 py-2 bg-white border border-gray-300">...</span>
          </li>
        );
      }
      pages.push(
        <li key={totalPages} className="page-item">
          <button
            onClick={() => handlePageChange(totalPages)}
            className="page-link px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </li>
      );
    }

    // Next button
    pages.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="page-link px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </li>
    );

    return pages;
  };

  return (
    <>
      <Header />
      <div className="main-div-search-panel bg-gray-50 min-h-screen">
        <div className="main-uni-course flex flex-col lg:flex-row max-w-7xl mx-auto">
          {/* Left Filter Sidebar */}
          <section className="left11-form lg:w-2/6 p-4 lg:p-6">
            <div className="university-side-form sticky top-4">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  type="button"
                  onClick={toggleFilterForm}
                  className="flex items-center justify-center gap-2 px-4 py-3 w-full bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <i className="ri-filter-line ri-lg"></i>
                  {showFilterForm ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              {/* Filter Form */}
              <form
                id="filter-form"
                onSubmit={handleFilterSubmit}
                className={`${showFilterForm ? 'block' : 'hidden'} lg:block space-y-6 bg-white p-5 rounded-xl shadow-lg border border-gray-100`}
              >
                {/* Universal Search */}
                <div className="switch-program">
                  <div className="relative">
                    <input
                      type="text"
                      id="universal_search"
                      value={universalSearch}
                      onChange={(e) => setUniversalSearch(e.target.value)}
                      placeholder="Search universities..."
                      className="w-full px-2 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <Search size={18} className="ri-search-line absolute left-3 top-4 text-gray-400"/>
                   
                  </div>
                </div>

                {/* Study Level */}
                <div className="switch-program">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Level
                  </label>
                  <Select
                    isMulti
                    options={studyLevelOptions}
                    value={selectedStudyLevel}
                    onChange={(selected) => setSelectedStudyLevel(selected as any)}
                    placeholder="Select study levels..."
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                  />
                </div>

                {/* Discipline */}
                <div className="switch-program">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discipline
                  </label>
                  <Select
                    isMulti
                    options={disciplineOptions}
                    value={selectedDiscipline}
                    onChange={(selected) => setSelectedDiscipline(selected as any)}
                    placeholder="Select disciplines..."
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                  />
                </div>

                {/* Course */}
                <div className="switch-program">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <Select
                    isMulti
                    options={courseOptions}
                    value={selectedCourse}
                    onChange={(selected) => setSelectedCourse(selected as any)}
                    placeholder="Select courses..."
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                  />
                </div>

                {/* Country */}
                <div className="switch-program">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Select
                    isMulti
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={(selected) => setSelectedCountry(selected as any)}
                    placeholder="Select countries..."
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                  />
                </div>

                {/* State */}
                <div className="switch-program">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Select
                    isMulti
                    options={stateOptions}
                    value={selectedState}
                    onChange={(selected) => setSelectedState(selected as any)}
                    placeholder="Select states..."
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                  />
                </div>

                {/* Intake */}
                <div className="switch-program">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intake
                  </label>
                  <Select
                    isMulti
                    options={intakeOptions}
                    value={selectedIntake}
                    onChange={(selected) => setSelectedIntake(selected as any)}
                    placeholder="Select intakes..."
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                  />
                </div>

                {/* University Type */}
                <div className="switch-program">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Type
                  </label>
                  <Select
                    isMulti
                    options={universityTypeOptions}
                    value={selectedUniversityType}
                    onChange={(selected) => setSelectedUniversityType(selected as any)}
                    placeholder="Select university types..."
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    <i className="ri-chat-check-line"></i>
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm hover:shadow-md"
                  >
                    Reset
                  </button>
                </div>
              </form>

              {/* News Section - Desktop */}
              <div className="hidden lg:block mt-8">
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 border-b">
                    <p className="font-bold text-gray-800 mb-0 flex items-center gap-2">
                      <i className="ri-newspaper-line text-blue-600"></i>
                      Latest News
                    </p>
                  </div>
                  {(data.news || []).map((article) => (
                    <Link
                      key={article.id}
                      href={`/news/${article.slug}/${article.id}`}
                      className="block border-b last:border-b-0 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="p-3">
                        <p className="text-gray-800 mb-0 line-clamp-2 text-sm group-hover:text-blue-700 transition-colors">
                          {article.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Webinars Section - Desktop */}
              <div className="hidden lg:block mt-6">
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 border-b">
                    <p className="font-bold text-gray-800 mb-0 flex items-center gap-2">
                      <i className="ri-video-line text-red-600"></i>
                      Student Testimonials
                    </p>
                  </div>
                  {(data.webinars || []).map((webinar) => (
                    <Link
                      key={webinar.id}
                      href={`/webinar/${webinar.slug}/${webinar.id}`}
                      target="_blank"
                      className="block border-b last:border-b-0 hover:bg-red-50 transition-colors group"
                    >
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-gray-800 mb-2 text-sm group-hover:text-red-700 transition-colors">
                              {webinar.title}
                            </p>
                            {webinar.url && (
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full hover:from-red-700 hover:to-red-800 transition-all shadow-sm">
                                  Watch Now
                                  <i className="ri-youtube-line"></i>
                                </span>
                              </div>
                            )}
                          </div>
                          {!webinar.url && webinar.image_url && (
                            <div className="ml-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-gray-100">
                                <Image
                                  src={webinar.image_url}
                                  alt={webinar.title}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="top-section flex-1 p-4 lg:p-6">
            <div className="university-section">
              {/* Results Count */}
              {/* <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Universities</h1>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold text-blue-600">{universities.length}</span> of{' '}
                    <span className="font-semibold text-gray-800">{data.universities?.length || 0}</span> universities
                  </p>
                  {selectedStudyLevel.length > 0 || selectedDiscipline.length > 0 || selectedCourse.length > 0 ? (
                    <div className="text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <i className="ri-filter-line"></i>
                        {selectedStudyLevel.length + selectedDiscipline.length + selectedCourse.length} filters active
                      </span>
                    </div>
                  ) : null}
                </div>
              </div> */}

              {/* Loader */}
              {loading && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <div className="inline-flex items-center justify-center w-12 h-12 animate-spin mb-4">
                    <i className="ri-loader-line ri-2x text-blue-600"></i>
                  </div>
                  <p className="text-gray-600">Loading universities...</p>
                </div>
              )}

              {/* Universities List */}
              {!loading && universities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <div className="text-gray-300 mb-4">
                    <i className="ri-search-line ri-4x"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No universities found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div id="results-container" className="space-y-6">
                  {universities.map((university, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* University Logo */}
                          <div className="lg:w-1/6 flex-shrink-0">
                            <div className="w-32 h-32 mx-auto lg:mx-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center p-4 ring-2 ring-gray-100">
                              {university.logo ? (
                                <Image
                                  src={`/images/site/igslogo.png`}
                                  alt={university.university}
                                  width={120}
                                  height={120}
                                  className="object-contain"
                                />
                              ) : (
                                <div className="text-gray-300 text-center">
                                  <i className="ri-building-line ri-4x"></i>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* University Details */}
                          <div className="flex-1">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-900">
                                {university.university}
                              </h3>
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                                <i className="ri-building-line"></i>
                                {university.type_of_university || 'University'}
                              </span>
                            </div>
                            
                            {university.address && (
                              <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(university.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-start gap-2 text-gray-600 mb-3 hover:text-blue-600 transition-colors"
                              >
                                <i className="ri-map-pin-line mt-0.5"></i>
                                <span>{university.address}</span>
                              </a>
                            )}
                            
                            {university.description && (
                              <p className="text-gray-700 text-sm mb-5 line-clamp-3">
                                {university.description}
                              </p>
                            )}

                            {/* University Features */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                              {university.video_link && (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={university.video_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                  >
                                    <i className="ri-video-line"></i>
                                    Video Link
                                  </a>
                                </div>
                              )}
                              
                              {university.brocher && (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`/assets/brochers/university-brocher/${university.brocher}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                  >
                                    <i className="ri-file-line"></i>
                                    Brochure
                                  </a>
                                </div>
                              )}
                              
                              {university.tution_url && (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={university.tution_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                  >
                                    <i className="ri-money-dollar-circle-line"></i>
                                    Tuition URL
                                  </a>
                                </div>
                              )}
                              
                              {university.kind_of_partners && (
                                <div className="flex items-center gap-2 text-gray-700 text-sm">
                                  <i className="ri-group-line"></i>
                                  <span>{university.kind_of_partners}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-end lg:col-span-1 md:col-span-2">
                                <Link
                                  href={`/universities/1`}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:from-gray-900 hover:to-black transition-all shadow-sm hover:shadow-md"
                                >
                                  View Programs
                                  <i className="ri-arrow-right-line"></i>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && !loading && (
                <div className="mt-8">
                  <nav>
                    <ul className="flex flex-wrap items-center justify-center gap-2">
                      {renderPagination()}
                    </ul>
                  </nav>
                </div>
              )}

              {/* Mobile News Section */}
              <div className="lg:hidden mt-8">
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 border-b">
                    <p className="font-bold text-gray-800 mb-0 flex items-center gap-2">
                      <i className="ri-newspaper-line text-blue-600"></i>
                      Latest News
                    </p>
                  </div>
                  {(data.news || []).map((article) => (
                    <Link
                      key={article.id}
                      href={`/news/${article.slug}/${article.id}`}
                      className="block border-b last:border-b-0 hover:bg-blue-50 transition-colors"
                    >
                      <div className="p-3">
                        <p className="text-gray-800 mb-0 text-sm">{article.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Webinars Section */}
              <div className="lg:hidden mt-6">
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 border-b">
                    <p className="font-bold text-gray-800 mb-0 flex items-center gap-2">
                      <i className="ri-video-line text-red-600"></i>
                      Student Testimonials
                    </p>
                  </div>
                  {(data.webinars || []).map((webinar) => (
                    <Link
                      key={webinar.id}
                      href={`/webinar/${webinar.slug}/${webinar.id}`}
                      target="_blank"
                      className="block border-b last:border-b-0 hover:bg-red-50 transition-colors"
                    >
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-gray-800 mb-2 text-sm">{webinar.title}</p>
                            {webinar.url && (
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full hover:from-red-700 hover:to-red-800 transition-all">
                                  Watch Now
                                  <i className="ri-youtube-line"></i>
                                </span>
                              </div>
                            )}
                          </div>
                          {!webinar.url && webinar.image_url && (
                            <div className="ml-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden">
                                <Image
                                  src={webinar.image_url}
                                  alt={webinar.title}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UniversitySearchComponent;