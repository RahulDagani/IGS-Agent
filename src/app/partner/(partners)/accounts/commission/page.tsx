"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { AlertCircle, X, Building2, GraduationCap, Percent, Coins, MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Commission {
  id: number;
  university_id: number;
  study_level_id: number;
  commission_value: string;
  currency: string;
  commission_type: string;
  remark: string;
  created_at: string;
  university_name: string;
  study_level_name: string;
  no_of_installments: string;
}

type SortField = keyof Commission | "";
type SortDirection = "asc" | "desc";

export default function AgentCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [studyLevelFilter, setStudyLevelFilter] = useState("all");
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${BASE_URL}/agent/commission-rates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setCommissions(data.data);
        else setError("Failed to load commissions.");
      } catch {
        setError("Failed to load commissions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchCommissions();
  }, [token, BASE_URL]);

  const universityNames = useMemo(
    () => Array.from(new Set(commissions.map((c) => c.university_name))),
    [commissions]
  );
  const studyLevels = useMemo(
    () => Array.from(new Set(commissions.map((c) => c.study_level_name))),
    [commissions]
  );

  const filtered = useMemo(() => {
    let data = commissions.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.university_name.toLowerCase().includes(q) ||
        c.study_level_name.toLowerCase().includes(q) ||
        c.commission_value.toLowerCase().includes(q) ||
        c.commission_type.toLowerCase().includes(q)
      );
    });
    if (universityFilter !== "all") data = data.filter((c) => c.university_name === universityFilter);
    if (studyLevelFilter !== "all") data = data.filter((c) => c.study_level_name === studyLevelFilter);
    if (sortField) {
      data = [...data].sort((a, b) => {
        let av = a[sortField] as string;
        let bv = b[sortField] as string;
        av = av?.toLowerCase?.() ?? av;
        bv = bv?.toLowerCase?.() ?? bv;
        if (av < bv) return sortDirection === "asc" ? -1 : 1;
        if (av > bv) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [commissions, searchTerm, universityFilter, studyLevelFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Commission) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const sortIcon = (field: keyof Commission) => {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Commission Rates</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View the commission rates for each university and study level.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by university, study level..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 h-10 rounded-lg border border-gray-200 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white dark:placeholder:text-white/30"
        />
        <select
          value={universityFilter}
          onChange={(e) => setUniversityFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="all">All Universities</option>
          {universityNames.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select
          value={studyLevelFilter}
          onChange={(e) => setStudyLevelFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="all">All Study Levels</option>
          {studyLevels.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {[
                  { key: "university_name", label: "University" },
                  { key: "study_level_name", label: "Study Level" },
                  { key: "commission_value", label: "Commission" },
                  { key: "currency", label: "Currency" },
                  { key: "remark", label: "Remark" },
                  { key: "created_at", label: "Added" },
                ].map(({ key, label }) => (
                  <TableCell
                    key={key}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort(key as keyof Commission)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <span className="text-xs">{sortIcon(key as keyof Commission)}</span>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    onClick={() => setSelectedCommission(c)}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                  >
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-sm dark:text-white/90">
                      {c.university_name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge size="sm" color="info">{c.study_level_name}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="font-semibold text-gray-800 dark:text-white text-sm">
                        {c.commission_value}{c.commission_type === "percentage" ? "%" : ""}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-600 text-sm dark:text-gray-400">
                      {c.currency || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-sm dark:text-gray-400 max-w-[180px] truncate">
                      {c.remark || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-sm dark:text-gray-400">
                      {formatDate(c.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="px-5 py-10 text-center text-gray-500 text-sm dark:text-gray-400">
                    No commission rates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-500">
        Showing {filtered.length} of {commissions.length} rates
      </p>

      {/* Detail Drawer */}
      {selectedCommission && (
        <div className="fixed inset-0 z-[99999] flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelectedCommission(null)} />
          <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Commission Details</h2>
              <button onClick={() => setSelectedCommission(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* University & Level */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">University</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedCommission.university_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Study Level</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCommission.study_level_name}</p>
                  </div>
                </div>
              </div>

              {/* Commission Info */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Commission</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" /> Type
                  </span>
                  <Badge size="sm" color={selectedCommission.commission_type === "percentage" ? "info" : "primary"}>
                    {selectedCommission.commission_type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" /> Value
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {selectedCommission.commission_value}{selectedCommission.commission_type === "percentage" ? "%" : ""}
                    {selectedCommission.currency ? ` ${selectedCommission.currency}` : ""}
                  </span>
                </div>
                {selectedCommission.no_of_installments && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Installments</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedCommission.no_of_installments}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Added
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedCommission.created_at)}</span>
                </div>
              </div>

              {/* Remark */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Remark</h3>
                </div>
                {selectedCommission.remark ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedCommission.remark}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">No remark added.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
