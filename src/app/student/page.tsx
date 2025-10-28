
import type { Metadata } from "next"; 
import React from "react";
import { Check, Clock, File, Heart, Table, PenSquare, FileText } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Student panel | Apply Tech",
  description: "This is complete solution for student for study abroad applications",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
          {/* My Applications Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  My Applications
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    15
                  </h4>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <File className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
          </div>

          {/* Shortlisted Courses Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Shortlisted Courses
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    40
                  </h4>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Heart className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
          </div>

          {/* Application Completed Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Application completed
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    2
                  </h4>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Check className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
          </div>

          {/* Application Pending Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Application Pending
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    8
                  </h4>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Clock className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
          </div>
        </div>

       {/* Quick Links Section */}
<div className="mb-8">
  <div className="rounded-xl">
    <div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h5 className="mb-0 text-lg font-semibold text-gray-800 dark:text-white">
          Quick Links
        </h5>
      </div>

      {/* Quick Link Cards */}
      <div className="space-y-4 mt-3">
        {/* Start New Application */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col sm:flex-row items-start gap-3 w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800">
              <Table className="text-indigo-600" size={24} />
            </div>
            <div className="flex-grow">
              <strong className="text-gray-800 dark:text-white">Start new application</strong><br/>
              <small className="text-gray-600 dark:text-gray-400">
                Submit your application to your dream course
              </small>
            </div>
          </div>
          <Link
            href="/student/applications"
            className="mt-3 md:mt-0 inline-flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md whitespace-nowrap "
          >
            Start Application ›
          </Link>
        </div>

        {/* Update Academic Interests */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col sm:flex-row items-start gap-3 w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-gray-800">
              <PenSquare className="text-indigo-600 " size={24} />
            </div>
            <div className="flex-grow">
              <strong className="text-gray-800 dark:text-white">Update Academic Interests & Test Scores</strong><br/>
              <small className="text-gray-600 dark:text-gray-400">
                Keep your profile up-to-date to get the most relevant course recommendations.
              </small>
            </div>
          </div>
          <Link
            href="/student/profile"
            className="mt-3 md:mt-0 inline-flex items-center justify-center gap-1 border border-indigo-600 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/30 text-sm px-4 py-2 rounded-md whitespace-nowrap"
          >
            Update Now ›
          </Link>
        </div>
      </div>
    </div>
  </div>
</div>

{/* To Do List Section */}
<div className="mb-8">
  <div className="rounded-xl">
    <div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h5 className="mb-0 text-lg font-semibold text-gray-800 dark:text-white">
          To Do List
        </h5>
      </div>

      {/* To Do Cards */}
      <div className="space-y-4 mt-3">
        {/* Complete Common Application Form */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ">
          <div className="flex flex-col sm:flex-row items-start gap-3 w-full">
            {/* Progress Ring */}
            <div className="relative w-[50px] h-[50px]">
              <svg className="w-full h-full">
                <circle
                  cx="25"
                  cy="25"
                  r="22"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                ></circle>
                <circle
                  cx="25"
                  cy="25"
                  r="22"
                  stroke="#673de6"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  style={{ strokeDasharray: '138.23', strokeDashoffset: '0' }}
                ></circle>
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-700 dark:text-purple-400">
                100%
              </div>
            </div>

            <div className="flex-grow">
              <strong className="text-gray-800 dark:text-white">Complete Common Application Form</strong><br/>
              <small className="text-gray-600 dark:text-gray-400">
                Fill out a single application form that works for multiple universities.
              </small>
            </div>
          </div>

          <Link
            href="/student/apply/application-form"
            className="mt-3 md:mt-0 inline-flex items-center justify-center gap-1 border border-[#290d80] text-[#290d80] hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/30 text-sm px-4 py-2 rounded-md whitespace-nowrap"
          >
            Complete Profile ›
          </Link>
        </div>

        {/* Upload Common Documents */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col sm:flex-row items-start gap-3 w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800">
              <FileText className="text-indigo-600 " size={24} />
            </div>
            <div className="flex-grow">
              <strong className="text-gray-800 dark:text-white">Upload Common Documents</strong><br/>
              <small className="text-gray-600 dark:text-gray-400">
                Submit your essential documents once and use them across all your applications.
              </small>
            </div>
          </div>

          <Link
            href="/student/apply/documents"
            className="mt-3 md:mt-0 inline-flex items-center justify-center gap-1 border border-[#290d80] text-[#290d80] hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/30 text-sm px-4 py-2 rounded-md whitespace-nowrap"
          >
            Start Uploading ›
          </Link>
        </div>
      </div>
    </div>
  </div>
</div>

      </div>
    </div>
  );
}