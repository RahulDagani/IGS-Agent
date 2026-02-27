"use client"
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, Send, Search, Download, CheckCircle } from "lucide-react";
import Link from "next/link";

interface CommissionNote {
  id: number;
  commission_note_number: string;
  agent_id: number;
  university_id: number;
  po_number: string | null;
  po_date: string | null;
  currency: string;
  gst_percentage: string;
  tds_percentage: string;
  total_commissionable_amount: string;
  total_full_commission: string;
  total_gst_amount: string;
  total_commission_after_gst: string;
  total_agent_commission: string;
  total_company_retained: string;
  total_commission_amount: string;
  total_tds_amount: string;
  total_net_payable: string;
  status: string;
  remarks: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  business_name: string;
}

// Updated interface for the new commission note item structure
interface CommissionNoteItem {
  invoice_item_id: number;
  application_id: number;
  installment_no: number;
  commission_amount: number;
  currency: string;
  commissionable_tuition_fee: number;
  student: string;
  course_name: string;
  study_level: string;
  intake_year: number;
  gst_percentage: number;
  gst_amount: number;
  commission_after_gst: number;
  agent_share_percentage: number;
  agent_commission_amount: number;
  conversion_currency: string;
  exchange_rate: number;
  shared_amount_in_inr: number;
  tds_percentage: number;
  tds_amount: number;
  gross_commission_payable: number;
  net_pay: number;
}

// Updated interface for the new commission note detail structure
interface CommissionNoteDetail {
  items: CommissionNoteItem[];
  summary: {
    total_items: number;
    currency_summary: string[];
    exchange_rates: Record<string, number>;
    totals: {
      total_commissionable_amount: number;
      total_full_commission: number;
      total_gst_amount: number;
      total_commission_after_gst: number;
      total_agent_amount_in_inr: number;
      total_gross_payable: number;
      total_tds_amount: number;
      total_net_payable: number;
    };
  };
}

interface Comment {
  id: number;
  invoice_note_id: number;
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
}

