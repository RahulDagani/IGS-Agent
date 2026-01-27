"use client";

import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  HardDrive,
  Layers,
  PieChart as PieChartIcon,
  TrendingUp,
  University,
  User,
  Users,
  Zap,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

// Types for API responses
interface DashboardOverviewData {
  subscription: {
    plan_name: string;
    billing_cycle: string;
    price: number;
    status: string;
    current_period_end: string | null;
  };
  storage: {
    total_storage_mb: number;
    current_used_mb: number;
    usage_percentage: number;
  };
  users: {
    total_users: number;
    students: number | null;
    agents: number | null;
    agent_students: number | null;
  };
  applications: {
    total_applications: number;
    submitted_applications: number | null;
    pending_applications: number | null;
  };
  universities: number;
  courses: {
    course_count: number;
    popular_courses: Array<{ name: string; count: number }> | null;
  };
  pending_agents: number;
}

interface UsageData {
  usage: {
    api_calls_used: number;
    api_calls_limit: number;
    api_usage_percentage: number;
    storage_used_mb: number;
    storage_limit_mb: number;
    storage_usage_percentage: number;
  };
  payment_history: Array<{
    date: string;
    amount: number;
    status: string;
  }>;
  next_billing: string | null;
}

interface ApplicationsData {
  status_distribution: Array<{
    status: string;
    count: number;
  }>;
  monthly_trends: Array<{
    month: string;
    applications: number;
  }>;
  popular_universities: Array<{
    university_name: string;
    applications: number;
  }>;
}

interface PerformanceData {
  success_rate: number;
  avg_processing_time: number;
  growth_metrics: {
    current_month_applications: number;
    previous_month_applications: number;
    growth_percentage: number;
  };
}

