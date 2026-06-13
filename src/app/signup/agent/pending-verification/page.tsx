"use client";

import { Clock, LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function VerificationPendingPage() {
  const { logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("ApplyTech");
  const [supportEmail, setSupportEmail] = useState<string | null>(null);

  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
    fetch(`${BASE_URL}/tenant/settings/public-logo`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.logo_url) setLogoUrl(d.data.logo_url);
        if (d?.data?.company_name) setCompanyName(d.data.company_name);
        if (d?.data?.email_address) setSupportEmail(d.data.email_address);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md sm:pt-10 mx-auto px-4 sm:px-0 flex justify-end">
          <button
            onClick={() => logout("partner")}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </button>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
          <div className="text-center">

            {/* Logo */}
            <div className="flex justify-center items-center gap-2 mb-8">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <Image
                  src="/images/logo/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                />
              )}
              <span className="text-gray-800 dark:text-white font-semibold text-xl">
                {companyName}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/20">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <h1 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
                Verification Pending
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Your agent account is currently under review
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                We are verifying your information. This process usually takes 24–48 hours.
                You will be notified once your account is approved.
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
                Need help?{" "}
                {supportEmail ? (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Contact Support
                  </a>
                ) : (
                  <span className="text-gray-500">Contact Support</span>
                )}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
