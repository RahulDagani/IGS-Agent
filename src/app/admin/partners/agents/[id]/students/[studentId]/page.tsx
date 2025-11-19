"use client"
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/badge/Badge";
import { ArrowLeft, Mail, Phone, Calendar, FileText, User } from "lucide-react";

interface StudentDetails {
  user_id: number;
  email: string;
  phone: string;
  status: string;
  first_name: string;
  last_name: string;
  passport_number: string;
  dob: string;
  created_at: string;
}

export default function StudentDetailsPage() {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();

  const agentId = params.id as string;
  const studentId = params.studentId as string;


  // Fetch student details from API
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!agentId || !studentId) {
        setError("Agent ID or Student ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/tenant/agent/student/list/${agentId}/${studentId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch student details: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setStudent(data.data[0]);
        } else {
          throw new Error("Student not found or invalid API response format");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching student details");
        console.error("Error fetching student details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [token, BASE_URL, agentId, studentId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "pending":
        return "warning";
      default:
        return "primary";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-16">
            <div className="text-lg">Loading student details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="text-lg text-red-500 mb-4">Error: {error}</div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className=" px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="text-lg text-gray-500 mb-4">Student not found</div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className=" px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Students
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Student ID: {student.user_id}
              </p>
            </div>
            <Badge
              color={getStatusColor(student.status)}
            >
              {formatStatus(student.status)}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    First Name
                  </label>
                  <p className="text-gray-800 dark:text-white/90 text-lg">
                    {student.first_name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Last Name
                  </label>
                  <p className="text-gray-800 dark:text-white/90 text-lg">
                    {student.last_name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Date of Birth
                  </label>
                  <p className="text-gray-800 dark:text-white/90 text-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(student.dob)} 
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({calculateAge(student.dob)} years old)
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Passport Number
                  </label>
                  <p className="text-gray-800 dark:text-white/90 text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {student.passport_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email Address
                    </label>
                    <p className="text-gray-800 dark:text-white/90">
                      {student.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Phone Number
                    </label>
                    <p className="text-gray-800 dark:text-white/90">
                      {student.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Account Information */}
          <div className="space-y-6">
            {/* Account Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Account Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    User ID
                  </label>
                  <p className="text-gray-800 dark:text-white/90 font-mono">
                    #{student.user_id}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Account Status
                  </label>
                  <Badge
                    color={getStatusColor(student.status)}
                  >
                    {formatStatus(student.status)}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-800 dark:text-white/90">
                    {formatDate(student.created_at)}
                  </p>
                </div>
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
}