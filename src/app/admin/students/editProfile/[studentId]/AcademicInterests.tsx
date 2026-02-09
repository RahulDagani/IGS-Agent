"use client"
import React, { useState, useEffect } from "react";
import { BookOpen, Globe, Edit2, Save, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Country } from "country-state-city";
import { useParams } from "next/navigation";

interface StudyLevel {
  id: number;
  name: string;
}

interface Discipline {
  id: number;
  name: string;
}

interface AcademicInterestsData {
  preferred_country: string;
  study_level: string; // Will store study_level_id as string
  discipline: string; // Will store discipline_id as string
  country_name?: string;
  study_level_name?: string;
  discipline_name?: string;
}

const AcademicInterests: React.FC = () => {
  const { token } = useAuth();
  const {studentId} = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<AcademicInterestsData>({
    preferred_country: "",
    study_level: "", // Will store ID as string
    discipline: "", // Will store ID as string
  });
  const [countries, setCountries] = useState<string[]>([]);
  const [studyLevels, setStudyLevels] = useState<StudyLevel[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loadingDisciplines, setLoadingDisciplines] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    fetchAcademicInterests();
  }, []);

  const fetchAcademicInterests = async () => {
    try {
      setIsLoading(true);
      
      // First, fetch initial countries
      const countriesResponse = await fetch(`${BASE_URL}/student/country-study-discipline`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (countriesResponse.ok) {
        const countriesResult = await countriesResponse.json();
        if (countriesResult.success && countriesResult.data) {
          setCountries(countriesResult.data.countries || []);
        }
      }

      // Then fetch the student's interests
      const interestsResponse = await fetch(`${BASE_URL}/tenant/student/interests/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (interestsResponse.ok) {
        const result = await interestsResponse.json();
        if (result.success && result.data) {
          const interests = result.data;
          const countryName = Country.getCountryByCode(interests.country_code)?.name || interests.country_code;
          
          // Set initial form data
          setFormData({
            preferred_country: interests.country_code || "",
            study_level: interests.study_level_id?.toString() || "",
            discipline: interests.discipline_id?.toString() || "",
            country_name: countryName,
          });

          // If country is selected, fetch study levels
          if (interests.country_code) {
            await fetchStudyLevelsAndNames(interests.country_code, interests.study_level_id, interests.discipline_id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching academic interests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudyLevelsAndNames = async (countryCode: string, studyLevelId?: string, disciplineId?: string) => {
    try {
      // Fetch study levels for the country
      const response = await fetch(
        `${BASE_URL}/student/country-study-discipline?country_code=${countryCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const studyLevelsData = result.data.study_levels || [];
          setStudyLevels(studyLevelsData);
          
          // Find and set study level name if ID exists
          if (studyLevelId && studyLevelsData.length > 0) {
            const studyLevel = studyLevelsData.find((sl: StudyLevel) => sl.id.toString() === studyLevelId.toString());
            if (studyLevel) {
              setFormData(prev => ({
                ...prev,
                study_level_name: studyLevel.name
              }));
              
              // If discipline ID exists, fetch disciplines and find the name
              if (disciplineId) {
                await fetchDisciplinesAndName(countryCode, studyLevelId, disciplineId);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching study levels:', error);
      setStudyLevels([]);
    }
  };

  const fetchDisciplinesAndName = async (countryCode: string, studyLevelId: string, disciplineId?: string) => {
    try {
      setLoadingDisciplines(true);
      const response = await fetch(
        `${BASE_URL}/student/country-study-discipline?country_code=${countryCode}&study_level_id=${studyLevelId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const disciplinesData = result.data.disciplines || [];
          setDisciplines(disciplinesData);
          
          // Find and set discipline name if ID exists
          if (disciplineId && disciplinesData.length > 0) {
            const discipline = disciplinesData.find((d: Discipline) => d.id.toString() === disciplineId.toString());
            if (discipline) {
              setFormData(prev => ({
                ...prev,
                discipline_name: discipline.name
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching disciplines:', error);
      setDisciplines([]);
    } finally {
      setLoadingDisciplines(false);
    }
  };

  const fetchStudyLevels = async (countryCode: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/student/country-study-discipline?country_code=${countryCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setStudyLevels(result.data.study_levels || []);
        }
      }
    } catch (error) {
      console.error('Error fetching study levels:', error);
      setStudyLevels([]);
    }
  };

  const fetchDisciplines = async (countryCode: string, studyLevelId: string) => {
    try {
      setLoadingDisciplines(true);
      const response = await fetch(
        `${BASE_URL}/student/country-study-discipline?country_code=${countryCode}&study_level_id=${studyLevelId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDisciplines(result.data.disciplines || []);
        }
      }
    } catch (error) {
      console.error('Error fetching disciplines:', error);
      setDisciplines([]);
    } finally {
      setLoadingDisciplines(false);
    }
  };

  const handleCountryChange = async (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_country: countryCode,
      study_level: "",
      discipline: "",
      study_level_name: "",
      discipline_name: ""
    }));
    
    setStudyLevels([]);
    setDisciplines([]);
    
    if (countryCode) {
      await fetchStudyLevels(countryCode);
    }
  };

  const handleStudyLevelChange = async (studyLevelId: string) => {
    setFormData(prev => ({
      ...prev,
      study_level: studyLevelId,
      discipline: "",
      discipline_name: ""
    }));
    
    setDisciplines([]);
    
    if (studyLevelId && formData.preferred_country) {
      await fetchDisciplines(formData.preferred_country, studyLevelId);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const payload = {
        country_code: formData.preferred_country,
        study_level_id: parseInt(formData.study_level),
        discipline_id: parseInt(formData.discipline)
      };

      const response = await fetch(`${BASE_URL}/tenant/student/interests/${studentId}`, {
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
          // Update display names
          const countryName = Country.getCountryByCode(formData.preferred_country)?.name || formData.preferred_country;
          const studyLevelName = studyLevels.find((sl: StudyLevel) => sl.id.toString() === formData.study_level)?.name;
          const disciplineName = disciplines.find((d: Discipline) => d.id.toString() === formData.discipline)?.name;
          
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

  const hasAllData = formData.preferred_country && formData.study_level && formData.discipline;

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
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white appearance-none"
                required
              >
                <option value="">Select Country</option>
                {countries.map(countryCode => (
                  <option key={countryCode} value={countryCode}>
                    {Country.getCountryByCode(countryCode)?.name || countryCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Study Level - Only show if country is selected */}
          {formData.preferred_country && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Study Level *
              </label>
              <select
                value={formData.study_level}
                onChange={(e) => handleStudyLevelChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Study Level</option>
                {studyLevels.map((level: StudyLevel) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                  {disciplines.map((discipline: Discipline) => (
                    <option key={discipline.id} value={discipline.id}>
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
          {hasAllData ? (
            <>
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                  <Globe size={16} />
                  <span>Preferred Country</span>
                </h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  {formData.country_name || Country.getCountryByCode(formData.preferred_country)?.name || formData.preferred_country}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Study Level
                </h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  {formData.study_level_name || "Loading..."}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Field of Interest
                </h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  {formData.discipline_name || "Loading..."}
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