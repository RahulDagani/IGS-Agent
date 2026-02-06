"use client"

import React from "react";
import { Check, Clock, File, Heart, Table, PenSquare, FileText, User, GraduationCap, Briefcase, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";


export default function StudentDashboard() {

  const {user} = useAuth();
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        {/* Metrics Grid - Updated as per image.png */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          {/* My Applications Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xl text-gray-800 dark:text-white/90">
                  My Applications
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    1
                  </h4>
                  {/* <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    (1 in progress)
                  </span> */}
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <File className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/student/applications"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Track Applications ›
              </Link>
            </div>
          </div>

          {/* Shortlisted Courses Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xl text-gray-800 dark:text-white/90">
                  Shortlisted Courses
                </span>
                <div className="flex align-middle">
                  <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                    0
                  </h4>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Heart className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/student/courses"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View All Courses ›
              </Link>
            </div>
          </div>

          {/* Book a Counselor Session Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xl text-gray-800 dark:text-white/90">
                  Book a Counselor Session
                </span>
                <div className="flex align-middle">
                  <h4 className=" text-gray-800 text-title-sm dark:text-white/90">
                    Available 
                  </h4>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <MessageSquare className="text-gray-800 dark:text-white/90" />
              </div>
            </div>
            <div className="mt-4">
              <button 
                // href="/student/counselor"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Book Now ›
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Todo and Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Quick Links Section - Right Column */}
          <div className="mb-8">
            <div className="rounded-xl">
              <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Quick Action
                  </h5>
                </div>

                {/* Quick Link Cards */}
                <div className="space-y-4">
                  {/* Start New Application */}
                  <div className="flex flex-col items-start justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md">
                    <div className="flex items-start gap-3 w-full mb-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800">
                        <Table className="text-indigo-600" size={24} />
                      </div>
                      <div className="flex-grow">
                        <strong className="text-gray-800 dark:text-white">Start New Application</strong>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Submit your application to your dream course
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/student/courses"
                      className="w-full inline-flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2.5 rounded-md whitespace-nowrap"
                    >
                      Start Application ›
                    </Link>
                  </div>

                  {/* Get Recommended Courses */}
                  <div className="flex flex-col items-start justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md">
                    <div className="flex items-start gap-3 w-full mb-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800">
                        <Heart className="text-indigo-600" size={24} />
                      </div>
                      <div className="flex-grow">
                        <strong className="text-gray-800 dark:text-white">Get Recommended Courses</strong>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Discover courses that match your profile and interests
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/student/courses"
                      className="w-full inline-flex items-center justify-center gap-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/30 text-sm px-4 py-2.5 rounded-md whitespace-nowrap"
                    >
                      Get Recommendations ›
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Todo List Section - Left Column */}
          <div className="mb-8">
            <div className="rounded-xl">
              <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
                    To Do
                  </h5>
                </div>

                {/* Todo Items */}
                <div className="space-y-3">
                  {/* Personal Information */}
                  <div className="flex items-center justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
                        <User className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>
                      <div>
                        <strong className="text-gray-800 dark:text-white text-sm">
                          Personal Information
                        </strong>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-600" style={{ width: '75%' }}></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">75%</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/student/editProfile/${user?.id}?profileTab=profile`}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Update ›
                    </Link>
                  </div>

                  {/* Academic Qualification */}
                  <div className="flex items-center justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
                        <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>
                      <div>
                        <strong className="text-gray-800 dark:text-white text-sm">
                          Academic Qualification
                        </strong>
                        <div className="flex items-center gap-2 mt-1 text-green-600">
                          Completed
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/student/editProfile/${user?.id}?profileTab=academics`}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Update ›
                    </Link>
                  </div>

                  {/* Test Scores */}
                  <div className="flex items-center justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
                        <Star className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>
                      <div>
                        <strong className="text-gray-800 dark:text-white text-sm">
                          Test Scores
                        </strong>
                        <div className="flex items-center gap-2 mt-1 text-yellow-500">
                          Added (1 Test)
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/student/editProfile/${user?.id}?profileTab=testscores`}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Update ›
                    </Link>
                  </div>

                  {/* Work Experience (optional) */}
                  <div className="flex items-center justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
                        <Briefcase className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>
                      <div>
                        <strong className="text-gray-800 dark:text-white text-sm">
                          Work Experience (optional)
                        </strong>
                        <div className="flex items-center gap-2 mt-1 text-blue-600">
                         Optional / Not Added
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/student/editProfile/${user?.id}?profileTab=workexperience`}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Update ›
                    </Link>
                  </div>

                  {/* Upload Documents */}
                  <div className="flex items-center justify-between shadow-sm rounded-xl p-4 dark:text-white transition border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
                        <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>
                      <div>
                        <strong className="text-gray-800 dark:text-white text-sm">
                          Upload Documents
                        </strong>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600" style={{ width: '40%' }}></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">40%</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/student/editProfile/${user?.id}?tab=documents`}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Upload ›
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}