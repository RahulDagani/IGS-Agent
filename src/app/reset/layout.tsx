"use client";
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React from "react";
import { useTenantLogo } from "@/hooks/useTenantLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logoUrl, companyName } = useTenantLogo();

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="block mb-4">
                   <div className="flex justify-center items-center">
                                {logoUrl ? (
                                  <img src={logoUrl} alt={companyName} className="h-12 w-auto object-contain" />
                                ) : (
                                  <span className="dark:text-white text-white font-semibold text-2xl">{companyName}</span>
                                )}
                              </div>
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  One platform to scale your student recruitment network
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