type SortField = keyof CommissionNote | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  dateRange: [Date | null, Date | null];
  universities: string[];
  status: string[];
  commissionNoteNumber: string;
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
  const [activeNoteDetail, setActiveNoteDetail] = useState<CommissionNoteDetail & { comments?: Comment[] } | null>(null);
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [markingAsPaid, setMarkingAsPaid] = useState(false);
  
  // Add ref to track initial mount and prevent unnecessary fetches
  const isInitialMount = useRef(true);
  const prevLimitRef = useRef(pagination.limit);
  
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: [null, null],
    universities: [],
    status: [],
    commissionNoteNumber: "",
    studentSearch: "",
    acknowledgementNo: "",
    agentId: null,
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>(filters);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE || "https://api.applystore.org";

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
      
      if (data.status === "success") {
        setUniversities(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch universities");
      }
    } catch (err) {
      console.error(err);
      setUniversities([]);
    }
  }, [BASE_URL, token]);

  // Fetch commission notes using the new endpoint
  const fetchCommissionNotes = useCallback(async (page = 1, filterOptions = appliedFilters) => {
    try {
      setNotesLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add status filter based on active tab
      if (active === "progress") {
        // For progress tab, exclude paid status
        params.append('status', 'draft,sent_to_partner,invoice_uploaded,revisions_in_invoice_needed,invoice_uploaded_after_corrections,revision_in_cn_needed');
      } else if (active === "paid") {
        params.append('status', 'commission_payment_done');
      }
      
      if (filterOptions.agentId) {
        params.append('agent_id', filterOptions.agentId);
      }
      
      if (filterOptions.commissionNoteNumber) {
        params.append('commission_note_number', filterOptions.commissionNoteNumber);
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
        `${BASE_URL}/tenant/commission-notes?${params.toString()}`,
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
      
      if (data.status === "success") {
        setNotes(data.data);
        
        // Update pagination based on API response
        setPagination(prev => ({
          ...prev,
          page: page,
          total: data.total || data.data.length,
          pages: data.pages || Math.ceil((data.total || data.data.length) / pagination.limit)
        }));
        
        // Set first note as active if available and no active note
        if (data.data.length > 0 && !activeNoteId) {
          setActiveNoteId(data.data[0].id);
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

  // Fetch comments for a commission note (updated endpoint)
  const fetchComments = useCallback(async (noteId: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tenant/agent-commission-notes/${noteId}/comments`,
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
      
      if (data.status === "success") {
        // Update the active note detail with comments
        setActiveNoteDetail(prev => {
          if (prev) {
            return {
              ...prev,
              comments: data.data
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

  // Fetch commission note details using the updated endpoint
  const fetchCommissionNoteDetail = useCallback(async (noteId: number) => {
    try {
      setDetailLoading(true);
      
      const response = await fetch(
        `${BASE_URL}/tenant/commission-note/${noteId}`,
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
      
      if (data.status === "success") {
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
  }, [BASE_URL, token, fetchComments]);

  // Mark commission note as paid
  const markAsPaid = useCallback(async (noteId: number) => {
    if (!noteId) return;
    
    try {
      setMarkingAsPaid(true);
      
      const response = await fetch(
        `${BASE_URL}/tenant/commission-note/mark-paid`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            commission_note_id: noteId
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to mark as paid: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success") {
        // Show success message
        alert("Commission note marked as paid successfully!");
        
        // Refresh the notes list
        fetchCommissionNotes(pagination.page);
        
        // If the current note is the one that was marked as paid, refresh its details
        if (activeNoteId === noteId) {
          fetchCommissionNoteDetail(noteId);
        }
      } else {
        throw new Error(data.message || "Failed to mark as paid");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while marking as paid");
    } finally {
      setMarkingAsPaid(false);
    }
  }, [BASE_URL, token, fetchCommissionNotes, fetchCommissionNoteDetail, activeNoteId, pagination.page]);

  // Download PDF function
  const downloadPdf = useCallback(async (noteId: number) => {
    if (!noteId) return;
    
    try {
      setDownloadingPdf(true);
      
      const response = await fetch(
        `${BASE_URL}/tenant/commission-note/${noteId}/pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commission-note-${noteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while downloading PDF");
    } finally {
      setDownloadingPdf(false);
    }
  }, [BASE_URL, token]);

  // Post a new comment (updated endpoint and payload)
  const postComment = useCallback(async (noteId: number, comment: string) => {
    if (!comment.trim() || !activeNoteDetail) return;
    
    try {
      setPostingComment(true);
      
      const response = await fetch(
        `${BASE_URL}/tenant/agent-commission-notes/${noteId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            who_has_created: "tenant",
            invoice_note_id: noteId,
            comment: comment.trim(),
            created_by: 1,
            is_internal_note: true
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to post comment: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success") {
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
  }, [BASE_URL, token, activeNoteDetail, fetchComments]);

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: value
      };
      
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
      commissionNoteNumber: "",
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

  // Handle limit change
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1
    }));
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (activeNoteId && commentText.trim()) {
      await postComment(activeNoteId, commentText);
    }
  };

  // Handle key press in comment input
  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  // Handle download PDF
  const handleDownloadPdf = () => {
    if (activeNoteId) {
      downloadPdf(activeNoteId);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = () => {
    if (activeNoteId) {
      if (window.confirm("Are you sure you want to mark this commission note as paid?")) {
        markAsPaid(activeNoteId);
      }
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

  // Format currency
  const formatCurrency = (amount: number | string, currency: string = 'USD') => {
    if (amount === undefined || amount === null) return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currency} ${numAmount.toFixed(2)}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    if (status === "commission_payment_done" || status.includes("Paid")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    } else if (status === "draft" || status.includes("Draft")) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    } else if (status === "sent_to_partner") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    } else if (status === "invoice_uploaded") {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    } else if (status === "revisions_in_invoice_needed" || status === "revision_in_cn_needed") {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    } else if (status === "invoice_uploaded_after_corrections") {
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  // Status options for filter
  const statusOptions = [
    { value: "draft", label: "Draft" },
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
      isInitialMount.current = false;
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
    if (!isInitialMount.current) {
      fetchCommissionNotes(1);
    }
  }, [active, fetchCommissionNotes]);

  // Effect for limit changes
  useEffect(() => {
    if (!isInitialMount.current && prevLimitRef.current !== pagination.limit) {
      prevLimitRef.current = pagination.limit;
      fetchCommissionNotes(1);
    }
  }, [pagination.limit, fetchCommissionNotes]);

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Commission notes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all your commission notes
            </p>
          </div>

          <Link
            href="/admin/partners/accounts/commissionnote/add"
            type="button"
            className="px-6 py-2.5 mb-auto bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <span>Create Commission Note</span>
          </Link>
        </div>
      </div>
      
      <div className="space-y-6">
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
                          key={note.id}
                          className={`rounded-xl p-4 space-y-2 mb-0 relative cursor-pointer transition-all ${
                            activeNoteId === note.id 
                              ? 'border-l-4 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                          }`}
                          onClick={() => handleNoteClick(note.id)}
                        >
                          <span className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full ${getStatusColor(note.status)}`}>
                            {note.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>

                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {note.commission_note_number}
                          </h3>

                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {note.business_name}
                          </p>

                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Commission Amount is{" "}
                            <span className="font-semibold">{formatCurrency(note.total_commission_amount, note.currency)}</span>
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
                        onChange={handleLimitChange}
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
                            Commission Note #{activeNoteId}
                          </h2>

                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Agent ID: {notes.find(n => n.id === activeNoteId)?.agent_id || '-'}
                          </p>

                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Total Items:{" "}
                            <span className="font-semibold">{activeNoteDetail.summary?.total_items || 0}</span>
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button 
                            className="flex items-center gap-2 border border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf}
                          >
                            <Download size={16} />
                            {downloadingPdf ? "Downloading..." : "Download Note"}
                          </button>

                          {/* Mark as Paid button - only show if not already paid */}
                          {notes.find(n => n.id === activeNoteId)?.status !== 'commission_payment_done' && (
                            <button 
                              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={handleMarkAsPaid}
                              disabled={markingAsPaid}
                            >
                              <CheckCircle size={16} />
                              {markingAsPaid ? "Processing..." : "Mark as Paid"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* CURRENCY SUMMARY */}
                      {activeNoteDetail.summary?.currency_summary && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Currencies: {activeNoteDetail.summary.currency_summary.join(', ')}
                          </p>
                          {activeNoteDetail.summary.exchange_rates && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Exchange Rates: {Object.entries(activeNoteDetail.summary.exchange_rates).map(([curr, rate]) => 
                                `1 ${curr} = ${rate} INR`
                              ).join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* ITEMS TABLE */}
                      {activeNoteDetail.items && activeNoteDetail.items.length > 0 && (
                        <div className="mb-6 mt-4">
                          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Commission Items</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Application ID</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Installment</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commission</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GST</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">After GST</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent Share</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">INR Amount</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">TDS</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Pay</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {activeNoteDetail.items.map((item, index) => (
                                  <tr key={item.invoice_item_id || index}>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.student}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.course_name} ({item.study_level}, {item.intake_year})</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.application_id}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.installment_no}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(item.commission_amount, item.currency)}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.gst_percentage}% ({formatCurrency(item.gst_amount, item.currency)})</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(item.commission_after_gst, item.currency)}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.agent_share_percentage}%</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">INR {item.shared_amount_in_inr.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.tds_percentage}% (INR {item.tds_amount.toFixed(2)})</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">INR {item.net_pay.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* SUMMARY TOTALS */}
                      {activeNoteDetail.summary?.totals && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Summary Totals</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total Full Commission</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(activeNoteDetail.summary.totals.total_full_commission, activeNoteDetail.summary.currency_summary[0])}
                              </p>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total GST Amount</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(activeNoteDetail.summary.totals.total_gst_amount, activeNoteDetail.summary.currency_summary[0])}
                              </p>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Commission After GST</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(activeNoteDetail.summary.totals.total_commission_after_gst, activeNoteDetail.summary.currency_summary[0])}
                              </p>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Agent Amount (INR)</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                INR {activeNoteDetail.summary.totals.total_agent_amount_in_inr.toFixed(2)}
                              </p>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Gross Payable (INR)</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                INR {activeNoteDetail.summary.totals.total_gross_payable.toFixed(2)}
                              </p>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total TDS Amount</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                INR {activeNoteDetail.summary.totals.total_tds_amount.toFixed(2)}
                              </p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                              <p className="text-xs text-green-600 dark:text-green-400">Net Payable</p>
                              <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                                INR {activeNoteDetail.summary.totals.total_net_payable.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

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
                            {activeNoteDetail.comments.map((comment: Comment) => (
                              <div key={comment.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] shadow-sm">
                                <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                                <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span>By: {comment.created_by_name || `User ${comment.created_by}`}</span>
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