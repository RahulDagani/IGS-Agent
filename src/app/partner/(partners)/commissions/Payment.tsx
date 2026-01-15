"use client"
import React, { useState, useMemo, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

interface Application {
  id: number;
  acknowledge_no: string;
  created_at: string;
  student_name: string;
  university_name: string;
  program_name: string;
  intake: string;
  created_by: string;
  application_status: string;
  igs_assigned: string;
  year: string;
  country: string;
  deadline_type?: string;
  deadline_date?: string;
}

type SortField = keyof Application | "";
type SortDirection = "asc" | "desc";

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
  deadlineDate: Date | null;
}

export default function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [active, setActive] = useState<"progress" | "paid">("paid");
  
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
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
    deadlineDate: null,
  });

  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;


  const universityOptions = [
    { value: "3", label: "(INTO) George Mason University" },
    { value: "753", label: "(INTO) Hofstra University" },
    { value: "676", label: "(INTO) Jefferson University, St, Philadelphia, Pennsylvania" },
    { value: "1436", label: "(INTO) Montclair State University" },
    { value: "114", label: "(INTO) New England College" },
    { value: "4", label: "(INTO) Oregon State University" },
    { value: "7", label: "(INTO) Saint Louis University" },
    { value: "571", label: "(INTO) Suffolk University" },
    { value: "1240", label: "(INTO) UMass Amherst" },
    { value: "9", label: "(INTO) University of Alabama at Birmingham" },
    { value: "2", label: "(INTO) University of Arizona" },
    { value: "6", label: "(INTO) University of South Florida" },
    { value: "1", label: "(Kaplan) Arizona State University- Arizona" },
    { value: "80", label: "(Kaplan) Pace University" },
    { value: "858", label: "(Shorelight) Cleveland State University" },
    { value: "57", label: "(Shorelight) Florida International University, Florida" },
    { value: "669", label: "(Shorelight) University of Dayton" },
    { value: "11", label: "(Shorelight) University of Illinois Chicago" },
    { value: "1218", label: "(Shorelight) University of Illinois Springfield" },
    { value: "33", label: "(Shorelight) University of Massachusetts Boston (UMass Boston)" },
    { value: "26", label: "(Shorelight) University of South Carolina" },
    { value: "24", label: "(Shorelight) University of the Pacific" },
    { value: "719", label: "(Study Group) DePaul University" },
    { value: "94", label: "(Study Group) Florida Atlantic University" },
    { value: "717", label: "(Study Group) University of Hartford" },
    { value: "340", label: "Anglia Ruskin University" },
    { value: "52", label: "Auburn University at Montgomery" },
    { value: "839", label: "Bournemouth University" },
    { value: "69", label: "California State University, East Bay" },
    { value: "67", label: "California State University, Fresno" },
    { value: "66", label: "California State University, Northridge" },
    { value: "651", label: "California State University, Sacramento" },
    { value: "73", label: "California State University, San Bernardino" },
    { value: "297", label: "Canadore College" },
    { value: "5", label: "Colorado State University" },
    { value: "871", label: "Coventry University, Coventry" },
    { value: "130", label: "Dallas Baptist University" },
    { value: "194", label: "Deakin University" },
    { value: "1520", label: "DePaul University" },
    { value: "572", label: "Drexel University" },
    { value: "451", label: "Dublin Business School" },
    { value: "1125", label: "Eastern Michigan University" },
    { value: "1129", label: "Franklin University" },
    { value: "1178", label: "Governors State University" },
    { value: "1035", label: "Grand Valley State University, Michigan" },
    { value: "912", label: "Kennesaw State University" },
    { value: "40", label: "Kent State University" },
    { value: "862", label: "Kingston University" },
    { value: "861", label: "La Trobe University, Melbourne" },
    { value: "292", label: "Lambton College" },
    { value: "104", label: "Lawrence Technological University" },
    { value: "359", label: "Leeds Beckett University" },
    { value: "1590", label: "Lehigh University" },
    { value: "754", label: "Lynn University" },
    { value: "650", label: "Manchester Metropolitan University" },
    { value: "100", label: "Marist University" },
    { value: "126", label: "Marshall University" },
    { value: "449", label: "Maynooth University" },
    { value: "326", label: "Middlesex University" },
    { value: "740", label: "Missouri State University" },
    { value: "898", label: "Missouri University of Science and Technology" },
    { value: "83", label: "Murray State University" },
    { value: "58", label: "New Jersey Institute of Technology" },
    { value: "97", label: "New York Institute of Technology" },
    { value: "18", label: "Northeastern University" },
    { value: "55", label: "Northern Arizona University" },
    { value: "303", label: "Northern College at Pures-Toronto" },
    { value: "331", label: "Northumbria University, Newcastle" },
    { value: "323", label: "Nottingham Trent University" },
    { value: "98", label: "Rider University" },
    { value: "1295", label: "Rowan University" },
    { value: "1134", label: "Sacred Heart University" },
    { value: "757", label: "Saint Leo University" },
    { value: "38", label: "San Francisco State University" },
    { value: "37", label: "San Jose State University" },
    { value: "62", label: "Southeast Missouri State University" },
    { value: "817", label: "Southern Illinois University Edwardsville" },
    { value: "136", label: "Southern New Hampshire University" },
    { value: "290", label: "St. Lawrence College" },
    { value: "708", label: "Teesside University" },
    { value: "61", label: "Texas A & M University - Corpus Christi" },
    { value: "1011", label: "The University of Alabama, Tuscaloosa" },
    { value: "133", label: "The University of Findlay" },
    { value: "47", label: "The University of Memphis" },
    { value: "789", label: "The University of Queensland" },
    { value: "1017", label: "The University of Scranton" },
    { value: "1067", label: "Trine University" },
    { value: "366", label: "Ulster University, London Campus" },
    { value: "444", label: "University College Dublin" },
    { value: "13", label: "University of Albany, The State University of New York, Albany (SUNY Albany)" },
    { value: "358", label: "University of Bedfordshire" },
    { value: "108", label: "University of Bridgeport" },
    { value: "85", label: "University Of Central Oklahoma" },
    { value: "17", label: "University of Cincinnati" },
    { value: "16", label: "University of Colorado Denver" },
    { value: "333", label: "University of East London" },
    { value: "1154", label: "University of Exeter" },
    { value: "334", label: "University of Greenwich" },
    { value: "35", label: "University of Idaho" },
    { value: "313", label: "University of Leicester" },
    { value: "310", label: "University of Liverpool" },
    { value: "1311", label: "University of Louisville" },
    { value: "23", label: "University of Maryland Baltimore County" },
    { value: "32", label: "University of Massachusetts Dartmouth (UMass Dartmouth)" },
    { value: "31", label: "University of Massachusetts Lowell (UMass Lowell)" },
    { value: "1256", label: "University of Michigan-Flint" },
    { value: "63", label: "University of Missouri–St. Louis (UMSL)" },
    { value: "1305", label: "University of Nebraska at Omaha" },
    { value: "49", label: "University of Nevada" },
    { value: "638", label: "University of New Hampshire" },
    { value: "78", label: "University of New Haven" },
    { value: "1413", label: "University of North Florida" },
    { value: "56", label: "University of North Texas" },
    { value: "356", label: "University of South Wales" },
    { value: "341", label: "University of Staffordshire" },
    { value: "95", label: "University of Tampa" },
    { value: "350", label: "University of West London" },
    { value: "1304", label: "University of Western Australia" },
    { value: "739", label: "University of Wisconsin Milwaukee, Wisconsin" },
    { value: "360", label: "University of Wolverhampton" },
    { value: "132", label: "Webster University - (St. Louis, Missouri)" },
    { value: "135", label: "Western New England University" },
    { value: "45", label: "Wichita State University" },
    { value: "500", label: "Wittenborg University of Applied Sciences" },
    { value: "44", label: "Wright State University" },
  ];



  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Static mock data for now
        const mockApplications: Application[] = [
          {
            id: 1,
            acknowledge_no: "APP-2024-001",
            created_at: "2024-01-15T10:30:00Z",
            student_name: "John Doe",
            university_name: "University of Arizona",
            program_name: "Master of Computer Science",
            intake: "Fall 2024",
            created_by: "Agent Smith",
            application_status: "Application Submitted",
            igs_assigned: "Not Assigned",
            year: "2024",
            country: "USA",
          },
          {
            id: 2,
            acknowledge_no: "APP-2024-002",
            created_at: "2024-02-20T14:45:00Z",
            student_name: "Jane Smith",
            university_name: "University of Toronto",
            program_name: "MBA",
            intake: "Winter 2025",
            created_by: "Agent Johnson",
            application_status: "Under Review",
            igs_assigned: "John Carter",
            year: "2024",
            country: "Canada",
          },
          {
            id: 3,
            acknowledge_no: "APP-2024-003",
            created_at: "2024-03-05T09:15:00Z",
            student_name: "Robert Johnson",
            university_name: "University of Melbourne",
            program_name: "Bachelor of Engineering",
            intake: "Spring 2024",
            created_by: "Agent Brown",
            application_status: "Offer Received",
            igs_assigned: "Sarah Miller",
            year: "2024",
            country: "Australia",
          },
          {
            id: 4,
            acknowledge_no: "APP-2024-004",
            created_at: "2024-01-25T16:20:00Z",
            student_name: "Emily Wilson",
            university_name: "University of Oxford",
            program_name: "PhD in Physics",
            intake: "Fall 2024",
            created_by: "Agent Davis",
            application_status: "Visa Processing",
            igs_assigned: "Michael Taylor",
            year: "2024",
            country: "UK",
          },
          {
            id: 5,
            acknowledge_no: "APP-2024-005",
            created_at: "2024-02-10T11:10:00Z",
            student_name: "Michael Brown",
            university_name: "National University of Singapore",
            program_name: "Master of Finance",
            intake: "Summer 2024",
            created_by: "Agent Wilson",
            application_status: "Application in Progress",
            igs_assigned: "Not Assigned",
            year: "2024",
            country: "Singapore",
          },
          {
            id: 6,
            acknowledge_no: "APP-2024-006",
            created_at: "2024-03-15T13:25:00Z",
            student_name: "Sarah Miller",
            university_name: "University of British Columbia",
            program_name: "Bachelor of Arts",
            intake: "Fall 2024",
            created_by: "Agent Taylor",
            application_status: "Documents Pending",
            igs_assigned: "David Wilson",
            year: "2024",
            country: "Canada",
          },
          {
            id: 7,
            acknowledge_no: "APP-2024-007",
            created_at: "2024-01-30T09:45:00Z",
            student_name: "David Wilson",
            university_name: "University of Sydney",
            program_name: "Master of Data Science",
            intake: "Spring 2024",
            created_by: "Agent Miller",
            application_status: "Conditional Offer",
            igs_assigned: "Emily Brown",
            year: "2024",
            country: "Australia",
          },
          {
            id: 8,
            acknowledge_no: "APP-2024-008",
            created_at: "2024-02-28T15:30:00Z",
            student_name: "Lisa Anderson",
            university_name: "Imperial College London",
            program_name: "PhD in Chemistry",
            intake: "Fall 2024",
            created_by: "Agent Anderson",
            application_status: "Interview Scheduled",
            igs_assigned: "Robert Davis",
            year: "2024",
            country: "UK",
          },
        ];
        
        setApplications(mockApplications);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Format date to readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    console.log("Applied filters:", filters);
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...applications];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((app) => {
        const matchesSearch = 
          app.acknowledge_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.university_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.program_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      });
    }

    // Apply custom filters
    if (filters.acknowledgeNo) {
      filtered = filtered.filter(app => 
        app.acknowledge_no.toLowerCase().includes(filters.acknowledgeNo.toLowerCase())
      );
    }

    if (filters.studentName) {
      filtered = filtered.filter(app => 
        app.student_name.toLowerCase().includes(filters.studentName.toLowerCase())
      );
    }

    if (filters.programName) {
      filtered = filtered.filter(app => 
        app.program_name.toLowerCase().includes(filters.programName.toLowerCase())
      );
    }

    if (filters.countries.length > 0) {
      filtered = filtered.filter(app => 
        filters.countries.includes(app.country)
      );
    }

    if (filters.universities.length > 0) {
      filtered = filtered.filter(app => 
        filters.universities.includes(app.university_name)
      );
    }

    if (filters.intakes.length > 0) {
      filtered = filtered.filter(app => 
        filters.intakes.some(intake => app.intake.includes(intake))
      );
    }

    if (filters.years.length > 0) {
      filtered = filtered.filter(app => 
        filters.years.includes(app.year)
      );
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(app => 
        filters.statuses.includes(app.application_status)
      );
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if(!aValue || !bValue) return 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        // Handle date sorting
        if (sortField === 'created_at') {
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
  }, [applications, searchTerm, sortField, sortDirection, filters]);

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
    if (status.includes("Received") || status.includes("Approved") || status.includes("Completed")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    } else if (status.includes("Pending") || status.includes("Processing") || status.includes("Progress")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    } else if (status.includes("Rejected") || status.includes("Closed")) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    } else if (status.includes("Submitted") || status.includes("Review")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    } else if (status.includes("Offer")) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
      <div className="w-full bg-[#f8fbff] dark:bg-gray-900 rounded-lg ">
  {/* Tabs */}
  <div className="flex gap-8 font-medium relative">
    {/* In Progress */}
    <button
      onClick={() => setActive("progress")}
      className={`pb-3 relative ${
        active === "progress"
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-900 dark:text-gray-300"
      }`}
    >
      In Progress
      {active === "progress" && (
        <span className="absolute left-0 -bottom-[1px] h-[3px] w-full bg-blue-600 dark:bg-blue-400 rounded-full" />
      )}
    </button>

    {/* Paid */}
    <button
      onClick={() => setActive("paid")}
      className={`pb-3 relative ${
        active === "paid"
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-900 dark:text-gray-300"
      }`}
    >
      Paid
      {active === "paid" && (
        <span className="absolute left-0 -bottom-[1px] h-[3px] w-full bg-blue-600 dark:bg-blue-400 rounded-full" />
      )}
    </button>
  </div>
