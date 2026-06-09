"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

interface Notification {
  id: number;
  type: string;
  message: string;
  path: string;
  is_read: number;
  created_at: string;
  sender_name: string | null;
}

interface Pagination {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_records: number;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const typeLabel: Record<string, string> = {
  student: "Student",
  agent: "Agent",
  application: "Application",
  wallet: "Commission",
  lead: "Lead",
};

const typeColor: Record<string, string> = {
  student: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  application: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  wallet: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  agent: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  lead: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export default function NotificationsPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async (pg: number, onlyUnread: boolean) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: "20" });
      if (onlyUnread) params.set("is_read", "false");
      const res = await fetch(`${BASE_URL}/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setPagination(data.data.pagination);
        setUnreadTotal(data.data.unread_counts?.total ?? 0);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications(page, filter === "unread");
  }, [page, filter, fetchNotifications]);

  const markAsRead = async (id: number) => {
    if (!token) return;
    try {
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {}
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch(`${BASE_URL}/notifications/mark-all-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadTotal(0);
    } catch (_) {}
  };

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: 1 } : x))
      );
      setUnreadTotal((c) => Math.max(0, c - 1));
    }
    if (n.path) router.push(n.path);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadTotal > 0 && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {unreadTotal} unread notification{unreadTotal !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadTotal > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setFilter(tab); setPage(1); }}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              filter === tab
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab === "all" ? "All" : `Unread${unreadTotal > 0 ? ` (${unreadTotal})` : ""}`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading…
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-sm text-gray-400 gap-3">
            <svg width="48" height="48" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" />
            </svg>
            <p>No notifications</p>
          </div>
        )}

        {!loading && notifications.map((n, i) => (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={`w-full text-left flex gap-4 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
              i < notifications.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
            } ${!n.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-lg">
              {n.type === "student" && "👤"}
              {n.type === "application" && "📋"}
              {n.type === "wallet" && "💰"}
              {n.type === "agent" && "🤝"}
              {n.type === "lead" && "🎯"}
              {!["student","application","wallet","agent","lead"].includes(n.type) && "🔔"}
            </span>

            <span className="flex flex-1 flex-col gap-1 min-w-0">
              <span
                className="text-sm text-gray-700 dark:text-gray-300 leading-snug"
                dangerouslySetInnerHTML={{ __html: n.message }}
              />
              <span className="flex items-center gap-2 text-xs text-gray-400">
                <span className={`rounded px-1.5 py-0.5 font-medium text-[11px] ${typeColor[n.type] ?? "bg-gray-100 text-gray-500"}`}>
                  {typeLabel[n.type] ?? n.type}
                </span>
                <span>{timeAgo(n.created_at)}</span>
              </span>
            </span>

            {!n.is_read && (
              <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {pagination.current_page} of {pagination.total_pages} ({pagination.total_records} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={page === pagination.total_pages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
