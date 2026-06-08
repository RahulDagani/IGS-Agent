"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, Send, Search, Download, CheckCircle, X, Mail, Upload, FileText, AlertCircle, Eye } from "lucide-react";
import Link from "next/link";

interface CommissionNote {
  id: number;
  commission_note_number: string;
  financial_year: string;
  sequence_number: number;
  agent_id: number;
  university_id: number;
  po_date: string | null;
  commission_note_currency: string;
  total_commissionable_tuition_fee: string;
  total_commission_amount_invoice_currency: string;
  total_bank_charges: string;
  total_commission_amt_after_bank_charges: string;
  total_gst_amount: string;
  total_tds_amount: string;
  total_net_payable_default: string;
  status: string;
  sent_at: string | null;
  payment_proof: string | null;
  paid_at: string | null;
  remarks: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  business_name: string;
}

interface CommissionNoteDetail {
  commission_note: {
    id: number;
    note_number: string;
    date: string;
    university: string;
    agent_business: string;
    status: string;
    currency: string;
  };
  items: Array<{
    id: number;
    student: string;
    course: string;
    intake: string;
    installment: string;
    commissionable_tuition_fee: string;
    commission_amount_invoice_currency: string;
    bank_charges: string;
    commission_amt_after_bank_charges: string;
    exchange_rate: string;
    net_commission_amt: string;
    partner_share_percentage: string;
    partner_share_amt: string;
    gst_percentage: string;
    gst_amount: string;
    tds_percentage: string;
    tds_amount: string;
    net_pay: string;
  }>;
  summary: {
    total_net_payable: string;
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
  status: string[];
  commissionNoteNumber: string;
  studentSearch: string;
  acknowledgementNo: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
  noteNumber: string;
  pdfEndpoint?: string;
  confirmLabel?: string;
  actionLabel?: string;
  onConfirm: () => void;
  onSendEmail: () => void;
  isSendingMail: boolean;
}

// PDF Modal Component
const PDFViewModal: React.FC<PDFModalProps> = ({
  isOpen,
  onClose,
  noteId,
  noteNumber,
  pdfEndpoint,
  confirmLabel,
  actionLabel,
  onConfirm,
  onSendEmail,
  isSendingMail
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE || "https://api.applystore.org";
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const resolvedEndpoint = pdfEndpoint || `${BASE_URL}/agent/commission-note/pdf/view/${noteId}`;

  // Fetch PDF with authentication
  const fetchPDF = useCallback(async () => {
    if (!noteId || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        resolvedEndpoint,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('PDF not found.');
        } else {
          throw new Error(`Failed to load PDF: ${response.status}`);
        }
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while loading the PDF");
    } finally {
      setLoading(false);
    }
  }, [noteId, token, resolvedEndpoint]);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchPDF();
      setIsConfirmed(false);
    }
    
