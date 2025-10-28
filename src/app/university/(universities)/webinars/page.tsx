"use client"
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

interface Webinar {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
}

const webinarData: Webinar[] = [
  {
    id: 1,
    title: "Introduction to React",
    description: "Learn the basics of React framework and component architecture",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T11:30:00Z",
    status: "completed"
  },
  {
    id: 2,
    title: "Advanced TypeScript Patterns",
    description: "Deep dive into advanced TypeScript patterns and best practices",
    startTime: "2024-01-20T14:00:00Z",
    endTime: "2024-01-20T16:00:00Z",
    status: "scheduled"
  },
  {
    id: 3,
    title: "Cloud Infrastructure with AWS",
    description: "Building scalable cloud infrastructure using AWS services",
    startTime: "2024-01-25T09:00:00Z",
    endTime: "2024-01-25T12:00:00Z",
    status: "scheduled"
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    description: "Modern UI/UX design principles for web applications",
    startTime: "2024-01-10T13:00:00Z",
    endTime: "2024-01-10T14:30:00Z",
    status: "cancelled"
  },
  {
    id: 5,
    title: "DevOps Best Practices",
    description: "Implementing DevOps practices for efficient development workflows",
    startTime: "2024-01-18T11:00:00Z",
    endTime: "2024-01-18T12:30:00Z",
    status: "live"
  },
];

type SortField = keyof Webinar | "";
type SortDirection = "asc" | "desc";

// Status Badge Component
const StatusBadge = ({ status }: { status: Webinar["status"] }) => {
  const statusConfig = {
    scheduled: { color: "bg-blue-100 text-blue-800", label: "Scheduled" },
    live: { color: "bg-green-100 text-green-800", label: "Live" },
    completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
    cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Details Modal Component
const WebinarDetailsModal = ({ 
  webinar, 
  isOpen, 
  onClose 
}: { 
  webinar: Webinar | null; 
  isOpen: boolean; 
  onClose: () => void 
}) => {
  if (!isOpen || !webinar) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99999">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {webinar.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300">{webinar.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Start Time</h3>
              <p className="text-gray-600 dark:text-gray-300">{formatDate(webinar.startTime)}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">End Time</h3>
              <p className="text-gray-600 dark:text-gray-300">{formatDate(webinar.endTime)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Status</h3>
            <StatusBadge status={webinar.status} />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WebinarsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = webinarData.filter((webinar) => {
      const matchesSearch = 
        webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        webinar.status.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof Webinar) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Webinar) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const handleViewDetails = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setIsModalOpen(true);
  };

  const handleCancelWebinar = (webinarId: number) => {
    // Implement cancel logic here
    console.log("Canceling webinar:", webinarId);
    // You would typically update the status in your state or make an API call
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Webinars" />
      <div className="space-y-6">
    
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, description, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <Link href="/university/webinars/add" className="shrink-0">
          <button className="h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Webinar
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    { key: "title", label: "Title" },
                    { key: "description", label: "Description" },
                    { key: "startTime", label: "Start Time" },
                    { key: "endTime", label: "End Time" },
                    { key: "status", label: "Status" },
                    { key: "actions", label: "Actions" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => key !== "actions" ? handleSort(key as keyof Webinar) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== "actions" && (
                          <span className="text-xs">{getSortIcon(key as keyof Webinar)}</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((webinar) => (
                    <TableRow key={webinar.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {webinar.title}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[300px] truncate">
                        {webinar.description}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatTime(webinar.startTime)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatTime(webinar.endTime)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <StatusBadge status={webinar.status} />
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          {/* Edit Button */}
                          <Link href={`/admin/webinars/edit/${webinar.id}`}>
                            <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                              Edit
                            </button>
                          </Link>
                          
                          {/* Details Button */}
                          <button 
                            onClick={() => handleViewDetails(webinar)}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            Details
                          </button>
                          
                          {/* Cancel Button */}
                          {webinar.status !== "cancelled" && webinar.status !== "completed" && (
                            <button 
                              onClick={() => handleCancelWebinar(webinar.id)}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      No webinars found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedData.length} of {webinarData.length} webinars
      </div>

      {/* Details Modal */}
      <WebinarDetailsModal 
        webinar={selectedWebinar}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
    </div>
  );
}