"use client";

import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Globe,
  GraduationCap,
  PieChart as PieChartIcon,
  TrendingUp,
  University,
  Users,
  Zap,
  Filter,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

// Types for the new API responses
interface PerformanceAnalytics {
  top_courses: Array<{
    id: number;
    course_name: string;
    university_id: number;
    university_name: string;
    application_count: number;
    agent_applications: number;
    direct_applications: number;
    enrollments: number;
  }>;
  top_universities: Array<{
    id: number;
    university_name: string;
    application_count: number;
    agent_applications: number;
    direct_applications: number;
    enrollments: number;
    total_commission: string;
  }>;
  high_conversion_universities: Array<{
    id: number;
    university_name: string;
    total_applications: number;
    successful_enrollments: number;
    conversion_rate: string;
  }>;
  agent_ranking: Array<{
    agent_id: number;
    agent_name: string;
    agent_email: string;
    total_applications: number;
    successful_enrollments: number;
    total_commission: string;
    total_payout: string;
    success_rate: string;
  }>;
  country_wise_revenue: Array<{
    country_code: string;
    application_count: number;
    direct_revenue: string;
    agent_revenue: string;
    total_revenue: string;
    university_count: number;
  }>;
}

interface FinancialKPIs {
  filters: {
    available_years: number[];
    current_year: number;
    available_currencies: string[];
  };
  direct_commission: Array<{
    currency: string;
    total: string;
    student_count: number;
  }>;
  agent_commission: Array<{
    currency: string;
    total: string;
    active_agents: number;
  }>;
  paid_to_agents: Array<{
    currency: string;
    total: string;
    transactions: number;
  }>;
  net_profit: Array<{
    currency: string;
    direct_commission: string;
    paid_to_agents: string;
    net_profit: string;
  }>;
  monthly_revenue: Array<{
    month: number;
    currencies: Record<string, {
      direct_commission: string;
      agent_commission: string;
      direct_students: number;
      agent_students: number;
    }>;
  }>;
  year_over_year_growth: Array<{
    currency: string;
    current_year: string;
    previous_year: string;
    growth_percentage: string;
  }>;
}

interface DashboardData {
  performance: PerformanceAnalytics | null;
  financial: FinancialKPIs | null;
}

