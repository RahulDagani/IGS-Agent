"use client"
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/badge/Badge";
import { useParams } from "next/navigation";

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PendingPaymentsResponse {
  pendingPayments: PendingPayment[];
  totalAmount: number;
}

export default function PendingPaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();

  const {id} = useParams();

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setIsLoading(true);
    setError(null);
    const url = id ? `${BASE_URL}/tenant/student/applications/pending/${id}` : `${BASE_URL}/tenant/student/applications/pending`;
    try {
      const response = await fetch(url, {
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
    } catch (err) {
      setError("Failed to fetch pending payments");
      console.error("Error fetching pending payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    const numericAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalAmount = pendingPayments.reduce((sum, payment) => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pending Payments
        </h1>
        <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
          Total: {formatAmount(totalAmount.toString())}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Application Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingPayments.length > 0 ? (
                pendingPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.student_email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        User ID: {payment.user_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.course_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.university_name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Application ID: {payment.application_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatAmount(payment.application_fee)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Tuition: {formatAmount(payment.tuition_fee)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge size="sm" color="warning">
                        {payment.fee_status.charAt(0).toUpperCase() + payment.fee_status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No pending payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {pendingPayments.length} pending payment(s)
      </div>
    </div>
  );
}