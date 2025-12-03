"use client"
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ApiStudent {
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

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  dateOfBirth: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

interface Agent {
  user_id: number;
  email: string;
  phone: string | null;
  name: string;
  business_name: string | null;
  is_agent_verified: number;
  is_payment_verified: number;
}

type SortField = keyof Student | "";
type SortDirection = "asc" | "desc";

export default function StudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all"); // "all" or agent ID
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const params = useParams();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tenant/agent/list`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agents: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setAgents(data.data);
        } else {
          throw new Error("Invalid API response format for agents");
        }
      } catch (err) {
        console.error("Error fetching agents:", err);
        // Don't set error here, just log it - we can still show students
      } finally {
        setLoadingAgents(false);
      }
    };

    if (token) {
      fetchAgents();
    }
  }, [token, BASE_URL]);

  // Fetch students based on selected agent
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        let url = `${BASE_URL}/tenant/agent/student/list`;
        
        // If a specific agent is selected, use the agent-specific endpoint
        if (agentFilter !== "all") {
          url = `${BASE_URL}/tenant/agent/student/list/${agentFilter}`;
        }
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch students: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Transform API data to match our component's interface
          const transformedStudents: Student[] = data.data.map((apiStudent: ApiStudent) => ({
            id: apiStudent.user_id,
            firstName: apiStudent.first_name || "N/A",
            lastName: apiStudent.last_name || "N/A",
            fullName: `${apiStudent.first_name || ""} ${apiStudent.last_name || ""}`.trim() || "N/A",
            email: apiStudent.email,
            phone: apiStudent.phone || "N/A",
            passportNumber: apiStudent.passport_number || "N/A",
            dateOfBirth: apiStudent.dob ? new Date(apiStudent.dob).toLocaleDateString() : "N/A",
            status: getStudentStatus(apiStudent.status),
            createdAt: apiStudent.created_at ? new Date(apiStudent.created_at).toLocaleDateString() : "N/A"
          }));
          
          setStudents(transformedStudents);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching students");
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStudents();
    }
  }, [token, BASE_URL, agentFilter]); // Add agentFilter as dependency

  // Helper function to determine status
  const getStudentStatus = (status: string): Student["status"] => {
    switch (status?.toLowerCase()) {
      case "active":
        return "active";
      case "inactive":
        return "inactive";
      case "pending":
        return "pending";
      default:
        return "pending";
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = students.filter((student) => {
      const matchesSearch = 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        student.passportNumber.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      
      return matchesSearch && matchesStatus;
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
  }, [students, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Student) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusColor = (status: Student["status"]) => {
    switch (status) {
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

  const formatStatus = (status: Student["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get the currently selected agent's name
  const getSelectedAgentName = () => {
    if (agentFilter === "all") return "All Agents";
    const agent = agents.find(a => a.user_id.toString() === agentFilter);
    return agent ? agent.name : "Unknown Agent";
  };

  if (loading && loadingAgents) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Students for {getSelectedAgentName()}
        </h1>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, phone, or passport..."
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

        {/* Filters Row */}
        <div className="flex gap-4 w-full sm:w-auto">
          {/* Agent Filter */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              disabled={loadingAgents}
            >
              <option value="all">All Agents</option>
              {agents.map((agent) => (
                <option key={agent.user_id} value={agent.user_id}>
                  {agent.name} {agent.business_name ? `(${agent.business_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    { key: "fullName", label: "Full Name" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                    { key: "passportNumber", label: "Passport Number" },
                    { key: "dateOfBirth", label: "Date of Birth" },
                    { key: "status", label: "Status" },
                    { key: "createdAt", label: "Created Date" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort(key as keyof Student)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <span className="text-xs">{getSortIcon(key as keyof Student)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      Loading students for {getSelectedAgentName()}...
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <Link href={`/admin/partners/agents/students/${student.id}`}>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {student.fullName}
                        </span>
                      </TableCell>
                      </Link>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.phone}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.passportNumber}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.dateOfBirth}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getStatusColor(student.status)}
                        >
                          {formatStatus(student.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.createdAt}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      No students found matching your criteria.
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
        Showing {filteredAndSortedData.length} of {students.length} students
      </div>
    </div>
  );
}