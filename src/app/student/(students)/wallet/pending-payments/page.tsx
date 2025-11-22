"use client"
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/context/AuthContext";

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

interface PendingPaymentsResponse {
  pendingPayments: PendingPayment[];
  totalAmount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface WalletBalance {
  balance: string;
  currency: string;
}

interface WalletBalanceResponse {
  wallet: {
    balance: string;
    currency: string;
  };
}

export default function PendingPaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
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
        fetchPendingPayments(),
        fetchWalletBalance(),
      ]);
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
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

  const fetchWalletBalance = async () => {
    const response = await fetch(`${BASE_URL}/student/wallet/balance`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const result: ApiResponse<WalletBalanceResponse> = await response.json();
    
    if (result.success) {
      // Set the entire wallet balance object, not just the balance string
      setWalletBalance(result.data.wallet);
    } else {
      throw new Error("Failed to fetch wallet balance");
    }
  };

  const handleSelectPayment = (paymentId: number) => {
    setSelectedPayments(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === pendingPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(pendingPayments.map(payment => payment.id));
    }
  };

  const handlePaySelected = async () => {
    if (selectedPayments.length === 0) return;

    setIsPaying(true);
    setPaymentStatus("idle");
    
    try {
      const response = await fetch(`${BASE_URL}/student/applications/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          application_ids: selectedPayments,
          payment_method: "wallet",
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentStatus("success");
        // Refresh data
        await fetchData();
        setSelectedPayments([]);
      } else {
        setPaymentStatus("error");
        throw new Error(result.message || "Failed to process payment");
      }
    } catch (err) {
      setPaymentStatus("error");
      console.error("Payment error:", err);
    } finally {
      setIsPaying(false);
    }
  };

  const handlePaySingle = async (paymentId: number) => {
    setIsPaying(true);
    setPaymentStatus("idle");
    
    try {
      const response = await fetch(`${BASE_URL}/student/applications/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          application_ids: [paymentId],
          payment_method: "wallet",
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentStatus("success");
        // Refresh data
        await fetchData();
      } else {
        setPaymentStatus("error");
        throw new Error(result.message || "Failed to process payment");
      }
    } catch (err) {
      setPaymentStatus("error");
      console.error("Payment error:", err);
    } finally {
      setIsPaying(false);
    }
  };

  const formatAmount = (amount: string) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return "$0.00";
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numericAmount);
  };

  const formatBalance = (balance: string | number | null | undefined) => {
    if (balance === null || balance === undefined || balance === '') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(0);
    }

    const numericBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTotalSelectedAmount = () => {
    return selectedPayments.reduce((total, paymentId) => {
      const payment = pendingPayments.find(p => p.id === paymentId);
      return total + (payment ? parseFloat(payment.application_fee) : 0);
    }, 0);
  };

  const hasSufficientBalance = () => {
    if (!walletBalance) return false;
    const balance = parseFloat(walletBalance.balance);
    return balance >= getTotalSelectedAmount();
  };

  // Helper function to check if balance is sufficient for a single payment
  const isInsufficientBalance = (payment: PendingPayment) => {
    if (!walletBalance) return true;
    return parseFloat(walletBalance.balance) < parseFloat(payment.application_fee);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading pending payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
        <button
          onClick={fetchData}
          className="ml-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pending Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your application fee payments
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Applications Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Pending Applications</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {pendingPayments.length}
          </div>
        </div>

        {/* Total Pending Amount Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Pending Amount</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatAmount(pendingPayments.reduce((sum, payment) => sum + parseFloat(payment.application_fee), 0).toString())}
          </div>
        </div>

        {/* Available Balance Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Available Balance</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {walletBalance ? formatBalance(walletBalance.balance) : formatBalance(0)}
          </div>
        </div>
      </div>

      {/* Payment Status Messages */}
      {paymentStatus === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 dark:text-green-300">Payment processed successfully!</span>
          </div>
        </div>
      )}

      {paymentStatus === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-red-800 dark:text-red-300">Failed to process payment. Please try again.</span>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {pendingPayments.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPayments.length === pendingPayments.length && pendingPayments.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Select All ({selectedPayments.length} selected)
                </label>
              </div>
              
              {selectedPayments.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total selected: {formatAmount(getTotalSelectedAmount().toString())}
                </div>
              )}
            </div>

            {selectedPayments.length > 0 && (
              <div className="flex items-center gap-3">
                {!hasSufficientBalance() && (
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Insufficient balance
                  </span>
                )}
                <button
                  onClick={handlePaySelected}
                  disabled={isPaying || !hasSufficientBalance()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaying ? "Processing..." : `Pay Selected (${formatAmount(getTotalSelectedAmount().toString())})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === pendingPayments.length && pendingPayments.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </TableCell>
                  {[
                    { key: "university_name", label: "University" },
                    { key: "course_name", label: "Course" },
                    { key: "application_fee", label: "Application Fee" },
                    { key: "tuition_fee", label: "Tuition Fee" },
                    { key: "duration", label: "Duration" },
                    { key: "created_at", label: "Applied Date" },
                    { key: "actions", label: "Actions" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {pendingPayments.length > 0 ? (
                  pendingPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={() => handleSelectPayment(payment.id)}
                          className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-800 text-theme-sm dark:text-white/90 font-medium">
                          {payment.university_name}
                        </div>
                        <div className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {payment.country_code}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-800 text-theme-sm dark:text-white/90">
                          {payment.course_name}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-red-600 dark:text-red-400 font-medium text-theme-sm">
                          {formatAmount(payment.application_fee)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-600 dark:text-gray-400 text-theme-sm">
                          {formatAmount(payment.tuition_fee)} {payment.currency_code}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-600 dark:text-gray-400 text-theme-sm">
                          {payment.duration_min} - {payment.duration_max} {payment.duration_unit}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-600 dark:text-gray-400 text-theme-sm">
                          {formatDate(payment.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <button
                          onClick={() => handlePaySingle(payment.id)}
                          disabled={isPaying || isInsufficientBalance(payment)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPaying ? "Paying..." : "Pay Now"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        <p>No pending payments found</p>
                        <p className="text-sm text-gray-400 mt-1">All your application fees have been paid.</p>
                      </div>
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
        Showing {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}