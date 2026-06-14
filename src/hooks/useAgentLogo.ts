"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function useAgentLogo() {
  const { token } = useAuth();
  const [agentLogoUrl, setAgentLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let objectUrl: string;
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

    fetch(`${BASE_URL}/agent/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const storedUrl: string | undefined = data.profile?.agency_logo;
        if (!storedUrl) return;
        const filename = storedUrl.split("/").pop();
        if (!filename) return;
        return fetch(`${BASE_URL}/files/view/agent-logos/${encodeURIComponent(filename)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => (res?.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob) return;
        objectUrl = URL.createObjectURL(blob);
        setAgentLogoUrl(objectUrl);
      })
      .catch(() => {});

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token]);

  return { agentLogoUrl };
}
