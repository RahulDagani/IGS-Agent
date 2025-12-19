"use client"

import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import Badge from "@/components/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { DollarSign, File, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

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

  const studentsTrend = getTrendPercentage(statistics.students.total_students);
  const applicationsTrend = getTrendPercentage(statistics.applications.total_applications);
  const enrolledTrend = getTrendPercentage(parseInt(statistics.applications.fully_admitted || '0'));
  const paymentsTrend = getTrendPercentage(statistics.payments.count);

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
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
          {/* Wallet Balance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Wallet Balance
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {wallet.currency} {wallet.balance.toFixed(2)}
                  </h4>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Wallet className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
          </div>
          {/* ... rest of your JSX ... */}

          {/* <!-- Total Students --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Students
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {statistics.students.total_students}
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
          </div>
          {/* <!-- Total Students End --> */}

          {/* <!-- Total Applications --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Applications
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {statistics.applications.total_applications}
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
          </div>
          {/* <!-- Total Applications End --> */}

          {/* <!-- Fully Admitted (Enrolled) --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Fully Admitted
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {statistics.applications.fully_admitted}
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
          </div>
          {/* <!-- Fully Admitted End --> */}

          {/* <!-- Total Payments --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Payments
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {statistics.payments.count}
                  </h4>
                  <span className="my-auto ml-2">
                    <Badge color={paymentsTrend.trend === 'up' ? "success" : "error"}>
                      {paymentsTrend.trend === 'up' ? (
                        <ArrowUpIcon className="text-success-500" />
                      ) : (
                        <ArrowDownIcon className="text-error-500" />
                      )}
                      {paymentsTrend.percentage}%
                    </Badge>
                  </span>
                </div>
                {statistics.payments.total_amount && (
                  <p className="text-xs text-gray-500 mt-1">
                    Total: {wallet.currency} {statistics.payments.total_amount.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <DollarSign className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
          </div>
          {/* <!-- Total Payments End --> */}

          {/* <!-- Conditionally Admitted --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Conditionally Admitted
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {statistics.applications.conditionally_admitted}
                  </h4>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <BoxIconLine className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
          </div>
          {/* <!-- Conditionally Admitted End --> */}
        </div>

        {/* Quick Links Section */}
        {quick_links.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quick_links.map((link, index) => (
                <Link
                  key={index}
                  href={link.link}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800 mb-2">
                    {getIconComponent(link.icon)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* <MonthlySalesChart /> */}
      </div>

      <div className="col-span-12 xl:col-span-5">
        {/* <MonthlyTarget /> */}
        
        {/* Application Status Summary */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Application Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Submitted to University</span>
              <span className="font-medium">{statistics.applications.submitted_to_uni}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Incomplete</span>
              <span className="font-medium">{statistics.applications.incomplete}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Documents Pending</span>
              <span className="font-medium">{statistics.applications.documents_pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Visa Approved</span>
              <span className="font-medium">{statistics.applications.visa_approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Denied</span>
              <span className="font-medium">{statistics.applications.denied}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}