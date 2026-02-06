"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   subdomain?: string | null;
//   role: string;
// }

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  role_key: string;
  panel_type: string;
  email_verified?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  adminAgentLogin: (user: User, token: string, adminToken: string) => void;
  adminReLoginFromAgent: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean; // ✅ added
  adminToken?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ added

  const router = useRouter();

  //For admin Re-Login from Agent panel
  const [adminToken, setAdminToken] = useState<string | null>(null);


  useEffect(() => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");
    const storedAdminToken = Cookies.get("adminToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    if(storedAdminToken){
      setAdminToken(storedAdminToken);
    }

    setLoading(false); // ✅ done loading cookies
  }, []);

  const login = (userData: User, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    Cookies.set("token", jwt, { expires: 7 });
  };

  const adminReLoginFromAgent = (userData: User, jwt:string) => {
    setUser(userData);
    setToken(jwt);
    Cookies.set("user", JSON.stringify(userData), {expires: 7});
    Cookies.set("token", jwt, {expires: 7});
    Cookies.remove("adminToken");
  }

  const adminAgentLogin = (userData: User, jwt:string, adminToken: string) => {
    setLoading(true);
    setUser(userData);
    setToken(jwt);
    Cookies.set("user", JSON.stringify(userData), {expires: 7});
    Cookies.set("token", jwt, {expires: 7});
    Cookies.set("adminToken", adminToken, {expires: 7});
    setTimeout(()=>{
      setLoading(false);
      router.push("/partner");
    },2000)
    
  }

  const logout = () => {
    const panel = user?.panel_type;
    setUser(null);
    setToken(null);

    Cookies.remove("user");
    Cookies.remove("token");
    Cookies.remove("adminToken");
   
    // if(panel ==   "agent"){
    //   window.location.href = '/signin/agent';

    //   }else if(panel == "student"){
    //     window.location.href = '/signin/student';
    //   }else{
    //     window.location.href = '/signin';
    //   }
  };

  const value: AuthContextType = {
    user,
    token,
    adminToken,
    login,
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
