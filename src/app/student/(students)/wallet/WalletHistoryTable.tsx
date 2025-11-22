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
import { useAuth } from "@/context/AuthContext";

interface WalletTransaction {
  id: number;
  tenant_id: number;
  user_id: number;
  wallet_id: number;
  type: "credit" | "debit";
  amount: string;
  transaction_ref: string;
  gateway: string;
  gateway_transaction_id: string | null;
  status: "pending" | "completed" | "failed";
  description: string;
  // metadata: any;
  created_at: string;
}

interface PendingPayment {
  id: number;
  tenant_id: number;
  user_id: number;
  application_id: string;
  application_fee: string;
  fee_status: string;
  created_at: string;
  updated_at: string;
  student_email: string;
  course_name: string;
  university_name: string;
  country_code: string;
  tuition_fee: string;
  currency_code: string;
  duration_min: number;
  duration_max: number;
  duration_unit: string;
}

interface WalletBalance {
  balance: string | number;
  currency: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface TransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface PendingPaymentsResponse {
  pendingPayments: PendingPayment[];
  totalAmount: number;
}

type SortField = keyof WalletTransaction | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  transactionType: string;
  referenceType: string;
  status: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      transactionType: selectedTransactionType,
      referenceType: "all", // Keeping this for compatibility
      status: selectedStatus,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedTransactionType("all");
    setSelectedStatus("all");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-999999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Transactions
          </h3>
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
          {/* Transaction Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={selectedTransactionType}
              onChange={(e) => setSelectedTransactionType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (amount: number) => void;
}

const AddBalanceModal: React.FC<AddBalanceModalProps> = ({
  isOpen,
  onClose,
  onRecharge,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      await onRecharge(parseFloat(amount));
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Failed to recharge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-999999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Add Balance
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Add Balance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function WalletHistoryTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    transactionType: "all",
    referenceType: "all",
    status: "all",
  });

  // API states
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();


  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchTransactions(),
        fetchWalletBalance(),
        fetchPendingPayments(),
      ]);
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const response = await fetch(`${BASE_URL}/student/wallet/transactions`,{
      headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    const result: ApiResponse<TransactionsResponse> = await response.json();
    
    if (result.success) {
      setTransactions(result.data.transactions);
    } else {
      throw new Error("Failed to fetch transactions");
    }
  };



  const fetchWalletBalance = async () => {
  try {
     const response = await fetch(`${BASE_URL}/student/wallet/balance`,{
      headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    const result = await response.json();
    
    if (result.success && result.data) {
      // Ensure balance is a valid number
      const balance = result.data.wallet.balance;
      const numericBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
      
      if (!isNaN(numericBalance)) {
        setWalletBalance({
          ...result.data,
          balance: numericBalance
        });
      } else {
        setWalletBalance({
          balance: 0,
          currency: 'USD'
        });
      }
    } else {
      throw new Error("Failed to fetch wallet balance");
    }
  } catch (err) {
    console.error("Error fetching wallet balance:", err);
    setWalletBalance({
      balance: 0,
      currency: 'USD'
    });
  }
};



  const fetchPendingPayments = async () => {
    const response = await fetch(`${BASE_URL}/student/applications/pending`,{
      headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    const result: ApiResponse<PendingPaymentsResponse> = await response.json();
    
    if (result.success) {
      setPendingPayments(result.data.pendingPayments);
    } else {
      throw new Error("Failed to fetch pending payments");
    }
  };

  const handleRecharge = async (amount: number) => {
    const response = await fetch(`${BASE_URL}/student/wallet/recharge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: amount,
        gateway: "stripe",
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      // Refresh wallet balance and transactions
      await Promise.all([fetchWalletBalance(), fetchTransactions()]);
    } else {
      throw new Error(result.message || "Failed to recharge wallet");
    }
  };

  const handlePayPendingPayments = async (applicationIds: number[]) => {
    const response = await fetch(`${BASE_URL}/student/applications/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization" : `Bearer ${token}`
      },
      body: JSON.stringify({
        application_ids: applicationIds,
        payment_method: "wallet",
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      // Refresh all data
      await fetchData();
    } else {
      throw new Error(result.message || "Failed to process payment");
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch = 
        transaction.transaction_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.gateway.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTransactionType = filters.transactionType === "all" || transaction.type === filters.transactionType;
      const matchesStatus = filters.status === "all" || transaction.status === filters.status;
      
      return matchesSearch && matchesTransactionType && matchesStatus;
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

        if(aValue && bValue){
          if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        }
        }
        
        
        return 0;
      });
    }

    return filtered;
  }, [transactions, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: keyof WalletTransaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof WalletTransaction) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getTransactionTypeColor = (type: WalletTransaction["type"]) => {
    switch (type) {
      case "credit":
        return "success";
      case "debit":
        return "error";
      default:
        return "primary";
    }
  };

  const getStatusColor = (status: WalletTransaction["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "primary";
    }
  };

  const formatAmount = (amount: string) => {
    const numericAmount = parseFloat(amount);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(numericAmount));
    
    return numericAmount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const formatBalance = (balance: string | number | null | undefined) => {
  // Handle null, undefined, or empty values
  if (balance === null || balance === undefined || balance === '') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(0);
  }

  // Convert to number, handling invalid cases
  const numericBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  // Check if the parsed value is a valid number
  if (isNaN(numericBalance)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(0);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(numericBalance);
};

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.transactionType !== "all" || filters.status !== "all";

  const clearAllFilters = () => {
    setFilters({
      transactionType: "all",
      referenceType: "all",
      status: "all",
    });
  };

  const totalPendingAmount = pendingPayments.reduce((sum, payment) => {
    return sum + parseFloat(payment.application_fee);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Balance Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Available Balance</div>
             <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
  {walletBalance ? formatBalance(walletBalance.balance) : formatBalance(0)}
</div>
            </div>
            <button
              onClick={() => setIsAddBalanceModalOpen(true)}
              className="px-3 py-1 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600"
            >
              Add Balance
            </button>
          </div>
        </div>

        {/* Total Credits Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Credits</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatBalance(
              transactions
                .filter(t => t.type === 'credit' && t.status === 'completed')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0).toString()
            )}
          </div>
        </div>

        {/* Pending Payments Card */}
        <div 
          className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => {
            // Redirect to pending payments page
            window.location.href = '/student/wallet/pending-payments';
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Pending Payments</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatBalance(totalPendingAmount.toString())}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {pendingPayments.length} application(s) pending
              </div>
            </div>
            {pendingPayments.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayPendingPayments(pendingPayments.map(p => p.id));
                }}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Pay All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by transaction reference, description, or gateway..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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

        {/* Filter Button and Active Filters */}
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Apply Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.transactionType !== "all" && (
            <Badge size="sm" color="primary">
              Transaction: {filters.transactionType}
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge size="sm" color="primary">
              Status: {filters.status}
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    { key: "created_at", label: "Date" },
                    { key: "type", label: "Transaction Type" },
                    { key: "status", label: "Status" },
                    { key: "amount", label: "Amount" },
                    { key: "transaction_ref", label: "Transaction Reference" },
                    { key: "description", label: "Description" },
                    { key: "gateway", label: "Gateway" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort(key as keyof WalletTransaction)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <span className="text-xs">{getSortIcon(key as keyof WalletTransaction)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start min-w-[200px]">
                        <div className="text-gray-800 text-theme-sm dark:text-white/90">
                          {formatDate(transaction.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getTransactionTypeColor(transaction.type)}
                        >
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getStatusColor(transaction.status)}
                        >
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className={`font-medium text-theme-sm ${
                          transaction.type === 'credit' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatAmount(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-400">
                        {transaction.transaction_ref}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-800 text-theme-sm dark:text-white/90 max-w-[200px] truncate">
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-400">
                        {transaction.gateway.charAt(0).toUpperCase() + transaction.gateway.slice(1)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      No transactions found matching your criteria.
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
        Showing {filteredAndSortedData.length} of {transactions.length} transactions
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />

      {/* Add Balance Modal */}
      <AddBalanceModal
        isOpen={isAddBalanceModalOpen}
        onClose={() => setIsAddBalanceModalOpen(false)}
        onRecharge={handleRecharge}
      />
    </div>
  );
}