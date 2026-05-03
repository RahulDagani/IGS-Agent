"use client"

import Badge from "@/components/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  CornerDownLeft,
  Cross,
  File,
  Filter,
  MapPinCheck,
  PlusCircle,
  User,
  Users,
  Wallet,
  Wallet2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ApplicationStatusCount {
  status_key: string;
  status_label: string;
  count: number;
}

interface RecentStudent {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface RecentApplication {
  id: number;
  created_at: string;
  student_name: string;
  course_name: string;
  university_name: string;
  status_label: string;
  status_key: string;
}

interface CounselorSummary {
  id: number;
  name: string;
  student_count: number;
}

interface ApplicationsTrend {
  this_month: number;
  last_month: number;
  change_pct: number;
}

interface DashboardData {
  total_students: number;
  total_applications: number;
  total_programs: number;
  wallet_balance: number;
  currency: string;
  application_status_counts: ApplicationStatusCount[];
  applications_trend: ApplicationsTrend;
  recent_students: RecentStudent[];
  recent_applications: RecentApplication[];
  counselor_summary: CounselorSummary[];
  current_filters: {
    date_range_start: string | null;
    date_range_end: string | null;
    country_code: string | null;
  };
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
  incomplete_application: number;
  documents_pending: number;
  application_complete: number;
  submitted_to_university: number;
  fully_admitted: number;
  conditionally_admitted: number;
  denied: number;
  i20_issued: number;
  i20_received: number;
  visa_appointment_booked: number;
  visa_approved: number;
  visa_denied: number;
  deferred_admission: number;
  arrived_on_campus: number;
  withdrawn: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

export default function PartnerDashboard() {
  const { token, user } = useAuth();
  const isCounsellor = user?.role_key === 'counsellor';

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
    incomplete_application: 0,
    documents_pending: 0,
    application_complete: 0,
    submitted_to_university: 0,
    fully_admitted: 0,
    conditionally_admitted: 0,
    denied: 0,
    i20_issued: 0,
    i20_received: 0,
    visa_appointment_booked: 0,
    visa_approved: 0,
    visa_denied: 0,
    deferred_admission: 0,
    arrived_on_campus: 0,
    withdrawn: 0
  });

  const [selectedPending, setSelectedPending] = useState<string>("applied");
  const [selectedComplete, setSelectedComplete] = useState<string>("application_complete");
  const [selectedAdmitted, setSelectedAdmitted] = useState<string>("total");
  const [selectedDeferred, setSelectedDeferred] = useState<string>("total");

  const intakeOptions = [
    { value: "Spring", label: "Spring" },
    { value: "Summer", label: "Summer" },
    { value: "Fall", label: "Fall" },
    { value: "Winter", label: "Winter" }
  ];

  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = 2022 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const countryOptions = [
    { value: "australia", label: "Australia" },
    { value: "canada", label: "Canada" },
    { value: "germany", label: "Germany" },
    { value: "united-kingdom", label: "United Kingdom" },
    { value: "united-states-of-america", label: "United States of America" }
  ];

  const getPendingCount = () => {
    switch (selectedPending) {
      case "applied": return stats.applied;
      case "received": return stats.received;
      case "incomplete_application": return stats.incomplete_application;
      case "documents_pending": return stats.documents_pending;
      case "denied": return stats.denied;
      default: return stats.applied;
    }
  };

  const getCompleteCount = () => {
    switch (selectedComplete) {
      case "application_complete": return stats.application_complete;
      case "submitted_to_university": return stats.submitted_to_university;
      default: return stats.application_complete;
    }
  };

  const getAdmittedCount = () => {
    switch (selectedAdmitted) {
      case "total": return stats.fully_admitted + stats.conditionally_admitted;
      case "fully_admitted": return stats.fully_admitted;
      case "conditionally_admitted": return stats.conditionally_admitted;
      default: return stats.fully_admitted + stats.conditionally_admitted;
    }
  };

