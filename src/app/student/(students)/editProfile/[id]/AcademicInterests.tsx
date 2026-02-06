// components/AcademicInterests.tsx
"use client"
import React, { useState, useEffect } from "react";
import { BookOpen, Globe, Edit2, Save, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Country } from "country-state-city";
import { useParams } from "next/navigation";

interface StudyLevel {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

interface Discipline {
  id: number;
  name: string;
}

interface AcademicInterestsData {
  preferred_country: string;
  study_level: string;
  discipline: string;
  country_name?: string;
  study_level_name?: string;
  discipline_name?: string;
}

const AcademicInterests: React.FC = () => {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<AcademicInterestsData>({
    preferred_country: "",
    study_level: "",
    discipline: "",
  });
  const [studyLevels, setStudyLevels] = useState<StudyLevel[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loadingDisciplines, setLoadingDisciplines] = useState(false);
  const [countries, setCountries] = useState<Array<{isoCode: string, name: string}>>([]);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const {studentId} = useParams();

  useEffect(() => {
    fetchAcademicInterests();
    fetchStudyLevels();
    loadCountries();
  }, []);

  const loadCountries = () => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries.map(country => ({
      isoCode: country.isoCode,
      name: country.name
    })));
  };

  const fetchAcademicInterests = async () => {
    try {
      setIsLoading(true);
      // Fetch student interests from API
      const response = await fetch(`${BASE_URL}/student/interests/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const interests = result.data;
          const countryName = Country.getCountryByCode(interests.preferred_country)?.name || interests.preferred_country;
          
          setFormData({
            preferred_country: interests.preferred_country || "",
            study_level: interests.study_level || "",
            discipline: interests.discipline || "",
            country_name: countryName,
            study_level_name: interests.study_level,
            discipline_name: interests.discipline.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          });
          
          // Load disciplines if study level is selected
          if (interests.study_level) {
            fetchDisciplinesByStudyLevel(interests.study_level);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching academic interests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudyLevels = async () => {
    try {
      const response = await fetch(`${BASE_URL}/student/get/studylevels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStudyLevels(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching study levels:', error);
    }
  };

  const fetchDisciplinesByStudyLevel = async (studyLevelSlug: string) => {
    try {
      setLoadingDisciplines(true);
      
      // Find study level ID
      const studyLevel = studyLevels.find(sl => sl.slug === studyLevelSlug);
      if (!studyLevel) return;

      const response = await fetch(`${BASE_URL}/student/get/disciplines/${studyLevel.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success === "1" && result.data) {
          setDisciplines(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching disciplines:', error);
    } finally {
      setLoadingDisciplines(false);
    }
  };

  const handleStudyLevelChange = (studyLevelSlug: string) => {
    setFormData(prev => ({
      ...prev,
      study_level: studyLevelSlug,
      discipline: ""
    }));
    
    if (studyLevelSlug) {
      fetchDisciplinesByStudyLevel(studyLevelSlug);
    } else {
      setDisciplines([]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const payload = {
        study_level: formData.study_level,
        preferred_country: formData.preferred_country,
        discipline: formData.discipline
      };

      const response = await fetch(`${BASE_URL}/student/interests/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const countryName = Country.getCountryByCode(formData.preferred_country)?.name || formData.preferred_country;
          const studyLevelName = studyLevels.find(sl => sl.slug === formData.study_level)?.name || formData.study_level;
          const disciplineName = formData.discipline.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          
          setFormData(prev => ({
            ...prev,
            country_name: countryName,
            study_level_name: studyLevelName,
            discipline_name: disciplineName
          }));
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Error saving academic interests:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    fetchAcademicInterests();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading academic interests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <BookOpen size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Academic Interests
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Define your academic goals and preferences
            </p>
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Edit2 size={16} />
            <span>Edit</span>
          </button>
        ) : (
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Preferred Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Country *
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Globe size={18} />
              </span>
              <select
                value={formData.preferred_country}
                onChange={(e) => setFormData({ ...formData, preferred_country: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white appearance-none"
                required
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Study Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Study Level *
            </label>
            <select
              value={formData.study_level}
              onChange={(e) => handleStudyLevelChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
              disabled={loadingDisciplines}
            >
              <option value="">Select Study Level</option>
              {studyLevels.map(level => (
                <option key={level.slug} value={level.slug}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          {/* Discipline - Only show if study level is selected */}
          {formData.study_level && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discipline *
              </label>
              {loadingDisciplines ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <select
                  value={formData.discipline}
                  onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Discipline</option>
                  {disciplines.map(discipline => (
                    <option key={discipline.id} value={discipline.name.toLowerCase().replace(/\s+/g, '-')}>
                      {discipline.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.study_level || !formData.preferred_country || !formData.discipline || loadingDisciplines || isSaving}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formData.preferred_country && formData.study_level && formData.discipline ? (
            <>
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                  <Globe size={16} />
                  <span>Preferred Country</span>
                </h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  {formData.country_name || formData.preferred_country}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Study Level
                </h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  {formData.study_level_name || formData.study_level}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Field of Interest
                </h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  {formData.discipline_name || formData.discipline}
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No academic interests selected yet
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 size={16} className="mr-2" />
                Add Academic Interests
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicInterests;