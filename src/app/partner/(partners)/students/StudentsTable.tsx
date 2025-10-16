"use client"
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

interface Student {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  agentEmail: string;
  agentName: string;
}

// Define the table data using the interface
const tableData: Student[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phoneNumber: "+1 (555) 123-4567",
    agentEmail: "john.smith@example.com",
    agentName: "John Smith",

  },
  {
    id: 2,
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    phoneNumber: "+1 (555) 987-6543",
    agentEmail: "sarah.j@example.com",
    agentName: "Sarah Johnson",
  },
  {
    id: 3,
    name: "Carol Davis",
    email: "carol.davis@example.com",
    phoneNumber: "+1 (555) 456-7890",
    agentEmail: "mike.chen@example.com",
    agentName: "Mike Chen",
  },
  {
    id: 4,
    name: "David Brown",
    email: "david.brown@example.com",
    phoneNumber: "+1 (555) 234-5678",
    agentEmail: "emily.davis@example.com",
    agentName: "Emily Davis",
  },
  {
    id: 5,
    name: "Eva Martinez",
    email: "eva.martinez@example.com",
    phoneNumber: "+1 (555) 876-5432",
    agentEmail: "r.wilson@example.com",
    agentName: "Robert Wilson",
  },
];

type SortField = keyof Student | "";
type SortDirection = "asc" | "desc";

export default function StudentTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Get unique agents for filter dropdown
  const agents = useMemo(() => {
    const uniqueAgents = Array.from(
      new Map(
        tableData.map(student => [student.agentEmail, {
          email: student.agentEmail,
          name: student.agentName
        }])
      ).values()
    );
    return uniqueAgents;
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = tableData.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phoneNumber.includes(searchTerm);
      
      const matchesAgent = agentFilter === "all" || student.agentEmail === agentFilter;
      
      return matchesSearch && matchesAgent;
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
  }, [searchTerm, agentFilter, sortField, sortDirection]);

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

        {/* Agent Filter */}
        <div className="w-full flex justify-end">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[230px]"
          >
            <option value="all">All Agents</option>
            {agents.map((agent) => (
              <option key={agent.email} value={agent.email}>
                {agent.name} ({agent.email})
              </option>
            ))}
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
                    { key: "email", label: "Email" },
                    { key: "phoneNumber", label: "Phone Number" },
                    { key: "agentName", label: "Agent" },
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
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {student.name}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.phoneNumber}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div>
                          <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {student.agentName}
                          </div>
                          <div className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {student.agentEmail}
                          </div>
                        </div>
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
        Showing {filteredAndSortedData.length} of {tableData.length} students
      </div>
    </div>
  );
}