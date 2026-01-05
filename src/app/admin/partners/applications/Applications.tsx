"use client"
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Application {
  id: number;
  uuid: string;
  tenant_id: number;
  agent_id: number;
  student_user_id: number;
  course_id: number;
  course_intake_id: number;
  study_level_id: number;
  current_status_id: number;
  assigned_to: number | null;
  remarks: string | null;
  is_submitted_to_university: number;
  role: string;
  created_by: number;
  created_at: string;
  updated_at: string | null;
  is_deleted: number;
  acknowledgement_no: string;
  date_created: string;
  status_key: string;
  status_label: string;
  status_sort_order: number;
  course_name: string;
  course_slug: string;
  duration_min: number;
  duration_max: number;
  duration_unit: string;
  tuition_fee: string;
  application_fee: string;
  currency_code: string;
  study_level_name: string;
  discipline_id: number;
  discipline_name: string;
  university_name: string;
  university_slug: string;
  university_id: number;
  university_logo: string;
  university_country: string;
  university_state: string;
  university_city: string;
  intake_id: number | null;
  intake_year: string | null;
  intake_name: string | null;
  deadline_date: string | null;
  deadline_type_id: number | null;
  deadline_type_name: string | null;
  student_full_name: string | null;
}

interface FilterOptionsData {
  students: Array<{ id: string; name: string }>;
  universities: Array<{ id: string | number; name: string }>;
  countries: Array<{ id: string; code?: string; name: string }>;
  studyLevels: Array<{ id: string | number; name: string }>;
  disciplines: Array<{ id: string | number; name: string }>;
  courses: Array<{ id: string | number; name: string }>;
  intakeYears: Array<{ id: string; name: string; value: number }>;
  deadlineTypes: Array<{ id: string | number; name: string }>;
  intakes: Array<{ id: string; intake_name: string }>;
  applicationStatus: Array<{ 
    id: string | number; 
    status_key?: string; 
    status_label?: string;
    name?: string;
  }>;
}

interface FilterOptions {
  dateRange: [Date | null, Date | null];
  countries: string[];
  universities: string[];
  intakes: string[];
  years: string[];
  statuses: string[];
  acknowledgeNo: string;
  programName: string;
  studentName: string;
  deadlineType: string | null;
  deadlineDate: [Date | null, Date | null];
  students: string[];
  studyLevels: string[];
  disciplines: string[];
  courses: string[];
}

interface Pagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type SortField = keyof Application | "";
type SortDirection = "asc" | "desc";

