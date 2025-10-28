"use client"
import React from "react";
import { User } from "lucide-react";

interface Application {
  id: number;
  university: string;
  course: string;
  intake: string;
  status: "Applied" | "Received" | "Submitted to University" | "Documents Pending";
  assignedTo: string;
  studentName: string;
  studentEmail: string;
  agentName: string;
  agentEmail: string;
  country?: string;
  degree?: string;
  location?: string;
  externalEvaluation?: string;
  ielts?: number;
  pte?: number;
  duolingo?: number;
}

// Define the table data using the interface
const tableData: Application[] = [
  {
    id: 1,
    university: "Harvard University",
    course: "Computer Science",
    intake: "Fall 2024",
    status: "Applied",
    assignedTo: "John Doe",
    studentName: "Alice Johnson",
    studentEmail: "alice.johnson@example.com",
    agentName: "John Smith",
    agentEmail: "john.smith@example.com",
    country: "United States of America",
    degree: "Bachelors",
    location: "Massachusetts, United States of America",
    externalEvaluation: "Required (WES)",
    ielts: 7.0,
    pte: 68,
    duolingo: 120
  },
  // Add more applications as needed
];

// Icons component for the card
const CardIcons = {
  GraduationCap: () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l9-5M12 20l-9-5" />
    </svg>
  ),
  MapMarker: () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  FileAlt: () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

const ApplicationCard: React.FC<{ application: Application }> = ({ application }) => {
  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "Applied":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "Received":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Submitted to University":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "Documents Pending":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
      {/* Status Badge */}
      <div className="flex justify-end">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full mb-2 ${getStatusColor(application.status)}`}>
          {application.status}
        </span>
      </div>
      
      {/* Top Section */}
      <div className="flex items-start justify-between">
        {/* University Info */}
        <div className="flex items-start gap-3">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
            {application.university.split(' ').map(word => word[0]).join('')}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white leading-snug">
              {application.course}
            </h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {application.university}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {application.country}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 space-y-3">
        {/* Degree */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <CardIcons.GraduationCap />
          <span>
            <strong className="font-semibold text-gray-800 dark:text-white">Degree:</strong>{" "}
            {application.degree}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <CardIcons.MapMarker />
          <span>
            <strong className="font-semibold text-gray-800 dark:text-white">Location:</strong>{" "}
            {application.location}
          </span>
        </div>

        {/* External Evaluation */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <CardIcons.FileAlt />
          <span>
            <strong className="font-semibold text-gray-800 dark:text-white">
              External Evaluation:
            </strong>{" "}
            {application.externalEvaluation}
          </span>
        </div>
      </div>

      {/* Entry Requirements */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
          ENTRY REQUIREMENTS
        </h3>
        <div className="flex gap-2 flex-wrap">
          {application.ielts && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              IELTS: <span className="text-gray-900 dark:text-white">{application.ielts}</span>
            </span>
          )}
          {application.pte && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              PTE: <span className="text-gray-900 dark:text-white">{application.pte}</span>
            </span>
          )}
          {application.duolingo && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              Duolingo: <span className="text-gray-900 dark:text-white">{application.duolingo}</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Student */}
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 space-y-3">
        <User size={16} className="mb-0 mr-2"/>
        <span>
          <strong className="font-semibold text-gray-800 dark:text-white">Student:</strong>{" "}
          {`${application.studentEmail}`}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-red-500 mb-3">Pending</p>
        <div className="flex justify-between items-center text-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
              <span className="text-red-500 text-lg font-bold">✕</span>
            </div>
            <p className="text-xs dark:text-white">Common Form</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
              <span className="text-red-500 text-lg font-bold">✕</span>
            </div>
            <p className="text-xs dark:text-white">Common Docs</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
              <span className="text-red-500 text-lg font-bold">✕</span>
            </div>
            <p className="text-xs dark:text-white ">Specific Docs</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm transition-all">
          LIVE CHAT
        </button>
        <button className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/30 font-semibold py-2 rounded-lg text-sm transition-all">
          Continue
        </button>
      </div>
    </div>
  );
};

export default function ApplicationsTable() {
  return (
    <div className="space-y-4 p-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tableData.length > 0 ? (
          tableData.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No applications found.
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {tableData.length} applications
      </div>
    </div>
  );
}