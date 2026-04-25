"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GridShape from "@/components/common/GridShape";

export default function AuthLogoPanel() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("ApplyTech");

  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
    fetch(`${BASE_URL}/tenant/settings/public-logo`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.logo_url) setLogoUrl(d.data.logo_url);
        if (d?.data?.company_name) setCompanyName(d.data.company_name);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
      <div className="relative items-center justify-center flex z-1">
        <GridShape />
        <div className="flex flex-col items-center max-w-xs">
          <Link href="/" className="block mb-4">
            <div className="flex justify-center items-center gap-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="h-11 w-auto object-contain"
                />
              ) : (
                <Image
                  src="/images/logo/logo.png"
                  alt="Logo"
                  width={45}
                  height={45}
                />
              )}
              <span className="dark:text-white text-white font-semibold text-2xl">
                {companyName}
              </span>
            </div>
          </Link>
          <p className="text-center text-gray-400 dark:text-white/60">
            One platform to scale your student recruitment network
          </p>
        </div>
      </div>
    </div>
  );
}
