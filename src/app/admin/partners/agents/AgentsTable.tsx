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
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface ApiAgent {
  user_id: number;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  is_agent_verified: number;
  is_payment_verified: number;
}

interface Agent {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  status: "approved" | "pending approval" | "payment verification pending";
}

type SortField = keyof Agent | "";
type SortDirection = "asc" | "desc";

export default function AgentTable() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const {token} = useAuth();

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/tenant/agent/list`,{
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
          // Transform API data to match our component's interface
          const transformedAgents: Agent[] = data.data.map((apiAgent: ApiAgent) => ({
            id: apiAgent.user_id,
            name: apiAgent.name || "N/A",
            businessName: apiAgent.business_name || "N/A",
            email: apiAgent.email,
            phoneNumber: apiAgent.phone || "N/A",
            status: getAgentStatus(apiAgent.is_agent_verified, apiAgent.is_payment_verified)
          }));
          
          setAgents(transformedAgents);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching agents");
        console.error("Error fetching agents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Helper function to determine status based on verification flags
  const getAgentStatus = (isAgentVerified: number, isPaymentVerified: number): Agent["status"] => {
    if (isAgentVerified === 1) {
      return "approved";
    } else if (isPaymentVerified === 0) {
      return "payment verification pending";
    } else {
      return "pending approval";
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = agents.filter((agent) => {
      const matchesSearch = 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.phoneNumber.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || agent.status === statusFilter;
      
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
  }, [agents, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Agent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Agent) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending approval":
        return "warning";
      case "payment verification pending":
        return "error";
      default:
        return "primary";
    }
  };

  const formatStatus = (status: Agent["status"]) => {
    return status
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading agents...</div>
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
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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

        {/* Status Filter */}
        <div className="w-full flex justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[230px]"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending approval">Pending Approval</option>
            <option value="payment verification pending">
              Payment Verification Pending
            </option>
          </select>
        </div>
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
                    { key: "name", label: "Name" },
                    { key: "businessName", label: "Business Name" },
                    { key: "email", label: "Email" },
                    { key: "phoneNumber", label: "Phone Number" },
                    { key: "status", label: "Status" },
                    { key: "students", label: "Students" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort(key as keyof Agent)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <span className="text-xs">{getSortIcon(key as keyof Agent)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((agent) => (
                    <TableRow key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <Link href={`/admin/partners/agents/${agent.id}`}>
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {agent.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90">
                        {agent.businessName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {agent.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {agent.phoneNumber}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getStatusColor(agent.status)}
                        >
                          {formatStatus(agent.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-blue-500 text-start text-theme-sm dark:text-blue-400">
                        <Link 
                        href={`/admin/partners/agents/${agent.id}/students`}
                        className="cursor-pointer"
                        >
                          View 
                        </Link>
                        
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      No agents found matching your criteria.
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
        Showing {filteredAndSortedData.length} of {agents.length} agents
      </div>
    </div>
  );
}