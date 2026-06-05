"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface PendingFee {
  id: number;
  student_id: number;
  student_name: string;
  application_fee: string;
  currency_code: string;
  fee_in_inr: number | null;
  conversion_rate: number | null;
  payment_status: string;
  created_at: string;
  course_name: string;
  university_name: string;
}

interface WalletBalance {
  balance: string;
  currency: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

export default function PendingFeesPage() {
  const { token } = useAuth();
  const [fees, setFees] = useState<PendingFee[]>([]);
  const [totalInr, setTotalInr] = useState(0);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [selectedFees, setSelectedFees] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchFees(), fetchWalletBalance()]);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    const res = await fetch(`${BASE_URL}/agent/wallet/pending-fees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.success) {
      setFees(json.data.pendingPayments ?? []);
      setTotalInr(json.data.totalAmount ?? 0);
    } else {
      throw new Error(json.message || "Failed to load pending fees");
    }
  };

  const fetchWalletBalance = async () => {
    const res = await fetch(`${BASE_URL}/agent/wallet/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.success) {
      setWalletBalance(json.data.wallet);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleSelectFee = (id: number) => {
    setSelectedFees(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedFees(
      selectedFees.length === fees.length ? [] : fees.map(f => f.id)
    );
  };

  const payApplication = async (applicationId: number) => {
    const res = await fetch(`${BASE_URL}/agent/wallet/pay-from-wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ application_id: applicationId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Payment failed");
  };

  const handlePaySingle = async (id: number) => {
    setIsPaying(true);
    setPaymentStatus("idle");
    try {
      await payApplication(id);
      setPaymentStatus("success");
      await fetchData();
    } catch {
      setPaymentStatus("error");
    } finally {
      setIsPaying(false);
    }
  };

  const handlePaySelected = async () => {
    if (selectedFees.length === 0) return;
    setIsPaying(true);
    setPaymentStatus("idle");
    try {
      for (const id of selectedFees) {
        await payApplication(id);
      }
      setPaymentStatus("success");
      setSelectedFees([]);
      await fetchData();
    } catch {
      setPaymentStatus("error");
    } finally {
      setIsPaying(false);
    }
  };

  const getTotalSelected = () =>
    selectedFees.reduce((sum, id) => {
      const fee = fees.find(f => f.id === id);
      return sum + (fee?.fee_in_inr ?? 0);
    }, 0);

  const hasSufficientBalance = () => {
    if (!walletBalance) return false;
    return parseFloat(walletBalance.balance) >= getTotalSelected();
  };

  const isInsufficientForSingle = (fee: PendingFee) => {
    if (!walletBalance) return true;
    return parseFloat(walletBalance.balance) < (fee.fee_in_inr ?? 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        Loading pending fees...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 gap-4">
        <span className="text-red-500">{error}</span>
        <button onClick={fetchData} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/partner/wallet" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Application Fees</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Application fees pending across your students
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending Applications</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{fees.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Pending (INR)</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatINR(totalInr)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {walletBalance ? formatINR(parseFloat(walletBalance.balance)) : formatINR(0)}
          </p>
          <Link
            href="/partner/wallet"
            className="inline-block mt-2 text-xs text-brand-500 hover:text-brand-600 underline font-medium"
          >
            + Add Balance
          </Link>
        </div>
      </div>

      {/* Payment status messages */}
      {paymentStatus === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-800 dark:text-green-300">Payment processed successfully!</span>
        </div>
      )}
      {paymentStatus === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-red-800 dark:text-red-300">Payment failed. Please try again.</span>
        </div>
      )}

      {/* Bulk action bar */}
      {fees.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFees.length === fees.length && fees.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Select All ({selectedFees.length} selected)
                </label>
              </div>
              {selectedFees.length > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {formatINR(getTotalSelected())}
                </span>
              )}
            </div>

            {selectedFees.length > 0 && (
              <div className="flex items-center gap-3">
                {!hasSufficientBalance() && (
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Insufficient balance —{" "}
                    <Link href="/partner/wallet" className="underline font-medium hover:text-red-800 dark:hover:text-red-300">
                      Add Balance
                    </Link>
                  </span>
                )}
                <button
                  onClick={handlePaySelected}
                  disabled={isPaying || !hasSufficientBalance()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isPaying ? "Processing..." : `Pay Selected (${formatINR(getTotalSelected())})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-700">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={selectedFees.length === fees.length && fees.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </TableCell>
                  {["Student", "University", "Course", "Application Fee", "Fee in INR", "Applied Date", "Actions"].map(label => (
                    <TableCell key={label} isHeader className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {fees.length === 0 ? (
                  <TableRow>
                    <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        <p>No pending application fees</p>
                        <p className="text-gray-400">All your students&apos; application fees have been paid.</p>
                      </div>
                    </td>
                  </TableRow>
                ) : (
                  fees.map(fee => (
                    <TableRow key={fee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFees.includes(fee.id)}
                          onChange={() => handleSelectFee(fee.id)}
                          className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Link
                          href={`/partner/editProfile/${fee.student_id}?tab=applications`}
                          className="font-medium text-brand-600 dark:text-brand-400 hover:underline text-sm"
                        >
                          {fee.student_name}
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {fee.university_name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {fee.course_name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm font-semibold text-red-600 dark:text-red-400">
                        {fee.currency_code} {parseFloat(fee.application_fee).toFixed(2)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm">
                        {fee.fee_in_inr != null ? (
                          <span className="font-medium text-gray-800 dark:text-white">
                            {formatINR(fee.fee_in_inr)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Rate unavailable</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(fee.created_at)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handlePaySingle(fee.id)}
                            disabled={isPaying || isInsufficientForSingle(fee)}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {isPaying ? "Paying..." : "Pay Now"}
                          </button>
                          {isInsufficientForSingle(fee) && (
                            <Link
                              href="/partner/wallet"
                              className="text-xs text-red-600 dark:text-red-400 underline hover:text-red-800 dark:hover:text-red-300 text-center"
                            >
                              Add Balance
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {fees.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {fees.length} pending fee{fees.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
