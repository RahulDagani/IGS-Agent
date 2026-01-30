"use client"
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, Send, Search } from "lucide-react";
import Link from "next/link";

interface CommissionNote {
  commission_note_id?: number;
  commission_note_number: string;
  status: string;
  company: string;
  commission_amount: string;
  created_at: string;
  updated_at: string;
}

interface CommissionNoteDetail {
  commission_note_number: string;
  status: string;
  company: string;
  commission_amount: string;
  generated_by: string | null;
  paid_by: string;
  date_received_on: string;
  date_of_payment: string;
  last_updated_on: string;
  agent_id: string;
  comments: Comment[];
}

interface Comment {
  id: number;
  comment: string;
  created_by: string;
  created_at: string;
}

interface ApiComment {
  id: number;
  tenant_id: number;
  agent_id: number;
  commission_note_id: number;
  comment: string;
  who_has_created: string;
  created_by: number;
  is_internal_note: number;
  is_deleted: number;
  deleted_by: number | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
  created_by_email: string | null;
}

type SortField = keyof CommissionNote | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  dateRange: [Date | null, Date | null];
  universities: string[];
  status: string[];
  invoiceNoteNumber: string;
  studentSearch: string;
  acknowledgementNo: string;
  agentId: string | null;
}

interface Agent {
  agent_id: number;
  name: string | null;
  email: string;
}

