// app/student/profile/page.tsx
"use client"
import React, { useState, useEffect } from "react";
import { Edit2, Mail, User, Globe, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import TestScores from "./TestScores";
import { useAuth } from "@/context/AuthContext";
import { Country } from "country-state-city";

interface StudentInterestData {
  id: number;
  student_id: number;
  preferred_country: string;
  study_level: string;
  discipline: string;
  created_at: string;
  updated_at: string;
}

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

interface StudentProfileData {
  user_id: number;
  name: string;
  email: string;
  academicInterests: {
    preferred_country: string;
    study_level: string;
    discipline: string;
    study_level_name?: string;
    discipline_name?: string;
    country_name?: string;
  };
}

interface EditAcademicInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: {
    preferred_country: string;
    study_level: string;
    discipline: string;
  }) => void;
  initialData: {
    preferred_country: string;
    study_level: string;
    discipline: string;
  };
  studyLevels: StudyLevel[];
  disciplines: Discipline[];
  loadingDisciplines: boolean;
}

// Edit Academic Interests Modal (keep as is)
const EditAcademicInterestsModal: React.FC<EditAcademicInterestsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  studyLevels,
  disciplines,
  loadingDisciplines
}) => {
  const [formData, setFormData] = useState(initialData);
  const [countries, setCountries] = useState<Array<{isoCode: string, name: string}>>([]);

  // Load countries
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries.map(country => ({
      isoCode: country.isoCode,
      name: country.name
    })));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleStudyLevelChange = (studyLevelSlug: string) => {
    setFormData(prev => ({
      ...prev,
      study_level: studyLevelSlug,
      // Clear discipline when study level changes since they're dependent
      discipline: ""
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Academic Interests
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
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
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.study_level || !formData.preferred_country || !formData.discipline || loadingDisciplines}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Profile Section Component
const ProfileSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}> = ({ title, icon, onEdit, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <Edit2 size={16} />
        <span>Edit</span>
      </button>
    </div>
    {children}
  </div>
);

// Main Student Profile Component
const StudentProfile: React.FC = () => {
  const { token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileData>({
    user_id: 1946,
    name: "John Doe",
    email: "john.doe@example.com",
    academicInterests: {
      preferred_country: "",
      study_level: "",
      discipline: "",
      study_level_name: "",
      discipline_name: "",
      country_name: ""
    },
  });

  const [isEditAcademicOpen, setIsEditAcademicOpen] = useState(false);
  const [studyLevels, setStudyLevels] = useState<StudyLevel[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loadingDisciplines, setLoadingDisciplines] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch student profile data
  useEffect(() => {
    fetchStudentProfile();
    fetchStudyLevels();
  }, [token]);

  const fetchStudentProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch(`https://api.applystore.org/api/student`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const studentData = data.data;
          const fullName = `${studentData.first_name || ''} ${studentData.middle_name || ''} ${studentData.last_name || ''}`.trim();
          
          setProfile(prev => ({
            ...prev,
            user_id: studentData.user_id || studentData.id || 1946,
            name: fullName || "No Name Provided",
            email: studentData.email || "No Email Provided"
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch student interests
  useEffect(() => {
    if (token && studyLevels.length > 0) {
      fetchStudentInterests();
    }
  }, [token, studyLevels]);

  const fetchStudentInterests = async () => {
    try {
      const response = await fetch(`https://api.applystore.org/api/student/interests/${profile.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const interests = data.data;
          const countryName = Country.getCountryByCode(interests.preferred_country)?.name || interests.preferred_country;
          
          setProfile(prev => ({
            ...prev,
            academicInterests: {
              ...interests,
              country_name: countryName,
              study_level_name: studyLevels.find(sl => sl.slug === interests.study_level)?.name || interests.study_level,
              discipline_name: interests.discipline.replace(/-/g, ' ').replace(/\b\w/g,( l: string )=> l.toUpperCase())
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching student interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyLevels = async () => {
    try {
      const response = await fetch('https://api.applystore.org/api/student/get/studylevels', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStudyLevels(data.data);
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

      const response = await fetch(`https://api.applystore.org/api/student/get/disciplines/${studyLevel.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success === "1" && data.data) {
          setDisciplines(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching disciplines:', error);
    } finally {
      setLoadingDisciplines(false);
    }
  };

  const handleEditProfileClick = () => {
    router.push(`/student/editProfile/${profile.user_id}`);
  };

  const handleAcademicInterestsSave = async (interests: StudentProfileData['academicInterests']) => {
    try {
      const payload = {
        study_level: interests.study_level,
        preferred_country: interests.preferred_country,
        discipline: interests.discipline
      };

      const response = await fetch(`https://api.applystore.org/api/student/interests/${profile.user_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const countryName = Country.getCountryByCode(interests.preferred_country)?.name || interests.preferred_country;
          const studyLevelName = studyLevels.find(sl => sl.slug === interests.study_level)?.name || interests.study_level;
          const disciplineName = interests.discipline.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          setProfile(prev => ({
            ...prev,
            academicInterests: {
              ...interests,
              country_name: countryName,
              study_level_name: studyLevelName,
              discipline_name: disciplineName
            }
          }));
          setIsEditAcademicOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving academic interests:', error);
    }
  };

  const handleEditAcademicOpen = () => {
    if (profile.academicInterests.study_level) {
      fetchDisciplinesByStudyLevel(profile.academicInterests.study_level);
    }
    setIsEditAcademicOpen(true);
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Profile Information - Now redirects to edit profile page */}
      <ProfileSection
        title="Profile Information"
        icon={<User size={20} className="text-blue-600 dark:text-blue-400" />}
        onEdit={handleEditProfileClick}
      >
        {profileLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {profile.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                  <Mail size={16} />
                  <span>{profile.email}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </ProfileSection>

      {/* Academic Interests */}
      <ProfileSection
        title="Academic Interests"
        icon={<BookOpen size={20} className="text-green-600 dark:text-green-400" />}
        onEdit={handleEditAcademicOpen}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !profile.academicInterests.study_level ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No academic interests selected yet
            </p>
            <button
              onClick={() => setIsEditAcademicOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={16} className="mr-2" />
              Add Academic Interests
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                <Globe size={16} />
                <span>Preferred Country</span>
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                {profile.academicInterests.country_name || profile.academicInterests.preferred_country}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Study Level
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                {profile.academicInterests.study_level_name || profile.academicInterests.study_level}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Field of Interest
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                {profile.academicInterests.discipline_name || profile.academicInterests.discipline}
              </div>
            </div>
          </div>
        )}
      </ProfileSection>

      {/* Test Scores Component */}
      <TestScores />

      {/* Academic Interests Modal */}
      <EditAcademicInterestsModal
        isOpen={isEditAcademicOpen}
        onClose={() => setIsEditAcademicOpen(false)}
        onSave={handleAcademicInterestsSave}
        initialData={profile.academicInterests}
        studyLevels={studyLevels}
        disciplines={disciplines}
        loadingDisciplines={loadingDisciplines}
      />
    </div>
  );
};

export default StudentProfile;