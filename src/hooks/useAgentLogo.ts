"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export const AGENT_LOGO_UPDATED_EVENT = "agent-logo-updated";

export function useAgentLogo() {
  const { token } = useAuth();
  const [agentLogoUrl, setAgentLogoUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1);
    window.addEventListener(AGENT_LOGO_UPDATED_EVENT, handler);
    return () => window.removeEventListener(AGENT_LOGO_UPDATED_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!token) return;
    let objectUrl: string;
    let cancelled = false;
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

    fetch(`${BASE_URL}/agent/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const storedUrl: string | undefined = data.profile?.agency_logo;
        if (!storedUrl) return null;
        const filename = storedUrl.split("/").pop();
        if (!filename) return null;
        return fetch(`${BASE_URL}/files/view/agent-logos/${encodeURIComponent(filename)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => (res?.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob || cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setAgentLogoUrl(objectUrl);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, refreshKey]);

  return { agentLogoUrl };
}
