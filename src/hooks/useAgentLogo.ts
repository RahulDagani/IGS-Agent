"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function useAgentLogo() {
  const { token } = useAuth();
  const [agentLogoUrl, setAgentLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
    fetch(`${BASE_URL}/agent/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile?.agency_logo) {
          setAgentLogoUrl(data.profile.agency_logo);
        }
      })
      .catch(() => {});
  }, [token]);

  return { agentLogoUrl };
}
