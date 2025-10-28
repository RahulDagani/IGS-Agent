"use client"
import React, { useState } from "react";
import { Edit2, Mail, User, Globe, BookOpen, Award } from "lucide-react";

interface StudentProfile {
  name: string;
  email: string;
  academicInterests: {
    countries: string[];
    studyLevels: string[];
    disciplines: string[];
  };
  testScores: {
    [key: string]: {
      taken: boolean;
      score?: string;
      date?: string;
    };
  };
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: { name: string; email: string }) => void;
  initialData: { name: string; email: string };
}

interface EditAcademicInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: {
    countries: string[];
    studyLevels: string[];
    disciplines: string[];
  }) => void;
  initialData: {
    countries: string[];
    studyLevels: string[];
    disciplines: string[];
  };
}

interface EditTestScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scores: StudentProfile['testScores']) => void;
  initialData: StudentProfile['testScores'];
}

// Edit Profile Modal
const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Profile
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
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
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Academic Interests Modal
const EditAcademicInterestsModal: React.FC<EditAcademicInterestsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [interests, setInterests] = useState(initialData);

  const countries = [
    "United States", "Canada", "United Kingdom", "Australia", "Germany",
    "France", "Netherlands", "Singapore", "Japan", "South Korea"
  ];

  const studyLevels = [
    "Undergraduate", "Graduate", "PhD", "Diploma", "Certificate"
  ];

  const disciplines = [
    "Computer Science", "Business Administration", "Engineering",
    "Medicine", "Arts & Humanities", "Social Sciences",
    "Natural Sciences", "Law", "Education", "Architecture"
  ];

  const toggleCountry = (country: string) => {
    setInterests(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  const toggleStudyLevel = (level: string) => {
    setInterests(prev => ({
      ...prev,
      studyLevels: prev.studyLevels.includes(level)
        ? prev.studyLevels.filter(l => l !== level)
        : [...prev.studyLevels, level]
    }));
  };

  const toggleDiscipline = (discipline: string) => {
    setInterests(prev => ({
      ...prev,
      disciplines: prev.disciplines.includes(discipline)
        ? prev.disciplines.filter(d => d !== discipline)
        : [...prev.disciplines, discipline]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(interests);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Academic Interests
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Countries Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Preferred Countries
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {countries.map(country => (
                <label key={country} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interests.countries.includes(country)}
                    onChange={() => toggleCountry(country)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Study Levels Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Study Levels
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {studyLevels.map(level => (
                <label key={level} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interests.studyLevels.includes(level)}
                    onChange={() => toggleStudyLevel(level)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Disciplines Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Fields of Interest
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {disciplines.map(discipline => (
                <label key={discipline} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={interests.disciplines.includes(discipline)}
                    onChange={() => toggleDiscipline(discipline)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{discipline}</span>
                </label>
              ))}
            </div>
          </div>

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
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Test Scores Modal
const EditTestScoresModal: React.FC<EditTestScoresModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [testScores, setTestScores] = useState(initialData);

  const tests = [
    { id: "sat", name: "SAT", maxScore: "1600", placeholder: "Enter SAT score" },
    { id: "act", name: "ACT", maxScore: "36", placeholder: "Enter ACT score" },
    { id: "toefl", name: "TOEFL", maxScore: "120", placeholder: "Enter TOEFL score" },
    { id: "pte", name: "PTE", maxScore: "90", placeholder: "Enter PTE score" },
    { id: "duolingo", name: "Duolingo", maxScore: "160", placeholder: "Enter Duolingo score" },
    { id: "ielts", name: "IELTS", maxScore: "9.0", placeholder: "Enter IELTS score" },
  ];

  const handleTestToggle = (testId: string) => {
    setTestScores(prev => ({
      ...prev,
      [testId]: {
        taken: !prev[testId]?.taken,
        score: prev[testId]?.score || "",
        date: prev[testId]?.date || ""
      }
    }));
  };

  const handleScoreChange = (testId: string, score: string) => {
    setTestScores(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        score
      }
    }));
  };

  const handleDateChange = (testId: string, date: string) => {
    setTestScores(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        date
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(testScores);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Test Scores
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {tests.map(test => (
              <div key={test.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <label className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={testScores[test.id]?.taken || false}
                      onChange={() => handleTestToggle(test.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {test.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (Max: {test.maxScore})
                    </span>
                  </div>
                </label>
                
                {testScores[test.id]?.taken && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Score
                      </label>
                      <input
                        type="text"
                        value={testScores[test.id]?.score || ""}
                        onChange={(e) => handleScoreChange(test.id, e.target.value)}
                        placeholder={test.placeholder}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Test Date
                      </label>
                      <input
                        type="date"
                        value={testScores[test.id]?.date || ""}
                        onChange={(e) => handleDateChange(test.id, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            >
              Save Scores
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
  const [profile, setProfile] = useState<StudentProfile>({
    name: "John Doe",
    email: "john.doe@example.com",
    academicInterests: {
      countries: ["United States", "Canada"],
      studyLevels: ["Undergraduate", "Graduate"],
      disciplines: ["Computer Science", "Business Administration"],
    },
    testScores: {
      sat: { taken: true, score: "1450", date: "2023-05-15" },
      toefl: { taken: true, score: "105", date: "2023-06-20" },
      ielts: { taken: false },
      act: { taken: false },
      pte: { taken: false },
      duolingo: { taken: false },
    },
  });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAcademicOpen, setIsEditAcademicOpen] = useState(false);
  const [isEditTestScoresOpen, setIsEditTestScoresOpen] = useState(false);

  const handleProfileSave = (newProfile: { name: string; email: string }) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
    setIsEditProfileOpen(false);
  };

  const handleAcademicInterestsSave = (interests: StudentProfile['academicInterests']) => {
    setProfile(prev => ({ ...prev, academicInterests: interests }));
    setIsEditAcademicOpen(false);
  };

  const handleTestScoresSave = (scores: StudentProfile['testScores']) => {
    setProfile(prev => ({ ...prev, testScores: scores }));
    setIsEditTestScoresOpen(false);
  };

  return (
    <div className=" mx-auto space-y-6">
      {/* Profile Information */}
      <ProfileSection
        title="Profile Information"
        icon={<User size={20} className="text-blue-600 dark:text-blue-400" />}
        onEdit={() => setIsEditProfileOpen(true)}
      >
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
      </ProfileSection>

      {/* Academic Interests */}
      <ProfileSection
        title="Academic Interests"
        icon={<BookOpen size={20} className="text-green-600 dark:text-green-400" />}
        onEdit={() => setIsEditAcademicOpen(true)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
              <Globe size={16} />
              <span>Preferred Countries</span>
            </h5>
            <div className="space-y-2">
              {profile.academicInterests.countries.map(country => (
                <div key={country} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  {country}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Study Levels
            </h5>
            <div className="space-y-2">
              {profile.academicInterests.studyLevels.map(level => (
                <div key={level} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  {level}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Fields of Interest
            </h5>
            <div className="space-y-2">
              {profile.academicInterests.disciplines.map(discipline => (
                <div key={discipline} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  {discipline}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProfileSection>

      {/* Test Scores */}
      <ProfileSection
        title="English / Standardized Test Scores"
        icon={<Award size={20} className="text-orange-600 dark:text-orange-400" />}
        onEdit={() => setIsEditTestScoresOpen(true)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(profile.testScores).map(([test, data]) => (
            data.taken ? (
              <div key={test} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h6 className="font-medium text-gray-800 dark:text-white capitalize">
                    {test}
                  </h6>
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.score}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Date: {data.date}
                  </p>
                </div>
              </div>
            ) : (
              <div key={test} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-60">
                <div className="flex justify-between items-start mb-2">
                  <h6 className="font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {test}
                  </h6>
                  <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded-full">
                    Not Taken
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No score recorded
                </p>
              </div>
            )
          ))}
        </div>
      </ProfileSection>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleProfileSave}
        initialData={{ name: profile.name, email: profile.email }}
      />

      <EditAcademicInterestsModal
        isOpen={isEditAcademicOpen}
        onClose={() => setIsEditAcademicOpen(false)}
        onSave={handleAcademicInterestsSave}
        initialData={profile.academicInterests}
      />

      <EditTestScoresModal
        isOpen={isEditTestScoresOpen}
        onClose={() => setIsEditTestScoresOpen(false)}
        onSave={handleTestScoresSave}
        initialData={profile.testScores}
      />
    </div>
  );
};

export default StudentProfile;