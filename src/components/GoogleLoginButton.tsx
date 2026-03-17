// components/GoogleLoginButton.tsx
"use client";

import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Image from 'next/image';

interface GoogleLoginButtonProps {
  buttonText?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  role?: 'agent'; // Add role if needed
}

export const GoogleLoginButton = ({ 
  buttonText = "Continue with Google",
  className = "",
  onSuccess,
  onError,
  role = 'agent' // Default to student
}: GoogleLoginButtonProps) => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
        
        // Send the ID token to backend
        const response = await fetch(`${BASE_URL}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: tokenResponse.access_token, // This is actually the ID token in implicit flow
            role: "agent" 
          }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.success) {
            
            const { user, token } = data.data;
            const {status} = data;
            
            if (user && token) {
              
              login(user, token);

              console.log(status)
              if(user.email_verified != 1){
                  router.push('/signin/verify');
                }
              
                if(status === "business_pending"){
                  router.push('/signup/agent/onboarding/business');
                }else if(status === "under_review"){
                  router.push('/signup/agent/pending-verification');
                }else if(status === "verification_failed"){
                  router.push('/signup/agent/verification-failed');
                }else if(status === "verified"){
                  // Redirect to intended page or partner dashboard
                  router.push("/");
                }
            }

            if (onSuccess) onSuccess();
          } else {
            console.log("Sdfsadf")
            throw new Error(data.message+"1" || "Google login failed");
          }
        } else {
          console.log("abcdddd")
          throw new Error(data.message+"2" || "Google login failed");
        }
      } catch (error) {
        console.error('Google login error:', error);
        if (onError) onError(error instanceof Error ? error.message : "Login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      if (onError) onError("Google authentication failed");
    },
    flow: 'implicit',
    scope: 'email profile',
  });

  return (
    <button
      onClick={() => googleLogin()}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="flex justify-center">
          <Image
            src="/images/google.png"
            alt="Google Logo"
            width={30}
            height={30}
          />
        </div> 
      )}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {loading ? "Processing..." : buttonText}
      </span>
    </button>
  );
};