</div>
    </div>
    <div className="space-y-6">
      
      {/* Filters Section */}
      <div className="MSL-Searchform bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

          
          {/* Student Name */}
          <div className="SF-Keyword">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commission Note
              </label>
              <input
                type="text"
                placeholder="Search by commission note Number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={filters.studentName}
                onChange={(e) => handleFilterChange('studentName', e.target.value)}
              />
            </div>
          </div>

           {/* University Multi-select */}
          <div className="SF-University all-countries">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <Select
                isMulti
                options={universityOptions}
                value={universityOptions.filter(option => 
                  filters.universities.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  handleFilterChange('universities', 
                    selectedOptions ? selectedOptions.map(option => option.value) : []
                  );
                }}
                placeholder="Select status"
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
                  filters.universities.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  handleFilterChange('universities', 
                    selectedOptions ? selectedOptions.map(option => option.value) : []
                  );
                }}
                placeholder="Select universities"
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
                selected={filters.dateRange[0]}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                startDate={filters.dateRange[0]}
                endDate={filters.dateRange[1]}
                selectsRange
                placeholderText="Select date range"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                isClearable
                readOnly
              />
            </div>
          </div>

        

      

          {/* Status Multi-select */}
          {/* <div className="SF-Status all-countries">
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
              />
            </div>
          </div> */}

          {/* Student Name */}
          <div className="SF-Keyword">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student
              </label>
              <input
                type="text"
                placeholder="Search by student Name/Email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={filters.studentName}
                onChange={(e) => handleFilterChange('studentName', e.target.value)}
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
                value={filters.acknowledgeNo}
                onChange={(e) => handleFilterChange('acknowledgeNo', e.target.value)}
              />
            </div>
          </div>

          {/* Search Button */}
        <div className="SF-Searchbtn mt-6">
          <div className="form-group">
            <button
              type="button"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={handleSearch}
            >
              <span>Search</span>
            </button>
          </div>
        </div>

   
          

          
        </div>

        
      </div>

     

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="flex gap-6 bg-[#F6F9FC] min-h-screen">
      {/* LEFT PANEL */}
      <div className="w-[420px] bg-white rounded-xl space-y-4">
        {/* CARD 1 */}
        <div className=" rounded-xl p-4 space-y-2 mb-0 relative">
          <span className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
            Invoice Uploaded
          </span>

          <h3 className="font-semibold text-lg">
            KCOMIHAN/CN/2526/5866
          </h3>

          <p className="text-sm text-gray-600">
            Abroad Study, Vijayawada
          </p>

          <p className="text-sm">
            Commission Amount is{" "}
            <span className="font-semibold">INR 29,792</span>
          </p>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              Created On:{" "}
              <span className="font-medium text-gray-800">
                03-01-2026 04:31:17 PM
              </span>
            </p>
            <p>
              Last Updated On:{" "}
              <span className="font-medium text-gray-800">
                05-01-2026 06:38:27 PM
              </span>
            </p>
          </div>
        </div>

        {/* CARD 2 (ACTIVE) */}
        <div className="border-l-4 border-blue-600 bg-blue-50 rounded-xl p-4 space-y-2 relative">
          <span className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
            Sent To Partner
          </span>

          <h3 className="font-semibold text-lg">
            KCOMIHAN/CN/2526/3369
          </h3>

          <p className="text-sm text-gray-600">
            Abroad Study, Vijayawada
          </p>

          <p className="text-sm">
            Commission Amount is{" "}
            <span className="font-semibold">INR 1,03,820</span>
          </p>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              Created On:{" "}
              <span className="font-medium text-gray-800">
                18-11-2025 10:27:22 AM
              </span>
            </p>
            <p>
              Last Updated On:{" "}
              <span className="font-medium text-gray-800">
                18-11-2025 10:27:22 AM
              </span>
            </p>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 border rounded-lg flex items-center justify-center">
              <ChevronLeft size={16} />
            </button>

            <button className="h-9 w-9 bg-blue-600 text-white rounded-lg">
              1
            </button>

            <button className="h-9 w-9 border rounded-lg flex items-center justify-center">
              <ChevronRight size={16} />
            </button>
          </div>

          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>25/page</option>
          </select>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-white rounded-xl p-6">
        {/* HEADER */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              KCOMIHAN/CN/2526/3369
            </h2>

            <p className="text-sm text-gray-600">
              Abroad Study, Vijayawada
            </p>

            <p className="text-sm">
              Commission Amount is{" "}
              <span className="font-semibold">INR 1,03,820</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              Generate Invoice
            </button>

            <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm">
              View Note
            </button>

            <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm">
              Download Note
            </button>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-10 py-6 text-sm">
          <p>
            Generated By:{" "}
            <span className="font-medium text-gray-800">
              Harshal Chakole
            </span>
          </p>

          <p>
            Paid By:{" "}
            <span className="font-medium text-gray-800">-</span>
          </p>

          <p>
            Date Received On:{" "}
            <span className="font-medium text-gray-800">
              18-11-2025 10:27:22 AM
            </span>
          </p>

          <p>
            Date of Payment:{" "}
            <span className="font-medium text-gray-800">-</span>
          </p>

          <p>
            Last Updated On:{" "}
            <span className="font-medium text-gray-800">
              18-11-2025 10:27:22 AM
            </span>
          </p>
        </div>

        {/* COMMENTS */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Comments</h3>

          <div className="flex items-center gap-3">
            <input
              placeholder="Shift + Enter for new line"
              className="flex-1 rounded-full px-4 py-3 border focus:outline-none"
            />

            <button className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Send size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center text-gray-400 mt-16">
            <p>No comments.</p>
          </div>
        </div>
      </div>
    </div>
          </div>
        </div>
      </div>

      {/* Results Count and Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredAndSortedData.length} of {applications.length} applications
        </div>
        
        {/* Pagination - Static for now */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Previous
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm">
            1
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            2
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            3
          </button>
          <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
          <button className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            10
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Next
          </button>
        </div>
      </div>
    </div>
    </>
  );
}