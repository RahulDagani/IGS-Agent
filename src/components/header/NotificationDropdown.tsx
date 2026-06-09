"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Dropdown } from "../ui/dropdown/Dropdown";

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

export default function NotificationDropdown() {
  const { token } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/notifications?limit=20&is_read=0`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unread_counts?.total ?? 0);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [token]);

  const pollUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.data.total ?? 0);
      }
    } catch (_) {}
  }, [token]);

  // Fetch on mount
  useEffect(() => {
    if (!hasFetched.current && token) {
      hasFetched.current = true;
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(pollUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token, pollUnreadCount]);

  // Re-fetch when dropdown opens
  const handleOpen = () => {
    setIsOpen(true);
    fetchNotifications();
  };

  const handleClose = () => setIsOpen(false);

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

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
      setNotifications([]);
      setUnreadCount(0);
    } catch (_) {}
  };

  const handleNotificationClick = async (notification: Notification) => {
    handleClose();
    await markAsRead(notification.id);
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    setUnreadCount((c) => Math.max(0, c - 1));
    if (notification.path) {
      router.push(notification.path);
    }
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleToggle}
      >
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={handleClose}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[380px] lg:right-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                {unreadCount} new
              </span>
            )}
          </h5>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <ul className="flex flex-col flex-1 overflow-y-auto custom-scrollbar gap-0.5">
          {loading && notifications.length === 0 && (
            <li className="flex items-center justify-center py-12 text-sm text-gray-400">
              Loading…
            </li>
          )}

          {!loading && notifications.length === 0 && (
            <li className="flex flex-col items-center justify-center py-12 text-sm text-gray-400 gap-2">
              <svg width="36" height="36" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" />
              </svg>
              No notifications yet
            </li>
          )}

          {notifications.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => handleNotificationClick(n)}
                className="w-full text-left flex gap-3 rounded-lg border-b border-gray-100 px-3 py-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
              >
                {/* Type icon */}
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-base">
                  {n.type === "student" && "👤"}
                  {n.type === "application" && "📋"}
                  {n.type === "wallet" && "💰"}
                  {n.type === "agent" && "🤝"}
                  {n.type === "lead" && "🎯"}
                  {!["student","application","wallet","agent","lead"].includes(n.type) && "🔔"}
                </span>

                <span className="flex flex-col min-w-0">
                  <span
                    className="mb-1 block text-sm text-gray-600 dark:text-gray-300 leading-snug"
                    dangerouslySetInnerHTML={{ __html: n.message }}
                  />
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {typeLabel[n.type] ?? n.type}
                    </span>
                    <span>·</span>
                    <span>{timeAgo(n.created_at)}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <Link
          href="/partner/notifications"
          onClick={handleClose}
          className="mt-3 block rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
