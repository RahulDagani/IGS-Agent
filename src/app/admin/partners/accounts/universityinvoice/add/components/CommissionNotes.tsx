"use client";
import React, { useState, useEffect } from 'react';
import { Application, ApplicationWithInstallments } from '../types';
import { useAuth } from '@/context/AuthContext';

interface CommissionNotesProps {
  applications: Application[];
  universityId: number;
  onBack: () => void;
  onSuccess: () => void; // Add success callback
}

// Define extended type for local state
interface ExtendedApplicationWithInstallments extends ApplicationWithInstallments {
  newCommissionAmt?: number;
  newInstallmentNo?: number;
}

const CommissionNotes: React.FC<CommissionNotesProps> = ({
  applications,
  universityId,
  onBack,
  onSuccess
}) => {
  const [appsWithInstallments, setAppsWithInstallments] = useState<ExtendedApplicationWithInstallments[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    if (applications.length > 0) {
      fetchApplicationNotes();
    }
  }, [applications]);

const fetchApplicationNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get unique application IDs
      const applicationIds = [...new Set(applications.map(app => app.application_id))];
      const params = new URLSearchParams();
      applicationIds.forEach(id => params.append('application_id', id.toString()));
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/note/items?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Initialize with next installment number and no commission amount
        const appsWithDefaults: ExtendedApplicationWithInstallments[] = (data.data || []).map((app: ApplicationWithInstallments) => ({
          ...app,
          newInstallmentNo: app.generated_intallments + 1, // Auto-set next installment
          newCommissionAmt: undefined // Start with undefined
        }));
        setAppsWithInstallments(appsWithDefaults);
      } else {
        throw new Error(data.message || "Failed to fetch notes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCommissionChange = (applicationId: number, value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    setAppsWithInstallments(prev => prev.map(app => {
      if (app.application_id === applicationId) {
        return {
          ...app,
          newCommissionAmt: numValue
        };
      }
      return app;
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    // Check if all applications have commission amount
    const appsWithoutCommission = appsWithInstallments.filter(
      app => app.generated_intallments < app.no_of_installments && !app.newCommissionAmt
    );
    
    if (appsWithoutCommission.length > 0) {
      errors.push("Please enter commission amount for all applications");
    }
    
    // Check if commission amount is valid number
    const invalidCommission = appsWithInstallments.filter(
      app => app.newCommissionAmt !== undefined && (isNaN(app.newCommissionAmt) || app.newCommissionAmt <= 0)
    );
    
    if (invalidCommission.length > 0) {
      errors.push("Please enter valid commission amount (greater than 0)");
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Filter applications that can have new notes (installments available)
      const applicationsToSubmit = appsWithInstallments.filter(app => 
        app.generated_intallments < app.no_of_installments && 
        app.newCommissionAmt && 
        app.newInstallmentNo
      );
      
      if (applicationsToSubmit.length === 0) {
        setError("No applications available for commission notes");
        return;
      }
      
      const payload = {
        university_id: universityId,
        commission_type: "percentage",
        commissionable_tuition_fee: applications.reduce((sum, app) => 
          sum + parseFloat(app.tuition_fee || "0"), 0
        ),
        applications: applicationsToSubmit.map(app => ({
          application_id: app.application_id,
          commission_amt: app.newCommissionAmt!,
          installment_no: app.newInstallmentNo! // This is auto-set to next installment
        }))
      };
      
      console.log("Submitting payload:", payload); // For debugging
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/note`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to create notes: ${response.status}`);
      }
      
      if (data.success) {
        setSuccess("Commission notes created successfully!");
        
        // Clear form after successful submission
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        throw new Error(data.message || "Failed to create notes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalCommission = () => {
    return appsWithInstallments.reduce((total, app) => {
      if (app.newCommissionAmt && app.generated_intallments < app.no_of_installments) {
        return total + app.newCommissionAmt;
      }
      return total;
    }, 0);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Success message
  if (success) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800/50 dark:bg-green-900/20">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="ml-2 text-sm font-medium text-green-800 dark:text-green-400">Success</h3>
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">{success}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Back to Applications
            </button>
            <button
              onClick={onSuccess}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Create More Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasPendingChanges = appsWithInstallments.some(
    app => app.generated_intallments < app.no_of_installments && app.newCommissionAmt
  );

  const totalCommission = calculateTotalCommission();
  const eligibleApplicationsCount = appsWithInstallments.filter(
    app => app.generated_intallments < app.no_of_installments
  ).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            ← Back to Applications
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Commission Notes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {eligibleApplicationsCount} application(s) eligible for new commission notes
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {totalCommission > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Commission</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${totalCommission.toFixed(2)}
              </p>
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={!hasPendingChanges || submitting}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-colors min-w-[140px]
              ${!hasPendingChanges || submitting
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
              }
            `}
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Submitting...
              </div>
            ) : (
              'Submit Notes'
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
          </div>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-6">
        {appsWithInstallments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No application data found
          </div>
        ) : (
          appsWithInstallments.map((app) => {
            const nextInstallmentNo = app.generated_intallments + 1;
            const canAddNote = app.generated_intallments < app.no_of_installments;
            
            return (
              <div
                key={app.application_id}
                className={`border rounded-lg p-4 ${
                  canAddNote 
                    ? 'border-gray-200 dark:border-white/[0.05]' 
                    : 'border-gray-100 dark:border-gray-800 opacity-70'
                }`}
              >
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-white/[0.05]">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {app.student_name}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Ack No: </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {app.acknowledgement_no}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Level: </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {app.course_level}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Year: </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {app.intake_year}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Installments</p>
                      <p className={`font-medium ${
                        canAddNote 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {app.generated_intallments}/{app.no_of_installments}
                      </p>
                      {canAddNote && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Next: #{nextInstallmentNo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Previous Installments */}
                {app.installments && app.installments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Previous Commission Notes
                    </h4>
                    <div className="space-y-2">
                      {app.installments.map((installment) => (
                        <div
                          key={installment.id}
                          className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded"
                        >
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              Installment {installment.installment_no}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-4">
                              Created: {new Date(installment.created_at).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              ${parseFloat(installment.commission_amt).toFixed(2)}
                            </div>
                            {installment.commissionable_tuition_fee && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Fee: ${installment.commissionable_tuition_fee}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add New Note Section */}
                {canAddNote ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Add New Commission Note
                      </h4>
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Installment: </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          #{nextInstallmentNo}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Commission Amount ($)
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Enter commission amount"
                            value={app.newCommissionAmt || ''}
                            onChange={(e) => handleCommissionChange(app.application_id, e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Enter the commission amount for installment #{nextInstallmentNo}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Next Installment Number
                        </label>
                        <div className="flex items-center">
                          <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                            #{nextInstallmentNo}
                          </div>
                          <input
                            type="hidden"
                            value={nextInstallmentNo}
                            onChange={(e) => {/* Auto-set, no manual input */}}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Auto-generated based on previous installments
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      All {app.no_of_installments} installments have been paid for this application
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary and Submit Section (Fixed at bottom) */}
      {eligibleApplicationsCount > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/[0.05]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {eligibleApplicationsCount} application(s) eligible for commission notes
              </p>
              {totalCommission > 0 && (
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  Total Commission: ${totalCommission.toFixed(2)}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!hasPendingChanges || submitting}
                className={`
                  px-6 py-2.5 rounded-lg font-medium transition-colors min-w-[140px]
                  ${!hasPendingChanges || submitting
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
                  }
                `}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creating Notes...
                  </div>
                ) : (
                  'Create Commission Notes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionNotes;