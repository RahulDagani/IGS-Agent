"use client";
import React, { useState, useEffect } from 'react';
import { University } from '../types';
import { useAuth } from '@/context/AuthContext';

interface UniversityListProps {
  onSelectUniversity: (universityId: number) => void;
  selectedUniversityId: number | null;
}

const UniversityList: React.FC<UniversityListProps> = ({
  onSelectUniversity,
  selectedUniversityId
}) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${BASE_URL}/tenant/invoice/universities`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch universities: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUniversities(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch universities");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
        </div>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={fetchUniversities}
          className="mt-3 text-sm text-red-800 dark:text-red-400 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (universities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No universities found
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Select University
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {universities.map((university) => (
          <button
            key={university.university_id}
            onClick={() => onSelectUniversity(university.university_id)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all duration-200
              ${selectedUniversityId === university.university_id
                ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }
            `}
          >
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {university.university_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              University ID: {university.university_id}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UniversityList;