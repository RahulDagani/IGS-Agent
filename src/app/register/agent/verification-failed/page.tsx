"use client";

import { ChevronLeftIcon, XCircle } from "lucide-react";
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

export default function VerificationFailedPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleContactSupport = () => {
    router.push("/support");
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* Left Side - Content */}
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
          <div className="text-center">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900/20">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <h1 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
                Verification Failed
              </h1>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Your agent account verification was unsuccessful
              </p>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                We were unable to verify your information. Please review your submission and ensure all details are accurate and complete.
              </p>

              {/* <div className="p-4 bg-red-50 rounded-lg dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Common reasons for rejection:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 text-left mt-2 space-y-1">
                  <li>• Incomplete or unclear business documentation</li>
                  <li>• Mismatched personal information</li>
                  <li>• Invalid business registration details</li>
                  <li>• Poor quality uploaded documents</li>
                </ul>
              </div> */}
            </div>

            

            <div className="mt-6">
              <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
                Need to resubmit? {""}
                <Link
                  href="/support"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Contact our team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}