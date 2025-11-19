"use client";

import { ChevronLeftIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Button = ({ 
  children, 
  onClick, 
  className = ""
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 py-3 ${className}`}
  >
    {children}
  </button>
);

export default function VerificationPendingPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* Left Side - Content */}
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
          <div className="text-center">
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
                We are verifying your information. This process usually takes 24-48 hours. 
                You will be notified once your account is approved.
              </p>
            </div>

            

            <div className="mt-6">
              <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
                Need help? {""}
                <Link
                  href="/support"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}