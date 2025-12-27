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

type SortField = keyof Student | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  dateRange: [Date | null, Date | null];
  countries: string[];
  intakes: string[];
  years: string[];
  statuses: string[];
  keyword: string;
}

export default function StudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: [null, null],
    countries: [],
    intakes: [],
    years: [],
    statuses: [],
    keyword: "",
  });

  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Static data for filters
  const countryOptions = [
    { value: "1", label: "United States of America" },
    { value: "2", label: "Australia" },
    { value: "3", label: "Canada" },
    { value: "4", label: "United Kingdom" },
    { value: "5", label: "New Zealand" },
    { value: "6", label: "Singapore" },
    { value: "7", label: "United Arab Emirates" },
    { value: "8", label: "Ireland" },
    { value: "9", label: "Germany" },
    { value: "10", label: "France" },
    { value: "11", label: "Sweden" },
    { value: "12", label: "Netherlands" },
    { value: "13", label: "Austria" },
    { value: "14", label: "Denmark" },
    { value: "15", label: "Finland" },
    { value: "16", label: "Italy" },
    { value: "17", label: "Hungary" },
    { value: "18", label: "Switzerland" },
    { value: "19", label: "Spain" },
    { value: "20", label: "Lithuania" },
    { value: "22", label: "Cyprus" },
    { value: "23", label: "Poland" },
    { value: "25", label: "Malaysia" },
    { value: "26", label: "Mauritius" },
    { value: "32", label: "China" },
    { value: "35", label: "Vietnam" },
    { value: "37", label: "Malta" },
    { value: "38", label: "Japan" },
    { value: "39", label: "Belgium" },
    { value: "40", label: "Russia" },
    { value: "41", label: "South Korea" },
    { value: "45", label: "India" },
    { value: "46", label: "Georgia" },
    { value: "48", label: "Monaco" },
    { value: "49", label: "Croatia" },
    { value: "50", label: "Indonesia" },
    { value: "51", label: "Kazakhstan" },
    { value: "52", label: "Saudi Arabia" },
    { value: "53", label: "Latvia" },
    { value: "54", label: "Sri Lanka" },
    { value: "55", label: "Thailand" },
    { value: "57", label: "Luxembourg" },
    { value: "58", label: "Greece" },
  ];

  const intakeOptions = [
    { value: "Jan", label: "Jan" },
    { value: "Feb", label: "Feb" },
    { value: "Mar", label: "Mar" },
    { value: "Apr", label: "Apr" },
    { value: "May", label: "May" },
    { value: "Jun", label: "Jun" },
    { value: "Jul", label: "Jul" },
    { value: "Aug", label: "Aug" },
    { value: "Sep", label: "Sep" },
    { value: "Oct", label: "Oct" },
    { value: "Nov", label: "Nov" },
    { value: "Dec", label: "Dec" },
    { value: "Spring", label: "Spring" },
    { value: "Summer", label: "Summer" },
    { value: "Fall", label: "Fall" },
    { value: "Winter", label: "Winter" },
  ];

  const yearOptions = [
    { value: "2020", label: "2020" },
    { value: "2021", label: "2021" },
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
  ];

  const statusOptions = [
    { value: "1", label: "Received Application at Igs" },
    { value: "2", label: "Application in Progress" },
    { value: "38", label: "Application on Hold - Intake yet to open" },
    { value: "3", label: "Application on Hold - Igs team" },
    { value: "8", label: "Application on Hold - University" },
    { value: "95", label: "Application on Hold - Pre-Assessment Pending" },
    { value: "23", label: "Pending from Partner" },
    { value: "40", label: "Pending from Partner - Login Credentials" },
    { value: "41", label: "Pending from Partner - Academic Documents" },
    { value: "42", label: "Pending from Partner - Financial Documents" },
    { value: "79", label: "Pending from Partner - Application Fee Pending" },
    { value: "89", label: "Pending from Partner - Interview" },
    { value: "43", label: "Pending from Igs" },
    { value: "4", label: "Application submitted to the Institution" },
    { value: "80", label: "Application Submitted - Consent Form/Student ID Required" },
    { value: "81", label: "Application Submitted - Under Review" },
    { value: "91", label: "Requirements met for Assessment" },
    { value: "7", label: "Rejected by Institution" },
    { value: "5", label: "Conditional Offer Received" },
    { value: "97", label: "Un-Conditional offer awaited from the University" },
    { value: "6", label: "Un-conditional Offer Received" },
    { value: "58", label: "Funds - Pending from Partner" },
    { value: "61", label: "Funds - On hold by the Institution" },
    { value: "60", label: "Funds - Submitted to the Institution" },
    { value: "13", label: "Funds - Under Assessment" },
    { value: "14", label: "Funds - Approved" },
    { value: "64", label: "Rejected on GTE grounds" },
    { value: "15", label: "COE Received" },
    { value: "16", label: "Payment Received" },
    { value: "98", label: "Payment Received - Conditional Offer" },
    { value: "83", label: "PAL - Pending" },
    { value: "84", label: "PAL - Received" },
    { value: "32", label: "CAS - Requested" },
    { value: "17", label: "CAS - Received" },
    { value: "36", label: "I-20 - Initiated" },
    { value: "18", label: "I-20 - Received" },
    { value: "34", label: "AIP Received" },
    { value: "19", label: "Visa In Process" },
    { value: "20", label: "Visa Received" },
    { value: "21", label: "Visa Rejected" },
    { value: "55", label: "Proposed for Case Closure" },
    { value: "10", label: "Case Closed" },
    { value: "66", label: "Case Closed - Fraudulent Documents Found" },
    { value: "45", label: "Case Closed - On Partner's Suggestion" },
    { value: "12", label: "Case Closed - Program Closed" },
    { value: "11", label: "Case Closed - Student Not Qualified" },
    { value: "31", label: "Case Closed - Offer Received - Student not interested to pay" },
    { value: "30", label: "Case Closed - Offer Received - Student Paid Tuition Fees to Other Institution" },
    { value: "47", label: "Case Closed - Student not tagged under Igs" },
    { value: "24", label: "Case Closed - Student not Enrolled" },
    { value: "46", label: "Case Closed - Full Commission Received" },
    { value: "90", label: "Case Closed - Offer not Received" },
    { value: "37", label: "Deferral - Initiated - Tuition Payment Not Done" },
    { value: "44", label: "Deferral - Initiated - Tuition Payment Done" },
    { value: "88", label: "Refund/Deferral Decision Pending" },
    { value: "25", label: "Deferral - Completed" },
    { value: "26", label: "Refund Request Initiated" },
    { value: "51", label: "Invoicing Due" },
    { value: "52", label: "Invoice sent to the Institution" },
    { value: "48", label: "Visa Received - Progressive Student" },
    { value: "50", label: "Visa Received - Progressive Student - Discontinued Enrolment" },
    { value: "49", label: "Visa Received - Progressive Student - Tuition Fees Not Paid" },
  ];

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Static mock data for now since we don't have API
        const mockStudents: Student[] = [
          {
            user_id: 1,
            email: "john.doe@example.com",
            phone: "+1234567890",
            status: "Active",
            first_name: "John",
            last_name: "Doe",
            passport_number: "A12345678",
            dob: "1995-05-15",
            created_at: "2024-01-15T10:30:00Z",
          },
          {
            user_id: 2,
            email: "jane.smith@example.com",
            phone: "+9876543210",
            status: "Pending",
            first_name: "Jane",
            last_name: "Smith",
            passport_number: "B87654321",
            dob: "1998-08-22",
            created_at: "2024-02-20T14:45:00Z",
          },
          {
            user_id: 3,
            email: "robert.johnson@example.com",
            phone: "+1122334455",
            status: "Active",
            first_name: "Robert",
            last_name: "Johnson",
            passport_number: "C44556677",
            dob: "1997-03-10",
            created_at: "2024-03-05T09:15:00Z",
          },
          {
            user_id: 4,
            email: "emily.wilson@example.com",
            phone: "+9988776655",
            status: "Completed",
            first_name: "Emily",
            last_name: "Wilson",
            passport_number: "D55667788",
            dob: "1996-11-30",
            created_at: "2024-01-25T16:20:00Z",
          },
          {
            user_id: 5,
            email: "michael.brown@example.com",
            phone: "+5544332211",
            status: "Active",
            first_name: "Michael",
            last_name: "Brown",
            passport_number: "E66778899",
            dob: "1999-07-18",
            created_at: "2024-02-10T11:10:00Z",
          },
        ];
        
        // Uncomment when API is ready
        // const response = await fetch(`${BASE_URL}/agent/student`, {
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //   },
        // });
        
        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        
        // const result = await response.json();
        
        // if (result.success && Array.isArray(result.data)) {
        //   setStudents(result.data);
        // } else {
        //   throw new Error('Invalid response format');
        // }
        
        // Using mock data for now
        setStudents(mockStudents);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Format date to readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get full name
  const getFullName = (student: Student) => {
    return `${student.first_name} ${student.last_name}`.trim();
  };

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle search button click
  const handleSearch = () => {
    // For now, we'll just log the filters
    console.log("Applied filters:", filters);
    // In a real implementation, you would update the filtered data or make an API call
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((student) => {
        const matchesSearch = 
          getFullName(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.phone.includes(searchTerm) ||
          student.passport_number.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      });
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Handle name sorting separately
        if (sortField === 'first_name' || sortField === 'last_name') {
          aValue = getFullName(a);
          bValue = getFullName(b);
        }
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        // Handle date sorting
        if (sortField === 'dob' || sortField === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
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

    return filtered;
  }, [students, searchTerm, sortField, sortDirection, filters]);

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Student) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (loading) {
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
          <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-400">Error loading students</h3>
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
    <><div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {"Students"}
      </h2>

      <Link href="/partner/students/add" className="shrink-0">
          <button className="h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register New Student
          </button>
        </Link>
      
    </div>
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="MSL-Searchform p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="SF-Date">
            <div className="form-group calendar-one">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Created
              </label>
              <DatePicker
                selected={filters.dateRange[0]}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                startDate={filters.dateRange[0]}
                endDate={filters.dateRange[1]}
                selectsRange
                placeholderText="Select date range"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                isClearable
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
                  filters.countries.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  handleFilterChange('countries', 
                    selectedOptions ? selectedOptions.map(option => option.value) : []
                  );
                }}
                placeholder="Select countries"
                className="react-select-container w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                    borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
                    minHeight: '42px',
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected 
                      ? 'rgb(59 130 246 / var(--tw-bg-opacity))' 
                      : state.isFocused
                      ? 'rgb(243 244 246 / var(--tw-bg-opacity))'
                      : 'rgb(255 255 255 / var(--tw-bg-opacity))',
                    color: state.isSelected 
                      ? 'white' 
                      : 'rgb(17 24 39 / var(--tw-text-opacity))',
                  }),
                }}
              />
            </div>
          </div>

          {/* Intake Multi-select */}
          <div className="SF-Intake all-countries">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Intake
              </label>
              <Select
                isMulti
                options={intakeOptions}
                value={intakeOptions.filter(option => 
                  filters.intakes.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  handleFilterChange('intakes', 
                    selectedOptions ? selectedOptions.map(option => option.value) : []
                  );
                }}
                placeholder="Select intakes"
                
                className="react-select-container w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"

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
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <Select
                isMulti
                options={yearOptions}
                value={yearOptions.filter(option => 
                  filters.years.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  handleFilterChange('years', 
                    selectedOptions ? selectedOptions.map(option => option.value) : []
                  );
                }}
                placeholder="Select years"
                
                className="react-select-container w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"

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
                  filters.statuses.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  handleFilterChange('statuses', 
                    selectedOptions ? selectedOptions.map(option => option.value) : []
                  );
                }}
                placeholder="Select statuses"
             
                className="react-select-container w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"

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

          {/* Keyword Search */}
          <div className="SF-Keyword">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Keyword Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z" stroke="#939393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.7498 15.7508L12.4873 12.4883" stroke="#939393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="keyword"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Search by keyword"
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="SF-Searchbtn mt-4">
          <div className="form-group">
            <button
              type="button"
              className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleSearch}
            >
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    { key: "created_by", label: "Created By" },
                    { key: "created_on", label: "Created On" },
                    { key: "student_name", label: "Student Name" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone Number" },
                    { key: "assigned_to", label: "Assigned To" },
                    { key: "status", label: "Status" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort(key as keyof Student)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <span className="text-xs">{getSortIcon(key as keyof Student)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((student) => (
                    <TableRow key={student.user_id}>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {/* Created By - static for now */}
                        System
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {formatDate(student.created_at)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        <Link href={'/partner/editProfile/1'}>
                        {getFullName(student)}
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {student.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {student.phone}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {/* Assigned To - static for now */}
                        Not Assigned
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          student.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : student.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {student.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      {students.length === 0 ? "No students found." : "No students found matching your criteria."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedData.length} of {students.length} students
      </div>
    </div>
    </>
  );
}