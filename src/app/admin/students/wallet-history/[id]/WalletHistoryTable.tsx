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

interface WalletTransaction {
  id: number;
  transactionType: "credit" | "debit" | "failed";
  referenceType: "application" | "manual_topup" | "refund" | "adjustment";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  paymentId: string;
  remarks: string;
  student: string;
  application: string;
  date: string;
}

// Define the table data using the interface
const tableData: WalletTransaction[] = [
  {
    id: 1,
    transactionType: "credit",
    referenceType: "manual_topup",
    amount: 1000.00,
    balanceBefore: 500.00,
    balanceAfter: 1500.00,
    paymentId: "PYMT_001234",
    remarks: "Manual top-up by admin",
    student: "Alice Johnson",
    application: "APP-001",
    date: "2024-01-15T10:30:00",
  },
  {
    id: 2,
    transactionType: "debit",
    referenceType: "application",
    amount: -250.00,
    balanceBefore: 1500.00,
    balanceAfter: 1250.00,
    paymentId: "PYMT_001235",
    remarks: "Application fee for Harvard University",
    student: "Bob Wilson",
    application: "APP-002",
    date: "2024-01-16T14:20:00",
  },
  {
    id: 3,
    transactionType: "credit",
    referenceType: "refund",
    amount: 150.00,
    balanceBefore: 1250.00,
    balanceAfter: 1400.00,
    paymentId: "PYMT_001236",
    remarks: "Refund for cancelled application",
    student: "Carol Davis",
    application: "APP-003",
    date: "2024-01-18T09:15:00",
  },
  {
    id: 4,
    transactionType: "failed",
    referenceType: "application",
    amount: 0.00,
    balanceBefore: 1400.00,
    balanceAfter: 1400.00,
    paymentId: "PYMT_001237",
    remarks: "Payment failed - insufficient funds",
    student: "David Brown",
    application: "APP-004",
    date: "2024-01-20T16:45:00",
  },
  {
    id: 5,
    transactionType: "debit",
    referenceType: "application",
    amount: -300.00,
    balanceBefore: 1400.00,
    balanceAfter: 1100.00,
    paymentId: "PYMT_001238",
    remarks: "Application fee for Stanford University",
    student: "Eva Martinez",
    application: "APP-005",
    date: "2024-01-22T11:30:00",
  },
  {
    id: 6,
    transactionType: "credit",
    referenceType: "adjustment",
    amount: 200.00,
    balanceBefore: 1100.00,
    balanceAfter: 1300.00,
    paymentId: "PYMT_001239",
    remarks: "Admin adjustment - service credit",
    student: "Alice Johnson",
    application: "N/A",
    date: "2024-01-25T13:20:00",
  },
];

type SortField = keyof WalletTransaction | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  transactionType: string;
  referenceType: string;
  student: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  students: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  students,
}) => {
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>("all");
  const [selectedReferenceType, setSelectedReferenceType] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      transactionType: selectedTransactionType,
      referenceType: selectedReferenceType,
      student: selectedStudent,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedTransactionType("all");
    setSelectedReferenceType("all");
    setSelectedStudent("all");
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
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Reference Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reference Type
            </label>
            <select
              value={selectedReferenceType}
              onChange={(e) => setSelectedReferenceType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All References</option>
              <option value="application">Application</option>
              <option value="manual_topup">Manual Top-up</option>
              <option value="refund">Refund</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Students</option>
              {students.map((student) => (
                <option key={student} value={student}>
                  {student}
                </option>
              ))}
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

export default function WalletHistoryTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    transactionType: "all",
    referenceType: "all",
    student: "all",
  });

  // Get unique values for filters
  const students = useMemo(() => {
    return Array.from(new Set(tableData.map(transaction => transaction.student)));
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = tableData.filter((transaction) => {
      const matchesSearch = 
        transaction.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.application.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTransactionType = filters.transactionType === "all" || transaction.transactionType === filters.transactionType;
      const matchesReferenceType = filters.referenceType === "all" || transaction.referenceType === filters.referenceType;
      const matchesStudent = filters.student === "all" || transaction.student === filters.student;
      
      return matchesSearch && matchesTransactionType && matchesReferenceType && matchesStudent;
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
  }, [searchTerm, filters, sortField, sortDirection]);

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

  const getTransactionTypeColor = (type: WalletTransaction["transactionType"]) => {
    switch (type) {
      case "credit":
        return "success";
      case "debit":
        return "error";
      case "failed":
        return "warning";
      default:
        return "primary";
    }
  };

  const getReferenceTypeColor = (type: WalletTransaction["referenceType"]) => {
    switch (type) {
      case "application":
        return "primary";
      case "manual_topup":
        return "success";
      case "refund":
        return "warning";
      case "adjustment":
        return "info";
      default:
        return "primary";
    }
  };

  const formatReferenceType = (type: WalletTransaction["referenceType"]) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatAmount = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
    
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
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

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(balance);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.transactionType !== "all" || filters.referenceType !== "all" || 
                          filters.student !== "all";

  const clearAllFilters = () => {
    setFilters({
      transactionType: "all",
      referenceType: "all",
      student: "all",
    });
  };

  return (
    <div className="space-y-4">
         {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Credits</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatBalance(
              filteredAndSortedData
                .filter(t => t.transactionType === 'credit')
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Debits</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatBalance(
              Math.abs(
                filteredAndSortedData
                  .filter(t => t.transactionType === 'debit')
                  .reduce((sum, t) => sum + t.amount, 0)
              )
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Balance</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatBalance(
              filteredAndSortedData.length > 0 
                ? filteredAndSortedData[filteredAndSortedData.length - 1].balanceAfter
                : 0
            )}
          </div>
        </div>
      </div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row  ">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by payment ID, remarks, student, or application..."
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
          {filters.referenceType !== "all" && (
            <Badge size="sm" color="primary">
              Reference: {formatReferenceType(filters.referenceType as WalletTransaction["referenceType"])}
            </Badge>
          )}
          {filters.student !== "all" && (
            <Badge size="sm" color="primary">
              Student: {filters.student}
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
                    { key: "date", label: "Date" },
                    { key: "transactionType", label: "Transaction Type" },
                    { key: "referenceType", label: "Reference Type" },
                    { key: "amount", label: "Amount" },
                    { key: "balanceBefore", label: "Balance Before" },
                    { key: "balanceAfter", label: "Balance After" },
                    { key: "paymentId", label: "Payment ID" },
                    { key: "remarks", label: "Remarks" },
                    { key: "student", label: "Student" },
                    { key: "application", label: "Application" },
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
                          {formatDate(transaction.date)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getTransactionTypeColor(transaction.transactionType)}
                        >
                          {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getReferenceTypeColor(transaction.referenceType)}
                        >
                          {formatReferenceType(transaction.referenceType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className={`font-medium text-theme-sm ${
                          transaction.transactionType === 'credit' 
                            ? 'text-green-600 dark:text-green-400' 
                            : transaction.transactionType === 'debit'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {formatAmount(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-400">
                        {formatBalance(transaction.balanceBefore)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90">
                        {formatBalance(transaction.balanceAfter)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-400">
                        {transaction.paymentId}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-800 text-theme-sm dark:text-white/90 max-w-[200px] truncate">
                          {transaction.remarks}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-800 text-theme-sm dark:text-white/90">
                          {transaction.student}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-600 text-theme-sm dark:text-gray-400">
                          {transaction.application}
                        </div>
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
        Showing {filteredAndSortedData.length} of {tableData.length} transactions
      </div>

      

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        students={students}
      />
    </div>
  );
}