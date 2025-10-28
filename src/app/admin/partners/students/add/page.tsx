"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Calendar, Shield, Send } from "lucide-react";

interface StudentFormData {
  agentId: string;
  salutation: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  otp: string;
}

interface Agent {
  id: string;
  name: string;
}

// Mock function to fetch agents
const fetchAgents = async (): Promise<Agent[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Sarah Johnson" },
    { id: "3", name: "Mike Wilson" },
    { id: "4", name: "Emily Brown" },
  ];
};

// Mock function to send OTP
const sendOTP = async (phoneNumber: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("OTP sent to:", phoneNumber);
  return true;
};

// Mock function to create student
const createStudent = async (studentData: StudentFormData): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log("Student created:", studentData);
  return true;
};

export default function AddStudent() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<StudentFormData>({
    agentId: "",
    salutation: "mr",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    otp: "",
  });

  const salutationOptions = [
    { value: "mr", label: "Mr." },
    { value: "mrs", label: "Mrs." },
    { value: "miss", label: "Miss" },
    { value: "dr", label: "Dr." },
  ];

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agentsData = await fetchAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error('Error loading agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if all required fields are filled (except OTP)
  const areRequiredFieldsFilled = () => {
    return (
      formData.agentId &&
      formData.salutation &&
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.dateOfBirth &&
      formData.email.trim() &&
      formData.phoneNumber.trim()
    );
  };

  // Check if form is ready for submission
  const isFormReadyForSubmission = () => {
    return areRequiredFieldsFilled() && formData.otp.trim() && otpSent;
  };

  const handleSendOTP = async () => {
    if (!areRequiredFieldsFilled()) {
      alert("Please fill all required fields before sending OTP");
      return;
    }

    setIsSendingOTP(true);
    try {
      const success = await sendOTP(formData.phoneNumber);
      if (success) {
        setOtpSent(true);
        alert("OTP has been sent to your phone number");
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert("Error sending OTP. Please try again.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormReadyForSubmission()) {
      alert("Please fill all fields and verify OTP before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createStudent(formData);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/admin/students');
          router.refresh();
        }, 2000);
      } else {
        alert("Failed to create student. Please try again.");
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert("Error creating student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading agents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Add New Student
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new student account with OTP verification.
        </p>
      </div>
      
      <div className="space-y-6 border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Student created successfully! Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Student Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Agent Selection */}
                <div className="md:col-span-2">
                  <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Agent Name *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <User size={18} />
                    </span>
                    <select
                      id="agentId"
                      name="agentId"
                      value={formData.agentId}
                      onChange={handleInputChange}
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                    >
                      <option value="">Select Agent</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salutation */}
                <div>
                  <label htmlFor="salutation" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Salutation *
                  </label>
                  <select
                    id="salutation"
                    name="salutation"
                    value={formData.salutation}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  >
                    {salutationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Calendar size={18} />
                    </span>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Phone size={18} />
                    </span>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* OTP Field */}
                <div className="md:col-span-2">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    OTP Verification *
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <Shield size={18} />
                      </span>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={formData.otp}
                        onChange={handleInputChange}
                        placeholder="Enter OTP"
                        disabled={!areRequiredFieldsFilled()}
                        required
                        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={!areRequiredFieldsFilled() || isSendingOTP}
                      className="px-6 py-3 text-sm border border-brand-500 text-brand-500 rounded-lg hover:bg-brand-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:border-gray-600 dark:disabled:text-gray-500 dark:hover:bg-brand-900/20"
                    >
                      {isSendingOTP ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send size={16} />
                          Send OTP
                        </div>
                      )}
                    </button>
                  </div>
                  {!areRequiredFieldsFilled() && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Please fill all fields above to enable OTP verification
                    </p>
                  )}
                  {otpSent && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      OTP has been sent to your phone number
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormReadyForSubmission() || isSubmitting}
              className="flex-1 px-4 py-3 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Student"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}