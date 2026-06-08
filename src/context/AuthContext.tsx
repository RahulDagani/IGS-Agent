"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  role_key: string;
  panel_type: string;
  email_verified?: number;
  phone_number: string;
  is_agent_verified?: number;
}

export interface AgreementState {
  signed: boolean;
  status: "pending" | "agent_signed" | "completed";
  grace_start: string | null;
  grace_end: string | null;
  is_blocked: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  agreement: AgreementState | null;
  login: (user: User, token: string, agreement?: AgreementState) => void;
  setAgreement: (agreement: AgreementState) => void;
  updateUser: (fields: Partial<User>) => void;
  adminAgentLogin: (user: User, token: string, adminToken: string) => void;
  adminReLoginFromAgent: (user: User, token: string) => void;
  logout: (userType: string) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  adminToken?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [agreement, setAgreementState] = useState<AgreementState | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");
    const storedAdminToken = Cookies.get("adminToken");
    const storedAgreement = Cookies.get("agreement");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    if (storedAdminToken) {
      setAdminToken(storedAdminToken);
    }

    if (storedAgreement) {
      try {
        setAgreementState(JSON.parse(storedAgreement));
      } catch {}
    }

    setLoading(false);
  }, []);

  const login = (userData: User, jwt: string, agreementData?: AgreementState) => {
    setUser(userData);
    setToken(jwt);
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    Cookies.set("token", jwt, { expires: 7 });
    if (agreementData) {
      setAgreementState(agreementData);
      Cookies.set("agreement", JSON.stringify(agreementData), { expires: 1 });
    }
  };

  const setAgreement = (agreementData: AgreementState) => {
    setAgreementState(agreementData);
    Cookies.set("agreement", JSON.stringify(agreementData), { expires: 1 });
  };

  const updateUser = (fields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    setUser(updated);
    Cookies.set("user", JSON.stringify(updated), { expires: 7 });
  };

  const adminReLoginFromAgent = (userData: User, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    Cookies.set("token", jwt, { expires: 7 });
    Cookies.remove("adminToken");
  };

  const adminAgentLogin = (userData: User, jwt: string, adminToken: string) => {
    setLoading(true);
    setUser(userData);
    setToken(jwt);
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    Cookies.set("token", jwt, { expires: 7 });
    Cookies.set("adminToken", adminToken, { expires: 7 });
    setTimeout(() => {
      setLoading(false);
      router.push("/partner");
    }, 2000);
  };

  const logout = async (userType: string) => {
    const currentToken = Cookies.get("token");
    if (currentToken) {
      const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
      await fetch(`${BASE_URL}/files/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      }).catch(() => {});
    }

    setUser(null);
    setToken(null);
    setAgreementState(null);

    Cookies.remove("user");
    Cookies.remove("token");
    Cookies.remove("adminToken");
    Cookies.remove("agreement");

    window.location.href = "/signin/agent";
  };

  const value: AuthContextType = {
    user,
    token,
    agreement,
    adminToken,
    login,
    setAgreement,
    updateUser,
    logout,
    adminAgentLogin,
    adminReLoginFromAgent,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
