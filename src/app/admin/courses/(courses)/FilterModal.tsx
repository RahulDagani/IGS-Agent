// app/admin/courses/FilterModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface FilterOption {
  id: number;
  name: string;
}

interface UniversityFilter {
  id: number;
  university: string;
  country_code: string;
  state_code: string;
  city_code: string;
}

interface Location {
  country_code: string;
  state_code?: string;
  city_code?: string;
}

interface Filters {
  studyLevels: FilterOption[];
  disciplines: FilterOption[];
  universities: UniversityFilter[];
  locations: {
    countries: Location[];
    states: Location[];
    cities: Location[];
  };
  tuitionRange: {
    min: string;
    max: string;
  };
}

interface FilterState {
  discipline_id: number[];
  study_level_id: number[];
  country_code: string[];
  university_id: number[];
  tuition_min?: string;
  tuition_max?: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  filters: Filters | null;
  appliedFilters: FilterState;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  filters,
  appliedFilters,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(appliedFilters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    studyLevel: true,
    discipline: true,
    university: true,
    location: true,
    tuition: true,
  });

  // Initialize local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  if (!isOpen || !filters) return null;

  // Handle checkbox changes
  const handleCheckboxChange = (
    type: keyof FilterState,
    value: number | string,
    checked: boolean
  ) => {
    setLocalFilters((prev) => {
      const currentArray = (prev[type] as (number | string)[]) || [];
      
      if (checked) {
        return {
          ...prev,
          [type]: [...currentArray, value],
        };
      } else {
        return {
          ...prev,
          [type]: currentArray.filter((item) => item !== value),
        };
      }
    });
  };

  // Handle tuition range changes
  const handleTuitionChange = (field: "tuition_min" | "tuition_max", value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value.trim() === "" ? undefined : value,
    }));
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Reset all filters
  const handleReset = () => {
    setLocalFilters({
      discipline_id: [],
      study_level_id: [],
      country_code: [],
      university_id: [],
    });
  };

  // Apply filters
  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className="relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Filter courses by different criteria
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Study Levels */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Study Levels
                    </h4>
                    <button
                      onClick={() => toggleSection("studyLevel")}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {expandedSections.studyLevel ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {expandedSections.studyLevel && (
                    <div className="space-y-2">
                      {filters.studyLevels.map((level) => (
                        <label
                          key={level.id}
                          className="flex cursor-pointer items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            checked={localFilters.study_level_id.includes(level.id)}
                            onChange={(e) =>
                              handleCheckboxChange("study_level_id", level.id, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {level.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Disciplines */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Disciplines
                    </h4>
                    <button
                      onClick={() => toggleSection("discipline")}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {expandedSections.discipline ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {expandedSections.discipline && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filters.disciplines.map((discipline) => (
                        <label
                          key={discipline.id}
                          className="flex cursor-pointer items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            checked={localFilters.discipline_id.includes(discipline.id)}
                            onChange={(e) =>
                              handleCheckboxChange("discipline_id", discipline.id, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {discipline.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Universities */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Universities
                    </h4>
                    <button
                      onClick={() => toggleSection("university")}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {expandedSections.university ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {expandedSections.university && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filters.universities.map((university) => (
                        <label
                          key={university.id}
                          className="flex cursor-pointer items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            checked={localFilters.university_id.includes(university.id)}
                            onChange={(e) =>
                              handleCheckboxChange("university_id", university.id, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {university.university} ({university.country_code})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Locations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Locations
                    </h4>
                    <button
                      onClick={() => toggleSection("location")}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {expandedSections.location ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {expandedSections.location && (
                    <div className="space-y-4">
                      {/* Countries */}
                      <div>
                        <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Countries
                        </h5>
                        <div className="space-y-2">
                          {filters.locations.countries.map((country) => (
                            <label
                              key={country.country_code}
                              className="flex cursor-pointer items-center gap-3"
                            >
                              <input
                                type="checkbox"
                                checked={localFilters.country_code.includes(country.country_code)}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    "country_code",
                                    country.country_code,
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {country.country_code}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tuition Range */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Tuition Fee Range
                    </h4>
                    <button
                      onClick={() => toggleSection("tuition")}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {expandedSections.tuition ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {expandedSections.tuition && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Minimum ($)
                        </label>
                        <input
                          type="number"
                          value={localFilters.tuition_min || ""}
                          onChange={(e) => handleTuitionChange("tuition_min", e.target.value)}
                          placeholder={filters.tuitionRange.min}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Maximum ($)
                        </label>
                        <input
                          type="number"
                          value={localFilters.tuition_max || ""}
                          onChange={(e) => handleTuitionChange("tuition_max", e.target.value)}
                          placeholder={filters.tuitionRange.max}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                onClick={handleReset}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Reset All
              </button>
              <button
                onClick={handleApply}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}