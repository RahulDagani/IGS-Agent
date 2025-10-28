import type { Metadata } from "next";
import React from "react";
import { 
  Users, 
  FileText, 
  BookOpen, 
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  MoreHorizontal
} from "lucide-react";

export const metadata: Metadata = {
  title: "University Platform | Apply Tech",
  description: "This is a complete solution for Universities to manage student applications.",
};

export default function University() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Students
              </span>
              <div className="flex items-center">
                <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                  88
                </h4>
                <span className="ml-2">
                  <div className="flex items-center rounded-full bg-green-50 px-2 py-1 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    9.05%
                  </div>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <Users className="text-gray-800 dark:text-white/90 h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Applications */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Applications
              </span>
              <div className="flex items-center">
                <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                  526
                </h4>
                <span className="ml-2">
                  <div className="flex items-center rounded-full bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    9.05%
                  </div>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <FileText className="text-gray-800 dark:text-white/90 h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Enrolled Applications */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Enrolled Applications
              </span>
              <div className="flex items-center">
                <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                  360
                </h4>
                <span className="ml-2">
                  <div className="flex items-center rounded-full bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    9.05%
                  </div>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <BookOpen className="text-gray-800 dark:text-white/90 h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Loan Applications */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Loan Applications
              </span>
              <div className="flex items-center">
                <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                  22
                </h4>
                <span className="ml-2">
                  <div className="flex items-center rounded-full bg-green-50 px-2 py-1 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    9.05%
                  </div>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <GraduationCap className="text-gray-800 dark:text-white/90 h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - 8/12 */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Applications Overview */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex justify-between items-center mb-6">
              <h6 className="font-bold text-lg dark:text-white text-black">Applications Overview</h6>
              <FileText className="h-5 w-5 text-gray-500" />
            </div>
            
            <div className="flex gap-4 mb-6">
              <select className="dark:text-white text-black flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                <option value="">Select Date Range</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="custom">Custom</option>
              </select>
              <select className="dark:text-white text-black flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                <option value="">Select Intake</option>
                <option value="spring">Spring 2025</option>
                <option value="summer">Summer 2025</option>
                <option value="fall">Fall 2025</option>
                <option value="winter">Winter 2025</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Application Submitted */}
  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 lg:border-b-0 lg:border-r lg:pr-4">
    <div className="flex items-center">
      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3 dark:bg-blue-900/20">
        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          Application Submitted to University
        </p>
        <small className="text-gray-500 dark:text-gray-400">
          {"Student's file has been sent to them"}
        </small>
      </div>
    </div>
    <div className="font-bold text-gray-900 dark:text-white">50</div>
  </div>

  {/* Fully Admitted */}
  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 lg:border-b-0">
    <div className="flex items-center">
      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3 dark:bg-green-900/20">
        <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          Fully Admitted
        </p>
        <small className="text-gray-500 dark:text-gray-400">
          Student got an unconditional admission
        </small>
      </div>
    </div>
    <div className="font-bold text-gray-900 dark:text-white">30</div>
  </div>

  {/* Conditionally Admitted */}
  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 lg:border-b-0 lg:border-r lg:pr-4">
    <div className="flex items-center">
      <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mr-3 dark:bg-yellow-900/20">
        <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          Conditionally Admitted
        </p>
        <small className="text-gray-500 dark:text-gray-400">
          Admission given but with conditions
        </small>
      </div>
    </div>
    <div className="font-bold text-gray-900 dark:text-white">12</div>
  </div>

  {/* Denied */}
  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 lg:border-b-0">
    <div className="flex items-center">
      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mr-3 dark:bg-red-900/20">
        <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          Denied
        </p>
        <small className="text-gray-500 dark:text-gray-400">
          Application rejected by university
        </small>
      </div>
    </div>
    <div className="font-bold text-gray-900 dark:text-white">4</div>
  </div>

  {/* Deferred Admission */}
  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 lg:border-b-0 lg:border-r lg:pr-4">
    <div className="flex items-center">
      <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mr-3 dark:bg-purple-900/20">
        <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          Deferred Admission
        </p>
        <small className="text-gray-500 dark:text-gray-400">
          Student admission moved to next intake
        </small>
      </div>
    </div>
    <div className="font-bold text-gray-900 dark:text-white">25</div>
  </div>

  {/* Application Withdrawn */}
  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 lg:border-b-0">
    <div className="flex items-center">
      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3 dark:bg-gray-800">
        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          Application Withdrawn
        </p>
        <small className="text-gray-500 dark:text-gray-400">
          Student or counselor withdrew the application
        </small>
      </div>
    </div>
    <div className="font-bold text-gray-900 dark:text-white">20</div>
  </div>
</div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Courses */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex justify-between items-center mb-6">
                <h6 className="font-bold text-lg dark:text-white text-black">Top Courses</h6>
                <BookOpen className="h-5 w-5 text-gray-500" />
              </div>
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg dark:bg-gray-800">
                <p className="text-gray-500">Bar chart visualization would go here</p>
              </div>
            </div>

            {/* Applications By Country */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex justify-between items-center mb-6">
                <h6 className="font-bold text-lg dark:text-white text-black">Applications By Country</h6>
                <MapPin className="h-5 w-5 text-gray-500" />
              </div>
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg dark:bg-gray-800">
                <p className="text-gray-500">Country distribution chart would go here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - 4/12 */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Latest Announcement */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex justify-between items-center mb-6">
              <h6 className="font-bold text-lg dark:text-white text-black">Latest Announcement</h6>
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              {/* Announcement 1 */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mr-3 dark:bg-yellow-900/20">
                    <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      Admission Deadline Extended
                    </p>
                    <small className="text-green-600 dark:text-green-400">2025-09-05</small>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>

              {/* Announcement 2 */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3 dark:bg-green-900/20">
                    <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      New Course Added:
                    </p>
                    <small className="text-green-600 dark:text-green-400">Data Science</small>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>

              {/* Announcement 3 */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3 dark:bg-blue-900/20">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      Webinar on AI
                    </p>
                    <small className="text-green-600 dark:text-green-400">Tomorrow</small>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Upcoming Webinars */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex justify-between items-center mb-6">
              <h6 className="font-bold text-lg dark:text-white text-black">Upcoming Webinars</h6>
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              {/* Webinar 1 */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3 dark:bg-green-900/20">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      {"Today's Webinar"}
                    </p>
                    <div className="flex flex-col">
                      <span className="text-green-600 dark:text-green-400 text-sm">AI & Data Science</span>
                      <span className="text-gray-500 text-xs font-bold">2025-09-05</span>
                    </div>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>

              {/* Webinar 2 */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3 dark:bg-green-900/20">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      Scholarship Opportunities in the UK
                    </p>
                    <div className="flex flex-col">
                      <span className="text-green-600 dark:text-green-400 text-sm">University of Oxford</span>
                      <span className="text-gray-500 text-xs font-bold">2025-09-10</span>
                    </div>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>

              {/* Webinar 3 */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3 dark:bg-green-900/20">
                    <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      Life in Canada: Student Experiences & Careers
                    </p>
                    <div className="flex flex-col">
                      <span className="text-green-600 dark:text-green-400 text-sm">University of Toronto</span>
                      <span className="text-gray-500 text-xs font-bold">2025-09-15</span>
                    </div>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}