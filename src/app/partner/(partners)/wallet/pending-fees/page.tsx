"use client"
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
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

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

export default function PendingFeesPage() {
  const { token } = useAuth();
  const [fees, setFees] = useState<PendingFee[]>([]);
  const [totalInr, setTotalInr] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/agent/wallet/pending-fees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setFees(json.data.pendingPayments ?? []);
        setTotalInr(json.data.totalAmount ?? 0);
      } else {
        setError(json.message || "Failed to load pending fees");
      }
    } catch {
      setError("Failed to load pending fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, [token]);

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
          onClick={fetchFees}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending Applications</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{fees.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Pending (INR)</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatINR(totalInr)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-700">
                <TableRow>
                  {["Student", "University", "Course", "Application Fee", "Fee in INR", "Applied Date"].map(label => (
                    <TableCell key={label} isHeader className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.length === 0 ? (
                  <TableRow>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      No pending application fees across your students.
                    </td>
                  </TableRow>
                ) : (
                  fees.map(fee => (
                    <TableRow key={fee.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {fees.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {fees.length} pending fee{fees.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
