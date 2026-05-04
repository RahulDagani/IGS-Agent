"use client";
import { useEffect, useState } from "react";

export function useTenantLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("ApplyTech");

  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
    fetch(`${BASE_URL}/tenant/settings/public-logo`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.logo_url) setLogoUrl(data.data.logo_url);
        if (data.success && data.data?.company_name) setCompanyName(data.data.company_name);
      })
      .catch(() => {});
  }, []);

  return { logoUrl, companyName };
}
