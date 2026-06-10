"use client"

import Badge from "@/components/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine } from "@/icons";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, FileText } from "lucide-react";
import AgreementModal from "@/components/agreement/AgreementModal";
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  File,
  PlusCircle,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface RecentStudent {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface RecentApplication {
  id: number;
  student_id: number;
  updated_at: string;
  student_name: string;
  course_name: string;
  university_name: string;
  status_label: string;
  status_key: string;
}

interface PendingAction {
  student_id: number;
  name: string;
  email: string;
  profile_incomplete: number;
  pending_documents: number;
}

interface UpcomingDeadline {
  course_name: string;
  university_name: string;
  intake_name: string;
  intake_year: number;
  application_deadline: string;
  course_start_date: string;
}

interface CounselorSummary {
  id: number;
  name: string;
  student_count: number;
}

interface DashboardData {
  total_students: number;
  total_applications: number;
  total_programs: number;
  wallet_balance: number;
  currency: string;
  applications_trend: { this_month: number; last_month: number; change_pct: number };
  application_status_summary: {
    in_progress: number;
    submitted: number;
    admitted: number;
    visa_granted: number;
    rejected: number;
  };
  recent_applications: RecentApplication[];
  upcoming_deadlines: UpcomingDeadline[];
  recent_students: RecentStudent[];
  counselor_summary: CounselorSummary[];
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

const statusColors: Record<string, string> = {
  pending_partner:          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  pending_partner_docs:     "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  submitted_institution:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  offer_unconditional:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  offer_conditional:        "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  rejected_institution:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  visa_granted:             "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  visa_rejected:            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function PartnerDashboard() {
  const { token, user, agreement } = useAuth();
  const isCounsellor = user?.role_key === 'counsellor';
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const [data, setData] = useState<DashboardData | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/agent/dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${BASE_URL}/agent/student/attention`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([dashboard, attention]) => {
        if (dashboard.success) setData(dashboard.data);
        else setError(dashboard.message || "Failed to load");
        if (attention.success) setPendingActions(attention.data);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [token]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">{error}</div>
  );

  const trend = data?.applications_trend;
  const trendUp = trend && trend.change_pct >= 0;
  const s = data?.application_status_summary;

  const AgreementBanner = () => {
    if (!agreement || agreement.signed || user?.role_key !== 'agent') return null;
    const daysLeft = agreement.grace_end
      ? Math.max(0, Math.ceil((new Date(agreement.grace_end).getTime() - Date.now()) / 86400000))
      : 0;
    return (
      <div className="col-span-12">
        <div className={`rounded-2xl p-4 flex items-start gap-4 ${daysLeft <= 2 ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700' : 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${daysLeft <= 2 ? 'bg-red-100 dark:bg-red-800/40' : 'bg-amber-100 dark:bg-amber-800/40'}`}>
            <AlertTriangle className={`w-5 h-5 ${daysLeft <= 2 ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${daysLeft <= 2 ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>
              {daysLeft === 0 ? 'Agreement expires today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to sign the IGS Associate Agreement`}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              You cannot create students or submit applications until you sign the agreement.
            </p>
          </div>
          <button
            onClick={() => setShowAgreementModal(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Sign Now
          </button>
        </div>
        {showAgreementModal && (
          <AgreementModal onClose={() => setShowAgreementModal(false)} />
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <AgreementBanner />

      {/* ── Left column ── */}
      <div className="col-span-12 xl:col-span-8 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-xs text-gray-500 dark:text-gray-400">Students</span>
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90 mt-1">{data?.total_students || 0}</div>
            <Link href="/partner/students" className="text-xs text-blue-500 mt-1 block">Manage</Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-xs text-gray-500 dark:text-gray-400">Applications</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-800 dark:text-white/90">{data?.total_applications || 0}</span>
              {trend && trend.last_month > 0 && (
                <Badge color={trendUp ? "success" : "error"}>
                  {trendUp ? <ArrowUpIcon className="text-success-500" /> : <ArrowDownIcon className="text-error-500" />}
                  {Math.abs(trend.change_pct)}%
                </Badge>
              )}
            </div>
            <Link href="/partner/applications" className="text-xs text-blue-500 mt-1 block">Manage</Link>
          </div>

          {!isCounsellor && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <span className="text-xs text-gray-500 dark:text-gray-400">Wallet</span>
              <div className="text-2xl font-bold text-gray-800 dark:text-white/90 mt-1">
                {data?.currency} {(parseFloat(String(data?.wallet_balance ?? 0)) || 0).toFixed(0)}
              </div>
              <Link href="/partner/wallet" className="text-xs text-blue-500 mt-1 block">View</Link>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-xs text-gray-500 dark:text-gray-400">Programs</span>
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90 mt-1">{data?.total_programs || 0}</div>
            <Link href="/partner/programs" className="text-xs text-blue-500 mt-1 block">Browse</Link>
          </div>
        </div>

        {/* Application pipeline */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">Application Pipeline</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {[
              { label: "In Progress",  value: s?.in_progress  || 0, color: "text-yellow-600",  bg: "bg-yellow-50 dark:bg-yellow-900/20",  icon: <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-500" /> },
              { label: "Submitted",    value: s?.submitted    || 0, color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20",      icon: <File className="w-5 h-5 mx-auto mb-1 text-blue-500" /> },
              { label: "Admitted",     value: s?.admitted     || 0, color: "text-green-600",   bg: "bg-green-50 dark:bg-green-900/20",    icon: <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-500" /> },
              { label: "Visa Granted", value: s?.visa_granted || 0, color: "text-teal-600",    bg: "bg-teal-50 dark:bg-teal-900/20",      icon: <Check className="w-5 h-5 mx-auto mb-1 text-teal-500" /> },
              { label: "Rejected",     value: s?.rejected     || 0, color: "text-red-600",     bg: "bg-red-50 dark:bg-red-900/20",        icon: <XCircle className="w-5 h-5 mx-auto mb-1 text-red-500" /> },
            ].map(({ label, value, color, bg, icon }) => (
              <div key={label} className={`rounded-xl p-3 ${bg}`}>
                {icon}
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending actions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold text-gray-800 dark:text-white/90">Needs Your Attention</h4>
              {pendingActions.length > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{pendingActions.length}</span>
              )}
            </div>
            <Link href="/partner/students" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {pendingActions.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">All caught up — no pending profiles or documents!</p>
          ) : (
            <div className="space-y-2">
              {pendingActions.map(a => (
                <Link key={a.student_id} href={`/partner/editProfile/${a.student_id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{a.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.email}</p>
                  </div>
                  <div className="ml-3 flex-shrink-0 flex flex-col items-end gap-1">
                    {a.profile_incomplete === 1 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Incomplete Profile
                      </span>
                    )}
                    {a.pending_documents > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {a.pending_documents} doc{a.pending_documents !== 1 ? 's' : ''} pending
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 text-blue-500" />
            <h4 className="font-semibold text-gray-800 dark:text-white/90">Upcoming Application Deadlines</h4>
          </div>
          {(data?.upcoming_deadlines?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No deadlines in the next 60 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left pb-2 font-medium">Program</th>
                    <th className="text-left pb-2 font-medium">Intake</th>
                    <th className="text-left pb-2 font-medium">Deadline</th>
                    <th className="text-left pb-2 font-medium">Starts</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.upcoming_deadlines?.map((d, i) => {
                    const days = daysUntil(d.application_deadline);
                    return (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                        <td className="py-2">
                          <p className="font-medium text-gray-800 dark:text-white/90 truncate max-w-[180px]">{d.course_name}</p>
                          <p className="text-xs text-gray-400 truncate">{d.university_name}</p>
                        </td>
                        <td className="py-2 text-gray-500 dark:text-gray-400">{d.intake_name} {d.intake_year}</td>
                        <td className="py-2">
                          <span className={`text-xs font-medium ${days <= 7 ? 'text-red-600' : days <= 14 ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300'}`}>
                            {formatDate(d.application_deadline)}
                          </span>
                          <span className={`ml-1 text-xs ${days <= 7 ? 'text-red-400' : 'text-gray-400'}`}>({days}d)</span>
                        </td>
                        <td className="py-2 text-xs text-gray-400">{d.course_start_date ? formatDate(d.course_start_date) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent activity */}
        {(data?.recent_applications?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white/90">Recent Activity</h4>
              <Link href="/partner/applications" className="text-xs text-blue-500 hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {data?.recent_applications?.map(app => (
                <Link key={app.id} href={`/partner/editProfile/${app.student_id}?tab=applications&app=${app.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{app.student_name}</p>
                    <p className="text-xs text-gray-400 truncate">{app.university_name} · {app.course_name || '—'}</p>
                  </div>
                  <div className="ml-3 flex-shrink-0 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[app.status_key] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {app.status_label || '—'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(app.updated_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 dark:text-white/90">Quick Links</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/partner/students/add" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 p-4 text-blue-600 dark:text-blue-400 transition-all hover:shadow-md flex flex-col items-center gap-2">
              <User className="w-6 h-6" />
              <span className="text-sm font-medium">Add Student</span>
            </Link>
            <Link href="/partner/applications" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 p-4 text-blue-600 dark:text-blue-400 transition-all hover:shadow-md flex flex-col items-center gap-2">
              <PlusCircle className="w-6 h-6" />
              <span className="text-sm font-medium">New Application</span>
            </Link>
            {!isCounsellor && (
              <Link href="/partner/wallet" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 p-4 text-blue-600 dark:text-blue-400 transition-all hover:shadow-md flex flex-col items-center gap-2">
                <Wallet className="w-6 h-6" />
                <span className="text-sm font-medium">My Wallet</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="col-span-12 xl:col-span-4 space-y-6">

        {/* Flywire */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-center">
          <div className="text-center">
            <a
              href="https://agents.demo.flywire.com/services/C4W3RQ/edu-payments?referrer=fe4bec9d-469f-c0bf-9ae2-c95bc4e0baf7"
              className="flywire-button flex px-4 py-2 border-2 border-blue-600 rounded-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-black dark:text-white mr-2">Pay Fees via</span>
              <img
                src="https://payment.flywire.com/assets/media/defaultLogo.964f0bfc5c799f25ebae43430aee0506.svg"
                alt="Flywire"
                width={74}
                height={36}
                className="flywire-logo"
              />
            </a>
          </div>
        </div>

        {/* Recent students */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h4 className="font-semibold text-gray-800 dark:text-white/90">Recent Students</h4>
            </div>
            <Link href="/partner/students" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {(data?.recent_students?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400">No students yet.</p>
          ) : (
            <div className="space-y-1">
              {data?.recent_students?.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatDate(s.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Counselor summary */}
        {!isCounsellor && (data?.counselor_summary?.length ?? 0) > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white/90">Counselors</h4>
              <Link href="/partner/users" className="text-xs text-blue-500 hover:underline">Manage</Link>
            </div>
            <div className="space-y-1">
              {data?.counselor_summary?.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <p className="text-sm text-gray-800 dark:text-white/90">{c.name}</p>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {c.student_count} student{c.student_count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* This month summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-3">This Month</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">New applications</span>
              <span className="font-semibold text-gray-800 dark:text-white/90">{trend?.this_month || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Last month</span>
              <span className="font-semibold text-gray-800 dark:text-white/90">{trend?.last_month || 0}</span>
            </div>
            {trend && trend.last_month > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Change</span>
                <span className={`font-semibold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                  {trendUp ? '+' : ''}{trend.change_pct}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