interface University {
  university_id: number;
  university_name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function PaymentsTable() {
  const [notes, setNotes] = useState<CommissionNote[]>([]);
  const [activeNoteDetail, setActiveNoteDetail] = useState<CommissionNoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [active, setActive] = useState<"progress" | "paid">("progress");
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: [null, null],
    universities: [],
    status: [],
    invoiceNoteNumber: "",
    studentSearch: "",
    acknowledgementNo: "",
    agentId: null,
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>(filters);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote/agents`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch agents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, [BASE_URL, token]);

  // Fetch universities based on selected agent
  const fetchUniversities = useCallback(async (agentId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote/universities?agent_id=${agentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch universities: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUniversities(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch universities");
      }
    } catch (err) {
      console.error(err);
      setUniversities([]);
    }
  }, [BASE_URL, token]);

  // Fetch commission notes
  const fetchCommissionNotes = useCallback(async (page = 1, filterOptions = appliedFilters) => {
    try {
      setNotesLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add status filter based on active tab
      if (active === "progress") {
        params.delete("status");
      } else if (active === "paid") {
        params.append('status', 'commission_payment_done');
      }
      
      if (filterOptions.agentId) {
        params.append('agent_id', filterOptions.agentId);
      }
      
      if (filterOptions.invoiceNoteNumber) {
        params.append('commission_note_number', filterOptions.invoiceNoteNumber);
      }
      
      if (filterOptions.status.length > 0) {
        filterOptions.status.forEach(status => params.append('status', status));
      }
      
      if (filterOptions.universities.length > 0) {
        filterOptions.universities.forEach(univId => params.append('university_id', univId));
      }
      
      if (filterOptions.dateRange[0]) {
        params.append('start_date', filterOptions.dateRange[0].toISOString().split('T')[0]);
      }
      
      if (filterOptions.dateRange[1]) {
        params.append('end_date', filterOptions.dateRange[1].toISOString().split('T')[0]);
      }
      
      if (filterOptions.studentSearch) {
        params.append('student_search', filterOptions.studentSearch);
      }
      
      if (filterOptions.acknowledgementNo) {
        params.append('acknowledgement_no', filterOptions.acknowledgementNo);
      }
      
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote/notes?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const notesWithId = data.data.map((note: CommissionNote, index: number) => ({
          ...note,
          id: index + 1
        }));
        
        setNotes(notesWithId);
        setPagination(data.pagination || {
          page: page,
          limit: pagination.limit,
          total: notesWithId.length,
          pages: 1
        });
        
        // Set first note as active if available
        if (notesWithId.length > 0 && !activeNoteId) {
          setActiveNoteId(notesWithId[0].commission_note_id || null);
        }
      } else {
        throw new Error(data.message || "Failed to fetch commission notes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setNotesLoading(false);
    }
  }, [BASE_URL, token, active, pagination.limit, activeNoteId, appliedFilters]);

  // Fetch commission note details
  const fetchCommissionNoteDetail = useCallback(async (noteId: number) => {
    try {
      setDetailLoading(true);
      
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote/notes/${noteId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch note details: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setActiveNoteDetail(data.data);
        // Fetch comments for this note
        fetchComments(noteId);
      } else {
        throw new Error(data.message || "Failed to fetch note details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDetailLoading(false);
    }
  }, [BASE_URL, token]);

  // Fetch comments for a commission note
  const fetchComments = useCallback(async (noteId: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote/comments/${noteId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform API comments to match our Comment interface
        const comments: Comment[] = data.data.map((apiComment: ApiComment) => ({
          id: apiComment.id,
          comment: apiComment.comment,
          created_by: apiComment.created_by_name || apiComment.created_by_email || `User ${apiComment.created_by}`,
          created_at: apiComment.created_at
        }));
        
        // Update the active note detail with comments
        setActiveNoteDetail(prev => {
          if (prev) {
            return {
              ...prev,
              comments: comments
            };
          }
          return prev;
        });
      } else {
        throw new Error(data.message || "Failed to fetch comments");
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }, [BASE_URL, token]);

  // Post a new comment
  const postComment = useCallback(async (noteId: number, comment: string) => {
    if (!comment.trim() || !activeNoteDetail) return;
    
    try {
      setPostingComment(true);
      
      // Find agent_id from the active note detail or filters
      // let agentId: number | null = null;
      
 
      // If not in filters, try to find from agents list
      // if (activeNoteDetail.company) {
      //   const agent = agents.find(a => a.name === activeNoteDetail.company || a.email === activeNoteDetail.company);
      //   if (agent) {
      //     agentId = agent.agent_id;
      //   }
      // }
      
      // if (!agentId) {
      //   throw new Error("Agent ID is required to post a comment");
      // }
      
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote/comments/${noteId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            comment: comment.trim(),
            agent_id: activeNoteDetail.agent_id || null
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to post comment: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Clear the comment input
        setCommentText("");
        
        // Refresh comments
        fetchComments(noteId);
      } else {
        throw new Error(data.message || "Failed to post comment");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while posting comment");
    } finally {
      setPostingComment(false);
    }
  }, [BASE_URL, token, activeNoteDetail, filters.agentId, agents, fetchComments]);

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: value
      };
      
      // If agent is changed, reset universities and fetch new ones
      if (filterType === 'agentId') {
        if (value) {
          fetchUniversities(value);
          newFilters.universities = [];
        } else {
          setUniversities([]);
        }
      }
      
      return newFilters;
    });
  };

  // Handle search button click - apply filters
  const handleSearch = () => {
    setAppliedFilters(filters);
    setDatePickerKey(prev => prev + 1);
    fetchCommissionNotes(1, filters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      dateRange: [null, null],
      universities: [],
      status: [],
      invoiceNoteNumber: "",
      studentSearch: "",
      acknowledgementNo: "",
      agentId: null,
    };
    
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setDatePickerKey(prev => prev + 1);
    setUniversities([]);
    fetchCommissionNotes(1, clearedFilters);
  };

  // Handle note click
  const handleNoteClick = (noteId: number) => {
    setActiveNoteId(noteId);
    fetchCommissionNoteDetail(noteId);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchCommissionNotes(newPage);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (activeNoteId && commentText.trim()) {
      await postComment(activeNoteId, commentText);
    }
  };

  // Handle key press in comment input (Shift + Enter for new line, Enter to submit)
  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "-";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString || dateString === "-") return "-";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    if (status.includes("Received") || status.includes("Approved") || status.includes("Completed") || status.includes("Paid")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    } else if (status.includes("Pending") || status.includes("Processing") || status.includes("Progress") || status.includes("In Progress")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    } else if (status.includes("Rejected") || status.includes("Closed")) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    } else if (status.includes("Sent To Partner")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    } else if (status.includes("Invoice Uploaded")) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  // Status options for filter
  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "sent_to_partner", label: "Sent To Partner" },
    { value: "invoice_uploaded", label: "Invoice Uploaded" },
    { value: "revisions_in_invoice_needed", label: "Revisions In Invoice Needed" },
    { value: "invoice_uploaded_after_corrections", label: "Invoice Uploaded After Corrections" },
    { value: "revision_in_cn_needed", label: "Revision In CN Needed" },
    { value: "commission_payment_done", label: "Commission Payment Done" },
  ];

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await fetchAgents();
      await fetchCommissionNotes();
      setLoading(false);
    };
    
    fetchInitialData();
  }, [fetchAgents, fetchCommissionNotes]);

  // Fetch detail when active note changes
  useEffect(() => {
    if (activeNoteId) {
      fetchCommissionNoteDetail(activeNoteId);
    }
  }, [activeNoteId, fetchCommissionNoteDetail]);

  // Refresh notes when active tab changes
  useEffect(() => {
    fetchCommissionNotes(1);
  }, [active, fetchCommissionNotes]);

  // Custom styles for react-select
  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
      borderColor: 'rgb(209 213 219 / var(--tw-border-opacity))',
      minHeight: '42px',
      '&:hover': {
        borderColor: 'rgb(156 163 175 / var(--tw-border-opacity))',
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'rgb(255 255 255)',
      zIndex: 50,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgb(243 244 246)' : 'white',
      color: 'rgb(17 24 39)',
      '&:hover': {
        backgroundColor: 'rgb(243 244 246)',
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'rgb(239 246 255)',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'rgb(29 78 216)',
    }),
  };

  const darkSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'rgb(31 41 55 / var(--tw-bg-opacity))',
      borderColor: 'rgb(75 85 99 / var(--tw-border-opacity))',
      minHeight: '42px',
      '&:hover': {
        borderColor: 'rgb(107 114 128 / var(--tw-border-opacity))',
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'rgb(31 41 55)',
      zIndex: 50,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgb(55 65 81)' : 'rgb(31 41 55)',
      color: 'rgb(243 244 246)',
      '&:hover': {
        backgroundColor: 'rgb(55 65 81)',
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'rgb(30 58 138)',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'rgb(191 219 254)',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'rgb(243 244 246)',
    }),
    input: (base: any) => ({
      ...base,
      color: 'rgb(243 244 246)',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: 'rgb(156 163 175)',
    }),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-400">Error loading data</h3>
        </div>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-red-800 dark:text-red-400 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex justify-between w-full bg-[#f8fbff] dark:bg-gray-900 rounded-lg ">
          {/* Tabs */}
          <div className="flex gap-8 font-medium relative">
            <button
              onClick={() => setActive("progress")}
              className={`pb-3 relative ${
                active === "progress"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-900 dark:text-gray-300"
              }`}
            >
              In Progress
              {active === "progress" && (
                <span className="absolute left-0 -bottom-[1px] h-[3px] w-full bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActive("paid")}
              className={`pb-3 relative ${
                active === "paid"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-900 dark:text-gray-300"
              }`}
            >
              Paid
              {active === "paid" && (
                <span className="absolute left-0 -bottom-[1px] h-[3px] w-full bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          </div>

          <Link
            href="/admin/partners/accounts/universityinvoice/add"
            type="button"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Filters Section */}
        <div className="MSL-Searchform bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-white/[0.05]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* Commission Note Number */}
            <div className="SF-Keyword">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Invoice Note
                </label>
                <input
                  type="text"
                  placeholder="Search by invoice note Number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  value={filters.invoiceNoteNumber}
                  onChange={(e) => handleFilterChange('invoiceNoteNumber', e.target.value)}
                />
              </div>
            </div>

            {/* Status Multi-select */}
            <div className="SF-University all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <Select
                  key={JSON.stringify(filters.status)}
                  isMulti
                  options={statusOptions}
                  value={statusOptions.filter(option => 
                    filters.status.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    handleFilterChange('status', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder="Select status"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={darkSelectStyles}
                />
              </div>
            </div>

            {/* Agent Select */}
            <div className="SF-University all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Agent
                </label>
                <Select
                  key={filters.agentId}
                  options={agents.map(agent => ({
                    value: agent.agent_id.toString(),
                    label: agent.name || agent.email
                  }))}
                  value={agents
                    .filter(agent => agent.agent_id.toString() === filters.agentId)
                    .map(agent => ({
                      value: agent.agent_id.toString(),
                      label: agent.name || agent.email
                    }))[0]}
                  onChange={(selectedOption) => {
                    handleFilterChange('agentId', selectedOption?.value || null);
                  }}
                  placeholder="Select agent"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={darkSelectStyles}
                />
              </div>
            </div>

            {/* University Multi-select */}
            <div className="SF-University all-countries">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  University
                </label>
                <Select
                  key={JSON.stringify([filters.universities, filters.agentId])}
                  isMulti
                  options={universities.map(univ => ({
                    value: univ.university_id.toString(),
                    label: univ.university_name
                  }))}
                  value={universities.filter(univ => 
                    filters.universities.includes(univ.university_id.toString())
                  ).map(univ => ({
                    value: univ.university_id.toString(),
                    label: univ.university_name
                  }))}
                  onChange={(selectedOptions) => {
                    handleFilterChange('universities', 
                      selectedOptions ? selectedOptions.map(option => option.value) : []
                    );
                  }}
                  placeholder={filters.agentId ? "Select universities" : "Select agent first"}
                  isDisabled={!filters.agentId}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={darkSelectStyles}
                />
              </div>
            </div>

            {/* Date Created */}
            <div className="SF-DateApp">
              <div className="form-group calendar-one">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Created
                </label>
                <div className="relative">
                  <DatePicker
                    key={datePickerKey}
                    selected={filters.dateRange[0]}
                    onChange={(dates: [Date | null, Date | null]) => handleFilterChange('dateRange', dates)}
                    startDate={filters.dateRange[0]}
                    endDate={filters.dateRange[1]}
                    selectsRange
                    isClearable
                    placeholderText="Select date range"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    dateFormat="dd-MM-yyyy"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Student Search */}
            <div className="SF-Keyword">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student
                </label>
                <input
                  type="text"
                  placeholder="Search by student Name/Email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  value={filters.studentSearch}
                  onChange={(e) => handleFilterChange('studentSearch', e.target.value)}
                />
              </div>
            </div>

            {/* Acknowledgement No. */}
            <div className="SF-Keyword">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Acknowledgement No.
                </label>
                <input
                  type="text"
                  placeholder="Acknowledgement No."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  value={filters.acknowledgementNo}
                  onChange={(e) => handleFilterChange('acknowledgementNo', e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <div className="form-group">
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium dark:bg-blue-700 dark:hover:bg-blue-600"
                  onClick={handleSearch}
                  disabled={notesLoading}
                >
                  <Search size={18} />
                  {notesLoading ? "Searching..." : "Search"}
                </button>
              </div>
              
              <div className="form-group">
                <button
                  type="button"
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  onClick={handleClearFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1200px]">
              <div className="flex gap-6 bg-[#F6F9FC] dark:bg-gray-900 min-h-screen">
                {/* LEFT PANEL */}
                <div className="w-[420px] bg-white dark:bg-gray-800 rounded-xl space-y-4 border border-gray-200 dark:border-white/[0.05]">
                  {notesLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No commission notes found
                    </div>
                  ) : (
                    <>
                      {notes.map((note) => (
                        <div 
                          key={note.commission_note_number}
                          className={`rounded-xl p-4 space-y-2 mb-0 relative cursor-pointer transition-all ${
                            activeNoteId === note.commission_note_id 
                              ? 'border-l-4 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                          }`}
                          onClick={() => handleNoteClick(note.commission_note_id!)}
                        >
                          <span className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full ${getStatusColor(note.status)}`}>
                            {note.status}
                          </span>

                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {note.commission_note_number}
                          </h3>

                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {note.company}
                          </p>

                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Commission Amount is{" "}
                            <span className="font-semibold">{note.commission_amount}</span>
                          </p>

                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>
                              Created On:{" "}
                              <span className="font-medium text-gray-800 dark:text-gray-300">
                                {formatDateTime(note.created_at)}
                              </span>
                            </p>
                            <p>
                              Last Updated On:{" "}
                              <span className="font-medium text-gray-800 dark:text-gray-300">
                                {formatDateTime(note.updated_at)}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* PAGINATION */}
                  {notes.length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <button 
                          className="h-9 w-9 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <button className="h-9 w-9 bg-blue-600 text-white rounded-lg dark:bg-blue-700">
                          {pagination.page}
                        </button>

                        <button 
                          className="h-9 w-9 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      <select 
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={pagination.limit}
                        onChange={(e) => {
                          const newLimit = parseInt(e.target.value);
                          setPagination(prev => ({
                            ...prev,
                            limit: newLimit
                          }));
                          fetchCommissionNotes(1);
                        }}
                      >
                        <option value="10">10/page</option>
                        <option value="20">20/page</option>
                        <option value="50">50/page</option>
                        <option value="100">100/page</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* RIGHT PANEL */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-white/[0.05]">
                  {detailLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    </div>
                  ) : activeNoteDetail ? (
                    <>
                      {/* HEADER */}
                      <div className="flex justify-between items-start border-b border-gray-200 dark:border-white/[0.05] pb-4">
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {activeNoteDetail.commission_note_number}
                          </h2>

                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activeNoteDetail.company}
                          </p>

                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Commission Amount is{" "}
                            <span className="font-semibold">{activeNoteDetail.commission_amount}</span>
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-600">
                            Generate Invoice
                          </button>

                          <button className="border border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            View Note
                          </button>

                          <button className="border border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            Download Note
                          </button>
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="grid grid-cols-2 gap-y-4 gap-x-10 py-6 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          Generated By:{" "}
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {activeNoteDetail.generated_by || '-'}
                          </span>
                        </p>

                        <p className="text-gray-700 dark:text-gray-300">
                          Paid By:{" "}
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {activeNoteDetail.paid_by}
                          </span>
                        </p>

                        <p className="text-gray-700 dark:text-gray-300">
                          Date Received On:{" "}
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {formatDateTime(activeNoteDetail.date_received_on)}
                          </span>
                        </p>

                        <p className="text-gray-700 dark:text-gray-300">
                          Date of Payment:{" "}
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {activeNoteDetail.date_of_payment}
                          </span>
                        </p>

                        <p className="text-gray-700 dark:text-gray-300">
                          Last Updated On:{" "}
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {formatDateTime(activeNoteDetail.last_updated_on)}
                          </span>
                        </p>
                      </div>

                      {/* COMMENTS */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
                        <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Comments</h3>

                        <div className="flex items-center gap-3">
                          <input
                            placeholder="Type your comment here... Press Enter to submit"
                            className="flex-1 rounded-full px-4 py-3 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={handleCommentKeyDown}
                            disabled={postingComment}
                          />

                          <button 
                            className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCommentSubmit}
                            disabled={postingComment || !commentText.trim()}
                          >
                            {postingComment ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Send size={18} />
                            )}
                          </button>
                        </div>

                        {activeNoteDetail.comments && activeNoteDetail.comments.length > 0 ? (
                          <div className="mt-4 space-y-4">
                            {activeNoteDetail.comments.map((comment) => (
                              <div key={comment.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] shadow-sm">
                                <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                                <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span>By: {comment.created_by}</span>
                                  <span>{formatDateTime(comment.created_at)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 mt-16">
                            <p>No comments yet.</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                      <p>Select a commission note to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count and Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {notes.length} of {pagination.total} commission notes
          </div>
          
          {/* Pagination */}
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                      : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
              <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
            )}
            
            {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
              <button
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handlePageChange(pagination.pages)}
              >
                {pagination.pages}
              </button>
            )}
            
            <button 
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}