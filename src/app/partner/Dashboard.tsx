"use client"

import Badge from "@/components/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Check, CheckCircle, Clock, CornerDownLeft, Cross, DollarSign, File, Filter, MapPinCheck, User, Wallet, Wallet2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


interface ApplicationCountData {
  status: string;
  count: number;
}

interface NewsArticle {
  id: number;
  title: string;
  author: string;
  content: string;
  image_url: string;
  published_at: string;
  source_url?: string;
  category?: string;
}

interface FilterState {
  dateRange: [Date | null, Date | null];
  intake: string[];
  year: string[];
  country: string[];
}

interface ApplicationStats {
  applied: number;
  received: number;
  incomplete: number;
  documentsPending: number;
  complete: number;
  submitted: number;
  fullyAdmitted: number;
  conditionallyAdmitted: number;
  denied: number;
  visaApproved: number;
  visaDenied: number;
  deferred: number;
  withdrawn: number;
  arrivedOnCampus: number;
}

// Define types for the API response
interface DashboardData {
  wallet: {
    balance: number;
    currency: string;
  };
  statistics: {
    applications: {
      total_applications: number;
      submitted_applications: string;
      applied: string;
      received: string;
      incomplete: string;
      documents_pending: string;
      complete: string;
      submitted_to_uni: string;
      fully_admitted: string;
      conditionally_admitted: string;
      denied: string;
      i20_issued: string;
      i20_received: string;
      visa_appointment_booked: string;
      visa_approved: string;
      visa_denied: string;
      deferred: string;
      arrived_on_campus: string;
      withdrawn: string;
    };
    students: {
      total_students: number;
    };
    payments: {
      count: number;
      total_amount: number | null;
    };
  };
  quick_links: {
    label: string;
    link: string;
    icon: string;
  }[];
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

// Helper function to get icon component based on icon name
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'add':
      return <BoxIconLine className="text-gray-800 dark:text-white/90" />;
    case 'person_add':
      return <GroupIcon className="text-gray-800 dark:text-white/90" />;
    case 'account_balance':
      return <Wallet className="text-gray-800 dark:text-white/90" />;
    case 'payment':
      return <DollarSign className="text-gray-800 dark:text-white/90" />;
    default:
      return <BoxIconLine className="text-gray-800 dark:text-white/90" />;
  }
};

