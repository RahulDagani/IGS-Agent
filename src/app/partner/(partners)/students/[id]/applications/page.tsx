"use client"
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Send, Paperclip, Eye, X, FileText, MessageCircle,
  Image as ImageIcon, Pencil, GraduationCap,
} from "lucide-react";
import StudentProgramsPage from "@/app/partner/(partners)/students/[id]/apply/Programs";
import { Country, State } from "country-state-city";

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

interface Application {
  id: number;
  uuid: string;
  course_id: number;
  current_status_id: number;
  status_label: string;
  status_key: string;
  course_name: string;
  university_name: string;
  university_logo: string | null;
  created_at: string;
}

interface ApplicationDetail {
  id: number;
  uuid: string;
  course_id: number;
  current_status_id: number;
  status_key: string;
  status_label: string;
  course_name: string;
  university_name: string;
  university_country: string;
  university_state: string;
  university_city: string;
  study_level_name: string;
  tuition_fee: string;
  application_fee: string;
  currency_code: string;
  intake: string;
  intake_year: number;
  application_login: string | null;
  application_password: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
}

interface ChatMessage {
  id: number;
  application_id: number;
  comment: string;
  file: string | null;
  who_has_created: "student" | "tenant";
  is_mine: number;
  created_by_name: string | null;
  created_by_email: string;
  created_at: string;
  file_url: string | null;
}

