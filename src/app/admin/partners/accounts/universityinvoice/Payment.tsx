"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, Send, Search, Download, Eye, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: string;
  currency: string;
  status: string;
  university_name: string;
}

interface InvoiceDetail {
  invoice: {
    id: number;
    invoice_number: string;
    invoice_date: string;
    purpose_code: string | null;
    total_amount: string;
    currency: string;
    status: string;
    created_at: string;
    university_id: number;
    university_name: string;
  };
  summary: {
    total_items: number;
    paid_items: number;
    unpaid_items: number;
  };
  items: InvoiceItem[];
}

interface InvoiceItem {
  invoice_item_id: number;
  application_id: number;
  installment_no: number;
  commission_type: string;
  commission_value: string;
  commissionable_tuition_fee: string;
  commission_amount: string;
  currency: string;
  payment_status: string;
  paid_at: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface FilterOptions {
  dateRange: [Date | null, Date | null];
  universities: string[];
  status: string[];
  invoiceNumber: string;
  studentEmail: string;
}

interface University {
  university_id: number;
  university_name: string;
  total_applications: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeInvoiceDetail, setActiveInvoiceDetail] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1
  });
  const [activeInvoiceId, setActiveInvoiceId] = useState<number | null>(null);
  // const [activeTab, setActiveTab] = useState<"all" | "draft" | "sent" | "paid">("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [markPaidItem, setMarkPaidItem] = useState<number | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: [null, null],
    universities: [],
    status: [],
    invoiceNumber: "",
    studentEmail: "",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>(filters);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch universities for filter
  const fetchUniversities = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/universities`,
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
      
      if (data.status === 'success') {
        setUniversities(data.data || []);
      }
    } catch (err) {
      console.error(err);
      setUniversities([]);
    }
  }, [BASE_URL, token]);

  // Fetch invoices
  const fetchInvoices = useCallback(async (page = 1, filterOptions = appliedFilters) => {
    try {
      setInvoicesLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add status filter based on active tab
      // if (activeTab !== "all") {
      //   params.append('status', activeTab);
      // }
      
      if (filterOptions.invoiceNumber) {
        params.append('invoice_number', filterOptions.invoiceNumber);
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
      
      if (filterOptions.studentEmail) {
        params.append('student_email', filterOptions.studentEmail);
      }
      
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoices?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setInvoices(data.data);
        setPagination(data.pagination || {
          page: page,
          limit: pagination.limit,
          total: data.data.length,
          total_pages: 1
        });
        
        // Set first invoice as active if available
        if (data.data.length > 0 && !activeInvoiceId) {
          setActiveInvoiceId(data.data[0].id);
        }
      } else {
        throw new Error(data.message || "Failed to fetch invoices");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setInvoicesLoading(false);
    }
  }, [BASE_URL, token, pagination.limit, activeInvoiceId, appliedFilters]);

  // Fetch invoice details
  const fetchInvoiceDetail = useCallback(async (invoiceId: number) => {
    try {
      setDetailLoading(true);
      setError(null);
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/${invoiceId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch invoice details: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setActiveInvoiceDetail(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch invoice details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDetailLoading(false);
    }
  }, [BASE_URL, token]);

  // Mark invoice item as paid
  const markItemAsPaid = useCallback(async (invoiceItemId: number) => {
    try {
      setProcessingAction(true);
      setError(null);
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/mark-paid`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            invoice_item_id: invoiceItemId
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to mark item as paid: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccess('Invoice item marked as paid successfully');
        // Refresh invoice details
        if (activeInvoiceId) {
          fetchInvoiceDetail(activeInvoiceId);
        }
        // Refresh invoices list
        fetchInvoices(pagination.page);
      } else {
        throw new Error(data.message || "Failed to mark item as paid");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessingAction(false);
      setMarkPaidItem(null);
    }
  }, [BASE_URL, token, activeInvoiceId, fetchInvoiceDetail, fetchInvoices, pagination.page]);

  // Delete invoice
  const deleteInvoice = useCallback(async (invoiceId: number) => {
    try {
      setProcessingAction(true);
      setError(null);
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/${invoiceId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccess('Invoice deleted successfully');
        setShowDeleteModal(false);
        setInvoiceToDelete(null);
        setActiveInvoiceId(null);
        setActiveInvoiceDetail(null);
        // Refresh invoices list
        fetchInvoices(1);
      } else {
        throw new Error(data.message || "Failed to delete invoice");
      }
    } catch (err) {
      
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessingAction(false);
    }
  }, [BASE_URL, token, fetchInvoices]);

  // Download invoice PDF
  const downloadInvoicePDF = useCallback(async (invoiceId: number) => {
    try {
      setProcessingAction(true);
      setError(null);
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/${invoiceId}/pdf`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.status}`);
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Invoice PDF downloaded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while downloading PDF");
    } finally {
      setProcessingAction(false);
    }
  }, [BASE_URL, token]);

  // Send invoice email
  const sendInvoiceEmail = useCallback(async (invoiceId: number) => {
    try {
      setProcessingAction(true);
      setError(null);
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/${invoiceId}/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccess('Invoice email sent successfully');
        // Refresh invoice details to update status
        if (activeInvoiceId) {
          fetchInvoiceDetail(activeInvoiceId);
        }
        // Refresh invoices list
        fetchInvoices(pagination.page);
      } else {
        throw new Error(data.message || "Failed to send invoice email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while sending email");
    } finally {
      setProcessingAction(false);
    }
  }, [BASE_URL, token, activeInvoiceId, fetchInvoiceDetail, fetchInvoices, pagination.page]);

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle search button click - apply filters
  const handleSearch = () => {
    setAppliedFilters(filters);
    setDatePickerKey(prev => prev + 1);
    fetchInvoices(1, filters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      dateRange: [null, null],
      universities: [],
      status: [],
      invoiceNumber: "",
      studentEmail: ""
    };
    
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setDatePickerKey(prev => prev + 1);
    fetchInvoices(1, clearedFilters);
  };

  // Handle invoice click
  const handleInvoiceClick = (invoiceId: number) => {
    setActiveInvoiceId(invoiceId);
    fetchInvoiceDetail(invoiceId);
  };

  // Handle page change
