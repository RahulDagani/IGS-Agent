"use client"
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/context/AuthContext";
import { Wallet, Plus, X, Clock, User, GraduationCap, Building2, CreditCard, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

interface WalletTransaction {
  id: number;
  type: "credit" | "debit";
  gateway: string;
  status: "success" | "pending" | "failed";
  amount: number;
  balance_before: number;
  balance_after: number;
  transaction_ref: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  description: string;
  created_at: string;
}

interface WalletData {
  wallet: { id: number; balance: number; currency: string };
  payment_gateway_key: string | null;
  recentTransactions: WalletTransaction[];
}

type SortField = keyof WalletTransaction | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  transactionType: string;
  status: string;
}

interface ApplicationDetail {
  application_id: number;
  application_date: string;
  application_fee: string;
  currency_code: string;
  payment_status: string;
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  course_name: string;
  university_name: string;
  university_logo: string | null;
}

interface TransactionDetail {
  transaction: WalletTransaction;
  application: ApplicationDetail | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise(resolve => {
    if (document.getElementById("rzp-script")) return resolve(true);
    const s = document.createElement("script");
    s.id = "rzp-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function WalletHistoryTable() {
  const { token, user } = useAuth();

  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [allTransactions, setAllTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filters, setFilters] = useState<FilterOptions>({ transactionType: "all", status: "all" });

  const [pendingFeeCount, setPendingFeeCount] = useState(0);
  const [pendingFeeTotal, setPendingFeeTotal] = useState(0);

  const [selectedDetail, setSelectedDetail] = useState<TransactionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchWallet = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [walletRes, pendingRes] = await Promise.all([
        fetch(`${BASE_URL}/agent/wallet/balance`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/agent/wallet/pending-fees`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const walletJson = await walletRes.json();
      if (walletJson.success) {
        setWalletData(walletJson.data);
        setAllTransactions(walletJson.data.recentTransactions || []);
      }
      const pendingJson = await pendingRes.json();
      if (pendingJson.success) {
        setPendingFeeCount(pendingJson.data.pendingPayments?.length ?? 0);
        setPendingFeeTotal(pendingJson.data.totalAmount ?? 0);
      }
    } catch (err) {
      console.error("fetchWallet error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, [token]);

  const handleRowClick = async (txn: WalletTransaction) => {
    setSelectedDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/agent/wallet/transaction/${txn.id}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setSelectedDetail(json.data);
    } catch {
      // show transaction with no application detail
      setSelectedDetail({ transaction: txn, application: null });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0) { setTopupError("Enter a valid amount"); return; }
    setTopupError(null);
    setTopupLoading(true);

    try {
      // Step 1: Create order on backend
      const orderRes = await fetch(`${BASE_URL}/agent/wallet/topup/order`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const orderJson = await orderRes.json();
      if (!orderJson.success) throw new Error(orderJson.message || "Failed to create order");

      const { order_id, amount: rzpAmount, currency, key_id } = orderJson.data;

      // Step 2: Load Razorpay checkout.js
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your internet connection.");

      // Step 3: Open Razorpay popup
      const options = {
        key: key_id,
        amount: rzpAmount,
        currency,
        order_id,
        name: "Agent Wallet Top-up",
        description: `Add ${currency} ${amount.toFixed(2)} to wallet`,
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#2563eb" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            // Step 4: Verify payment
            const verifyRes = await fetch(`${BASE_URL}/agent/wallet/topup/verify`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyJson = await verifyRes.json();
            if (verifyJson.success) {
              setTopupOpen(false);
              setTopupAmount("");
              fetchWallet();
            } else {
              setTopupError(verifyJson.message || "Payment verification failed");
            }
          } catch {
            setTopupError("Verification failed. Contact support.");
          }
        },
        modal: { ondismiss: () => setTopupLoading(false) },
      };

      // @ts-ignore — Razorpay loaded via CDN script
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setTopupError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setTopupLoading(false);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    const filtered = allTransactions.filter(t => {
      const matchesSearch =
        (t.transaction_ref || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.razorpay_payment_id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filters.transactionType === "all" || t.type === filters.transactionType;
      const matchesStatus = filters.status === "all" || t.status === filters.status;
      return matchesSearch && matchesType && matchesStatus;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let aVal: string | number = (a as unknown as Record<string, string | number>)[sortField as string];
        let bVal: string | number = (b as unknown as Record<string, string | number>)[sortField as string];
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [allTransactions, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: keyof WalletTransaction) => {
    if (sortField === field) setSortDirection(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const getSortIcon = (field: keyof WalletTransaction) => {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: walletData?.wallet?.currency || "INR",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const totalCredits = allTransactions.filter(t => t.type === "credit" && t.status === "success").reduce((s, t) => s + parseFloat(String(t.amount)), 0);
  const totalDebits = allTransactions.filter(t => t.type === "debit" && t.status === "success").reduce((s, t) => s + parseFloat(String(t.amount)), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-48 text-gray-500">Loading wallet...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
            <Wallet className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(walletData?.wallet?.balance || 0)}
          </p>
          <button
            onClick={() => { setTopupOpen(true); setTopupError(null); setTopupAmount(""); }}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Top-up Wallet
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Credits</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalCredits)}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Debits</p>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400">{formatCurrency(totalDebits)}</p>
        </div>

        <Link
          href="/partner/wallet/pending-fees"
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Application Fees</p>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(pendingFeeTotal)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pendingFeeCount} application(s) with pending fee</p>
        </Link>
      </div>

      {/* Topup Modal */}
      {topupOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top-up Wallet</h3>
              <button onClick={() => setTopupOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter the amount to add. You'll be redirected to Razorpay to complete the payment securely.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (INR)</label>
              <input
                type="number"
                min="1"
                value={topupAmount}
                onChange={e => { setTopupAmount(e.target.value); setTopupError(null); }}
                placeholder="e.g. 500"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white"
              />
              {topupError && <p className="text-xs text-red-500 mt-1">{topupError}</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setTopupOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleTopup}
                disabled={topupLoading || !topupAmount}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {topupLoading ? "Processing..." : "Proceed to Pay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <input
            type="text"
            placeholder="Search by ref, description, payment ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
          />
          <div className="flex gap-2">
            <select
              value={filters.transactionType}
              onChange={e => setFilters(f => ({ ...f, transactionType: e.target.value }))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <select
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-700">
              <TableRow>
                {[
                  { label: "Date", field: "created_at" },
                  { label: "Type", field: "type" },
                  { label: "Amount", field: "amount" },
                  { label: "Balance Before", field: "balance_before" },
                  { label: "Balance After", field: "balance_after" },
                  { label: "Status", field: "status" },
                  { label: "Ref / Payment ID", field: "transaction_ref" },
                  { label: "Description", field: "description" },
                ].map(col => (
                  <TableCell
                    key={col.field}
                    isHeader
                    className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort(col.field as keyof WalletTransaction)}
                  >
                    {col.label} {getSortIcon(col.field as keyof WalletTransaction)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                    No transactions found.
                  </td>
                </TableRow>
              ) : (
                filteredAndSortedData.map(txn => (
                  <TableRow
                    key={txn.id}
                    onClick={() => handleRowClick(txn)}
                    className="border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(txn.created_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge color={txn.type === "credit" ? "success" : "error"}>
                        {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className={`px-4 py-3 text-sm font-semibold ${txn.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                      {txn.type === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(txn.balance_before || 0)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(txn.balance_after || 0)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge color={txn.status === "success" ? "success" : txn.status === "pending" ? "warning" : "error"}>
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                      {txn.razorpay_payment_id || txn.transaction_ref || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                      {txn.description || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Transaction Detail Drawer */}
      {(detailLoading || selectedDetail) && (
        <div className="fixed inset-0 z-[99999] flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40" onClick={() => setSelectedDetail(null)} />

          {/* Panel */}
          <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Transaction Details</h2>
              <button onClick={() => setSelectedDetail(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center flex-1 text-gray-500 dark:text-gray-400 py-20">
                Loading details...
              </div>
            ) : selectedDetail && (
              <div className="px-6 py-5 space-y-6">
                {/* Transaction Info */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Transaction</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                    <span className={`text-sm font-bold ${selectedDetail.transaction.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                      {selectedDetail.transaction.type === 'credit' ? '+' : '−'}
                      {formatCurrency(selectedDetail.transaction.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                    <Badge color={selectedDetail.transaction.type === 'credit' ? 'success' : 'error'}>
                      {selectedDetail.transaction.type.charAt(0).toUpperCase() + selectedDetail.transaction.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                    <Badge color={selectedDetail.transaction.status === 'success' ? 'success' : selectedDetail.transaction.status === 'pending' ? 'warning' : 'error'}>
                      {selectedDetail.transaction.status.charAt(0).toUpperCase() + selectedDetail.transaction.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Balance After</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">{formatCurrency(selectedDetail.transaction.balance_after || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(selectedDetail.transaction.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Ref</span>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                      {selectedDetail.transaction.razorpay_payment_id || selectedDetail.transaction.transaction_ref || '—'}
                    </span>
                  </div>
                  {selectedDetail.transaction.description && (
                    <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedDetail.transaction.description}</p>
                    </div>
                  )}
                </div>

                {/* Application + Student Info */}
                {selectedDetail.application ? (
                  <>
                    {/* Student */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Student</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{selectedDetail.application.student_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedDetail.application.student_email}</p>
                          {selectedDetail.application.student_phone && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedDetail.application.student_phone}</p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/partner/editProfile/${selectedDetail.application.student_id}?tab=applications&app=${selectedDetail.application.application_id}`}
                        className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                        onClick={() => setSelectedDetail(null)}
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Application
                      </Link>
                    </div>

                    {/* Application */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Application</h3>
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-800 dark:text-white">{selectedDetail.application.course_name}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDetail.application.university_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedDetail.application.currency_code} {parseFloat(selectedDetail.application.application_fee).toFixed(2)}
                          <span className="ml-2">
                            <Badge color="success">Paid</Badge>
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                ) : selectedDetail.transaction.type === 'debit' && (
                  <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center text-sm text-gray-400 dark:text-gray-500">
                    No application details found for this transaction.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