export default function ApplicationsPage() {
  const { id: studentId } = useParams();
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const appFromUrl = searchParams.get("app");

  const [activeTab, setActiveTab] = useState<"applied" | "apply">("applied");
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeApp, setActiveApp] = useState<number | null>(null);
  const [applicationDetail, setApplicationDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatFilePreview, setChatFilePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [editingCredentials, setEditingCredentials] = useState({ login: "", password: "" });
  const [savingCredentials, setSavingCredentials] = useState(false);

  const chatFileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (studentId) fetchApplications();
  }, [studentId]);

  useEffect(() => {
    if (applications.length > 0 && !activeApp) {
      setActiveApp(applications[0].id);
    }
  }, [applications]);

  useEffect(() => {
    if (appFromUrl) {
      setActiveApp(Number(appFromUrl));
      setActiveTab("applied");
    }
  }, [appFromUrl]);

  useEffect(() => {
    if (activeApp) {
      fetchApplicationDetail(activeApp);
      fetchMessages(activeApp);
    }
  }, [activeApp]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/agent/applications/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApplications(data.data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDetail = async (appId: number) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`${BASE_URL}/agent/application/student/detail/${studentId}/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApplicationDetail(data.data.application);
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchMessages = async (appId: number) => {
    try {
      setMessagesLoading(true);
      const res = await fetch(`${BASE_URL}/agent/application/comments/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!activeApp || (!newMessage.trim() && !chatFile)) return;
    try {
      setSending(true);
      const formData = new FormData();
      if (newMessage.trim()) formData.append("comment", newMessage.trim());
      if (chatFile) formData.append("file", chatFile);
      const res = await fetch(`${BASE_URL}/agent/application/comments/${activeApp}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        setChatFile(null);
        if (chatFilePreview) URL.revokeObjectURL(chatFilePreview);
        setChatFilePreview(null);
        fetchMessages(activeApp);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const saveCredentials = async () => {
    if (!activeApp) return;
    try {
      setSavingCredentials(true);
      const res = await fetch(`${BASE_URL}/agent/application/credentials/${activeApp}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          application_login: editingCredentials.login,
          application_password: editingCredentials.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (applicationDetail) {
          setApplicationDetail({
            ...applicationDetail,
            application_login: editingCredentials.login,
            application_password: editingCredentials.password,
          });
        }
        setShowCredentialsModal(false);
      }
    } catch (err) {
      console.error("Error saving credentials:", err);
    } finally {
      setSavingCredentials(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("applied")) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
    if (s.includes("pending") || s.includes("document")) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
    if (s.includes("received") || s.includes("submitted")) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    if (s.includes("reject") || s.includes("closed")) return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const getCountryName = (code: string) => Country.getCountryByCode(code)?.name || code;
  const getStateName = (stateCode: string, countryCode: string) =>
    State.getStateByCodeAndCountry(stateCode, countryCode)?.name || stateCode;

  const renderMessages = () => {
    if (messagesLoading) {
      return (
        <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          Loading messages...
        </div>
      );
    }
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <MessageCircle size={20} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet</p>
        </div>
      );
    }
    return messages.map((msg) => {
      const isMine = msg.is_mine === 1;
      return (
        <div key={msg.id} className={`flex gap-3 mb-4 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${isMine ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}>
            {isMine ? "Me" : (msg.created_by_name?.[0] || "T").toUpperCase()}
          </div>
          <div className={`rounded-lg p-3 max-w-sm ${isMine ? "bg-gray-100 dark:bg-gray-700 text-right" : "bg-blue-50 dark:bg-blue-900/20"}`}>
            <div className={`flex items-center gap-2 mb-1 ${isMine ? "flex-row-reverse" : ""}`}>
              <span className={`text-xs font-medium ${isMine ? "text-gray-700 dark:text-gray-300" : "text-blue-700 dark:text-blue-400"}`}>
                {isMine ? "You" : (msg.created_by_name || "Team")}
              </span>
              <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
            </div>
            {msg.comment && (
              <p className={`text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${isMine ? "text-right" : ""}`}>
                {msg.comment}
              </p>
            )}
            {msg.file_url && (
              <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                <Eye size={12} />
                {msg.file?.split("/").pop() || "Attachment"}
              </a>
            )}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Tabs */}
      <div className="flex gap-8 border-b dark:border-gray-700 mb-5">
        <button
          onClick={() => setActiveTab("apply")}
          className={`pb-3 font-medium text-sm ${activeTab === "apply" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400"}`}
        >
          Apply to Programs
        </button>
        <button
          onClick={() => setActiveTab("applied")}
          className={`pb-3 font-medium text-sm ${activeTab === "applied" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400"}`}
        >
          Applied Programs
        </button>
      </div>

      {activeTab === "apply" ? (
        <div className="w-full">
          <StudentProgramsPage />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-5">
          {/* Left panel — application list */}
          <div className="col-span-4 space-y-3">
            {applications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-6 text-center">
                <GraduationCap size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No applications yet.</p>
                <button
                  onClick={() => setActiveTab("apply")}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Application
                </button>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setActiveApp(app.id)}
                  className={`cursor-pointer border dark:border-gray-700 rounded-md p-4 relative bg-white dark:bg-gray-800 ${activeApp === app.id ? "border-blue-500 dark:border-blue-400" : "border-gray-200 dark:border-gray-700"}`}
                >
                  <span className={`text-xs font-semibold px-2 py-1 rounded mb-2 inline-block ${getStatusColor(app.status_label)}`}>
                    {app.status_label}
                  </span>
                  <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <p><span className="font-medium dark:text-gray-200">Course:</span> {app.course_name}</p>
                    <p><span className="font-medium dark:text-gray-200">University:</span> {app.university_name}</p>
                    <p><span className="font-medium dark:text-gray-200">Ref:</span> {app.uuid}</p>
                    <p><span className="font-medium dark:text-gray-200">Date:</span> {formatDate(app.created_at)}</p>
                  </div>
                  {activeApp === app.id && (
                    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-b-[10px] border-l-[10px] border-transparent border-l-blue-500 dark:border-l-blue-400" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right panel — detail */}
          <div className="col-span-8">
            {detailLoading ? (
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-6 flex items-center justify-center h-48">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Loading details...</div>
              </div>
            ) : applicationDetail ? (
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-6 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold dark:text-white">{applicationDetail.course_name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{applicationDetail.university_name}</p>
                    {applicationDetail.university_country && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {applicationDetail.university_city && `${applicationDetail.university_city}, `}
                        {applicationDetail.university_state && `${getStateName(applicationDetail.university_state, applicationDetail.university_country)}, `}
                        {getCountryName(applicationDetail.university_country)}
                      </p>
                    )}
                    <p className="text-sm font-semibold underline dark:text-white mt-1">{applicationDetail.uuid}</p>
                    {applicationDetail.intake && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Intake: {applicationDetail.intake} {applicationDetail.intake_year}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm px-3 py-1 rounded font-medium ${getStatusColor(applicationDetail.status_label)}`}>
                    {applicationDetail.status_label}
                  </span>
                </div>

                {/* Fees */}
                <div className="flex gap-4 flex-wrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Application Fee:{" "}
                    <span className="ml-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-sm font-medium">
                      {parseFloat(applicationDetail.application_fee || "0") > 0
                        ? `${applicationDetail.currency_code} ${applicationDetail.application_fee}`
                        : "No Fee"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tuition Fee:{" "}
                    <span className="ml-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-sm font-medium">
                      {applicationDetail.currency_code} {applicationDetail.tuition_fee}
                    </span>
                  </div>
                </div>

                {/* Credentials */}
                <div className="flex gap-4 flex-wrap items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Login: <span className="text-gray-800 dark:text-gray-200 font-medium">{applicationDetail.application_login || "N/A"}</span></span>
                  <span>Password: <span className="text-gray-800 dark:text-gray-200 font-medium">{applicationDetail.application_password || "N/A"}</span></span>
                  <button
                    onClick={() => {
                      setEditingCredentials({
                        login: applicationDetail.application_login || "",
                        password: applicationDetail.application_password || "",
                      });
                      setShowCredentialsModal(true);
                    }}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs"
                  >
                    <Pencil size={12} />Edit
                  </button>
                </div>

                {/* Chat/Comments */}
                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 border-b border-blue-600 pb-2 mb-4 inline-block">
                    Comments
                  </h3>

                  <div className="h-56 overflow-y-auto mb-4 pr-1">
                    {renderMessages()}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* File preview */}
                  {chatFile && (
                    <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        {chatFile.type.startsWith("image/") ? <ImageIcon size={14} /> : <FileText size={14} />}
                        <span className="truncate max-w-[200px]">{chatFile.name}</span>
                      </div>
                      <button onClick={() => { setChatFile(null); if (chatFilePreview) URL.revokeObjectURL(chatFilePreview); setChatFilePreview(null); }}>
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Write your message..."
                      rows={3}
                      disabled={sending}
                      className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <input
                          type="file"
                          ref={chatFileRef}
                          className="hidden"
                          disabled={sending}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setChatFile(f);
                            if (f.type.startsWith("image/")) setChatFilePreview(URL.createObjectURL(f));
                          }}
                        />
                        <button
                          onClick={() => chatFileRef.current?.click()}
                          disabled={sending}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800/40"
                        >
                          <Paperclip size={15} />Attach
                        </button>
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={(!newMessage.trim() && !chatFile) || sending}
                        className={`flex items-center gap-1 px-4 py-2 rounded text-sm text-white ${(!newMessage.trim() && !chatFile) || sending ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                      >
                        {sending ? (
                          <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending</>
                        ) : (
                          <><Send size={15} />Send</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-6 flex items-center justify-center h-48">
                <p className="text-sm text-gray-500 dark:text-gray-400">Select an application to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
              <h3 className="text-base font-semibold dark:text-white">Edit Application Credentials</h3>
              <button onClick={() => setShowCredentialsModal(false)} disabled={savingCredentials}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Login</label>
                <input
                  type="text"
                  value={editingCredentials.login}
                  onChange={(e) => setEditingCredentials(prev => ({ ...prev, login: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Login"
                  disabled={savingCredentials}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Password</label>
                <input
                  type="text"
                  value={editingCredentials.password}
                  onChange={(e) => setEditingCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Password"
                  disabled={savingCredentials}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t dark:border-gray-700">
              <button onClick={() => setShowCredentialsModal(false)} disabled={savingCredentials} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                Cancel
              </button>
              <button
                onClick={saveCredentials}
                disabled={savingCredentials || !editingCredentials.login || !editingCredentials.password}
                className={`px-4 py-2 rounded text-sm text-white flex items-center gap-2 ${savingCredentials || !editingCredentials.login || !editingCredentials.password ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {savingCredentials ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : "Save Credentials"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