const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= pagination.total_pages) {
    fetchInvoices(newPage, appliedFilters);
  }
};

  // Handle delete confirmation
  const handleDeleteClick = (invoiceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setInvoiceToDelete(invoiceId);
    setShowDeleteModal(true);
  };

  // Handle mark as paid click
  const handleMarkPaidClick = (invoiceItemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMarkPaidItem(invoiceItemId);
  };

  // Confirm mark as paid
  const confirmMarkPaid = () => {
    if (markPaidItem) {
      markItemAsPaid(markPaidItem);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'sent':
      case 'sent_to_partner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'paid':
      case 'commission_payment_done':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Status options for filter
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "partial_paid", label: "Partial Paid" },
    { value: "paid", label: "Paid" },
  ];

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await fetchUniversities();
      await fetchInvoices();
      setLoading(false);
    };
    
    fetchInitialData();
  }, [fetchUniversities, fetchInvoices]);

  // Fetch detail when active invoice changes
  useEffect(() => {
    if (activeInvoiceId) {
      fetchInvoiceDetail(activeInvoiceId);
    }
  }, [activeInvoiceId, fetchInvoiceDetail]);

  // Refresh invoices when active tab changes
  // useEffect(() => {
  //   fetchInvoices(1);
  // }, [fetchInvoices]);

  // Custom styles for react-select
  const darkSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: 'rgb(31 41 55)',
      borderColor: 'rgb(75 85 99)',
      minHeight: '42px',
      '&:hover': {
        borderColor: 'rgb(107 114 128)',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 z-999999 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg max-w-md animate-slide-in">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-green-800 dark:text-green-300">{success}</p>
            <button 
              onClick={() => setSuccess(null)}
              className="ml-4 text-green-600 dark:text-green-400 hover:text-green-800"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-999999 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg max-w-md animate-slide-in">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-600 dark:text-red-400 hover:text-red-800"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-99999 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setInvoiceToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                onClick={() => invoiceToDelete && deleteInvoice(invoiceToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={processingAction}
              >
                {processingAction ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Confirmation Modal */}
      {markPaidItem && (
        <div className="fixed inset-0 bg-black/50 z-99999 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Payment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to mark this invoice item as paid?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMarkPaidItem(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkPaid}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={processingAction}
              >
                {processingAction ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Invoices
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all your invoices
            </p>
          </div>

          <Link
            href="/admin/partners/accounts/universityinvoice/add"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Create New Invoice
          </Link>
        </div>

        {/* Tabs */}
        {/* <div className="border-b border-gray-200 dark:border-white/[0.05]">
          <div className="flex gap-8">
            {['all', 'draft', 'sent', 'paid'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-3 px-1 relative capitalize ${
                  activeTab === tab
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute left-0 -bottom-[1px] h-[3px] w-full bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div> */}
        
        {/* Filters Section */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-white/[0.05]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="Search by invoice number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                value={filters.invoiceNumber}
                onChange={(e) => handleFilterChange('invoiceNumber', e.target.value)}
              />
            </div>

            {/* Status Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <Select
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

            {/* University Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                University
              </label>
              <Select
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
                placeholder="Select universities"
                className="react-select-container"
                classNamePrefix="react-select"
                styles={darkSelectStyles}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Created
              </label>
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

            {/* University Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student Email Search
              </label>
              <input
                type="text"
                placeholder="Search by Student Email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                value={filters.studentEmail}
                onChange={(e) => handleFilterChange('studentEmail', e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium dark:bg-blue-700 dark:hover:bg-blue-600"
                onClick={handleSearch}
                disabled={invoicesLoading}
              >
                <Search size={18} />
                {invoicesLoading ? "Searching..." : "Search"}
              </button>
              
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

        {/* Main Content */}
        <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1200px]">
              <div className="flex gap-6 bg-[#F6F9FC] dark:bg-gray-900 min-h-screen">
                {/* LEFT PANEL - Invoices List */}
                <div className="w-[420px] bg-white dark:bg-gray-800 rounded-xl space-y-4 border border-gray-200 dark:border-white/[0.05]">
                  {invoicesLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">No invoices found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Try adjusting your filters or create a new invoice
                      </p>
                    </div>
                  ) : (
                    <>
                      {invoices.map((invoice) => (
                        <div 
                          key={invoice.id}
                          className={`rounded-xl p-4 space-y-2 relative cursor-pointer transition-all ${
                            activeInvoiceId === invoice.id 
                              ? 'border-l-4 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                          }`}
                          onClick={() => handleInvoiceClick(invoice.id)}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                            <button
                              onClick={(e) => handleDeleteClick(invoice.id, e)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {invoice.invoice_number}
                          </h3>

                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {invoice.university_name}
                          </p>

                          <div className="flex justify-between items-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {invoice.currency} {parseFloat(invoice.total_amount).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(invoice.invoice_date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Pagination */}
                  {invoices.length > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <button 
                          className="h-9 w-9 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Page {pagination.page} of {pagination.total_pages}
                        </span>

                        <button 
                          className="h-9 w-9 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.total_pages}
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
      limit: newLimit,
      page: 1 // Reset to first page when changing limit
    }));
    // Use setTimeout to ensure state update completes
    setTimeout(() => {
      fetchInvoices(1, appliedFilters);
    }, 0);
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

                {/* RIGHT PANEL - Invoice Details */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-white/[0.05]">
                  {detailLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : activeInvoiceDetail ? (
                    <div className="space-y-6">
                      {/* Header Actions */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                          <button
                            onClick={() => downloadInvoicePDF(activeInvoiceDetail.invoice.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            disabled={processingAction}
                          >
                            <Download size={16} />
                            Download PDF
                          </button>
                          <button
                            onClick={() => sendInvoiceEmail(activeInvoiceDetail.invoice.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            disabled={processingAction}
                          >
                            <Send size={16} />
                            Send Email
                          </button>
                          {/* <button
                            onClick={() => window.open(`/admin/invoice/view/${activeInvoiceDetail.invoice.id}`, '_blank')}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                          >
                            <Eye size={16} />
                            View Details
                          </button> */}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeInvoiceDetail.invoice.status)}`}>
                          {activeInvoiceDetail.invoice.status}
                        </span>
                      </div>

                      {/* Invoice Header */}
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Invoice Number</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {activeInvoiceDetail.invoice.invoice_number}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Invoice Date</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {formatDate(activeInvoiceDetail.invoice.invoice_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">University</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {activeInvoiceDetail.invoice.university_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total Amount</p>
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                              {activeInvoiceDetail.invoice.currency} {parseFloat(activeInvoiceDetail.invoice.total_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Summary Cards */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Items</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {activeInvoiceDetail.summary.total_items}
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Paid Items</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {activeInvoiceDetail.summary.paid_items}
                          </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Unpaid Items</p>
                          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                            {activeInvoiceDetail.summary.unpaid_items}
                          </p>
                        </div>
                      </div>

                      {/* Invoice Items Table */}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Invoice Items</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  App ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Installment
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Commission Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Tuition Fee
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Commission Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {activeInvoiceDetail.items.map((item) => (
                                <tr key={item.invoice_item_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    #{item.application_id}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {item.installment_no}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <span className="capitalize">{item.commission_type}</span>
                                    <span className="text-gray-500 ml-1">
                                      ({item.commission_value})
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {item.currency} {parseFloat(item.commissionable_tuition_fee).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {item.currency} {parseFloat(item.commission_amount).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(item.payment_status)}`}>
                                      {item.payment_status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.payment_status === 'pending' && (
                                      <button
                                        onClick={(e) => handleMarkPaidClick(item.invoice_item_id, e)}
                                        className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        disabled={processingAction}
                                      >
                                        Mark Paid
                                      </button>
                                    )}
                                    {item.paid_at && (
                                      <span className="text-xs text-gray-500">
                                        Paid: {formatDateTime(item.paid_at)}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-white/[0.05]">
                        Created: {formatDateTime(activeInvoiceDetail.invoice.created_at)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium mb-1">No invoice selected</p>
                      <p className="text-sm">Select an invoice from the list to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {invoices.length} of {pagination.total} invoices
        </div>
      </div>
    </>
  );
}