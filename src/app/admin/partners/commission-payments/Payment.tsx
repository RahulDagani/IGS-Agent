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

  // Static data for filters
  const countryOptions = [
    { value: "1", label: "United States of America" },
    { value: "2", label: "Australia" },
    { value: "3", label: "Canada" },
    { value: "4", label: "United Kingdom" },
    { value: "8", label: "Ireland" },
    { value: "12", label: "Netherlands" },
  ];

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
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
  ];

  const statusOptions = [
    { value: "1", label: "Received Application at KC" },
    { value: "2", label: "Application in Progress" },
    { value: "38", label: "Application on Hold - Intake yet to open" },
    { value: "3", label: "Application on Hold - KC team" },
    { value: "8", label: "Application on Hold - University" },
    { value: "95", label: "Application on Hold - Pre-Assessment Pending" },
    { value: "23", label: "Pending from Partner" },
    { value: "40", label: "Pending from Partner - Login Credentials" },
    { value: "41", label: "Pending from Partner - Academic Documents" },
    { value: "42", label: "Pending from Partner - Financial Documents" },
    { value: "79", label: "Pending from Partner - Application Fee Pending" },
    { value: "89", label: "Pending from Partner - Interview" },
    { value: "43", label: "Pending from KC" },
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
    { value: "47", label: "Case Closed - Student not tagged under KC" },
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

  const deadlineTypeOptions = [
    { value: "1", label: "Application Deadline" },
    { value: "2", label: "Payment Deadline" },
    { value: "3", label: "CAS Request Deadline" },
    { value: "4", label: "Enrollment Deadline" },
    { value: "5", label: "GS Submission Deadline" },
    { value: "6", label: "Visa Received Deadline" },
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
      <div className="w-full bg-[#f8fbff] dark:bg-gray-900  pt-4 rounded-lg ">
  {/* Tabs */}
  <div className="flex gap-8 text-sm font-medium relative">
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
      <div className="MSL-Searchform p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  filters.intakes.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  handleFilterChange('intakes', 
                    selectedOptions ? selectedOptions.map(option => option.value) : []
                  );
                }}
                placeholder="Select intakes"
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
                  filters.years.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  handleFilterChange('years', 
                    selectedOptions ? selectedOptions.map(option => option.value) : []
                  );
                }}
                placeholder="Select years"
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
                value={filters.programName}
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
                value={filters.studentName}
                onChange={(e) => handleFilterChange('studentName', e.target.value)}
              />
            </div>
          </div>

          
        </div>

        {/* Search Button */}
        <div className="SF-Searchbtn mt-6">
          <div className="form-group flex justify-end">
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

     

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    { key: "acknowledge_no", label: "Acknowledge No." },
                    { key: "created_at", label: "Date Created" },
                    { key: "student_name", label: "Student Name" },
                    { key: "university_name", label: "University Name" },
                    { key: "program_name", label: "Program Name" },
                    { key: "intake", label: "Intake" },
                    { key: "created_by", label: "Created By" },
                    { key: "application_status", label: "Application Status" },
                    { key: "igs_assigned", label: "IGS Assigned" },
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
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((application) => (
                    <TableRow key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300 font-medium">
                        <Link href={`/partner/applications/${application.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {application.acknowledge_no}
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {formatDate(application.created_at)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300 font-medium">
                        <Link href={`/partner/editProfile/1`}>
                        {application.student_name}
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {application.university_name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {application.program_name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {application.intake}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300">
                        {application.created_by}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(application.application_status)}`}>
                          {application.application_status}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          application.igs_assigned === 'Not Assigned' 
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
                        }`}>
                          {application.igs_assigned}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      {applications.length === 0 ? "No applications found." : "No applications found matching your criteria."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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