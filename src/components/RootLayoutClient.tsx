"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/app/partner/AppHeader";
import AppSidebar from "@/app/partner/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";


import RoleGuard from "@/components/RoleGuard";
import { usePathname } from "next/navigation";

interface PartnerLayoutProps {
  children: React.ReactNode;
}

function PartnerLayout({ children }: PartnerLayoutProps) {
  const pathname = usePathname();

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const isPartnerRoute = pathname?.startsWith('/partner') || pathname === '/';


  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // If it's not a student route (and not root), render children normally
  if (!isPartnerRoute) {
    return <>{children}</>;
  }

  return (
    <RoleGuard allowedRoles={["agent","counsellor"]}>
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
    </RoleGuard>
  );
}


export default PartnerLayout;
// export default PartnerLayout;
