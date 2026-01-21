"use client";
import React, { useState, useEffect } from 'react';
import { Application } from '../types';
import { useAuth } from '@/context/AuthContext';

interface ApplicationListProps {
  universityId: number | null;
  onApplicationsSelect: (applications: Application[]) => void;
  onNextStep: () => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({
  universityId,
  onApplicationsSelect,
  onNextStep
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApps, setSelectedApps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    if (universityId) {
      fetchApplications();
    } else {
      setApplications([]);
      setSelectedApps([]);
    }
  }, [universityId]);

  const fetchApplications = async () => {
    if (!universityId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/applications?university_id=${universityId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch applications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApplication = (applicationId: number, isEligible: boolean) => {
    if (!isEligible) return;
    
    setSelectedApps(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  const handleCreatePayment = () => {
    const selectedApplications = applications.filter(app => 
      selectedApps.includes(app.application_id)
    );
    onApplicationsSelect(selectedApplications);
    onNextStep();
  };

  const isApplicationEligible = (app: Application) => {
    return app.generated_intallments < app.no_of_installments;
  };

  if (!universityId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6 text-center">
        <div className="text-gray-400 dark:text-gray-500">
          Please select a university first
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
          </div>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-3 text-sm text-red-800 dark:text-red-400 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const eligibleApplications = applications.filter(isApplicationEligible);
  const isCreateDisabled = selectedApps.length === 0 || 
    selectedApps.length > eligibleApplications.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Select Applications
        </h2>
        
        {selectedApps.length > 0 && (
          <button
            onClick={handleCreatePayment}
            disabled={isCreateDisabled}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-colors
              ${isCreateDisabled
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white'
              }
            `}
          >
            Create Payment ({selectedApps.length} selected)
          </button>
        )}
      </div>
      
      {applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No applications found for this university
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isEligible = isApplicationEligible(app);
            const isSelected = selectedApps.includes(app.application_id);
            
            return (
              <div
                key={app.application_id}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${!isEligible
                    ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
                onClick={() => handleSelectApplication(app.application_id, isEligible)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectApplication(app.application_id, isEligible)}
                        disabled={!isEligible}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {app.student_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.acknowledgement_no}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ml-7">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Intake</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {app.intake_name} {app.intake_year}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Study Level</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {app.study_level}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Tuition Fee</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {app.currency_code} {app.tuition_fee}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Installments</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {app.generated_intallments}/{app.no_of_installments} paid
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {!isEligible && (
                    <span className="ml-4 px-3 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      All installments paid
                    </span>
                  )}
                  
                  {isEligible && (
                    <span className="ml-4 px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Eligible for payment
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationList;