"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/app/partner/AppHeader";
import AppSidebar from "@/app/partner/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useState, useEffect } from "react";

import RoleGuard from "@/components/RoleGuard";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AgreementModal from "@/components/agreement/AgreementModal";
import { AlertTriangle, FileText } from "lucide-react";

interface PartnerLayoutProps {
  children: React.ReactNode;
}

function AgreementGuard({ children }: { children: React.ReactNode }) {
  const { agreement, user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const isAgentRole = user?.role_key === "agent";

  useEffect(() => {
    if (!agreement || !isAgentRole) return;
    if (!agreement.signed) {
      setShowModal(true);
    }
  }, [agreement, isAgentRole]);

  if (!agreement || !isAgentRole) {
    return <>{children}</>;
  }

  const daysLeft = agreement.grace_end
    ? Math.max(0, Math.ceil((new Date(agreement.grace_end).getTime() - Date.now()) / 86400000))
    : 0;

  if (agreement.is_blocked) {
    return (
      <>
        {/* Full-screen block overlay */}
        <div className="fixed inset-0 z-[9998] bg-gray-900/95 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Portal Access Restricted
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Your 7-day grace period has ended. You must sign the IGS Associate Agreement to continue using the portal.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
            >
              <FileText className="w-4 h-4" />
              Review &amp; Sign Agreement
            </button>
          </div>
        </div>
        {showModal && <AgreementModal forceOpen onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      {children}
      {/* Grace period banner rendered inside the layout */}
      {!agreement.signed && (
        <GracePeriodBanner daysLeft={daysLeft} onSign={() => setShowModal(true)} />
      )}
      {showModal && <AgreementModal onClose={() => setShowModal(false)} />}
    </>
  );
}

function GracePeriodBanner({
  daysLeft,
  onSign,
}: {
  daysLeft: number;
  onSign: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const urgent = daysLeft <= 2;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9990] w-full max-w-xl px-4 pointer-events-none`}
    >
      <div
        className={`pointer-events-auto rounded-2xl shadow-lg px-5 py-3.5 flex items-center gap-3 ${
          urgent
            ? "bg-red-600 text-white"
            : "bg-amber-500 text-white"
        }`}
      >
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {daysLeft === 0
              ? "Agreement expires today!"
              : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left to sign the Associate Agreement`}
          </p>
          <p className="text-xs opacity-85 mt-0.5 leading-tight">
            You cannot create students or submit applications until signed.
          </p>
        </div>
        <button
          onClick={onSign}
          className="flex-shrink-0 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Sign Now
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 text-white/70 hover:text-white"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function PartnerLayout({ children }: PartnerLayoutProps) {
  const pathname = usePathname();

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const isPartnerRoute = pathname?.startsWith('/partner') || pathname === '/';

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  if (!isPartnerRoute) {
    return <>{children}</>;
  }

  return (
    <RoleGuard allowedRoles={["agent", "counsellor"]}>
      <AgreementGuard>
        <div className="min-h-screen xl:flex">
          <AppSidebar />
          <Backdrop />
          <div
            className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ease-in-out ${mainContentMargin}`}
          >
            <AppHeader />
            <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
          </div>
        </div>
      </AgreementGuard>
    </RoleGuard>
  );
}

export default PartnerLayout;
