'use client';

import React, { useState } from 'react';
import { Application, GenerateInvoicePayload } from '../types';
import { DollarSign, AlertCircle, Loader2, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface CommissionNotesProps {
  applications: Application[];
  universityId: number;
  onBack: () => void;
  onSuccess: () => void;
}

export default function CommissionNotes({ applications, universityId, onBack, onSuccess }: CommissionNotesProps) {
  const [tuitionFees, setTuitionFees] = useState<Record<number, number>>(
    applications.reduce((acc, app) => {
      // Only set default values for percentage-based commissions
      if (app.commission_type === 'percentage') {
        return { ...acc, [app.application_id]: 0 }; // Default value for percentage
      }
      return acc; // No tuition fee needed for fixed commissions
    }, {})
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {token} = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const router = useRouter();

  const handleFeeChange = (applicationId: number, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setTuitionFees(prev => ({ ...prev, [applicationId]: numValue }));
    }
  };

  const validateFees = (): boolean => {
    // Only validate fees for percentage-based applications
    return applications
      .filter(app => app.commission_type === 'percentage')
      .every(app => {
        const fee = tuitionFees[app.application_id];
        return fee !== undefined && fee > 0;
      });
  };

const handleSubmit = async () => {
  if (!validateFees()) {
    setError('Please enter valid tuition fees for percentage-based applications');
    return;
  }

  setLoading(true);
  setError(null);

  // Include ALL applications in the payload
  const payloadApplications = applications.map(app => ({
    application_id: app.application_id,
    // Only include commissionable_tuition_fee for percentage-based applications
    ...(app.commission_type === 'percentage' && {
      commissionable_tuition_fee: tuitionFees[app.application_id]
    })
    // For fixed commissions, don't send commissionable_tuition_fee at all
  }));

  const payload = {
    university_id: universityId,
    applications: payloadApplications
  };

  try {
    const response = await fetch(`${BASE_URL}/tenant/invoice/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === 'success') {
      setSuccess(true);
      setTimeout(() => {
        // onSuccess();
        router.push("/admin/partners/accounts/universityinvoice/add");
      }, 2000);
    } else {
      setError(data.message || 'Failed to generate invoice');
    }
  } catch (err) {
    setError('Error connecting to server. Please try again.');
    console.error('Error generating invoice:', err);
  } finally {
    setLoading(false);
  }
};

  const calculateTotalCommission = (app: Application) => {
    if (app.commission_type === 'percentage') {
      const fee = tuitionFees[app.application_id] || 0;
      return (fee * parseFloat(app.commission_value)) / 100;
    }
    // For fixed commission, just return the fixed amount
    return parseFloat(app.commission_value);
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Invoice Generated Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting you back to the university list...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        {/* <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button> */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Set Commissionable Tuition Fees
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {applications.some(app => app.commission_type === 'percentage') 
              ? 'Enter tuition fees for percentage-based commissions. Fixed commissions will be processed automatically.'
              : 'All selected applications have fixed commissions. No tuition fees required.'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app) => (
          <div 
            key={app.application_id}
            className={`bg-white dark:bg-gray-800 border rounded-xl p-6 transition-shadow ${
              app.commission_type === 'percentage' 
                ? 'border-gray-200 dark:border-gray-700 hover:shadow-md' 
                : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    app.commission_type === 'percentage' 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${
                      app.commission_type === 'percentage' 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Application #{app.application_id}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Student ID: {app.student_id}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase">Commission Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {app.commission_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase">Commission Value</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {app.commission_type === 'percentage' 
                        ? `${app.commission_value}%` 
                        : `${app.currency} ${parseFloat(app.commission_value).toLocaleString()}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase">Installments</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {app.no_of_installments} ({app.total_installments_paid} paid)
                    </p>
                  </div>
                </div>
              </div>

              {app.commission_type === 'percentage' ? (
                <div className="w-full sm:w-64">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commissionable Tuition Fee ({app.currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {app.currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tuitionFees[app.application_id] || ''}
                      onChange={(e) => handleFeeChange(app.application_id, e.target.value)}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  {tuitionFees[app.application_id] > 0 && (
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Estimated commission: {app.currency} {calculateTotalCommission(app).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full sm:w-64 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fixed Commission Amount</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {app.currency} {parseFloat(app.commission_value).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    No tuition fee input required for fixed commissions
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Applications:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{applications.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Percentage-based:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {applications.filter(app => app.commission_type === 'percentage').length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Fixed Commission:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {applications.filter(app => app.commission_type === 'fixed').length}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Total Estimated Commission:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {applications[0]?.currency} {applications.reduce((total, app) => total + calculateTotalCommission(app), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !validateFees()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Generate Invoice</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}