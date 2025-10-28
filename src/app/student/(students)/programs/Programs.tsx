"use client"
import React, { useState, useMemo } from "react";
import Badge from "@/components/ui/badge/Badge";
import { DockIcon, DollarSign, GraduationCap, MapPin } from "lucide-react";
import Link from "next/link";

interface Program {
  id: number;
  university: string;
  course: string;
  intake: string;
  status: "Applied" | "Received" | "Submitted to University" | "Documents Pending";
  country?: string;
  degree?: string;
  location?: string;
  applicationFee?: string;
  discipline?: string;
  ielts?: number;
  pte?: number;
  duolingo?: number;
  studyLevel?: string;
  state?: string;
}

// Define the table data using the interface
const tableData: Program[] = [
  {
    id: 1,
    university: "Harvard University",
    course: "Computer Science",
    intake: "Fall 2024",
    status: "Applied",
    discipline: "Engineering",
    country: "United States of America",
    degree: "Bachelors",
    studyLevel: "bachelors",
    location: "Massachusetts, United States of America",
    applicationFee: "N/A",
    ielts: 7.0,
    pte: 68,
    duolingo: 120,
    state: "massachusetts"
  },
  {
    id: 2,
    university: "Stanford University",
    course: "Business Administration",
    intake: "Spring 2024",
    status: "Received",
    discipline: "Business & Economics",
    country: "United States of America",
    degree: "Masters",
    studyLevel: "masters",
    location: "California, United States of America",
    applicationFee: "Waiver",
    ielts: 7.5,
    pte: 70,
    duolingo: 125,
    state: "california"
  },
  {
    id: 3,
    university: "MIT",
    course: "Data Science",
    intake: "Fall 2024",
    status: "Submitted to University",
    discipline: "Computer Science",
    country: "United States of America",
    degree: "Masters",
    studyLevel: "masters",
    location: "Massachusetts, United States of America",
    applicationFee: "80$",
    ielts: 7.0,
    pte: 65,
    duolingo: 115,
    state: "massachusetts"
  },
  {
    id: 4,
    university: "University of Toronto",
    course: "Mechanical Engineering",
    intake: "Winter 2024",
    status: "Documents Pending",
    discipline: "Engineering",
    country: "Canada",
    degree: "Bachelors",
    studyLevel: "bachelors",
    location: "Ontario, Canada",
    applicationFee: "50$",
    ielts: 6.5,
    pte: 60,
    duolingo: 110
  },
  {
    id: 5,
    university: "UBC",
    course: "Psychology",
    intake: "Fall 2024",
    status: "Applied",
    discipline: "Arts & Humanities",
    country: "Canada",
    degree: "Bachelors",
    studyLevel: "bachelors",
    location: "British Columbia, Canada",
    applicationFee: "25$",
    ielts: 6.5,
    pte: 58,
    duolingo: 105
  },
];

