'use client';

import React, { useEffect, useState } from 'react';
import { Application } from '../types';
import { Check, Loader2, AlertCircle, GraduationCap, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ApplicationListProps {
  universityId: number;
  onApplicationsSelect: (applications: Application[]) => void;
  onNextStep: () => void;
}

export default function ApplicationList({ universityId, onApplicationsSelect, onNextStep }: ApplicationListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const {token} = useAuth();
    const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    fetchApplications();
  }, [universityId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/tenant/invoice/applications/${universityId}`,{
          headers:{
            "Authorization": `Bearer ${token}`
          }
        });
      const data = await response.json();
      
      if (data.status === 'success') {
        setApplications(data.data);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleApplication = (applicationId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedIds(newSelected);
    
    const selectedApps = applications.filter(app => newSelected.has(app.application_id));
    onApplicationsSelect(selectedApps);
  };

  const toggleAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
      onApplicationsSelect([]);
    } else {
      const allIds = new Set(applications.map(app => app.application_id));
      setSelectedIds(allIds);
      onApplicationsSelect(applications);
    }
  };

  const getCommissionDisplay = (app: Application) => {
    const value = parseFloat(app.commission_value);
    if (app.commission_type === 'percentage') {
      return `${value}%`;
    }
    return `${app.currency} ${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={fetchApplications}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedIds.size} application{selectedIds.size !== 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Total available: {applications.length} applications
            </p>
          </div>
        </div>
        <button
          onClick={toggleAll}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        >
          {selectedIds.size === applications.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Select
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Application ID
                </th>
                
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Installments
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {applications.map((app) => (
                <tr 
                  key={app.application_id}
                  onClick={() => toggleApplication(app.application_id)}
                  className={`cursor-pointer transition-colors ${
                    selectedIds.has(app.application_id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedIds.has(app.application_id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedIds.has(app.application_id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    #{app.application_id}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {app.student_name_email}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {app.course_study_level_intake}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {getCommissionDisplay(app)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {app.total_installments_paid}/{app.no_of_installments}
                      </span>
                      {app.pending_installments > 0 && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                          {app.pending_installments} pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {app.last_invoice_date || 'No invoice'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      app.pending_installments > 0
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : app.total_installments_paid === app.no_of_installments
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    }`}>
                      {app.pending_installments > 0 ? 'Pending' : 
                       app.total_installments_paid === app.no_of_installments ? 'Paid' : 'New'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNextStep}
          disabled={selectedIds.size === 0}
          className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${
            selectedIds.size > 0
              ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Continue with {selectedIds.size} Application{selectedIds.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}