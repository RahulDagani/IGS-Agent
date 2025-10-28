"use client"
import React, { useState } from "react";
import Link from "next/link";

// Mock data for reports
const reportData = {
  overview: {
    totalStudents: 1250,
    totalWebinars: 45,
    activeApplications: 89,
    completionRate: 78
  },
  webinarStats: {
    byStatus: [
      { status: "Completed", count: 25, percentage: 55.6 },
      { status: "Scheduled", count: 12, percentage: 26.7 },
      { status: "Live", count: 3, percentage: 6.7 },
      { status: "Cancelled", count: 5, percentage: 11.1 }
    ],
    attendance: {
      average: 67,
      highest: 95,
      lowest: 45
    }
  },
  studentStats: {
    byDepartment: [
      { department: "Computer Science", count: 320, percentage: 25.6 },
      { department: "Engineering", count: 280, percentage: 22.4 },
      { department: "Business", count: 195, percentage: 15.6 },
      { department: "Arts & Sciences", count: 175, percentage: 14.0 },
      { department: "Medicine", count: 150, percentage: 12.0 },
      { department: "Law", count: 130, percentage: 10.4 }
    ],
    applicationStatus: [
      { status: "Accepted", count: 450, percentage: 36 },
      { status: "Pending", count: 89, percentage: 7.1 },
      { status: "Rejected", count: 125, percentage: 10 },
      { status: "Under Review", count: 586, percentage: 46.9 }
    ]
  },
  financials: {
    revenue: {
      total: 125000,
      tuition: 98000,
      webinars: 27000
    },
    expenses: {
      total: 89000,
      staff: 45000,
      infrastructure: 25000,
      marketing: 19000
    }
  }
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  icon?: string | React.ReactNode;
}

const StatCard = ({ title, value, subtitle, trend, icon }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`inline-flex items-center mt-2 text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
          </div>
        )}
      </div>
      {icon && (
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          {icon}
        </div>
      )}
    </div>
  </div>
);

const ProgressBar = ({ percentage, color = "blue" }: { percentage: number; color?: "blue" | "green" | "yellow" | "red" | "purple"  }) => {
  const colorClasses: { [key: string]: string } = {
  blue: "bg-blue-500",
  green: "bg-green-500", 
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  purple: "bg-purple-500"
};

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${colorClasses[color]}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const DonutChart = ({ data, title }: { data: Array<{ label: string; value: number; color: string }>; title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulated = 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, index) => {
              const startAngle = (accumulated / total) * 359.9;
              const endAngle = ((accumulated + item.value) / total) * 359.9;
              accumulated += item.value;

              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{total}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {item.value} ({(item.value / total * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last_30_days");
  const [exportFormat, setExportFormat] = useState("pdf");

  const handleExport = () => {
    // Mock export functionality
    console.log(`Exporting reports as ${exportFormat} for ${dateRange}`);
    alert(`Reports exported as ${exportFormat.toUpperCase()} successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive overview of university performance and metrics
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="this_year">This Year</option>
            <option value="last_year">Last Year</option>
          </select>

          {/* Export Format */}
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={reportData.overview.totalStudents.toLocaleString()}
          subtitle="Registered students"
          trend={{ direction: 'up', value: '12%' }}
          icon="👥"
        />
        <StatCard
          title="Webinars Conducted"
          value={reportData.overview.totalWebinars}
          subtitle="This academic year"
          trend={{ direction: 'up', value: '8%' }}
          icon="🎓"
        />
        <StatCard
          title="Active Applications"
          value={reportData.overview.activeApplications}
          subtitle="Pending review"
          trend={{ direction: 'down', value: '5%' }}
          icon="📄"
        />
        <StatCard
          title="Completion Rate"
          value={`${reportData.overview.completionRate}%`}
          subtitle="Course completion"
          trend={{ direction: 'up', value: '3%' }}
          icon="✅"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webinar Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Webinar Statistics
          </h3>
          <div className="space-y-4">
            {reportData.webinarStats.byStatus.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{stat.status}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stat.count} ({stat.percentage}%)
                  </span>
                </div>
                <ProgressBar 
                  percentage={stat.percentage} 
                  color={index === 0 ? 'green' : index === 1 ? 'blue' : index === 2 ? 'yellow' : 'red'}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Attendance Metrics</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{reportData.webinarStats.attendance.average}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{reportData.webinarStats.attendance.highest}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Highest</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{reportData.webinarStats.attendance.lowest}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lowest</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Distribution */}
        <DonutChart
          title="Students by Department"
          data={[
            { label: "Computer Science", value: 320, color: "#3B82F6" },
            { label: "Engineering", value: 280, color: "#10B981" },
            { label: "Business", value: 195, color: "#F59E0B" },
            { label: "Arts & Sciences", value: 175, color: "#EF4444" },
            { label: "Medicine", value: 150, color: "#8B5CF6" },
            { label: "Law", value: 130, color: "#06B6D4" }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Application Status
          </h3>
          <div className="space-y-4">
            {reportData.studentStats.applicationStatus.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{stat.status}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stat.count} ({stat.percentage}%)
                  </span>
                </div>
                <ProgressBar 
                  percentage={stat.percentage} 
                  color={index === 0 ? 'green' : index === 1 ? 'yellow' : index === 2 ? 'red' : 'blue'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Financial Overview
          </h3>
          <div className="space-y-6">
            {/* Revenue */}
            <div>
              <h4 className="font-medium text-green-600 mb-3">Revenue</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${reportData.financials.revenue.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tuition Fees</span>
                  <span>${reportData.financials.revenue.tuition.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Webinar Income</span>
                  <span>${reportData.financials.revenue.webinars.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div>
              <h4 className="font-medium text-red-600 mb-3">Expenses</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${reportData.financials.expenses.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Staff Salaries</span>
                  <span>${reportData.financials.expenses.staff.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Infrastructure</span>
                  <span>${reportData.financials.expenses.infrastructure.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Marketing</span>
                  <span>${reportData.financials.expenses.marketing.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900 dark:text-white">Net Profit</span>
                <span className="text-green-600">
                  ${(reportData.financials.revenue.total - reportData.financials.expenses.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/students">
            <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Student Management</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage student records and applications</div>
            </button>
          </Link>
          
          <Link href="/admin/webinars">
            <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Webinar Dashboard</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage webinars</div>
            </button>
          </Link>
          
          <Link href="/admin/analytics">
            <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Advanced Analytics</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Deep dive into metrics</div>
            </button>
          </Link>
          
          <Link href="/admin/settings">
            <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Report Settings</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure reporting parameters</div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}