  const getDeferredCount = () => {
    switch (selectedDeferred) {
      case "total": return stats.deferred_admission + stats.withdrawn;
      case "deferred_admission": return stats.deferred_admission;
      case "withdrawn": return stats.withdrawn;
      default: return stats.deferred_admission + stats.withdrawn;
    }
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      const [startDate, endDate] = filter.dateRange;
      if (startDate) queryParams.append('date_range_start', startDate.toISOString().split('T')[0]);
      if (endDate) queryParams.append('date_range_end', endDate.toISOString().split('T')[0]);
      if (filter.intake.length > 0) queryParams.append('intake', filter.intake.join(','));
      if (filter.year.length > 0) queryParams.append('year', filter.year.join(','));
      if (filter.country.length > 0) queryParams.append('country_code', filter.country.join(','));

      const res = await fetch(`${BASE_URL}/agent/dashboard?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');

      const response = await res.json();
      const data = response.data;
      setDashboardData(data);

      const newStats = { ...stats };
      (data.application_status_counts || []).forEach((item: ApplicationStatusCount) => {
        const key = item.status_key as keyof ApplicationStats;
        if (key in newStats) newStats[key] = item.count;
      });
      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    setFilter(prev => ({ ...prev, dateRange: [start, end] }));
  }, []);

  useEffect(() => {
    if (filter.dateRange[0] && filter.dateRange[1]) fetchDashboardData();
  }, [filter]);

  const handleApplyFilter = () => fetchDashboardData();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const trend = dashboardData?.applications_trend;
  const trendUp = trend && trend.change_pct >= 0;

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
      {/* Main Content */}
      <div className="col-span-12 space-y-6 xl:col-span-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Overview</h3>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
          {/* Total Students */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Students</span>
                <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {dashboardData?.total_students || 0}
                </h4>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Users className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <Link href="/partner/students" className="text-sm text-blue-500 dark:text-blue-400">
              Manage Students
            </Link>
          </div>

          {/* Total Applications */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Applications</span>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {dashboardData?.total_applications || 0}
                  </h4>
                  {trend && trend.last_month > 0 && (
                    <Badge color={trendUp ? "success" : "error"}>
                      {trendUp ? <ArrowUpIcon className="text-success-500" /> : <ArrowDownIcon className="text-error-500" />}
                      {Math.abs(trend.change_pct)}%
                    </Badge>
                  )}
                </div>
                {trend && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {trend.this_month} this month · {trend.last_month} last month
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <File className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <Link href="/partner/applications" className="text-sm text-blue-500 dark:text-blue-400">
              Manage Applications
            </Link>
          </div>

          {/* Wallet Balance — hidden for counsellors */}
          {!isCounsellor && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Wallet Balance</span>
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {dashboardData?.currency || 'INR'} {(parseFloat(String(dashboardData?.wallet_balance ?? 0)) || 0).toFixed(2)}
                  </h4>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  <Wallet className="text-gray-800 dark:text-white/90" />
                </div>
              </div>
              <Link href="/partner/wallet" className="text-sm text-blue-500 dark:text-blue-400">
                My Wallet
              </Link>
            </div>
          )}

          {/* Programs */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Programs</span>
                <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {dashboardData?.total_programs || 0}
                </h4>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <BoxIconLine className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <Link href="/partner/programs" className="text-sm text-blue-500 dark:text-blue-400">
              View Programs
            </Link>
          </div>
        </div>

        {/* Recent Applications Table */}
        {(dashboardData?.recent_applications?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white/90">Recent Applications</h4>
              <Link href="/partner/applications" className="text-xs text-blue-500 hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left pb-2 font-medium">Student</th>
                    <th className="text-left pb-2 font-medium">Program</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-left pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.recent_applications?.map(app => (
                    <tr key={app.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                      <td className="py-2 font-medium text-gray-800 dark:text-white/90">{app.student_name}</td>
                      <td className="py-2 text-gray-500 dark:text-gray-400 max-w-[150px] truncate">{app.course_name || '—'}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {app.status_label || '—'}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-gray-400">{formatDate(app.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Applications</h3>
          </div>

          {/* Filter Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                <DatePicker
                  selected={filter.dateRange[0]}
                  onChange={(dates: [Date | null, Date | null]) => setFilter(prev => ({ ...prev, dateRange: dates }))}
                  startDate={filter.dateRange[0]}
                  endDate={filter.dateRange[1]}
                  selectsRange
                  placeholderText="Select date range"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  dateFormat="dd-MM-yyyy"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Intake</label>
                <Select
                  isMulti
                  options={intakeOptions}
                  value={intakeOptions.filter(o => filter.intake.includes(o.value))}
                  onChange={(selected) => setFilter(prev => ({ ...prev, intake: selected ? selected.map(o => o.value) : [] }))}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Intake"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Intake Year</label>
                <Select
                  isMulti
                  options={yearOptions}
                  value={yearOptions.filter(o => filter.year.includes(o.value))}
                  onChange={(selected) => setFilter(prev => ({ ...prev, year: selected ? selected.map(o => o.value) : [] }))}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Year"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Countries</label>
                <Select
                  isMulti
                  options={countryOptions}
                  value={countryOptions.filter(o => filter.country.includes(o.value))}
                  onChange={(selected) => setFilter(prev => ({ ...prev, country: selected ? selected.map(o => o.value) : [] }))}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Countries"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleApplyFilter}
                disabled={loading}
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Filter className="w-4 h-4 mr-2" />
                {loading ? "Applying..." : "Apply Filter"}
              </button>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <select value={selectedPending} onChange={(e) => setSelectedPending(e.target.value)} className="text-sm font-medium text-gray-800 dark:text-white/90 bg-transparent border-none focus:ring-0 focus:outline-none">
                    <option value="applied">Application is Pending</option>
                    <option value="received">Received Application</option>
                    <option value="incomplete_application">Incomplete Application</option>
                    <option value="denied">Rejected Application</option>
                    <option value="documents_pending">Documents Pending</option>
                  </select>
                  <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{getPendingCount()}</div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <select value={selectedComplete} onChange={(e) => setSelectedComplete(e.target.value)} className="text-sm font-medium text-gray-800 dark:text-white/90 bg-transparent border-none focus:ring-0 focus:outline-none">
                    <option value="application_complete">Application Completed</option>
                    <option value="submitted_to_university">Submitted to University</option>
                  </select>
                  <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{getCompleteCount()}</div>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <select value={selectedAdmitted} onChange={(e) => setSelectedAdmitted(e.target.value)} className="text-sm font-medium text-gray-800 dark:text-white/90 bg-transparent border-none focus:ring-0 focus:outline-none">
                    <option value="total">Admitted Students</option>
                    <option value="fully_admitted">Fully Admitted</option>
                    <option value="conditionally_admitted">Conditionally Admitted</option>
                  </select>
                  <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{getAdmittedCount()}</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">Visa Approved</div>
                  <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{stats.visa_approved}</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Wallet2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">I-20 Issued</div>
                  <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{stats.i20_issued}</div>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <File className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">Denied</div>
                  <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{stats.denied}</div>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Cross className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">Visa Denied</div>
                  <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{stats.visa_denied}</div>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <select value={selectedDeferred} onChange={(e) => setSelectedDeferred(e.target.value)} className="text-sm font-medium text-gray-800 dark:text-white/90 bg-transparent border-none focus:ring-0 focus:outline-none">
                    <option value="total">Deferred / Withdrawn</option>
                    <option value="deferred_admission">Deferred Admission</option>
                    <option value="withdrawn">Application Withdrawn</option>
                  </select>
                  <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{getDeferredCount()}</div>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <CornerDownLeft className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">Arrived on Campus</div>
                  <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{stats.arrived_on_campus}</div>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <MapPinCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/partner/students/add" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 p-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-all duration-200 hover:shadow-md flex flex-col items-center justify-center gap-2">
              <User className="w-8 h-8" />
              <span className="text-sm font-medium">Add Student</span>
            </Link>
            <Link href="/partner/applications" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 p-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-all duration-200 hover:shadow-md flex flex-col items-center justify-center gap-2">
              <PlusCircle className="w-8 h-8" />
              <span className="text-sm font-medium">New Application</span>
            </Link>
            {!isCounsellor && (
              <Link href="/partner/wallet" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 p-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-all duration-200 hover:shadow-md flex flex-col items-center justify-center gap-2">
                <Wallet className="w-8 h-8" />
                <span className="text-sm font-medium">My Wallet</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="col-span-12 xl:col-span-4 mt-6 space-y-6">
        {/* Recent Students */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800 dark:text-white/90">Recent Students</h4>
            <Link href="/partner/students" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {(dashboardData?.recent_students?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400">No students yet.</p>
          ) : (
            <div className="space-y-1">
              {dashboardData?.recent_students?.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatDate(s.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Counselor Summary — agent view only */}
        {!isCounsellor && (dashboardData?.counselor_summary?.length ?? 0) > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white/90">Counselors</h4>
              <Link href="/partner/users" className="text-xs text-blue-500 hover:underline">Manage</Link>
            </div>
            <div className="space-y-1">
              {dashboardData?.counselor_summary?.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <p className="text-sm text-gray-800 dark:text-white/90">{c.name}</p>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {c.student_count} student{c.student_count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