interface ChartsData {
  trend_chart: {
    labels: string[];
    data: number[];
  };
  status_chart: {
    labels: string[];
    data: number[];
  };
  university_chart: {
    labels: string[];
    data: number[];
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function TenantDashboard() {
  const [overviewData, setOverviewData] = useState<DashboardOverviewData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [applicationsData, setApplicationsData] = useState<ApplicationsData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [
          overviewRes,
          usageRes,
          applicationsRes,
          performanceRes,
          chartsRes,
        ] = await Promise.all([
          fetch(`${BASE_URL}/tenant/dashboard/overview`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${BASE_URL}/tenant/dashboard/usage`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${BASE_URL}/tenant/dashboard/applications`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${BASE_URL}/tenant/dashboard/performance`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${BASE_URL}/tenant/dashboard/charts`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        // Check all responses
        const responses = [overviewRes, usageRes, applicationsRes, performanceRes, chartsRes];
        const failedResponse = responses.find(res => !res.ok);
        if (failedResponse) {
          throw new Error(`Failed to fetch dashboard data: ${failedResponse.status}`);
        }

        // Parse all responses
        const [overview, usage, applications, performance, charts] = await Promise.all([
          overviewRes.json(),
          usageRes.json(),
          applicationsRes.json(),
          performanceRes.json(),
          chartsRes.json(),
        ]);

        // Debug logging
        console.log('Charts data:', charts);

        // Set data if successful
        if (overview.success) setOverviewData(overview.data);
        if (usage.success) setUsageData(usage.data);
        if (applications.success) setApplicationsData(applications.data);
        if (performance.success) setPerformanceData(performance.data);
        if (charts.success) setChartsData(charts.data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Format data for top cards
  const getTopCards = () => {
    if (!overviewData) return [];

    return [
      {
        title: "Active Plan",
        icon: <CreditCard className="w-4 h-4 text-gray-700 dark:text-gray-300" />,
        value: overviewData.subscription.plan_name,
        note: overviewData.subscription.status === 'active' 
          ? `$${overviewData.subscription.price}/${overviewData.subscription.billing_cycle}` 
          : "No active subscription",
        noteColor: overviewData.subscription.status === 'active' 
          ? "text-green-500 dark:text-green-400" 
          : "text-red-500 dark:text-red-400",
        border: overviewData.subscription.status === 'active' ? "from-green-500" : "from-gray-500",
      },
      {
        title: "Total Applications",
        icon: <FileText className="w-4 h-4 text-gray-700 dark:text-gray-300" />,
        value: overviewData.applications.total_applications.toString(),
        note: `${overviewData.applications.submitted_applications || 0} submitted`,
        noteColor: "text-blue-500 dark:text-blue-400",
        border: "from-blue-500",
      },
      {
        title: "Total Users",
        icon: <Users className="w-4 h-4 text-gray-700 dark:text-gray-300" />,
        value: overviewData.users.total_users.toString(),
        note: `${overviewData.users.students || 0} students • ${overviewData.users.agents || 0} agents`,
        noteColor: "text-purple-500 dark:text-purple-400",
        border: "from-purple-500",
      },
      {
        title: "Universities",
        icon: <University className="w-4 h-4 text-gray-700 dark:text-gray-300" />,
        value: overviewData.universities.toString(),
        note: `${overviewData.courses.course_count} courses available`,
        noteColor: "text-yellow-500 dark:text-yellow-400",
        border: "from-yellow-500",
      },
    ];
  };

  // Format data for usage cards
  const getUsageCards = () => {
    if (!usageData) return [];

    return [
      {
        title: "API Usage",
        icon: <Zap className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
        used: usageData.usage.api_calls_used,
        limit: usageData.usage.api_calls_limit,
        percentage: usageData.usage.api_usage_percentage,
        color: usageData.usage.api_usage_percentage > 80 ? "bg-red-500" : "bg-blue-500",
        note: "API calls this month",
      },
      {
        title: "Storage Usage",
        icon: <HardDrive className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
        used: usageData.usage.storage_used_mb,
        limit: usageData.usage.storage_limit_mb,
        percentage: usageData.usage.storage_usage_percentage,
        color: usageData.usage.storage_usage_percentage > 80 ? "bg-red-500" : "bg-green-500",
        note: "Storage used",
        unit: "MB",
      },
    ];
  };

  // Format data for performance cards
  const getPerformanceCards = () => {
    if (!performanceData || !applicationsData) return [];

    return [
      {
        title: "Success Rate",
        icon: <CheckCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
        value: `${performanceData.success_rate}%`,
        color: "bg-green-500",
        desc: "Application success rate",
        stats: [
          { 
            value: applicationsData.status_distribution.find(s => s.status === 'accepted')?.count || 0, 
            label: "Accepted", 
            color: "text-green-500 dark:text-green-400" 
          },
          { 
            value: applicationsData.status_distribution.find(s => s.status === 'rejected')?.count || 0, 
            label: "Rejected", 
            color: "text-red-500 dark:text-red-400" 
          },
        ],
      },
      {
        title: "Processing Time",
        icon: <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
        value: `${performanceData.avg_processing_time} days`,
        color: "bg-blue-500",
        desc: "Average processing time",
        stats: [
          { 
            value: applicationsData.status_distribution.find(s => s.status === 'pending')?.count || 0, 
            label: "Pending", 
            color: "text-yellow-500 dark:text-yellow-400" 
          },
          { 
            value: applicationsData.status_distribution.find(s => s.status === 'processing')?.count || 0, 
            label: "Processing", 
            color: "text-blue-500 dark:text-blue-400" 
          },
        ],
      },
      {
        title: "Growth",
        icon: <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
        value: `${performanceData.growth_metrics.growth_percentage}%`,
        color: performanceData.growth_metrics.growth_percentage >= 0 ? "bg-green-500" : "bg-red-500",
        desc: "Applications growth",
        stats: [
          { 
            value: performanceData.growth_metrics.current_month_applications, 
            label: "This Month", 
            color: "text-green-500 dark:text-green-400" 
          },
          { 
            value: performanceData.growth_metrics.previous_month_applications, 
            label: "Last Month", 
            color: "text-gray-500 dark:text-gray-400" 
          },
        ],
      },
    ];
  };

  // Format data for charts - FIXED
  const getTrendChartData = () => {
    if (!chartsData?.trend_chart || !chartsData.trend_chart.labels || !chartsData.trend_chart.data) {
      // Return default empty data if no charts data
      return [{ month: 'No Data', applications: 0 }];
    }
    
    try {
      return chartsData.trend_chart.labels.map((label, index) => ({
        month: label,
        applications: chartsData.trend_chart.data[index] || 0,
      }));
    } catch (err) {
      console.error('Error processing trend chart data:', err);
      return [{ month: 'Error', applications: 0 }];
    }
  };

  const getStatusChartData = () => {
    // First check if we have applicationsData with status_distribution
    if (applicationsData?.status_distribution && applicationsData.status_distribution.length > 0) {
      const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6'];
      
      return applicationsData.status_distribution.map((item, index) => ({
        name: item.status && typeof item.status === 'string' && item.status.length > 0 
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
          : `Status ${index + 1}`,
        value: item.count || 0,
        color: colors[index % colors.length],
      }));
    }
    
    // If no applicationsData, check chartsData
    if (chartsData?.status_chart && chartsData.status_chart.labels && chartsData.status_chart.data) {
      const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6'];
      
      try {
        return chartsData.status_chart.labels.map((label, index) => {
          // FIX: Check if label is defined and is a string before using charAt
          const name = label && typeof label === 'string' && label.length > 0
            ? label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
            : `Status ${index + 1}`;
            
          return {
            name,
            value: chartsData.status_chart.data[index] || 0,
            color: colors[index % colors.length],
          };
        }).filter(item => item.value > 0); // Only show items with value > 0
      } catch (err) {
        console.error('Error processing status chart data:', err);
        return [{ name: 'Error', value: 100, color: '#9CA3AF' }];
      }
    }
    
    // Default fallback
    return [{ name: 'No Data', value: 100, color: '#9CA3AF' }];
  };

  const getUniversityChartData = () => {
    // First check applicationsData
    if (applicationsData?.popular_universities && applicationsData.popular_universities.length > 0) {
      return applicationsData.popular_universities.slice(0, 5).map((uni) => ({
        name: uni.university_name || 'Unknown University',
        applications: uni.applications || 0,
      }));
    }
    
    // Then check chartsData
    if (chartsData?.university_chart && chartsData.university_chart.labels && chartsData.university_chart.data) {
      try {
        return chartsData.university_chart.labels.map((label, index) => ({
          name: label || `University ${index + 1}`,
          applications: chartsData.university_chart.data[index] || 0,
        })).filter(uni => uni.applications > 0); // Only show universities with applications
      } catch (err) {
        console.error('Error processing university chart data:', err);
        return [];
      }
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-800 dark:text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-800 dark:text-white text-lg">No data available</div>
      </div>
    );
  }

  const topCards = getTopCards();
  const usageCards = getUsageCards();
  const performanceCardsData = getPerformanceCards();
  const trendChartData = getTrendChartData();
  const statusChartData = getStatusChartData();
  const universityChartData = getUniversityChartData();

  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard" />

      <div className="space-y-6">
        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topCards.map((card, index) => (
            <div
              key={index}
              className="overflow-hidden relative bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6"
            >
              {/* Colored left border gradient */}
              <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${card.border} to-transparent rounded-l-xl`} />

              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  {card.icon}
                </div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400">{card.title}</h3>
              </div>

              {/* Value */}
              <p className={`font-bold text-gray-800 ${card.title === "Active Plan" ? "text-lg mb-3" : "text-title-sm"} dark:text-white/90`}>
                {card.value}
              </p>

              {/* Note */}
              <p className={`text-xs ${card.noteColor}`}>{card.note}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Trend */}
          <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Applications Trend</h2>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6B7280" }}
                    axisLine={{ stroke: "#6B7280" }}
                    tickLine={{ stroke: "#6B7280" }}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280" }}
                    axisLine={{ stroke: "#6B7280" }}
                    tickLine={{ stroke: "#6B7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [`${value} applications`, 'Count']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 4, fill: "#fff" }}
                    activeDot={{ r: 6, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Application Status Distribution */}
          <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <PieChartIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Application Status</h2>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
  <Pie
    data={statusChartData}
    cx="50%"
    cy="50%"
    labelLine={true}
    outerRadius={90}
    dataKey="value"
    label={(entry) => `${entry.name}: ${entry.value}`}
  >
    {statusChartData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color} />
    ))}
  </Pie>
  <Tooltip
    contentStyle={{
      backgroundColor: "#1F2937",
      border: "none",
      borderRadius: "8px",
      color: "#fff", // Already here, but let's ensure it's working
    }}
    itemStyle={{
      color: "#fff", // Add this to style individual items in tooltip
    }}
    labelStyle={{
      color: "#fff", // Add this to style the label in tooltip
    }}
    formatter={(value, name, props) => [
      `${value} applications`,
      props.payload.name,
    ]}
  />
  <Legend 
  wrapperStyle={{
    paddingTop: "30px",
  }}
  iconSize={12}
  layout="horizontal"
  verticalAlign="bottom"
  align="center"
/>
</PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Performance Metrics</h2>
          
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {performanceCardsData.map((card, index) => (
              <div
                key={index}
                className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{card.title}</h3>
                </div>

                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{card.value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{card.desc}</p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {card.stats.map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center border border-gray-200 dark:border-white/10"
                    >
                      <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage and Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {usageCards.map((card, index) => (
              <div
                key={index}
                className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    {card.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{card.title}</h2>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                      {card.used.toLocaleString()}/{card.limit.toLocaleString()} {card.unit || ''}
                    </span>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {card.percentage}%
                    </span>
                  </div>
                  
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${card.color}`}
                      style={{ width: `${Math.min(card.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm">{card.note}</p>
              </div>
            ))}

            {/* Next Billing */}
            {/* {usageData?.next_billing && (
              <div className="md:col-span-2 bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-yellow-600 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Next Billing</h2>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      ${overviewData?.subscription.price || 0}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {overviewData?.subscription.plan_name}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Due Date
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {new Date(usageData.next_billing).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )} */}
          </div>

          {/* Popular Universities Card (Moved to separate section) */}
        </div>

        {/* Popular Universities */}
        {/* {universityChartData.length > 0 && (
          <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <University className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Popular Universities</h2>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={universityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    axisLine={{ stroke: "#6B7280" }}
                    tickLine={{ stroke: "#6B7280" }}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280" }}
                    axisLine={{ stroke: "#6B7280" }}
                    tickLine={{ stroke: "#6B7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [`${value} applications`, 'Count']}
                    labelFormatter={(label) => `University: ${label}`}
                  />
                  <Bar dataKey="applications" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )} */}

        {/* Recent Payments */}
        {/* {usageData?.payment_history && usageData.payment_history.length > 0 && (
          <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Payments</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.payment_history.slice(0, 5).map((payment, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-white/10 last:border-0">
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-300">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-300 font-medium">
                        ${payment.amount}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {payment.status && typeof payment.status === 'string' && payment.status.length > 0
                            ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
                            : 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}
      </div>
    </>
  );
}