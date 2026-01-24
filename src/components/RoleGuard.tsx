"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated, loading, adminToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // ✅ wait for auth to finish initializing

    
    
    if (!isAuthenticated) {

      let signinRoute = "/signin"; // default
      
      if (pathname?.startsWith("/student")) {
        signinRoute = "/signin/student";
      } else if (pathname?.startsWith("/partner")) {
        signinRoute = "/signin/agent";
      }


      const returnUrl = encodeURIComponent(pathname || "/");
      router.replace(`${signinRoute}?returnUrl=${returnUrl}`);

    } else if (user && !allowedRoles.includes(user.panel_type)) {

      if(adminToken && user.panel_type == "agent"){ //Prevent Admin from /signin after session change for Agent access
        router.replace(`/partner`);
        return;
      }
      else if(adminToken && user.panel_type == "admin"){ //Prevent admin from /signin/agent after session change for ReLogin of Admin
        router.replace(`/admin/partners/agents`);
        return;
      }else{
          let signinRoute = "/signin";
        if (pathname?.startsWith("/student")) {
          signinRoute = "/signin/student";
        } else if (pathname?.startsWith("/partner")) {
          signinRoute = "/signin/agent";
        }else if(pathname?.startsWith("/admin")){
          signinRoute = "/signin"
        }

        const returnUrl = encodeURIComponent(pathname || "/");
        router.replace(`${signinRoute}?returnUrl=${returnUrl}`);
      }


      
      // router.replace("/unauthorized");
    }

    
  }, [loading, isAuthenticated, user, allowedRoles, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-blue-600">
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.panel_type)) {
    return null;
  }

  return <>{children}</>;
}
