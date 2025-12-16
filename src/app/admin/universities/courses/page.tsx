"use client"
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import { Edit, Trash, Book, Building2, GraduationCap, Star, DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Country, State } from "country-state-city";

interface Course {
  id: number;
  courseName: string;
  universityName: string;
  discipline: string;
  studyLevel: string;
  applicationFee: string;
  externalEvaluation: "yes" | "no";
  popular: "yes" | "no";
  status: "active" | "inactive";
  createdAt: string;
}

// API Response Interface
interface ApiCourse {
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
  data: ApiCourse[];
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

type SortField = keyof Course | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  discipline_ids: number[];
  study_level_id: number | null; // Changed from array to single value
  university_ids: number[];
  country_codes: string[];
  state_codes: string[];
  city_codes: string[];
  // Removed popular and externalEvaluation filters
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: FilterOptions) => void;
  filtersData: ApiResponse['filters'] | null;
  appliedFilters: FilterOptions;
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
  onFilterChange,
  filtersData,
  appliedFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(appliedFilters);

  // Initialize local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDisciplineChange = (disciplineId: number) => {
    const newDisciplineIds = localFilters.discipline_ids.includes(disciplineId)
      ? localFilters.discipline_ids.filter(id => id !== disciplineId)
      : [...localFilters.discipline_ids, disciplineId];
    
    handleFilterChange({
      ...localFilters,
      discipline_ids: newDisciplineIds
    });
  };

  const handleStudyLevelChange = (studyLevelId: number | null) => {
    handleFilterChange({
      ...localFilters,
      study_level_id: studyLevelId
    });
  };

  const handleUniversityChange = (universityId: number) => {
    const newUniversityIds = localFilters.university_ids.includes(universityId)
      ? localFilters.university_ids.filter(id => id !== universityId)
      : [...localFilters.university_ids, universityId];
    
    handleFilterChange({
      ...localFilters,
      university_ids: newUniversityIds
    });
  };

  const handleCountryChange = (countryCode: string) => {
    const newCountryCodes = localFilters.country_codes.includes(countryCode)
      ? localFilters.country_codes.filter(code => code !== countryCode)
      : [...localFilters.country_codes, countryCode];
    
    handleFilterChange({
      ...localFilters,
      country_codes: newCountryCodes
    });
  };

  const handleStateChange = (stateCode: string) => {
    const newStateCodes = localFilters.state_codes.includes(stateCode)
      ? localFilters.state_codes.filter(code => code !== stateCode)
      : [...localFilters.state_codes, stateCode];
    
    handleFilterChange({
      ...localFilters,
      state_codes: newStateCodes
    });
  };

  const handleCityChange = (cityCode: string) => {
    const newCityCodes = localFilters.city_codes.includes(cityCode)
      ? localFilters.city_codes.filter(code => code !== cityCode)
      : [...localFilters.city_codes, cityCode];
    
    handleFilterChange({
      ...localFilters,
      city_codes: newCityCodes
    });
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      discipline_ids: [],
      study_level_id: null,
      university_ids: [],
      country_codes: [],
      state_codes: [],
      city_codes: [],
    };
    handleFilterChange(resetFilters);
  };

  if (!isOpen || !filtersData) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-999999 justify-center align-middle p-4 px-6 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Courses
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Study Levels Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              Study Levels
            </label>
            <select
              value={localFilters.study_level_id ?? ""}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null;
                handleStudyLevelChange(value);
              }}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="">Select study level</option>
              {filtersData.studyLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          {/* Disciplines Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              Disciplines
            </label>
            <div className="grid grid-cols-2 gap-6 max-h-40 overflow-y-auto">
              {filtersData.disciplines.map((discipline) => (
                <div key={discipline.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`discipline-${discipline.id}`}
                    checked={localFilters.discipline_ids.includes(discipline.id)}
                    onChange={() => handleDisciplineChange(discipline.id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label
                    htmlFor={`discipline-${discipline.id}`}
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {discipline.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          

          {/* Countries Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              Countries
            </label>
            <div className="grid grid-cols-2 gap-6 max-h-40 overflow-y-auto">
              {filtersData.locations.countries.map((country) => (
                <div key={country.country_code} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`country-${country.country_code}`}
                    checked={localFilters.country_codes.includes(country.country_code)}
                    onChange={() => handleCountryChange(country.country_code)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label
                    htmlFor={`country-${country.country_code}`}
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {getCountryName(country.country_code)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* States Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              States
            </label>
            <div className="grid grid-cols-2 gap-6 max-h-40 overflow-y-auto">
              {filtersData.locations.states.map((state) => (
                <div key={state.state_code} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`state-${state.state_code}`}
                    checked={localFilters.state_codes.includes(state.state_code)}
                    onChange={() => handleStateChange(state.state_code)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label
                    htmlFor={`state-${state.state_code}`}
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {state.state_code}
                  </label>
                </div>
              ))}
            </div>
          </div>


          {/* Universities Filter */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              Universities
            </label>
            <div className="grid grid-cols-2 gap-6 max-h-40 overflow-y-auto">
              {filtersData.universities.map((university) => (
                <div key={university.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`university-${university.id}`}
                    checked={localFilters.university_ids.includes(university.id)}
                    onChange={() => handleUniversityChange(university.id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label
                    htmlFor={`university-${university.id}`}
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {university.university}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Cities Filter */}
          {/* <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              Cities
            </label>
            <div className="grid grid-cols-2 gap-6 max-h-40 overflow-y-auto">
              {filtersData.locations.cities.map((city) => (
                <div key={city.city_code} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`city-${city.city_code}`}
                    checked={localFilters.city_codes.includes(city.city_code)}
                    onChange={() => handleCityChange(city.city_code)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label
                    htmlFor={`city-${city.city_code}`}
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {city.city_code}
                  </label>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-hidden focus:ring-2 focus:ring-gray-500/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CoursesTable() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    discipline_ids: [],
    study_level_id: null,
    university_ids: [],
    country_codes: [],
    state_codes: [],
    city_codes: [],
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Build query string from filters
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add pagination
    params.append('page', currentPage.toString());
    params.append('limit', limit.toString());
    
    // Add search term
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    // Add array parameters
    filters.discipline_ids.forEach(id => params.append('discipline_id', id.toString()));
    
    // Add single study level parameter (not array)
    if (filters.study_level_id) {
      params.append('study_level_id', filters.study_level_id.toString());
    }
    
    filters.university_ids.forEach(id => params.append('university_id', id.toString()));
    filters.country_codes.forEach(code => params.append('country_code', code));
    filters.state_codes.forEach(code => params.append('state_code', code));
    filters.city_codes.forEach(code => params.append('city_code', code));
    
    return params.toString();
  }, [filters, currentPage, limit, searchTerm]);

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    if (!token) {
      setError("Authentication token not found");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
      
      const queryString = buildQueryString();
      const url = `${BASE_URL}/tenant/course/list${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        // Transform API data to match Course interface
        const transformedCourses: Course[] = result.data.map((apiCourse: ApiCourse) => ({
          id: apiCourse.id,
          courseName: apiCourse.course_name,
          universityName: apiCourse.university_name,
          discipline: apiCourse.discipline_name,
          studyLevel: apiCourse.study_level_name,
          applicationFee: `${apiCourse.currency_code} ${apiCourse.application_fee}`,
          externalEvaluation: "no", // Default value since not in API
          popular: apiCourse.is_popular === 1 ? "yes" : "no",
          status: apiCourse.is_deleted === 0 ? "active" : "inactive",
          createdAt: apiCourse.created_at,
        }));

        setCourses(transformedCourses);
        setApiResponse(result);
        // Update current page from API response
        setCurrentPage(result.page);
      } else {
        setCourses([]);
        setApiResponse(null);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
      setCourses([]);
      setApiResponse(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, buildQueryString]);

  // Initial fetch
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchCourses();
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Type-safe filter removal functions
  const handleRemoveDisciplineFilter = (id: number) => {
    setFilters(prev => ({
      ...prev,
      discipline_ids: prev.discipline_ids.filter(disciplineId => disciplineId !== id)
    }));
    setCurrentPage(1);
  };

  const handleRemoveStudyLevelFilter = () => {
    setFilters(prev => ({
      ...prev,
      study_level_id: null
    }));
    setCurrentPage(1);
  };

  const handleRemoveUniversityFilter = (id: number) => {
    setFilters(prev => ({
      ...prev,
      university_ids: prev.university_ids.filter(universityId => universityId !== id)
    }));
    setCurrentPage(1);
  };

  const handleRemoveCountryFilter = (code: string) => {
    setFilters(prev => ({
      ...prev,
      country_codes: prev.country_codes.filter(countryCode => countryCode !== code)
    }));
    setCurrentPage(1);
  };

  const handleRemoveStateFilter = (code: string) => {
    setFilters(prev => ({
      ...prev,
      state_codes: prev.state_codes.filter(stateCode => stateCode !== code)
    }));
    setCurrentPage(1);
  };

  const handleRemoveCityFilter = (code: string) => {
    setFilters(prev => ({
      ...prev,
      city_codes: prev.city_codes.filter(cityCode => cityCode !== code)
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      discipline_ids: [],
      study_level_id: null,
      university_ids: [],
      country_codes: [],
      state_codes: [],
      city_codes: [],
    });
    setCurrentPage(1);
  };

  const filteredAndSortedData = useMemo(() => {
    // With real-time API filtering, we don't need client-side filtering anymore
    // We can just return the courses from API
    if (sortField) {
      return [...courses].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return courses;
  }, [courses, sortField, sortDirection]);

  const handleSort = (field: keyof Course) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Course) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusColor = (status: Course["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "primary";
    }
  };

  const getPopularColor = (popular: Course["popular"]) => {
    return popular === "yes" ? "warning" : "primary";
  };

  const getExternalEvaluationColor = (externalEvaluation: Course["externalEvaluation"]) => {
    return externalEvaluation === "yes" ? "info" : "primary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
        const response = await fetch(`${BASE_URL}/tenant/course/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          // Refresh the courses list
          fetchCourses();
        } else {
          throw new Error('Failed to delete course');
        }
      } catch (err) {
        console.error('Error deleting course:', err);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const hasActiveFilters = 
    filters.discipline_ids.length > 0 ||
    filters.study_level_id !== null ||
    filters.university_ids.length > 0 ||
    filters.country_codes.length > 0 ||
    filters.state_codes.length > 0 ||
    filters.city_codes.length > 0;

  // Helper function to get filter name by ID
  const getFilterName = (type: 'discipline' | 'studyLevel' | 'university', id: number): string => {
    if (!apiResponse?.filters) return '';
    
    switch (type) {
      case 'discipline':
        return apiResponse.filters.disciplines.find(d => d.id === id)?.name || '';
      case 'studyLevel':
        return apiResponse.filters.studyLevels.find(s => s.id === id)?.name || '';
      case 'university':
        return apiResponse.filters.universities.find(u => u.id === id)?.university || '';
      default:
        return '';
    }
  };

  // Helper to get study level name
  const getStudyLevelName = (id: number): string => {
    if (!apiResponse?.filters) return '';
    return apiResponse.filters.studyLevels.find(s => s.id === id)?.name || '';
  };

  // Fetch courses when filters or page change
  useEffect(() => {
    fetchCourses();
  }, [filters, currentPage, fetchCourses]);

  // if (isLoading && currentPage === 1) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
  //     </div>
  //   );
  // }

  if (error && currentPage === 1) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button 
          onClick={fetchCourses}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Courses</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {apiResponse?.total || 0}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Courses</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {courses.filter(c => c.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Popular Courses</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {courses.filter(c => c.popular === 'yes').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Universities</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {apiResponse?.filters?.universities.length || 0}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        {/* <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by course name, university, discipline, study level, or fee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div> */}

        {/* Filter Button and Active Filters */}
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All Filters
            </button>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filter Courses
          </button>
          <Link href="/admin/universities/courses/add">
            <button className="dark:border-green-500 h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Course
            </button>
          </Link>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {filters.discipline_ids.map(id => (
            <Badge key={`discipline-${id}`} size="sm" color="primary">
              Discipline: {getFilterName('discipline', id)}
              <button 
                onClick={() => handleRemoveDisciplineFilter(id)}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.study_level_id !== null && (
            <Badge key={`study-level-${filters.study_level_id}`} size="sm" color="primary">
              Study Level: {getStudyLevelName(filters.study_level_id)}
              <button 
                onClick={handleRemoveStudyLevelFilter}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.university_ids.map(id => (
            <Badge key={`university-${id}`} size="sm" color="primary">
              University: {getFilterName('university', id)}
              <button 
                onClick={() => handleRemoveUniversityFilter(id)}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.country_codes.map(code => (
            <Badge key={`country-${code}`} size="sm" color="primary">
              Country: {getCountryName(code)}
              <button 
                onClick={() => handleRemoveCountryFilter(code)}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.state_codes.map(code => (
            <Badge key={`state-${code}`} size="sm" color="primary">
              State: {getStateName(code)}
              <button 
                onClick={() => handleRemoveStateFilter(code)}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.city_codes.map(code => (
            <Badge key={`city-${code}`} size="sm" color="primary">
              City: {code}
              <button 
                onClick={() => handleRemoveCityFilter(code)}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1400px]">
            {isLoading && currentPage > 1 ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {[
                      { key: "id", label: "ID" },
                      { key: "courseName", label: "Course Name" },
                      { key: "universityName", label: "University" },
                      { key: "discipline", label: "Discipline" },
                      { key: "studyLevel", label: "Study Level" },
                      { key: "applicationFee", label: "Application Fee" },
                      { key: "externalEvaluation", label: "Ext. Evaluation" },
                      { key: "popular", label: "Popular" },
                      { key: "status", label: "Status" },
                      { key: "createdAt", label: "Created At" },
                      { key: "action", label: "Action" },
                    ].map(({ key, label }) => (
                      <TableCell
                        key={key}
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => key !== "action" ? handleSort(key as keyof Course) : undefined}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {key !== "action" && (
                            <span className="text-xs">{getSortIcon(key as keyof Course)}</span>
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredAndSortedData.length > 0 ? (
                    filteredAndSortedData.map((course) => (
                      <TableRow key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="px-5 py-4 text-start">
                          <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            #{course.id}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Book size={16} className="text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {course.courseName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-gray-400" />
                            <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                              {course.universityName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge size="sm" color="info">
                            {course.discipline}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-2">
                            <GraduationCap size={14} className="text-gray-400" />
                            <Badge size="sm" color="primary">
                              {course.studyLevel}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-gray-400" />
                            <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                              {course.applicationFee}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            size="sm"
                            color={getExternalEvaluationColor(course.externalEvaluation)}
                          >
                            {course.externalEvaluation === "yes" ? "Required" : "Not Required"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            size="sm"
                            color={getPopularColor(course.popular)}
                          >
                            {course.popular === "yes" ? (
                              <div className="flex items-center gap-1">
                                <Star size={12} className="fill-current" />
                                Popular
                              </div>
                            ) : (
                              "Standard"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            size="sm"
                            color={getStatusColor(course.status)}
                          >
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                            {formatDate(course.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/universities/courses/edit/${course.id}`}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit Course"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Course"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        No courses found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Results Count and Pagination Info */}
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <div>
          Showing {filteredAndSortedData.length} of {apiResponse?.total || 0} courses
          {apiResponse && (
            <span className="ml-2">
              (Page {apiResponse.page} of {apiResponse.totalPages})
            </span>
          )}
        </div>
        {apiResponse && apiResponse.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!apiResponse.hasPrevPage}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              {currentPage} / {apiResponse.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!apiResponse.hasNextPage}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onFilterChange={handleFilterChange}
        filtersData={apiResponse?.filters || null}
        appliedFilters={filters}
      />
    </div>
  );
}