type SortField = keyof Program | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  university: string[];
  course: string[];
  studyLevel: string[];
  discipline: string[];
  country: string[];
  state: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  universities: string[];
  courses: string[];
  disciplines: string[];
  countries: string[];
  states: string[];
  studyLevels: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  universities,
  disciplines,
  countries,
  states
}) => {
  const [selectedStudyLevel, setSelectedStudyLevel] = useState<string>("");
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);

  const handleDisciplineChange = (discipline: string) => {
    setSelectedDisciplines(prev =>
      prev.includes(discipline)
        ? prev.filter(d => d !== discipline)
        : [...prev, discipline]
    );
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleStateChange = (state: string) => {
    setSelectedStates(prev =>
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleUniversityChange = (university: string) => {
    setSelectedUniversities(prev =>
      prev.includes(university)
        ? prev.filter(u => u !== university)
        : [...prev, university]
    );
  };

  const handleApply = () => {
    const filters: FilterOptions = {
      university: selectedUniversities,
      course: [], // You can add course selection if needed
      studyLevel: selectedStudyLevel ? [selectedStudyLevel] : [],
      discipline: selectedDisciplines,
      country: selectedCountries,
      state: selectedStates,
    };
    onApply(filters);
    onClose();
  };

  // const handleReset = () => {
  //   setSelectedStudyLevel("");
  //   setSelectedDisciplines([]);
  //   setSelectedCountries([]);
  //   setSelectedStates([]);
  //   setSelectedUniversities([]);
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-99999">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="modal-content">
          <div className="modal-header flex justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h5 className="modal-title text-lg font-semibold text-gray-800 dark:text-white">
              Filter courses by
            </h5>
            <button 
              type="button" 
              className="btn-close text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={onClose}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="modal-body p-6 space-y-6">
            {/* Study Level */}
            <div className="subject-area mb-3">
              <label htmlFor="subjectArea" className="form-label fw-bold filter-heading block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Study Level
              </label>
              <div className="input-group">
                <select 
                  className="form-select selected_study_level w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  name="selected_study_level[]" 
                  id="subjectArea" 
                  value={selectedStudyLevel}
                  onChange={(e) => setSelectedStudyLevel(e.target.value)}
                >
                  <option value="">Select Study Level</option>
                  <option value="bachelors">Bachelors</option>
                  <option value="masters">Masters</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            </div>

            {/* Discipline */}
            <div className="mb-3">
              <label className="form-label fw-bold filter-heading block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Discipline
              </label>
              <div className="row disciplines_select grid grid-cols-1 md:grid-cols-2 gap-3">
                {disciplines.map((discipline) => (
                  <div key={discipline} className="col-lg-6">
                    <div className="form-check">
                      <input 
                        className="form-check-input"
                        type="checkbox" 
                        name="selected_discipline" 
                        id={discipline}
                        value={discipline}
                        checked={selectedDisciplines.includes(discipline)}
                        onChange={() => handleDisciplineChange(discipline)}
                      />
                      <label className="form-check-label ml-2 text-sm text-gray-700 dark:text-gray-300" htmlFor={discipline}>
                        {discipline.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Destinations */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label fw-bold filter-heading block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Study destinations
                </label>
              </div>
              <div className="row grid grid-cols-1 md:grid-cols-2 gap-3" id="country_list">
                {countries.map((country) => (
                  <div key={country} className="col-lg-6">
                    <div className="form-check">
                      <input 
                        className="form-check-input"
                        type="checkbox" 
                        name="selected_country" 
                        id={country}
                        value={country}
                        checked={selectedCountries.includes(country)}
                        onChange={() => handleCountryChange(country)}
                      />
                      <label className="form-check-label ml-2 text-sm text-gray-700 dark:text-gray-300" htmlFor={country}>
                        {country.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* States */}
            <div className="mb-3 large-list-container">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label fw-bold filter-heading block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  States
                </label>
                <button className="small show-all fw-bold text-sm text-brand-500 hover:text-brand-600">
                  Show all <i className="bi bi-caret-down-fill"></i>
                </button>
              </div>
              <div className="row large-list grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto" id="states_list">
                {states.map((state) => (
                  <div key={state} className="col-lg-6">
                    <div className="form-check">
                      <input 
                        className="form-check-input"
                        type="checkbox" 
                        name="selected_state" 
                        id={state}
                        value={state}
                        checked={selectedStates.includes(state)}
                        onChange={() => handleStateChange(state)}
                      />
                      <label className="form-check-label ml-2 text-sm text-gray-700 dark:text-gray-300" htmlFor={state}>
                        {state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institution */}
            <div className="mb-3 large-list-container">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label fw-bold filter-heading block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Universities
                </label>
                <button className="small show-all fw-bold text-sm text-brand-500 hover:text-brand-600">
                  Show all <i className="bi bi-caret-down-fill"></i>
                </button>
              </div>
              <div className="row large-list grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto" id="university-list">
                {universities.map((university) => (
                  <div key={university} className="col-lg-6">
                    <div className="form-check">
                      <input 
                        className="form-check-input"
                        type="checkbox" 
                        name="selected_university" 
                        id={university}
                        value={university}
                        checked={selectedUniversities.includes(university)}
                        onChange={() => handleUniversityChange(university)}
                      />
                      <label className="form-check-label ml-2 text-sm text-gray-700 dark:text-gray-300" htmlFor={university}>
                        {university.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button 
              type="button" 
              className="btn btn-outline-secondary flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary apply-filter d-flex flex-1 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
              onClick={handleApply}
            >
              <span className="d-block me-2">Apply filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgramCard: React.FC<{ program: Program }> = ({ program }) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
      {/* Top Section */}
      <div className="flex items-start justify-between">
        {/* University Info */}
        <div className="flex items-start gap-3">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
            {program.university.split(' ').map(word => word[0]).join('')}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white leading-snug">
              {program.course}
            </h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {program.university}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 space-y-3">
        {/* Degree */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <GraduationCap size={18}/>
          <div>
            <span className="block">Degree</span>
            <strong className="block font-semibold text-gray-800 dark:text-white">{program.degree}</strong>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <MapPin size={18}/>
          <div>
            <span className="block">Location</span>
            <strong className="block font-semibold text-gray-800 dark:text-white">{program.location}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <DollarSign size={18}/>
          <div>
            <span className="block">Fee</span>
            <strong className="block font-semibold text-gray-800 dark:text-white">Application Fee - {program.applicationFee}</strong>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <DockIcon size={18}/>
          <div>
            <span className="block">Discipline</span>
            <strong className="block font-semibold text-gray-800 dark:text-white">{program.discipline}</strong>
          </div>
        </div>
      </div>

      {/* Entry Requirements */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
          ENTRY REQUIREMENTS
        </h3>
        <div className="flex gap-2 flex-wrap">
          {program.ielts && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              IELTS: <span className="text-gray-900 dark:text-white">{program.ielts}</span>
            </span>
          )}
          {program.pte && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              PTE: <span className="text-gray-900 dark:text-white">{program.pte}</span>
            </span>
          )}
          {program.duolingo && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-semibold text-gray-700 dark:text-gray-300">
              Duolingo: <span className="text-gray-900 dark:text-white">{program.duolingo}</span>
            </span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <Link href={`/student/programs/${program.id}`}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-center dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm transition-all"
        >
       
          VIEW COURSE DETAILS
      
        </Link>
      </div>
    </div>
  );
};

export default function ProgramCards() {
  const [sortField] = useState<SortField>("");
  const [sortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    university: [],
    course: [],
    studyLevel: [],
    discipline: [],
    country: [],
    state: [],
  });

  // Get unique values for filters
  const universities = useMemo(() => {
    return Array.from(new Set(tableData.map(app => app.university)));
  }, []);

  const courses = useMemo(() => {
    return Array.from(new Set(tableData.map(app => app.course)));
  }, []);

  const disciplines = useMemo(() => [
    "aeronautics", "agriculture-studies", "applied-science", "architecture-planning",
    "arts-humanities", "business-economics", "commerce", "communication-journalism",
    "computer-science", "design", "education", "engineering", "engineering-technology", 
    
  ], []);

  const countries = useMemo(() => [
    "australia", "canada", "germany", "united-kingdom", "united-states-of-america"
  ], []);

  const states = useMemo(() => [
    "alabama", "alaska", "arizona", "arkansas", "bad-honnef", "bavaria", "berlin",
    "british-columbia", "california", "connecticut", "delaware", "dortmund", "england",
    "florida", "georgia", "glasgow", "hamburg", "hesse", "illinois", "indiana", "kansas",
    "kentucky", "las-vegas", "manchester", "massachusetts", "michigan", "mississippi",
    "missouri", "munich", "nebraska", "nevada", "new-hampshire", "new-jersey",
    "new-south-wales", "new-york", "north-carolina", "nova-scotia", "ohio", "oklahoma",
    "pennsylvania", "rhode-island", "san-francisco", "saxony", "scotland", "south-carolina",
    "tennessee", "texas", "victoria", "wales", "washington", "wisconsin", "wyoming"
  ], []);

  const studyLevels = useMemo(() => ["bachelors", "masters", "phd"], []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = tableData.filter((program) => {
      const matchesUniversity = filters.university.length === 0 || filters.university.includes(program.university);
      const matchesCourse = filters.course.length === 0 || filters.course.includes(program.course);
      const matchesStudyLevel = filters.studyLevel.length === 0 || (program.studyLevel && filters.studyLevel.includes(program.studyLevel));
      const matchesDiscipline = filters.discipline.length === 0 || (program.discipline && filters.discipline.some(d => program.discipline?.toLowerCase().includes(d.toLowerCase())));
      const matchesCountry = filters.country.length === 0 || (program.country && filters.country.some(c => program.country?.toLowerCase().includes(c.toLowerCase())));
      const matchesState = filters.state.length === 0 || (program.state && filters.state.includes(program.state));
      
      return matchesUniversity && matchesCourse && matchesStudyLevel && matchesDiscipline && matchesCountry && matchesState;
    });

    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sortDirection === "asc" ? 1 : -1;
        if (bValue === undefined) return sortDirection === "asc" ? -1 : 1;
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [filters, sortField, sortDirection]);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(filterArray => filterArray.length > 0);

  const clearAllFilters = () => {
    setFilters({
      university: [],
      course: [],
      studyLevel: [],
      discipline: [],
      country: [],
      state: [],
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Filter Button and Active Filters */}
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Apply Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.studyLevel.map(level => (
            <Badge key={level} size="sm" color="primary">
              Study Level: {level}
            </Badge>
          ))}
          {filters.discipline.map(discipline => (
            <Badge key={discipline} size="sm" color="primary">
              Discipline: {discipline}
            </Badge>
          ))}
          {filters.country.map(country => (
            <Badge key={country} size="sm" color="primary">
              Country: {country}
            </Badge>
          ))}
          {filters.state.map(state => (
            <Badge key={state} size="sm" color="primary">
              State: {state}
            </Badge>
          ))}
          {filters.university.map(university => (
            <Badge key={university} size="sm" color="primary">
              University: {university}
            </Badge>
          ))}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedData.length > 0 ? (
          filteredAndSortedData.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No programs found matching your criteria.
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedData.length} of {tableData.length} programs
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        universities={universities}
        courses={courses}
        disciplines={disciplines}
        countries={countries}
        states={states}
        studyLevels={studyLevels}
      />
    </div>
  );
}