"use client";
import React, { useState } from 'react';
import UniversityList from './components/UniversityList';
import ApplicationList from './components/ApplicationList';
import CommissionNotes from './components/CommissionNotes';
import { Application } from './types';

export default function UniversityPaymentsPage() {
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([]);
  const [currentStep, setCurrentStep] = useState<'university' | 'applications' | 'commission-notes'>('university');

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

  const [refreshKey, setRefreshKey] = useState(0);

const handleSuccess = () => {
  // Reset the flow after successful submission
  setSelectedUniversityId(null);
  setSelectedApplications([]);
  setCurrentStep('university');
  setRefreshKey(prev => prev + 1); // Force re-render
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            University Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage commission payments for universities
          </p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-lg ${currentStep === 'university' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            1. Select University
          </div>
          <div className="text-gray-400">→</div>
          <div className={`px-4 py-2 rounded-lg ${currentStep === 'applications' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            2. Select Applications
          </div>
          <div className="text-gray-400">→</div>
          <div className={`px-4 py-2 rounded-lg ${currentStep === 'commission-notes' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            3. Commission Notes
          </div>
        </div>
      </div>

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
          key={refreshKey} // Add key to force re-render
          applications={selectedApplications}
          universityId={selectedUniversityId}
          onBack={handleBackToApplications}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}