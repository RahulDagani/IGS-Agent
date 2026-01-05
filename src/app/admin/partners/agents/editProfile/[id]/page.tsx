"use client"
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useSearchParams } from "next/navigation";

import ProfileForm from "./Profile";
import Applications from "./Applications";
import DocumentsPage from "./Documents";


interface Student {
  name: string;
  email: string;
  phone: string;
  profile_status: string,
  total_applications: number,
  total_pending_documents: number

}




export default function StudentDetailsPage() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const activeTabFromUrl = searchParams.get("tab");

  const [refreshDocuments, setRefreshDocuments] = useState(0);
  
  const {id: studentId} = useParams();
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  useEffect(() => {
    fetchStudentDetails();
  }, [refreshDocuments]);

  useEffect(() => {
      if (activeTabFromUrl) {
        setActiveTab(activeTabFromUrl);
      }
    }, [activeTabFromUrl]);

  

  const fetchStudentDetails = async () => {
    
    try {
      setLoading(true);
        const response = await fetch(`${BASE_URL}/tenant/agent/student/dashbaord/status/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { data } = await response.json();
      // Mock data for now
      const mockStudent = {
        name: data.student.name,
        email: data.student.email,
        phone: data.student.phone,
        profile_status : data.profile_status,
        total_applications: data.total_applications,
        total_pending_documents: data.total_pending_documents
      };
      
      setStudent(mockStudent);

      } else {
          
          console.error('Failed to fetch student data');
        }
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-400">Student not found</h3>
        </div>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">The requested student could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="row parentTabsRespFlex">
        <style jsx>{`
          .disabled .ts-control {
            border-color: var(--Border-check, #EBEBEB);
            background-color: var(--Border-On-light, #EBEBEB);
          }

          @media (max-width: 768px) {
            #EditMobVal {
              width: 100%;
            }
            #editMob {
              margin-bottom: 25px;
            }
          }

          @media (min-width: 768px) and (max-width: 991px) {
            #EditMobVal {
              width: 70%;
              font-size: 12px;
              height: 30px;
            }
          }

          @media (min-width: 992px) and (max-width: 1070px) {
            #EditMobVal {
              width: 100%;
            }
          }

          .tooltip-holder {
            position: relative;
          }

          .tooltip-holder:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
          }

          .tooltip-text {
            visibility: hidden;
            width: 300px;
            background-color: #333;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 8px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 12px;
          }

          .tooltip-text::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #333 transparent transparent transparent;
          }
        `}</style>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">

        {/* Welcome User Section */}
        <div className="d-flex gap-16 col-span-2 rounded-lg border border-gray-300 dark:border-gray-700 p-4" style={{ flex: 2 }}>
          <div className="welcomeUser">
            <div className="d-flex welcomeUser-items flex-wrap gap-4">
              <div className="studentDetail">
                <div className="namefld">
                  <span id="dispName" className="camelCasing font-semibold text-lg dark:text-white">
                    {student.name}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="namefld flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.66634 2.66406H13.333C14.0663 2.66406 14.6663 3.26406 14.6663 3.9974V11.9974C14.6663 12.7307 14.0663 13.3307 13.333 13.3307H2.66634C1.93301 13.3307 1.33301 12.7307 1.33301 11.9974V3.9974C1.33301 3.26406 1.93301 2.66406 2.66634 2.66406Z" stroke="#939393" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.6663 4L7.99967 8.66667L1.33301 4" stroke="#939393" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="emailSmall text-gray-600 dark:text-gray-300" id="dispEmail">
                    {student.email}
                  </span>
                </div>
              </div>
              
              <div className="studentDetaiMargin">
                <div className="namefld flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.6669 11.2827V13.2827C14.6677 13.4683 14.6297 13.6521 14.5553 13.8222C14.4809 13.9924 14.3718 14.1451 14.235 14.2706C14.0982 14.3961 13.9367 14.4917 13.7608 14.5511C13.5849 14.6106 13.3985 14.6327 13.2136 14.616C11.1622 14.3931 9.19161 13.6921 7.46028 12.5693C5.8495 11.5458 4.48384 10.1801 3.46028 8.56934C2.3336 6.83014 1.63244 4.85 1.41361 2.78934C1.39695 2.60498 1.41886 2.41918 1.47795 2.24375C1.53703 2.06833 1.63199 1.90713 1.75679 1.77042C1.88159 1.6337 2.03348 1.52448 2.20281 1.44968C2.37213 1.37489 2.55517 1.33618 2.74028 1.336H4.74028C5.06382 1.33282 5.37748 1.44739 5.62279 1.65836C5.8681 1.86933 6.02833 2.1623 6.07361 2.48267C6.15803 3.12271 6.31458 3.75115 6.54028 4.356C6.62998 4.59462 6.64939 4.85395 6.59622 5.10326C6.54305 5.35257 6.41952 5.58141 6.24028 5.76267L5.39361 6.60934C6.34265 8.27837 7.72458 9.6603 9.39361 10.6093L10.2403 9.76267C10.4215 9.58343 10.6504 9.4599 10.8997 9.40673C11.149 9.35356 11.4083 9.37297 11.6469 9.46267C12.2518 9.68837 12.8802 9.84492 13.5203 9.92934C13.8441 9.97502 14.1399 10.1381 14.3513 10.3877C14.5627 10.6372 14.6751 10.9557 14.6669 11.2827Z" stroke="#939393" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span id="dispMob" className="StudentmobileNumber text-gray-600 dark:text-gray-300">
                    {student.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Main Tabs */}
        <div className="maintabs-flex-responsive  col-span-4 rounded-lg border border-gray-300 dark:border-gray-700 p-4">
          <ul className="nav maintabs nav-tabs flex flex-wrap justify-between mx-20" role="tablist">
            <li id="profileSection" className="mr-2">
              <button
                className={`nav-link flex flex-col items-center px-4 py-3 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 "
                    : "border-transparent text-gray-500 hover:text-gray-700  dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <span className="num mb-2 bg-gray-200 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  1
                </span>
                <span className="flex justify-center items-center">
                  <span>Profile</span> 
                  {student.profile_status == "COMPLETE" ? <span className="num ml-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      
                    </span> : <span className="num ml-1 bg-red-700 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      
                    </span>}
                  </span> 
              </button>
              
            </li>
            
            <li id="application" className="mr-2">
              <button
                className={`nav-link flex flex-col items-center px-4 py-3 font-medium text-sm ${
                  activeTab === "applications"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 "
                    : "border-transparent text-gray-500 hover:text-gray-700  dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("applications")}
              >
                <span className="num mb-2 bg-gray-200 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  2
                </span>
                <span className="flex justify-center items-center">
                  <span>Applications</span> 
                  <span className="num ml-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      {student.total_applications}
                    </span>
                  </span>
              </button>
            </li>
            
            <li id="docsView">
              <button
                className={`nav-link flex flex-col items-center px-4 py-3 font-medium text-sm ${
                  activeTab === "documents"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 "
                    : "border-transparent text-gray-500 hover:text-gray-700  dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("documents")}
              >
                <span className="num mb-2 bg-gray-200 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  3
                </span>
                
                 <span className="flex justify-center items-center">
                  <span>Documents</span> 
                  <span className="num ml-1 bg-red-700 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      {student.total_pending_documents}
                    </span>
                  </span>
              </button>
            </li>
          </ul>
        </div>

        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content mt-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
         <ProfileForm />
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <Applications />
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <DocumentsPage key={refreshDocuments} onDocumentUpload={() => setRefreshDocuments(prev => prev + 1)} />
        )}
      </div>
    </div>
  );
}