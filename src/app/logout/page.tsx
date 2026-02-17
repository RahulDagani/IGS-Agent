"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LogoutPage() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const role  = user?.panel_type;

  const searchParams = useSearchParams();
  const userType = searchParams.get("userType") || "";


  useEffect(() => {
    const performLogout = async () => {
      try {
        
        logout(userType);

        // Optional: Add a small delay to ensure logout completes
        // setTimeout(() => {
        //     if(role == "agent"){
        //         router.push('/signin/agent');
        //     }else if(role == "student"){
        //         router.push('/signin/student');
        //     }else{
        //         router.push('/signin');
        //     }
          
        // }, 1000);
      } catch (error) {
        console.error('Logout failed:', error);
        // Still redirect to login even if logout fails
        if(userType == "agent"){
                router.push('/signin/agent');
            }else if(userType == "student"){
                router.push('/signin/student');
            }else{
                router.push('/signin');
            }
      }
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Logging out</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we securely sign you out...</p>
      </div>
    </div>
  );
}