export default function TenantDashboard() {
  const [data, setData] = useState<DashboardData>({ performance: null, financial: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>([2026]);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch both APIs with year filter
        const [performanceRes, financialRes] = await Promise.all([
          fetch(`${BASE_URL}/tenant/dashboard/performance-analytics?year=${selectedYear}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${BASE_URL}/tenant/dashboard/financial-kpis?year=${selectedYear}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        // Check responses
        if (!performanceRes.ok || !financialRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [performance, financial] = await Promise.all([
          performanceRes.json(),
          financialRes.json(),
        ]);

        if (performance.success) setData(prev => ({ ...prev, performance: performance.data }));
        if (financial.success) {
          setData(prev => ({ ...prev, financial: financial.data }));
          if (financial.data?.filters?.available_years) {
            setAvailableYears(financial.data.filters.available_years);
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, selectedYear]);

  // Prepare data for KPI cards
  const getFinancialKPIs = () => {
    if (!data.financial) return [];

    // Sum across all currencies for overview
    const totalDirect = data.financial.direct_commission.reduce((sum, curr) => 
      sum + parseFloat(curr.total), 0);
    const totalAgent = data.financial.agent_commission.reduce((sum, curr) => 
      sum + parseFloat(curr.total), 0);
    const totalPaid = data.financial.paid_to_agents.reduce((sum, curr) => 
      sum + parseFloat(curr.total), 0);
    const totalNet = data.financial.net_profit.reduce((sum, curr) => 
      sum + parseFloat(curr.net_profit), 0);

    return [
      {
        title: "Direct Commission",
        icon: <DollarSign className="w-4 h-4 text-gray-700 dark:text-gray-300" />,
        value: `$${totalDirect.toFixed(2)}`,
        note: `${data.financial.direct_commission.reduce((sum, curr) => sum + curr.student_count, 0)} students`,
        noteColor: "text-green-500 dark:text-green-400",
        border: "from-green-500",
      },
      {
        title: "Agent Commission",
        icon: <Users className="w-4 h-4 text-gray-700 dark:text-gray-300" />,
        value: `$${totalAgent.toFixed(2)}`,
        note: `${data.financial.agent_commission.reduce((sum, curr) => sum + curr.active_agents, 0)} active agents`,
        noteColor: "text-blue-500 dark:text-blue-400",
        border: "from-blue-500",
      },
      {
        title: "Paid to Agents",
        icon: <CreditCard className="w-4 h-4 text-gray-700 dark:text-gray-300" />,
        value: `$${totalPaid.toFixed(2)}`,
        note: `${data.financial.paid_to_agents.reduce((sum, curr) => sum + curr.transactions, 0)} transactions`,
        noteColor: "text-purple-500 dark:text-purple-400",
        border: "from-purple-500",
      },
      {
        title: "Net Profit",
        icon: <TrendingUp className="w-4 h-4 text-gray-700 dark:text-gray-300" />,
        value: `$${totalNet.toFixed(2)}`,
        note: totalNet >= 0 ? "Positive growth" : "Negative growth",
        noteColor: totalNet >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400",
        border: totalNet >= 0 ? "from-green-500" : "from-red-500",
      },
    ];
  };

  // Prepare monthly revenue chart data
  const getMonthlyRevenueData = () => {
    if (!data.financial?.monthly_revenue) return [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return data.financial.monthly_revenue.map(item => {
      let total = 0;
      Object.values(item.currencies).forEach(curr => {
        total += parseFloat(curr.direct_commission) + parseFloat(curr.agent_commission);
      });
      
      return {
        month: monthNames[item.month - 1] || `Month ${item.month}`,
        revenue: total,
      };
    });
  };

  // Prepare currency distribution for pie chart
  const getCurrencyDistribution = () => {
    if (!data.financial?.direct_commission) return [];

    return data.financial.direct_commission.map(item => ({
      name: item.currency,
      value: parseFloat(item.total),
      color: getCurrencyColor(item.currency),
    }));
  };

  // Get color for currency
  const getCurrencyColor = (currency: string) => {
    const colors: Record<string, string> = {
      USD: '#10B981',
      EUR: '#3B82F6',
      GBP: '#8B5CF6',
      AUD: '#F59E0B',
      CAD: '#EF4444',
    };
    return colors[currency] || '#6B7280';
  };

  // Prepare top courses data
  const getTopCoursesData = () => {
    if (!data.performance?.top_courses) return [];
    
    return data.performance.top_courses.slice(0, 5).map(course => ({
      name: course.course_name.length > 20 
        ? course.course_name.substring(0, 20) + '...' 
        : course.course_name,
      applications: course.application_count,
      university: course.university_name,
    }));
  };

  // Prepare country revenue data
  const getCountryRevenueData = () => {
    if (!data.performance?.country_wise_revenue) return [];

    return data.performance.country_wise_revenue.map(country => ({
      country: country.country_code,
      revenue: parseFloat(country.total_revenue),
      applications: country.application_count,
    }));
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

  const kpiCards = getFinancialKPIs();
  const monthlyRevenueData = getMonthlyRevenueData();
  const currencyData = getCurrencyDistribution();
  const topCoursesData = getTopCoursesData();
  const countryRevenueData = getCountryRevenueData();

  return (
    <>
      
      {/* Year Filter */}
      <div className="mb-6 flex items-center justify-between">
        
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        Dashboard
      </h2>
        <div className="flex items-center gap-2 bg-white dark:bg-white/[0.03] rounded-lg border border-gray-200 dark:border-white/10 p-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-gray-800 dark:text-white/90 border-none focus:outline-none focus:ring-0 text-sm"
          >
            {availableYears.map(year => (
              <option key={year} value={year} className="dark:bg-gray-800">
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, index) => (
            <div
              key={index}
              className="overflow-hidden relative bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6"
            >
              <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${card.border} to-transparent rounded-l-xl`} />

              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  {card.icon}
                </div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400">{card.title}</h3>
              </div>

              <p className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                {card.value}
              </p>

              <p className={`text-xs ${card.noteColor}`}>{card.note}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 - Revenue Trend and Currency Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Trend */}
          <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Monthly Revenue {selectedYear}</h2>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData}>
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
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 4, fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Currency Distribution */}
          <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <PieChartIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Commission by Currency</h2>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currencyData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={90}
                    dataKey="value"
                    label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                  >
                    {currencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [`$${value}`, 'Commission']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Courses and Country Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Courses */}
          {topCoursesData.length > 0 && (
            <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Top Courses</h2>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCoursesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" tick={{ fill: "#6B7280" }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={120}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value, name, props) => [
                        `${value} applications`,
                        props.payload.university
                      ]}
                    />
                    <Bar dataKey="applications" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Country Revenue */}
          {countryRevenueData.length > 0 && (
            <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-yellow-600 p-2 rounded-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Revenue by Country</h2>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="country" tick={{ fill: "#6B7280" }} />
                    <YAxis tick={{ fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`$${value}`, 'Revenue'];
                        return [value, 'Applications'];
                      }}
                    />
                    <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Agent Rankings Table */}
        {data.performance?.agent_ranking && data.performance.agent_ranking.length > 0 && (
          <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Top Performing Agents</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Agent</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Applications</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Enrollments</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Success Rate</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Commission</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {data.performance.agent_ranking.map((agent) => (
                    <tr key={agent.agent_id} className="border-b border-gray-200 dark:border-white/10 last:border-0">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{agent.agent_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{agent.agent_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-300">{agent.total_applications}</td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-300">{agent.successful_enrollments}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(agent.success_rate) >= 75
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : parseFloat(agent.success_rate) >= 50
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {agent.success_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-300">${parseFloat(agent.total_commission).toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-300">${parseFloat(agent.total_payout).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Year over Year Growth */}
        {data.financial?.year_over_year_growth && data.financial.year_over_year_growth.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.financial.year_over_year_growth.map((growth, index) => (
              <div key={index} className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">{growth.currency}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    parseFloat(growth.growth_percentage) >= 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {parseFloat(growth.growth_percentage) >= 0 ? '+' : ''}{growth.growth_percentage}%
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current: <span className="font-medium text-gray-800 dark:text-white">${parseFloat(growth.current_year).toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Previous: <span className="font-medium text-gray-800 dark:text-white">${parseFloat(growth.previous_year).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}