export default function PartnerDashboard() {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [filter, setFilter] = useState<FilterState>({
    dateRange: [null, null],
    intake: [],
    year: [],
    country: []
  });
  const [stats, setStats] = useState<ApplicationStats>({
    applied: 0,
    received: 0,
    incomplete: 0,
    documentsPending: 0,
    complete: 0,
    submitted: 0,
    fullyAdmitted: 0,
    conditionallyAdmitted: 0,
    denied: 0,
    visaApproved: 0,
    visaDenied: 0,
    deferred: 0,
    withdrawn: 0,
    arrivedOnCampus: 0
  });
  const [selectedPending, setSelectedPending] = useState<string>("applied");
  const [selectedComplete, setSelectedComplete] = useState<string>("complete");
  const [selectedAdmitted, setSelectedAdmitted] = useState<string>("total");
  const [selectedDeferred, setSelectedDeferred] = useState<string>("total");

    // Intake options
  const intakeOptions = [
    { value: "Spring", label: "Spring" },
    { value: "Summer", label: "Summer" },
    { value: "Fall", label: "Fall" },
    { value: "Winter", label: "Winter" }
  ];

  // Year options
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = 2022 + i;
    return { value: year.toString(), label: year.toString() };
  });

  // Country options
  const countryOptions = [
    { value: "australia", label: "Australia" },
    { value: "canada", label: "Canada" },
    { value: "germany", label: "Germany" },
    { value: "united-kingdom", label: "United Kingdom" },
    { value: "united-states-of-america", label: "United States of America" }
  ];

  // Calculate derived stats
  const getPendingCount = () => {
    switch (selectedPending) {
      case "applied": return stats.applied;
      case "received": return stats.received;
      case "incomplete": return stats.incomplete;
      case "documents": return stats.documentsPending;
      case "rejected": return stats.denied;
      default: return stats.applied;
    }
  };

  const getCompleteCount = () => {
    switch (selectedComplete) {
      case "complete": return stats.complete;
      case "submitted": return stats.submitted;
      default: return stats.complete;
    }
  };

  const getAdmittedCount = () => {
    switch (selectedAdmitted) {
      case "total": return stats.fullyAdmitted + stats.conditionallyAdmitted;
      case "fully": return stats.fullyAdmitted;
      case "conditional": return stats.conditionallyAdmitted;
      default: return stats.fullyAdmitted + stats.conditionallyAdmitted;
    }
  };

  const getDeferredCount = () => {
    switch (selectedDeferred) {
      case "total": return stats.deferred + stats.withdrawn;
      case "deferred": return stats.deferred;
      case "withdrawn": return stats.withdrawn;
      default: return stats.deferred + stats.withdrawn;
    }
  };

    // Fetch application counts
  const fetchApplicationCounts = async () => {
    if (!token) return;

    try {
      // setLoading(true);
      const [startDate, endDate] = filter.dateRange;
      
      const queryParams = new URLSearchParams();
      if (startDate && endDate) {
        queryParams.append('start_date', startDate.toISOString().split('T')[0]);
        queryParams.append('end_date', endDate.toISOString().split('T')[0]);
      }
      if (filter.intake.length > 0) {
        queryParams.append('intake', filter.intake.join(','));
      }
      if (filter.year.length > 0) {
        queryParams.append('year', filter.year.join(','));
      }
      if (filter.country.length > 0) {
        queryParams.append('country', filter.country.join(','));
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_EXPRESS_API_BASE}/api/application-counts?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to fetch application counts');
      }

      const data = await res.json();
      
      // Transform API response to update stats
      const newStats = { ...stats };
      data.data.forEach((item: ApplicationCountData) => {
        const status = item.status.toLowerCase();
        switch (status) {
          case 'applied':
            newStats.applied = item.count;
            break;
          case 'received':
            newStats.received = item.count;
            break;
          case 'incomplete application':
            newStats.incomplete = item.count;
            break;
          case 'documents pending':
            newStats.documentsPending = item.count;
            break;
          case 'application complete':
            newStats.complete = item.count;
            break;
          case 'application submitted to university':
            newStats.submitted = item.count;
            break;
          case 'denied':
            newStats.denied = item.count;
            break;
          case 'visa approved':
            newStats.visaApproved = item.count;
            break;
          case 'visa denied':
            newStats.visaDenied = item.count;
            break;
          case 'fully admitted':
            newStats.fullyAdmitted = item.count;
            break;
          case 'conditionally admitted':
            newStats.conditionallyAdmitted = item.count;
            break;
          case 'deferred admission':
            newStats.deferred = item.count;
            break;
          case 'application withdrawn':
            newStats.withdrawn = item.count;
            break;
          case 'arrived on campus':
            newStats.arrivedOnCampus = item.count;
            break;
        }
      });
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching application counts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize with default date range (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    
    setFilter(prev => ({
      ...prev,
      dateRange: [start, end]
    }));
  }, []);

  // Fetch counts when filters change or on initial load
  useEffect(() => {
    if (filter.dateRange[0] && filter.dateRange[1]) {
      fetchApplicationCounts();
    }
  }, [filter]);

  const handleApplyFilter = () => {
    fetchApplicationCounts();
  };

  useEffect(() => {
    async function fetchDashboardData() {
      if (!token) return;

      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/agent/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await res.json();
        setDashboardData(data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [token]); // Add token as dependency

  // Fallback data for when dashboardData is null
  const fallbackData: DashboardData = {
    wallet: { balance: 0, currency: 'USD' },
    statistics: {
      applications: {
        total_applications: 0,
        submitted_applications: "0",
        applied: "0",
        received: "0",
        incomplete: "0",
        documents_pending: "0",
        complete: "0",
        submitted_to_uni: "0",
        fully_admitted: "0",
        conditionally_admitted: "0",
        denied: "0",
        i20_issued: "0",
        i20_received: "0",
        visa_appointment_booked: "0",
        visa_approved: "0",
        visa_denied: "0",
        deferred: "0",
        arrived_on_campus: "0",
        withdrawn: "0"
      },
      students: { total_students: 0 },
      payments: { count: 0, total_amount: null }
    },
    quick_links: []
  };

  const data = dashboardData || fallbackData;
  const { statistics, wallet, quick_links } = data;

  // Calculate percentages or trends
  const getTrendPercentage = (value: number) => {
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const percentage = (Math.random() * 20).toFixed(2);
    return { trend, percentage };
  };

  const studentsTrend = getTrendPercentage(statistics ? statistics.students.total_students : 0);
  const applicationsTrend = getTrendPercentage(statistics ? statistics.applications.total_applications: 0);
  const enrolledTrend = getTrendPercentage(parseInt(statistics ? (statistics.applications.fully_admitted || '0') : '0'));
  const paymentsTrend = getTrendPercentage(statistics ? statistics.payments.count: 0);


   const [newsArticles] = useState<NewsArticle[]>([
    {
      id: 1,
      title: "New Visa Regulations for International Students",
      author: "Study Abroad Department",
      content: "The government has announced new visa regulations that will affect international students starting from the upcoming academic year.",
      image_url: "/images/news/visa-regulations.jpg",
      published_at: "2024-03-15T10:30:00Z",
      category: "Visa Updates"
    },
    {
      id: 2,
      title: "University Partnerships Expanded to 50+ Countries",
      author: "Global Partnerships Team",
      content: "We're excited to announce new partnerships with universities in Europe and Asia, expanding our network to over 500 institutions worldwide.",
      image_url: "/images/news/university-partnerships.jpg",
      published_at: "2024-03-10T14:45:00Z",
      category: "Partnerships"
    },
    {
      id: 3,
      title: "Scholarship Opportunities for 2024 Intake",
      author: "Financial Aid Office",
      content: "Applications are now open for merit-based scholarships for the Fall 2024 intake. Deadline: April 30, 2024.",
      image_url: "/images/news/scholarship.jpg",
      published_at: "2024-03-05T09:15:00Z",
      category: "Scholarships"
    },
    {
      id: 4,
      title: "IELTS & TOEFL Test Center Updates",
      author: "Testing Services",
      content: "New test centers have been added in major cities. Check availability for your preferred test dates.",
      image_url: "/images/news/test-center.jpg",
      published_at: "2024-03-01T16:20:00Z",
      category: "Testing"
    },
    {
      id: 5,
      title: "Post-Study Work Visa Extension Announced",
      author: "Immigration Services",
      content: "The post-study work visa period has been extended to 3 years for graduates of accredited programs.",
      image_url: "/images/news/work-visa.jpg",
      published_at: "2024-02-28T11:10:00Z",
      category: "Career Opportunities"
    }
  ]);

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Get time ago for relative time display
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Your existing JSX remains the same, but use `data` instead of `dashboardData` */}
      <div className="col-span-12 space-y-6 xl:col-span-8">
        {/* Section Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Overview
        </h3>
      </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
          

          {/* <!-- Total Students --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Students
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {statistics ? statistics.students.total_students : 0}
                  </h4>
                  <span className="my-auto ml-2">
                    <Badge color={studentsTrend.trend === 'up' ? "success" : "error"}>
                      {studentsTrend.trend === 'up' ? (
                        <ArrowUpIcon className="text-success-500" />
                      ) : (
                        <ArrowDownIcon className="text-error-500" />
                      )}
                      {studentsTrend.percentage}%
                    </Badge>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <GroupIcon className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <Link href={"/partner/students"} className="text-sm text-blue-500 dark:text-blue-400">
                Manage Students
              </Link>
          </div>
          {/* <!-- Total Students End --> */}

          {/* <!-- Total Applications --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Applications
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {statistics ? statistics.applications.total_applications : 0}
                  </h4>
                  <span className="my-auto ml-2">
                    <Badge color={applicationsTrend.trend === 'up' ? "success" : "error"}>
                      {applicationsTrend.trend === 'up' ? (
                        <ArrowUpIcon className="text-success-500" />
                      ) : (
                        <ArrowDownIcon className="text-error-500" />
                      )}
                      {applicationsTrend.percentage}%
                    </Badge>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <File className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <Link href={"/partner/applications"} className="text-sm text-blue-500 dark:text-blue-400">
                Manage Applications
              </Link>
          </div>
          {/* <!-- Total Applications End --> */}

          {/* Wallet Balance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Wallet Balance
                </span>
                <div className="flex align-middle">
                  {wallet ? <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {wallet.currency} {wallet.balance.toFixed(2)}
                  </h4> : <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    0.00
                  </h4>}
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Wallet className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <Link href={"/partner/wallet"} className="text-sm text-blue-500 dark:text-blue-400">
                My Wallet
              </Link>
          </div>

          {/* <!-- Fully Admitted (Enrolled) --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Programs
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {statistics ? statistics.applications.fully_admitted : 0}
                  </h4>
                  <span className="my-auto ml-2">
                    <Badge color={enrolledTrend.trend === 'up' ? "success" : "error"}>
                      {enrolledTrend.trend === 'up' ? (
                        <ArrowUpIcon className="text-success-500" />
                      ) : (
                        <ArrowDownIcon className="text-error-500" />
                      )}
                      {enrolledTrend.percentage}%
                    </Badge>
                  </span>
                </div>
                
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <BoxIconLine className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <Link href={"/partner/programs"} className="text-sm text-blue-500 dark:text-blue-400">
                View Programs
              </Link>
          </div>
         

        </div>


        <div className="space-y-6">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Applications
        </h3>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 md:p-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-end mb-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Range
            </label>
            <DatePicker
              selected={filter.dateRange[0]}
              onChange={(dates: [Date | null, Date | null]) => {
                setFilter(prev => ({ ...prev, dateRange: dates }));
              }}
              startDate={filter.dateRange[0]}
              endDate={filter.dateRange[1]}
              selectsRange
              placeholderText="Select date range"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="dd-MM-yyyy"
            />
          </div>

          {/* Intake */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Intake
            </label>
            <Select
              isMulti
              options={intakeOptions}
              value={intakeOptions.filter(option => 
                filter.intake.includes(option.value)
              )}
              onChange={(selected) => {
                setFilter(prev => ({
                  ...prev,
                  intake: selected ? selected.map(opt => opt.value) : []
                }));
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select Intake"
            />
          </div>         

          
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-end">
          
          {/* Year */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Intake Year
            </label>
            <Select
              isMulti
              options={yearOptions}
              value={yearOptions.filter(option => 
                filter.year.includes(option.value)
              )}
              onChange={(selected) => {
                setFilter(prev => ({
                  ...prev,
                  year: selected ? selected.map(opt => opt.value) : []
                }));
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select Year"
            />
          </div>

          {/* Countries */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Countries
            </label>
            <Select
              isMulti
              options={countryOptions}
              value={countryOptions.filter(option => 
                filter.country.includes(option.value)
              )}
              onChange={(selected) => {
                setFilter(prev => ({
                  ...prev,
                  country: selected ? selected.map(opt => opt.value) : []
                }));
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select Countries"
            />
          </div>

          
        </div>

        {/* Apply Button */}
          <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-4">
            <button
              onClick={handleApplyFilter}
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 
                       text-white font-medium rounded-full transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-4 h-4 mr-2" />
              {loading ? "Applying..." : "Apply Filter"}
            </button>
          </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Applications Pending */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedPending}
                  onChange={(e) => setSelectedPending(e.target.value)}
                  className="text-sm font-medium text-gray-800 dark:text-white/90 bg-transparent border-none focus:ring-0 focus:outline-none"
                >
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800" value="applied">Application is Pending</option>
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800"  value="received">Received Application</option>
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800"  value="incomplete">Incomplete Application</option>
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800"  value="rejected">Rejected Application</option>
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800"  value="documents">Documents Pending</option>
                </select>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {getPendingCount()}
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Application Complete */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedComplete}
                  onChange={(e) => setSelectedComplete(e.target.value)}
                  className="text-sm font-medium text-gray-800 dark:text-white/90 bg-transparent border-none focus:ring-0 focus:outline-none"
                >
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800" value="complete">Application Completed</option>
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800" value="submitted">Submitted to University</option>
                </select>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {getCompleteCount()}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Admitted Students */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedAdmitted}
                  onChange={(e) => setSelectedAdmitted(e.target.value)}
                  className="text-sm font-medium text-gray-800 dark:text-white/90 bg-transparent border-none focus:ring-0 focus:outline-none"
                >
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800" value="total">Admitted Students</option>
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800" value="fully">Fully Admitted</option>
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800" value="conditional">Conditionally Admitted</option>
                </select>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {getAdmittedCount()}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Visa Approved */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                Visa Approved
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {stats.visaApproved}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Wallet2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                Rejected
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {stats.denied}
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Cross className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Visa Denied */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                Visa Denied
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {stats.visaDenied}
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Deferred / Withdrawn */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedDeferred}
                  onChange={(e) => setSelectedDeferred(e.target.value)}
                  className="text-sm font-medium text-gray-800 dark:text-white/90 bg-transparent border-none focus:ring-0 focus:outline-none"
                >
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800" value="total">Deferred / Withdrawn</option>
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800" value="deferred">Deferred Admission</option>
                  <option className="text-gray-800 dark:text-white/90 bg-white dark:bg-gray-800" value="withdrawn">Application Withdrawn</option>
                </select>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {getDeferredCount()}
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <CornerDownLeft className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Arrived on Campus */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                Arrived on Campus
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {stats.arrivedOnCampus}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <MapPinCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
       
      </div>

      <div className="col-span-12 xl:col-span-4 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Latest News & Updates
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stay updated with the latest information
          </p>
        </div>
        <div className="relative">
          <select 
            className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="visa">Visa Updates</option>
            <option value="partnerships">Partnerships</option>
            <option value="scholarships">Scholarships</option>
            <option value="testing">Testing</option>
            <option value="career">Career Opportunities</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {newsArticles.map((article) => (
          <div 
            key={article.id} 
            className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
          >
            <div className="flex items-start gap-3 mb-2">
              {/* News Image */}
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* News Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-gray-800 dark:text-white/90 line-clamp-2">
                    {article.title}
                  </h4>
                  <span className="flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {article.category}
                  </span>
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.published_at)}
                    </span>
                  </div>
                  <span className="text-xs">
                    {getTimeAgo(article.published_at)}
                  </span>
                </div>

                {/* Article Preview */}
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {article.content}
                </p>

                {/* Action Button */}
                <button className="mt-2 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  Read more
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button className="w-full py-2 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300 
                         hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 
                         rounded-lg transition-colors duration-200">
          View All News & Updates
        </button>
      </div>
    </div>
      </div>
    </div>
  );
}