export default function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false); // New state for search button loading
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterOptions, setFilterOptions] = useState<FilterOptionsData | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Filter states - these are now UI filters that will be applied only on search
  const [uiFilters, setUiFilters] = useState<FilterOptions>({
    dateRange: [null, null],
    countries: [],
    universities: [],
    intakes: [],
    years: [],
    statuses: [],
    acknowledgeNo: "",
    programName: "",
    studentName: "",
    deadlineType: null,
    deadlineDate: [null, null],
    students: [],
    studyLevels: [],
    disciplines: [],
    courses: [],
  });

  // Active filters that are actually applied to the API
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    dateRange: [null, null],
    countries: [],
    universities: [],
    intakes: [],
    years: [],
    statuses: [],
    acknowledgeNo: "",
    programName: "",
    studentName: "",
    deadlineType: null,
    deadlineDate: [null, null],
    students: [],
    studyLevels: [],
    disciplines: [],
    courses: [],
  });

  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tenant/agent/application/filters/dynamic`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setFilterOptions(data.data.filterOptions);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch filter options');
      }
    };

    if (token) {
      fetchFilterOptions();
    }
  }, [token, BASE_URL]);

  const fetchApplications = async (filtersToApply: FilterOptions = activeFilters) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add pagination params
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      // Add filter params
      if (filtersToApply.students.length > 0 && !filtersToApply.students.includes('all')) {
        filtersToApply.students.forEach(student => {
          params.append('student', student);
        });
      }
      
      if (filtersToApply.countries.length > 0 && !filtersToApply.countries.includes('all')) {
        filtersToApply.countries.forEach(country => {
          params.append('country_code', country);
        });
      }
      
      if (filtersToApply.universities.length > 0 && !filtersToApply.universities.includes('all')) {
        filtersToApply.universities.forEach(university => {
          params.append('university', university);
        });
      }
      
      if (filtersToApply.studyLevels.length > 0 && !filtersToApply.studyLevels.includes('all')) {
        filtersToApply.studyLevels.forEach(level => {
          params.append('level', level);
        });
      }
      
      if (filtersToApply.disciplines.length > 0 && !filtersToApply.disciplines.includes('all')) {
        filtersToApply.disciplines.forEach(discipline => {
          params.append('discipline', discipline);
        });
      }
      
      if (filtersToApply.courses.length > 0 && !filtersToApply.courses.includes('all')) {
        filtersToApply.courses.forEach(course => {
          params.append('course', course);
        });
      }
      
      if (filtersToApply.intakes.length > 0 && !filtersToApply.intakes.includes('all')) {
        filtersToApply.intakes.forEach(intake => {
          params.append('intake', intake);
        });
      }
      
      if (filtersToApply.years.length > 0 && !filtersToApply.years.includes('all')) {
        filtersToApply.years.forEach(year => {
          params.append('year', year);
        });
      }
      
      if (filtersToApply.statuses.length > 0 && !filtersToApply.statuses.includes('all')) {
        filtersToApply.statuses.forEach(status => {
          params.append('applicationStatus', status);
        });
      }
      
      if (filtersToApply.deadlineType && filtersToApply.deadlineType !== 'all') {
        params.append('deadline_type', filtersToApply.deadlineType);
      }
      
      if (filtersToApply.dateRange[0]) {
        params.append('date_created_start', filtersToApply.dateRange[0].toISOString().split('T')[0]);
      }
      
      if (filtersToApply.dateRange[1]) {
        params.append('date_created_end', filtersToApply.dateRange[1].toISOString().split('T')[0]);
      }
      
      if (filtersToApply.deadlineDate[0]) {
        params.append('deadline_date_start', filtersToApply.deadlineDate[0].toISOString().split('T')[0]);
      }
      
      if (filtersToApply.deadlineDate[1]) {
        params.append('deadline_date_end', filtersToApply.deadlineDate[1].toISOString().split('T')[0]);
      }
      
      if (filtersToApply.acknowledgeNo) {
        params.append('acknowledgement_no', filtersToApply.acknowledgeNo);
      }
      
      if (filtersToApply.programName) {
        params.append('program_name', filtersToApply.programName);
      }
      
      if (filtersToApply.studentName) {
        params.append('student_name', filtersToApply.studentName);
      }

      const url = `${BASE_URL}/tenant/agent/applications?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setApplications(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
      setSearchLoading(false); // Also stop search loading when fetch completes
    }
  };

  // Fetch applications from API on initial load and page change
  useEffect(() => {
    if (token) {
      fetchApplications(activeFilters);
    }
  }, [token, BASE_URL, pagination.page, pagination.limit, activeFilters]);

  // Handle UI filter changes - this only updates the UI state, not the API
  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setUiFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle search button click - apply filters to API
  const handleSearch = async () => {
    // Set search loading to true
    setSearchLoading(true);
    
    // Set active filters from UI filters and reset to page 1
    setActiveFilters(uiFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // The useEffect will trigger fetchApplications with the new activeFilters
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Format date to readable string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Application) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('approved') || statusLower.includes('admitted') || statusLower.includes('complete') || statusLower.includes('arrived')) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    } else if (statusLower.includes('pending') || statusLower.includes('incomplete') || statusLower.includes('received') || statusLower.includes('submitted')) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    } else if (statusLower.includes('denied') || statusLower.includes('rejected') || statusLower.includes('withdrawn')) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    } else if (statusLower.includes('applied') || statusLower.includes('documents')) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    } else if (statusLower.includes('visa') || statusLower.includes('i20')) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  // Prepare filter options for Select components
  const countryOptions = filterOptions?.countries?.map(country => ({
    value: country.code || country.id,
    label: country.name
  })) || [];

  const universityOptions = filterOptions?.universities?.map(univ => ({
    value: univ.id.toString(),
    label: univ.name
  })) || [];

  const intakeOptions = filterOptions?.intakes?.map(intake => ({
    value: intake.id,
    label: intake.intake_name
  })) || [];

  const yearOptions = filterOptions?.intakeYears?.map(year => ({
    value: year.id,
    label: year.name
  })) || [];

  const statusOptions = filterOptions?.applicationStatus?.map(status => ({
    value: status.id.toString(),
    label: status.status_label || status.name || 'Unknown'
  })) || [];

  const deadlineTypeOptions = filterOptions?.deadlineTypes?.map(type => ({
    value: type.id.toString(),
    label: type.name
  })) || [];

  const studyLevelOptions = filterOptions?.studyLevels?.map(level => ({
    value: level.id.toString(),
    label: level.name
  })) || [];

  const disciplineOptions = filterOptions?.disciplines?.map(discipline => ({
    value: discipline.id.toString(),
    label: discipline.name
  })) || [];

  const courseOptions = filterOptions?.courses?.map(course => ({
    value: course.id.toString(),
    label: course.name
  })) || [];

  const studentOptions = filterOptions?.students?.map(student => ({
    value: student.id.toString(),
    label: student.name
  })) || [];

  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters: FilterOptions = {
      dateRange: [null, null],
      countries: [],
      universities: [],
      intakes: [],
      years: [],
      statuses: [],
      acknowledgeNo: "",
      programName: "",
      studentName: "",
      deadlineType: null,
      deadlineDate: [null, null],
      students: [],
      studyLevels: [],
      disciplines: [],
      courses: [],
    };
    
    setUiFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setSearchTerm("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && !applications.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-400">Error loading applications</h3>
        </div>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-red-800 dark:text-red-400 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Applications ({pagination.totalRecords})
        </h2>
        <span  className="d-block text-sm text-gray-800 dark:text-white/90">Manage your Students' Applications.</span>
        </div>
        
        <div className="flex items-center gap-3">
          
          {/* <Link href="/partner/programs" className="shrink-0">
            <button className="h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Application
            </button>
          </Link> */}
        </div>
      </div>
      
      <div className="space-y-6">
       

        {/* Filters Section */}
        <div className="MSL-Searchform p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Student Multi-select */}
            <div className="SF-Student all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student
                </label>
                <Select
                  isMulti
                  options={studentOptions}
                  value={studentOptions.filter(option => 
                    uiFilters.students.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('students', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select students"
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                />
              </div>
            </div>

            {/* Country Multi-select */}
            <div className="all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <Select
                  isMulti
                  options={countryOptions}
                  value={countryOptions.filter(option => 
                    uiFilters.countries.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('countries', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select countries"
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                />
              </div>
            </div>

            {/* University Multi-select */}
            <div className="SF-University all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  University
                </label>
                <Select
                  isMulti
                  options={universityOptions}
                  value={universityOptions.filter(option => 
                    uiFilters.universities.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('universities', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select universities"
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                />
              </div>
            </div>

            {/* Study Level Multi-select */}
            <div className="SF-StudyLevel all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Study Level
                </label>
                <Select
                  isMulti
                  options={studyLevelOptions}
                  value={studyLevelOptions.filter(option => 
                    uiFilters.studyLevels.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('studyLevels', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select study levels"
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                />
              </div>
            </div>

            {/* Discipline Multi-select */}
            <div className="SF-Discipline all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discipline
                </label>
                <Select
                  isMulti
                  options={disciplineOptions}
                  value={disciplineOptions.filter(option => 
                    uiFilters.disciplines.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('disciplines', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select disciplines"
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                />
              </div>
            </div>

            {/* Course Multi-select */}
            <div className="SF-Course all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course
                </label>
                <Select
                  isMulti
                  options={courseOptions}
                  value={courseOptions.filter(option => 
                    uiFilters.courses.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('courses', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select courses"
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                />
              </div>
            </div>

            {/* Intake Multi-select */}
            <div className="SF-Intake all-countries">
              <div className="form-group calendar-two">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Intake
                </label>
                <Select
                  isMulti
                  options={intakeOptions}
                  value={intakeOptions.filter(option => 
                    uiFilters.intakes.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('intakes', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select intakes"
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                />
              </div>
            </div>

            {/* Year Multi-select */}
            <div className="SF-year all-countries">
              <div className="form-group calendar-two">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year
                </label>
                <Select
                  isMulti
                  options={yearOptions}
                  value={yearOptions.filter(option => 
                    uiFilters.years.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('years', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select years"
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                />
              </div>
            </div>

            {/* Status Multi-select */}
            <div className="SF-Status all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <Select
                  isMulti
                  options={statusOptions}
                  value={statusOptions.filter(option => 
                    uiFilters.statuses.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('statuses', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select statuses"
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                />
              </div>
            </div>

            {/* Date Created */}
            <div className="SF-DateApp">
              <div className="form-group calendar-one">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Created
                </label>
                <DatePicker
                  selected={uiFilters.dateRange[0]}
                  onChange={(dates: [Date | null, Date | null]) => handleFilterChange('dateRange', dates)}
                  startDate={uiFilters.dateRange[0]}
                  endDate={uiFilters.dateRange[1]}
                  selectsRange
                  isClearable
                  placeholderText="Select date range"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  dateFormat="dd-MM-yyyy"
                />
              </div>
            </div>

            {/* Acknowledgement No. */}
            <div className="SF-Keyword">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Acknowledgement No.
                </label>
                <input
                  type="text"
                  placeholder="Acknowledgement No."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={uiFilters.acknowledgeNo}
                  onChange={(e) => handleFilterChange('acknowledgeNo', e.target.value)}
                />
              </div>
            </div>

            {/* Program Name */}
            <div className="SF-Keyword">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program Name
                </label>
                <input
                  type="text"
                  placeholder="Program Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={uiFilters.programName}
                  onChange={(e) => handleFilterChange('programName', e.target.value)}
                />
              </div>
            </div>

            {/* Student Name */}
            <div className="SF-Keyword">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  placeholder="Student Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={uiFilters.studentName}
                  onChange={(e) => handleFilterChange('studentName', e.target.value)}
                />
              </div>
            </div>

            {/* Deadline Type */}
            <div className="SF-Intake all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deadline Type
                </label>
                <Select
                  options={deadlineTypeOptions}
                  value={deadlineTypeOptions.find(option => option.value === uiFilters.deadlineType)}
                  onChange={(selectedOption) => {
                    handleFilterChange('deadlineType', selectedOption?.value || null);
                  }}
                  placeholder="Select deadline type"
                  className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                      minHeight: '42px',
                    }),
                  }}
                  isClearable
                />
              </div>
            </div>

            {/* Deadline Date */}
            <div className="SF-DateApp">
              <div className="form-group calendar-one">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deadline Date
                </label>
                <DatePicker
                  selected={uiFilters.deadlineDate[0]}
                  onChange={(dates: [Date | null, Date | null]) => handleFilterChange('deadlineDate', dates)}
                  startDate={uiFilters.deadlineDate[0]}
                  endDate={uiFilters.deadlineDate[1]}
                  selectsRange
                  isClearable
                  placeholderText="Select deadline date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  dateFormat="dd-MM-yyyy"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="SF-Searchbtn mt-6">
            <div className="form-group flex justify-end">
              <button
            onClick={clearAllFilters}
            className="h-11 mr-2 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Clear Filters
          </button>
              <button
                type="button"
                className={`px-6 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center min-w-[100px] ${
                  searchLoading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                onClick={handleSearch}
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Show table loading overlay when data is being fetched */}
        {loading && (
          <div className="relative">
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading applications...</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {applications.length} of {pagination.totalRecords} applications
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1200px]">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {[
                      { key: "acknowledgement_no", label: "Acknowledge No." },
                      { key: "date_created", label: "Date Created" },
                      { key: "student_full_name", label: "Student Name" },
                      { key: "university_name", label: "University Name" },
                      { key: "course_name", label: "Program Name" },
                      { key: "intake_name", label: "Intake" },
                      { key: "study_level_name", label: "Study Level" },
                      { key: "status_label", label: "Application Status" },
                    ].map(({ key, label }) => (
                      <TableCell
                        key={key}
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort(key as keyof Application)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          <span className="text-xs">{getSortIcon(key as keyof Application)}</span>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {applications.length > 0 ? (
                    applications.map((application) => (
                      <TableRow key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300 font-medium">
                          <Link href={`/partner/editProfile/${application.student_user_id}?tab=applications&app=${application.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {application.acknowledgement_no}
                          </Link>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                          {formatDate(application.date_created)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300 font-medium">
                          <Link href={`/partner/editProfile/${application.student_user_id}`}>
                            {application.student_full_name || 'N/A'}
                          </Link>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                          {application.university_name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                          {application.course_name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                          {application.intake_name || 'N/A'}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                          {application.study_level_name}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(application.status_label)}`}>
                            {application.status_label}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                       
                        className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        No applications found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} applications
          </div>
          
          <div className="flex items-center gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
              >
                {[10, 20, 50, 100].map(limit => (
                  <option key={limit} value={limit}>{limit}</option>
                ))}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">per page</span>
            </div>
            
            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  pagination.hasPrevPage
                    ? 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                <>
                  <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  pagination.hasNextPage
                    ? 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}