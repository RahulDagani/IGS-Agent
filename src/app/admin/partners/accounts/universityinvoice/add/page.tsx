'use client';

import React, { useState } from 'react';
import UniversityList from './components/UniversityList';
import ApplicationList from './components/ApplicationList';
import CommissionNotes from './components/CommissionNotes';
import { Application } from './types';
import { useRouter } from 'next/navigation';


export default function UniversityPaymentsPage() {
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([]);
  const [currentStep, setCurrentStep] = useState<'university' | 'applications' | 'commission-notes'>('university');
  const [refreshKey, setRefreshKey] = useState(0);

  const router = useRouter();
  const handleUniversitySelect = (universityId: number) => {
    setSelectedUniversityId(universityId);
    setCurrentStep('applications');
  };

  const handleApplicationsSelect = (applications: Application[]) => {
    setSelectedApplications(applications);
  };

  const handleNextToCommission = () => {
    setCurrentStep('commission-notes');
  };

  const handleBackToApplications = () => {
    setCurrentStep('applications');
  };

  const handleBackToUniversity = () => {
    setSelectedUniversityId(null);
    setSelectedApplications([]);
    setCurrentStep('university');
  };

  const handleSuccess = () => {
    // Reset the flow after successful submission
    // setSelectedUniversityId(null);
    // setSelectedApplications([]);
    // setCurrentStep('university');
    // setRefreshKey(prev => prev + 1); // Force re-render

    router.push("/admin/partners/accounts/universityinvoice/add");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            University Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage invoice payments for universities
          </p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-lg transition-colors ${
            currentStep === 'university' 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            1. Select University
          </div>
          <div className="text-gray-400">→</div>
          <div className={`px-4 py-2 rounded-lg transition-colors ${
            currentStep === 'applications' 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            2. Select Applications
          </div>
          <div className="text-gray-400">→</div>
          <div className={`px-4 py-2 rounded-lg transition-colors ${
            currentStep === 'commission-notes' 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            3. Raise Invoice
          </div>
        </div>
      </div>

      {/* Back button for steps > 1 */}
      {currentStep !== 'university' && (
        <button
          onClick={currentStep === 'applications' ? handleBackToUniversity : handleBackToApplications}
          className="mb-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      )}

      {/* Content */}
      {currentStep === 'university' && (
        <UniversityList
          onSelectUniversity={handleUniversitySelect}
          selectedUniversityId={selectedUniversityId}
        />
      )}

      {currentStep === 'applications' && selectedUniversityId && (
        <ApplicationList
          universityId={selectedUniversityId}
          onApplicationsSelect={handleApplicationsSelect}
          onNextStep={handleNextToCommission}
        />
      )}

      {currentStep === 'commission-notes' && selectedUniversityId && selectedApplications.length > 0 && (
        <CommissionNotes
          key={refreshKey}
          applications={selectedApplications}
          universityId={selectedUniversityId}
          onBack={handleBackToApplications}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}