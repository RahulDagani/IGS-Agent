"use client"
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, Send, Search, Download, CheckCircle, X, Mail, Upload, FileText, AlertCircle } from "lucide-react";
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

// Update the CommissionNoteDetail interface to match the API response
interface CommissionNoteDetail {
  commission_note: {
    id: number;
    commission_note_number: string;
    po_date: string;
    status: string;
    university_name: string;
    university_country: string;
    agent_name: string;
    agent_business_name: string;
    agent_address: string;
    agent_email: string;
    agent_phone: string;
    total_commissionable_amount: string;
    total_received_in_default: string;
    total_agent_commission: string;
    total_gst_amount: string;
    total_tds_amount: string;
    total_net_payable_default: string;
  };
  items: Array<{
    id: number;
    invoice_item_id: number;
    application_id: number;
    installment_no: number;
    student: string;
    course_name: string;
    study_level: string;
    intake_year: number;
    commission_type: string;
    commissionable_tuition_fee: string;
    invoice_amount: string;
    amount_received_in_default: string;
    bank_charges: string;
    agent_share_percentage: string;
    agent_commission_default: string;
    net_pay: string;
  }>;
  summary: {
    total_items: number;
    totals: {
      total_agent_commission: string;
      total_final_payable: string;
      total_net_payable: string;
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

// Mark as Paid Modal Props
interface MarkAsPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  noteId: number | null;
  isSubmitting: boolean;
}

const MarkAsPaidModal: React.FC<MarkAsPaidModalProps> = ({ isOpen, onClose, onSubmit, noteId, isSubmitting }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Check if file is PDF or image
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF or image file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if file is PDF or image
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF or image file');
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      await onSubmit(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Mark as Paid
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload payment proof for Commission Note #{noteId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
              dragActive
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : selectedFile
                ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isSubmitting}
            />

            <div className="text-center">
              {selectedFile ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    onClick={handleRemoveFile}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                    <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-semibold text-green-600 dark:text-green-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PDF, PNG, JPG, GIF (Max 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Info Message */}
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Please upload a clear copy of the payment proof. This will be used to verify the payment and mark the commission as paid.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Confirm Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [sendingMail, setSendingMail] = useState(false);
  const [markingAsPaid, setMarkingAsPaid] = useState(false);
  
  // Mark as paid modal state
  const [isMarkAsPaidModalOpen, setIsMarkAsPaidModalOpen] = useState(false);
  
  // Add ref to track initial mount and prevent unnecessary fetches
  const isInitialMount = useRef(true);
  const prevLimitRef = useRef(pagination.limit);


  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | null;
    message: string;
  }>({
    isOpen: false,
    type: null,
    message: ''
  });

  
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

  // Fetch comments for a commission note
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

  // Send commission note email
  const sendEmail = useCallback(async (noteId: number) => {
    if (!noteId) return;
    
    try {
      setSendingMail(true);
      
      const response = await fetch(
        `${BASE_URL}/tenant/commission-note/${noteId}/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.status === "success") {
        // Show success dialog
        setDialog({
          isOpen: true,
          type: 'success',
          message: data.message || "Commission note sent via email successfully!"
        });
        
        // Refresh the notes list to update status
        fetchCommissionNotes(pagination.page);
      } else {
        // Show error dialog
        setDialog({
          isOpen: true,
          type: 'error',
          message: data.message || "Failed to send email"
        });
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: 'error',
        message: err instanceof Error ? err.message : "An error occurred while sending email"
      });
    } finally {
      setSendingMail(false);
    }
  }, [BASE_URL, token, fetchCommissionNotes, pagination.page]);

  // Mark commission note as paid with file upload
  const markAsPaid = useCallback(async (file: File) => {
    if (!activeNoteId) return;
    
    try {
      setMarkingAsPaid(true);
      
      const formData = new FormData();
      formData.append('payment_proof', file);
      formData.append('commission_note_id', activeNoteId.toString());
      
      const response = await fetch(
        `${BASE_URL}/tenant/commission-note/mark-paid`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (data.status === "success") {
        // Close the modal
        setIsMarkAsPaidModalOpen(false);
        
        // Show success dialog
        setDialog({
          isOpen: true,
          type: 'success',
          message: data.message || "Commission marked as paid successfully!"
        });
        
        // Refresh the notes list
        fetchCommissionNotes(pagination.page);
        
        // If the current note is the one that was marked as paid, refresh its details
        if (activeNoteId) {
          fetchCommissionNoteDetail(activeNoteId);
        }
      } else {
        // Show error dialog
        setDialog({
          isOpen: true,
          type: 'error',
          message: data.message || "Failed to mark as paid"
        });
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: 'error',
        message: err instanceof Error ? err.message : "An error occurred while marking as paid"
      });
    } finally {
      setMarkingAsPaid(false);
    }
  }, [BASE_URL, token, activeNoteId, fetchCommissionNotes, fetchCommissionNoteDetail, pagination.page]);

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const StatusDialog = () => {
    if (!dialog.isOpen) return null;

    return (
      <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full animate-fade-in">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                dialog.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {dialog.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <button
                onClick={closeDialog}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {dialog.type === 'success' ? 'Success' : 'Error'}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {dialog.message}
            </p>
            
            <button
              onClick={closeDialog}
              className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                dialog.type === 'success'
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                  : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

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

  // Post a new comment
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

  // Handle send email
  const handleSendEmail = () => {
    if (activeNoteId) {
      if (window.confirm("Are you sure you want to send this commission note via email?")) {
        sendEmail(activeNoteId);
      }
    }
  };

  // Handle mark as paid - open modal instead of confirm
  const handleMarkAsPaid = () => {
    if (activeNoteId) {
      setIsMarkAsPaidModalOpen(true);
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
  const formatCurrency = (amount: number | string | undefined, currency: string = 'USD') => {
    if (amount === undefined || amount === null) return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currency} ${numAmount.toFixed(2)}`;
  };

  // Format INR currency
  const formatINR = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toFixed(2)}`;
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
      {/* Status Dialog */}
      <StatusDialog />

      {/* Mark as Paid Modal */}
      <MarkAsPaidModal
        isOpen={isMarkAsPaidModalOpen}
        onClose={() => setIsMarkAsPaidModalOpen(false)}
        onSubmit={markAsPaid}
        noteId={activeNoteId}
        isSubmitting={markingAsPaid}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Commission Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all your commission notes
          </p>
        </div>

        <Link
          href="/admin/partners/accounts/commissionnote/add"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <span>Create Commission Note</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Notes List */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Commission Notes List
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {notes.length} of {pagination.total} notes
            </p>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {notesLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No commission notes found
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleNoteClick(note.id)}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      activeNoteId === note.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {note.commission_note_number}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(note.status)}`}>
                        {note.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {note.business_name}
                    </p>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {formatCurrency(note.total_commission_amount, note.currency)}
                    </p>

                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>Created: {formatDate(note.created_at)}</p>
                      <p>Updated: {formatDate(note.updated_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {notes.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-white/[0.05]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <select
                  value={pagination.limit}
                  onChange={handleLimitChange}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Details */}
<div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
  {detailLoading ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ) : activeNoteDetail ? (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {/* Commission Note  */}
            #{activeNoteDetail.commission_note?.commission_note_number || activeNoteId} <span className={`text-xs px-3 py-1.5 rounded-full ${getStatusColor(activeNoteDetail.commission_note?.status || '')}`}>
            {(activeNoteDetail.commission_note?.status || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          </h2>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Agent:</span> {activeNoteDetail.commission_note?.agent_name || '-'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Business:</span> {activeNoteDetail.commission_note?.agent_business_name || '-'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Email:</span> {activeNoteDetail.commission_note?.agent_email || '-'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Phone:</span> {activeNoteDetail.commission_note?.agent_phone || '-'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">University:</span> {activeNoteDetail.commission_note?.university_name || '-'} ({activeNoteDetail.commission_note?.university_country || '-'})
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Address:</span> {activeNoteDetail.commission_note?.agent_address || '-'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">PO Date:</span> {formatDate(activeNoteDetail.commission_note?.po_date) || '-'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          
          
          {/* Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {downloadingPdf ? "Downloading..." : "Download"}
          </button>

          {/* Send Mail Button */}
          <button
            onClick={handleSendEmail}
            disabled={sendingMail}
            className="inline-flex items-center gap-2 px-3 py-2 border border-green-600 text-green-600 dark:border-green-500 dark:text-green-400 rounded-lg text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
          >
            <Mail size={16} />
            {sendingMail ? "Sending..." : "Send Mail"}
          </button>

          {activeNoteDetail.commission_note?.status !== 'commission_payment_done' && (
            <button
              onClick={handleMarkAsPaid}
              disabled={markingAsPaid}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={16} />
              {markingAsPaid ? "Processing..." : "Mark Paid"}
            </button>
          )}
        </div>
      </div>

      

      {/* Items Table */}
      {activeNoteDetail.items && activeNoteDetail.items.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Commission Items ({activeNoteDetail.summary?.total_items || activeNoteDetail.items.length})
          </h3>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">App ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Inst</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice Amt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Received</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bank Charges</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Agent Share</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Agent Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Net Pay</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {activeNoteDetail.items.map((item, index) => (
                  <tr key={item.id || item.invoice_item_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.student || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-[200px] truncate" title={`${item.course_name || ''} (${item.study_level || ''}, ${item.intake_year || ''})`}>
                      {item.course_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.application_id || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.installment_no || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.invoice_amount || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.amount_received_in_default || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.bank_charges || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.agent_share_percentage || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.agent_commission_default || '-'}</td>
                    
                    <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                      {item.net_pay || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Commissionable</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {activeNoteDetail.commission_note?.total_commissionable_amount || '-'}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Received</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {activeNoteDetail.commission_note?.total_received_in_default || '-'}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Agent Commission</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {activeNoteDetail.commission_note?.total_agent_commission || '-'}
          </p>
        </div>
        
        {activeNoteDetail.commission_note?.total_gst_amount !== '0.00 USD' && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">GST Amount</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {activeNoteDetail.commission_note?.total_gst_amount || '-'}
            </p>
          </div>
        )}
        
        {activeNoteDetail.commission_note?.total_tds_amount !== '0.00 USD' && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">TDS Amount</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {activeNoteDetail.commission_note?.total_tds_amount || '-'}
            </p>
          </div>
        )}
        
        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <p className="text-xs text-green-600 dark:text-green-400">Net Payable</p>
          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
            {activeNoteDetail.commission_note?.total_net_payable_default || '-'}
          </p>
        </div>
      </div>


      {/* Comments Section - Keep as is */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Comments</h3>

        <div className="flex gap-2">
          <input
            placeholder="Type your comment... (Press Enter to submit)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            disabled={postingComment}
          />
          <button
            onClick={handleCommentSubmit}
            disabled={postingComment || !commentText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {postingComment ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>

        {activeNoteDetail.comments && activeNoteDetail.comments.length > 0 ? (
          <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
            {activeNoteDetail.comments.map((comment) => (
              <div key={comment.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.comment}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{comment.created_by_name || `User ${comment.created_by}`}</span>
                  <span>{formatDateTime(comment.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-6 py-4">
            No comments yet
          </p>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
      <p>Select a commission note to view details</p>
    </div>
  )}
</div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}