    // Cleanup function to revoke blob URL when component unmounts or modal closes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [isOpen, noteId, fetchPDF]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError("Failed to load PDF. Please try again.");
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsConfirmed(e.target.checked);
  };

  const handleSendEmail = () => {
    if (isConfirmed) {
      onSendEmail();
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.05]">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {actionLabel === "Submit Invoice" ? "Invoice Preview" : "Commission Note"}: {noteNumber}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {actionLabel === "Submit Invoice" ? "Review the invoice before submitting" : "Review the commission note before sending"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="p-6">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ height: "70vh" }}>
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PDF...</p>
                  </div>
                </div>
              )}
              
              {error && !loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md px-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <p className="mt-4 text-red-600 dark:text-red-400 font-medium">Error Loading PDF</p>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{error}</p>
                    <div className="mt-6 flex gap-3 justify-center">
                      <button
                        onClick={fetchPDF}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pdfUrl && !error && (
                <iframe
                  ref={iframeRef}
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title={`Commission Note ${noteNumber}`}
                />
              )}
            </div>
          </div>

          {/* Footer with confirmation and actions */}
          <div className="border-t border-gray-200 dark:border-white/[0.05] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Confirmation Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={handleConfirmChange}
                  disabled={!!error}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {confirmLabel || "I confirm that the commission note has been reviewed and is correct."}
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={!isConfirmed || isSendingMail || !!error}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingMail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      {actionLabel === "Submit Invoice" ? <FileText size={16} /> : <Mail size={16} />}
                      <span>{actionLabel || "Send Email"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [sendingMail, setSendingMail] = useState(false);
  
  // PDF Modal state
  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean;
    noteId: number | null;
    noteNumber: string;
  }>({
    isOpen: false,
    noteId: null,
    noteNumber: ''
  });

  // Raise Invoice modal state
  const [raiseInvoiceModal, setRaiseInvoiceModal] = useState<{
    isOpen: boolean;
    noteId: number | null;
    noteNumber: string;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    noteId: null,
    noteNumber: '',
    isSubmitting: false,
  });

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
    status: [],
    commissionNoteNumber: "",
    studentSearch: "",
    acknowledgementNo: "",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>(filters);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE || "https://api.applystore.org";

  // Fetch commission notes using the new endpoint
  const fetchCommissionNotes = useCallback(async (page = 1, filterOptions = appliedFilters) => {
    try {
      setNotesLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add status filter based on active tab
      if (active === "progress") {
        params.append('status', 'draft,sent_to_partner,invoice_uploaded');
      } else if (active === "paid") {
        params.append('status', 'commission_payment_done');
      }
    
      
      if (filterOptions.commissionNoteNumber) {
        params.append('commission_note_number', filterOptions.commissionNoteNumber);
      }
      
      if (filterOptions.status.length > 0) {
        filterOptions.status.forEach(status => params.append('status', status));
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
        `${BASE_URL}/agent/commission-notes?${params.toString()}`,
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
        
        if (data.data.length > 0) {
          const stillVisible = data.data.some((note: CommissionNote) => note.id === activeNoteId);
          if (!stillVisible) {
            setActiveNoteId(data.data[0].id);
          }
        } else {
          setActiveNoteId(null);
          setActiveNoteDetail(null);
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
        `${BASE_URL}/agent/agent-commission-notes/${noteId}/comments`,
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
        `${BASE_URL}/agent/commission-note/${noteId}`,
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
        `${BASE_URL}/agent/commission-note/${noteId}/send`,
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
        // Close the PDF modal
        setPdfModal({ isOpen: false, noteId: null, noteNumber: '' });
        
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

  // Handle send email from modal
  const handleSendEmailFromModal = useCallback(() => {
    if (pdfModal.noteId) {
      sendEmail(pdfModal.noteId);
    }
  }, [pdfModal.noteId, sendEmail]);

  // Handle raise invoice button click — open invoice preview modal
  const handleRaiseInvoice = useCallback((noteId: number, noteNumber: string) => {
    setRaiseInvoiceModal({
      isOpen: true,
      noteId: noteId,
      noteNumber: noteNumber,
      isSubmitting: false,
    });
  }, []);

  const submitRaiseInvoice = useCallback(async () => {
    if (!raiseInvoiceModal.noteId) return;
    setRaiseInvoiceModal(prev => ({ ...prev, isSubmitting: true }));
    try {
      const response = await fetch(
        `${BASE_URL}/agent/commission-note/${raiseInvoiceModal.noteId}/raise-invoice`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.status === 'success') {
        setRaiseInvoiceModal({ isOpen: false, noteId: null, noteNumber: '', isSubmitting: false });
        setDialog({ isOpen: true, type: 'success', message: 'Invoice raised successfully! Admin will review and process your payment.' });
        fetchCommissionNotes(pagination.page);
        if (raiseInvoiceModal.noteId) fetchCommissionNoteDetail(raiseInvoiceModal.noteId);
      } else {
        setDialog({ isOpen: true, type: 'error', message: data.message || 'Failed to raise invoice' });
        setRaiseInvoiceModal(prev => ({ ...prev, isSubmitting: false }));
      }
    } catch (err) {
      setDialog({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'An error occurred' });
      setRaiseInvoiceModal(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [BASE_URL, token, raiseInvoiceModal, fetchCommissionNotes, fetchCommissionNoteDetail, pagination.page]);

  const handleSendEmailFromRaiseInvoice = useCallback(() => {
    submitRaiseInvoice();
  }, [submitRaiseInvoice]);

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
        `${BASE_URL}/agent/commission-note/${noteId}/pdf`,
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

  // Download Invoice PDF function
  const downloadInvoice = useCallback(async (noteId: number) => {
    if (!noteId) return;
    try {
      setDownloadingInvoice(true);
      const response = await fetch(
        `${BASE_URL}/agent/commission-note/invoice/download/${noteId}`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error(`Failed to download invoice: ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${noteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while downloading invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  }, [BASE_URL, token]);

  // Post a new comment
  const postComment = useCallback(async (noteId: number, comment: string) => {
    if (!comment.trim() || !activeNoteDetail) return;
    
    try {
      setPostingComment(true);
      
      const response = await fetch(
        `${BASE_URL}/agent/agent-commission-notes/${noteId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            comment: comment.trim(),
            is_internal_note: false
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
      status: [],
      commissionNoteNumber: "",
      studentSearch: "",
      acknowledgementNo: "",
    };
    
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setDatePickerKey(prev => prev + 1);
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
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  // Status options for filter
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent_to_partner", label: "Sent To Partner" },
    { value: "invoice_uploaded", label: "Invoice Uploaded" },
    { value: "commission_payment_done", label: "Commission Payment Done" },
  ];

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await fetchCommissionNotes();
      setLoading(false);
      isInitialMount.current = false;
    };
    
    fetchInitialData();
  }, [fetchCommissionNotes]);

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

      {/* Raise Invoice Modal — PDF Preview */}
      {raiseInvoiceModal.isOpen && raiseInvoiceModal.noteId && (
        <PDFViewModal
          isOpen={raiseInvoiceModal.isOpen}
          onClose={() => setRaiseInvoiceModal(prev => ({ ...prev, isOpen: false }))}
          noteId={raiseInvoiceModal.noteId}
          noteNumber={raiseInvoiceModal.noteNumber}
          pdfEndpoint={`${BASE_URL}/agent/commission-note/invoice/preview/${raiseInvoiceModal.noteId}`}
          confirmLabel="I confirm the invoice details are correct and ready to submit."
          actionLabel="Submit Invoice"
          onConfirm={() => {}}
          onSendEmail={handleSendEmailFromRaiseInvoice}
          isSendingMail={raiseInvoiceModal.isSubmitting}
        />
      )}

      {/* PDF Modal */}
      <PDFViewModal
        isOpen={pdfModal.isOpen}
        onClose={() => setPdfModal({ isOpen: false, noteId: null, noteNumber: '' })}
        noteId={pdfModal.noteId || 0}
        noteNumber={pdfModal.noteNumber}
        onConfirm={() => {}}
        onSendEmail={handleSendEmailFromModal}
        isSendingMail={sendingMail}
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
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActive('progress'); setActiveNoteId(null); setActiveNoteDetail(null); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            active === 'progress'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => { setActive('paid'); setActiveNoteId(null); setActiveNoteDetail(null); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            active === 'paid'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Paid
        </button>
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
                      {formatCurrency(parseFloat(note.total_commission_amount_invoice_currency), note.commission_note_currency)}
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
                    Commission Note #{activeNoteDetail.commission_note?.note_number || activeNoteId} 
                    <span className={`ml-2 text-xs px-3 py-1.5 rounded-full ${getStatusColor(activeNoteDetail.commission_note?.status || '')}`}>
                      {(activeNoteDetail.commission_note?.status || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </h2>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Date:</span> {formatDate(activeNoteDetail.commission_note?.date) || '-'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Agent Business:</span> {activeNoteDetail.commission_note?.agent_business || '-'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">University:</span> {activeNoteDetail.commission_note?.university || '-'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Currency:</span> {activeNoteDetail.commission_note?.currency || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Raise Invoice Button — only visible when invoice can be raised */}
                  {['sent_to_partner'].includes(activeNoteDetail.commission_note?.status || '') && (
                    <button
                      onClick={() => handleRaiseInvoice(
                        activeNoteDetail.commission_note?.id || 0,
                        activeNoteDetail.commission_note?.note_number || ''
                      )}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FileText size={16} />
                      Raise Invoice
                    </button>
                  )}
                  {activeNoteDetail.commission_note?.status === 'invoice_uploaded' && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                      <CheckCircle size={16} />
                      Invoice Submitted
                    </span>
                  )}

                  {/* Download Commission Note Button */}
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                  >
                    <Download size={16} />
                    {downloadingPdf ? "Downloading..." : "Download Note"}
                  </button>

                  {/* Download Invoice Button — visible once agent has raised the invoice */}
                  {['invoice_uploaded', 'commission_payment_done'].includes(activeNoteDetail.commission_note?.status || '') && (
                    <button
                      onClick={() => activeNoteId && downloadInvoice(activeNoteId)}
                      disabled={downloadingInvoice}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400 rounded-lg text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
                    >
                      <FileText size={16} />
                      {downloadingInvoice ? "Downloading..." : "Download Invoice"}
                    </button>
                  )}

                </div>
              </div>

              {/* Items Table */}
              {activeNoteDetail.items && activeNoteDetail.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Commission Items ({activeNoteDetail.items.length})
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Intake</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Inst</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Comm. Fee</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Comm. Amt</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bank Charges</th>
                          
                          {/* Conditionally show commission_amt_after_bank_charges and exchange_rate */}
                          {activeNoteDetail.items.some(item => item.exchange_rate) && (
                            <>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">After Bank</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ex. Rate</th>
                            </>
                          )}
                          
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Net Comm.</th>
                          
                          {/* Conditionally show partner_share_percentage and partner_share_amt */}
                          {activeNoteDetail.items.some(item => item.partner_share_percentage) && (
                            <>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Partner Share</th>
                              
                            </>
                          )}

                          {activeNoteDetail.items.some(item => item.partner_share_amt) && (
                            <>
                              
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Partner Amt</th>
                            </>
                          )}
                          
                          {/* Conditionally show GST columns */}
                          {activeNoteDetail.items.some(item => item.gst_percentage) && (
                            <>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">GST</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">GST Amt</th>
                            </>
                          )}
                          
                          {/* TDS columns (always show if GST exists) */}
                          {activeNoteDetail.items.some(item => item.gst_percentage) && (
                            <>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">TDS</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">TDS Amt</th>
                            </>
                          )}
                          
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Net Pay</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {activeNoteDetail.items.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.student || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.course || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.intake || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.installment || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.commissionable_tuition_fee || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.commission_amount_invoice_currency || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.bank_charges || '-'}</td>
                            
                            {/* Conditionally show commission_amt_after_bank_charges and exchange_rate */}
                            {activeNoteDetail.items.some(item => item.exchange_rate) && (
                              <>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.commission_amt_after_bank_charges || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.exchange_rate || '-'}</td>
                              </>
                            )}
                            
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.net_commission_amt || '-'}</td>
                            
                            {/* Conditionally show partner_share_percentage and partner_share_amt */}
                            {activeNoteDetail.items.some(item => item.partner_share_percentage) && (
                              <>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.partner_share_percentage || '-'}</td>
                          
                              </>
                            )}

                            {activeNoteDetail.items.some(item => item.partner_share_amt) && (
                              <>
                                
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.partner_share_amt || '-'}</td>
                              </>
                            )}
                            
                            {/* Conditionally show GST columns */}
                            {activeNoteDetail.items.some(item => item.gst_percentage) && (
                              <>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.gst_percentage || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.gst_amount || '-'}</td>
                              </>
                            )}
                            
                            {/* TDS columns (always show if GST exists) */}
                            {activeNoteDetail.items.some(item => item.gst_percentage) && (
                              <>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.tds_percentage || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.tds_amount || '-'}</td>
                              </>
                            )}
                            
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

              {/* Summary */}
              {activeNoteDetail.summary && (
                <div className="flex justify-end">
                  <div className="w-full sm:w-64 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-xs text-green-600 dark:text-green-400">Total Net Payable</p>
                    <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                      {activeNoteDetail.summary.total_net_payable || '-'}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Proof */}
              {(() => {
                const activeNote = notes.find(n => n.id === activeNoteId);
                const proof = activeNote?.payment_proof;
                if (!proof) return null;
                const apiBase = (BASE_URL || 'https://api.applystore.org').replace(/\/api$/, '');
                const proofUrl = `${apiBase}/${proof.replace(/^\.\//, '')}`;
                const isImage = /\.(jpe?g|png|gif|webp)$/i.test(proof);
                return (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                      <CheckCircle size={16} /> Payment Proof
                    </p>
                    {isImage ? (
                      <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                        <img src={proofUrl} alt="Payment proof" className="max-h-48 rounded border border-green-300 dark:border-green-700 object-contain" />
                      </a>
                    ) : (
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                      >
                        <FileText size={16} /> View Payment Proof
                      </a>
                    )}
                  </div>
                );
              })()}

              {/* Comments Section */}
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
                    {activeNoteDetail.comments.map((comment) => {
                      const isAgent = comment.who_has_created === 'agent';
                      return (
                        <div key={comment.id} className={`p-3 rounded-lg border ${isAgent ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ml-4' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mr-4'}`}>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.comment}</p>
                          <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className={`font-medium ${isAgent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                              {isAgent ? 'You' : (comment.created_by_name || 'Admin')}
                            </span>
                            <span>{formatDateTime(comment.created_at)}</span>
                          </div>
                        </div>
                      );
                    })}
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