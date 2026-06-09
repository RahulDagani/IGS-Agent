"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, X } from "lucide-react";
import SignaturePad from "./SignaturePad";
import { useAuth } from "@/context/AuthContext";
import type { AgreementState } from "@/context/AuthContext";

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
const TOTAL_PAGES = 7;

interface Props {
  onClose?: () => void;
  forceOpen?: boolean;
}

export default function AgreementModal({ onClose, forceOpen }: Props) {
  const { token, agreement, setAgreement } = useAuth();
  const [page, setPage] = useState(1);
  const [content, setContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (page < TOTAL_PAGES) {
      setLoadingContent(true);
      fetch(`${BASE_URL}/agent/agreement/content?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setContent(d.data?.content || "");
        })
        .finally(() => setLoadingContent(false));
    }
  }, [page, token]);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setSubmitError("Please enter your full name.");
      return;
    }
    if (!signature) {
      setSubmitError("Please draw your signature.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/agent/agreement/sign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agent_full_name: fullName, agent_signature: signature }),
      });
      const data = await res.json();
      if (data.success) {
        const updated: AgreementState = {
          signed: true,
          status: "agent_signed",
          grace_start: null,
          grace_end: null,
          is_blocked: false,
        };
        setAgreement(updated);
        setDone(true);
      } else {
        setSubmitError(data.message || "Failed to submit signature.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const alreadySigned = !done && agreement?.signed && agreement.status !== "pending";

  const handleDownload = async () => {
    const res = await fetch(`${BASE_URL}/agent/agreement/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "IGS_Associate_Agreement.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (alreadySigned) {
    return (
      <ModalShell forceOpen={forceOpen} onClose={onClose}>
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Agreement Signed</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              {agreement?.status === "completed"
                ? "Your agreement is fully executed. You can download the PDF below."
                : agreement?.status === "expired"
                ? "Your agreement term has ended. Please review and sign the renewed agreement."
                : "Your signature has been submitted. Waiting for admin to countersign."}
            </p>
          </div>
          <div className="flex gap-3">
            {agreement?.status === "completed" && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </ModalShell>
    );
  }

  if (done) {
    return (
      <ModalShell forceOpen={forceOpen} onClose={onClose}>
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Agreement Signed!</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              Thank you. Your signature has been submitted. The admin will countersign the agreement shortly.
            </p>
          </div>
          {onClose && !forceOpen && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Continue to Dashboard
            </button>
          )}
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell forceOpen={forceOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-gray-800 dark:text-white leading-tight">
            IGS Associate Agreement
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {TOTAL_PAGES}
          </p>
        </div>
        {!forceOpen && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-3">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${(page / TOTAL_PAGES) * 100}%` }}
        />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto mt-4 min-h-0">
        {page < TOTAL_PAGES ? (
          loadingContent ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <div
              className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed
                [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-center [&_h2]:uppercase [&_h2]:mb-4 [&_h2]:text-gray-900 dark:[&_h2]:text-white
                [&_h3]:text-xs [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-blue-700 dark:[&_h3]:text-blue-400 [&_h3]:mt-5 [&_h3]:mb-2
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
                [&_li]:leading-relaxed
                [&_p]:mb-3 [&_strong]:font-semibold [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )
        ) : (
          <SignaturePage
            fullName={fullName}
            onFullNameChange={setFullName}
            onSignatureChange={setSignature}
            error={submitError}
          />
        )}
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 flex-shrink-0">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-xs text-gray-400 dark:text-gray-500">
          {page}/{TOTAL_PAGES}
        </span>

        {page < TOTAL_PAGES ? (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
            ) : (
              "Submit & Sign"
            )}
          </button>
        )}
      </div>
    </ModalShell>
  );
}

function SignaturePage({
  fullName,
  onFullNameChange,
  onSignatureChange,
  error,
}: {
  fullName: string;
  onFullNameChange: (v: string) => void;
  onSignatureChange: (v: string | null) => void;
  error: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
          By signing below, you confirm that you have read and agree to all terms of the IGS Associate Agreement.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          placeholder="Enter your full legal name"
          className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Digital Signature <span className="text-red-500">*</span>
        </label>
        <SignaturePad onChange={onSignatureChange} />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

function ModalShell({
  children,
  forceOpen,
  onClose,
}: {
  children: React.ReactNode;
  forceOpen?: boolean;
  onClose?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={forceOpen ? undefined : (e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
