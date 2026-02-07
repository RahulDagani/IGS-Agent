"use client"

import React, { useEffect, useState } from "react";
import { Check, Clock, File, Heart, Table, PenSquare, FileText, User, GraduationCap, Briefcase, Star, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import CalendlyEmbed from "@/components/CalendlyEmbed"
import Image from "next/image";

interface DashboardData {
  applications: {
    total: number;
  };
  shortlisted_courses: {
    total: number;
  };
  profile: {
    completion_percentage: number;
    is_complete: boolean;
  };
  test_scores: {
    total_added: number;
    is_complete: boolean;
  };
  academic_qualifications: {
    is_complete: boolean;
  };
  work_experience: {
    is_complete: boolean;
  };
  documents: {
    mandatory: number;
    uploaded: number;
    is_complete: boolean;
  };
  links: DashboardLinks[];
}

interface DashboardLinks {
  text: string;
  img: string;
  link: string;
}

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);

  const BASE_URL = "https://api.applystore.org/api";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/student/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status) {
          setDashboardData(result.data);
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Calculate document upload percentage
  const calculateDocumentPercentage = () => {
    if (!dashboardData) return 0;
    if (dashboardData.documents.mandatory === 0) return 100;
    return Math.round((dashboardData.documents.uploaded / dashboardData.documents.mandatory) * 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 dark:text-gray-400">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600 dark:text-red-400">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-12">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                <span className="border-b-4 border-indigo-600">Hi</span> {user?.name}
              </h1>
            </div>
            
            {/* Programs Summary */}
            {dashboardData && (
              <div className="flex gap-4 text-sm">
                {/* Book Session Button */}
                {/* <button
                  onClick={() => setIsCalendlyModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                >
                  <MessageSquare size={16} />
                  Book a Session
                </button> */}

                {/* Flywire Link */}
                <div className="text-center">
                  <a
                    href={dashboardData.links[0].link}
                    className="flywire-button flex px-4 py-2 border-2 border-blue-600 rounded-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-black dark:text-white mr-2">
                      {dashboardData.links[0].text}
                    </span>
                    <Image
                      height={36}
                      width={74}
                      src={dashboardData.links[0].img}
                      alt="Flywire"
                      className="flywire-logo"
                    />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Metrics Grid */}
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
                      {dashboardData?.applications.total || 0}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  <File className="text-gray-800 dark:text-white/90" />
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/student/editProfile?tab=applications"
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
                      {dashboardData?.shortlisted_courses.total || 0}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  <Heart className="text-gray-800 dark:text-white/90" />
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/student/courses/shortlisted"
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  View Shortlisted ›
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
                    <h4 className="text-gray-800 text-title-sm dark:text-white/90">
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
                  onClick={() => setIsCalendlyModalOpen(true)}
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
                              <div 
                                className="h-full bg-green-600" 
                                style={{ width: `${dashboardData?.profile.completion_percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {dashboardData?.profile.completion_percentage || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/student/editProfile?profileTab=profile`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        {dashboardData?.profile.is_complete ? 'Update' : 'Complete'} ›
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
                              <div 
                                className={`h-full ${dashboardData?.documents.is_complete ? 'bg-green-600' : 'bg-indigo-600'}`}
                                style={{ width: `${calculateDocumentPercentage()}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {calculateDocumentPercentage()}%
                              <span className="ml-1 text-gray-400">
                                ({dashboardData?.documents.uploaded || 0}/{dashboardData?.documents.mandatory || 0})
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/student/editProfile?tab=documents`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        {dashboardData?.documents.is_complete ? 'View' : 'Upload'} ›
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
                          <div className="flex items-center text-sm gap-2 mt-1 text-green-600">
                            {dashboardData?.academic_qualifications.is_complete ? 'Completed' : 'Incomplete'}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/student/editProfile?profileTab=academics`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        {dashboardData?.academic_qualifications.is_complete ? 'Update' : 'Complete'} ›
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
                          <div className={`flex items-center gap-2 text-sm mt-1 ${dashboardData?.test_scores.is_complete ? 'text-green-600' : 'text-yellow-500'}`}>
                            {dashboardData?.test_scores.is_complete ? 'Completed' : `Added (${dashboardData?.test_scores.total_added || 0} Test${dashboardData?.test_scores.total_added !== 1 ? 's' : ''})`}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/student/editProfile?profileTab=testscores`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        {dashboardData?.test_scores.is_complete ? 'Update' : 'Complete'} ›
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
                          <div className={`flex items-center gap-2 mt-1 text-sm ${dashboardData?.work_experience.is_complete ? 'text-green-600' : 'text-blue-600'}`}>
                            {dashboardData?.work_experience.is_complete ? 'Completed' : 'Optional / Not Added'}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/student/editProfile?profileTab=workexperience`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        {dashboardData?.work_experience.is_complete ? 'Update' : 'Add'} ›
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendly Modal */}
      {isCalendlyModalOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Book a Counselor Session
              </h3>
              <button
                onClick={() => setIsCalendlyModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Calendly Embed */}
            <div className="p-4 " style={{height: "500px"}}>
              <CalendlyEmbed url="https://calendly.com/sumitrathore8294/30min" />
            </div>

            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsCalendlyModalOpen(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}