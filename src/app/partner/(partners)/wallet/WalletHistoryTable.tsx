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
import { Wallet, Plus, X, Clock } from "lucide-react";
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
                  <TableRow key={txn.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
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
    </div>
  );
}
