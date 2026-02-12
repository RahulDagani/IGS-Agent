"use client"

import React, { useState, useEffect } from "react";
import { Trash2, Save, Plus } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Intake {
  id?: number;
  course_id?: number;
  intake_id: string;
  intake_year: string;
  course_start_date: string;
  application_start_date: string;
  application_deadline: string;
  status: 'upcoming' | 'open' | 'closed' | 'ongoing' | 'completed';
  is_active: boolean;
}

interface IntakeOption {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface IntakesManagerProps {
  courseId: string;
  token: string | null;
  initialIntakes?: any[]; // The intakes data from courseData?.intakes
}

const IntakesManager: React.FC<IntakesManagerProps> = ({ 
  courseId, 
  token, 
  initialIntakes = [] 
}) => {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [intakeOptions, setIntakeOptions] = useState<IntakeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [savingIntakeId, setSavingIntakeId] = useState<number | null>(null);
  const [deletingIntakeId, setDeletingIntakeId] = useState<number | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Format initial intakes from parent component
  useEffect(() => {
    if (initialIntakes && initialIntakes.length > 0) {
      const formattedIntakes: Intake[] = initialIntakes.map((intake: any) => ({
        id: intake.id,
        course_id: intake.course_id,
        intake_id: intake.intake_id?.toString() || "",
        intake_year: intake.intake_year?.toString() || "",
        course_start_date: intake.course_start_date?.split('T')[0] || "",
        application_start_date: intake.application_start_date?.split('T')[0] || "",
        application_deadline: intake.application_deadline?.split('T')[0] || "",
        status: intake.status || 'upcoming',
        is_active: intake.is_active !== undefined ? intake.is_active : true
      }));
      setIntakes(formattedIntakes);
    }
  }, [initialIntakes]);

  // Fetch intake options
  useEffect(() => {
    const fetchOptions = async () => {
      if (!token) return;

      try {
        setIsLoadingOptions(true);
        const intakesRes = await fetch(`${BASE_URL}/tenant/option/apply_tenant_intakes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const intakesData = await intakesRes.json();
        if (intakesData.success) {
          setIntakeOptions(intakesData.data);
        }
      } catch (error) {
        console.error('Error fetching intake options:', error);
        showMessage('error', 'Failed to load intake options');
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [token]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const addNewIntake = () => {
    setIntakes(prev => [...prev, {
      intake_id: "",
      intake_year: "",
      course_start_date: "",
      application_start_date: "",
      application_deadline: "",
      status: "upcoming",
      is_active: true
    }]);
  };

  const removeIntake = (index: number) => {
    if (window.confirm('Are you sure you want to remove this unsaved intake?')) {
      setIntakes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateIntake = (index: number, field: keyof Intake, value: string | boolean) => {
    const updatedIntakes = [...intakes];
    updatedIntakes[index] = {
      ...updatedIntakes[index],
      [field]: value
    };
    setIntakes(updatedIntakes);
  };

  const saveIntake = async (intake: Intake, index: number) => {
    if (!token || !courseId) {
      showMessage('error', 'Please log in to save intake');
      return;
    }

    // Validate required fields
    if (!intake.intake_year) {
      showMessage('error', 'Please select intake year');
      return;
    }
    if (!intake.intake_id) {
      showMessage('error', 'Please select intake');
      return;
    }
    if (!intake.course_start_date) {
      showMessage('error', 'Please select course start date');
      return;
    }
    if (!intake.application_start_date) {
      showMessage('error', 'Please select application start date');
      return;
    }
    if (!intake.application_deadline) {
      showMessage('error', 'Please select application deadline');
      return;
    }

    try {
      setSavingIntakeId(intake.id || index);
      
      const payload: any = {
        course_id: parseInt(courseId),
        intake_id: parseInt(intake.intake_id),
        intake_year: parseInt(intake.intake_year),
        course_start_date: intake.course_start_date,
        application_start_date: intake.application_start_date,
        application_deadline: intake.application_deadline,
        status: intake.status,
        is_active: intake.is_active
      };

      // Add id for existing intakes
      if (intake.id) {
        payload.id = intake.id;
      }

      const response = await fetch(`${BASE_URL}/tenant/course/intake/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        showMessage('success', 'Intake saved successfully');

         const courseRes = await fetch(`${BASE_URL}/tenant/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (courseRes.ok) {
        const { data } = await courseRes.json();
        const intakes = data?.intakes || [];
        
        // Format and set the updated intakes
        const formattedIntakes: Intake[] = intakes.map((intake: any) => ({
          id: intake.id,
          course_id: intake.course_id,
          intake_id: intake.intake_id?.toString() || "",
          intake_year: intake.intake_year?.toString() || "",
          course_start_date: intake.course_start_date?.split('T')[0] || "",
          application_start_date: intake.application_start_date?.split('T')[0] || "",
          application_deadline: intake.application_deadline?.split('T')[0] || "",
          status: intake.status || 'upcoming',
          is_active: intake.is_active !== undefined ? intake.is_active : true
        }));
        
        setIntakes(formattedIntakes);
      }else {
      throw new Error(result.message || 'Failed to save intake');
    }
       
        
      } else {
        throw new Error(result.message || 'Failed to save intake');
      }
    } catch (error) {
      console.error('Error saving intake:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to save intake');
    } finally {
      setSavingIntakeId(null);
    }
  };

  const deleteIntake = async (intakeId: number) => {
    if (!token || !courseId || !intakeId) {
      showMessage('error', 'Cannot delete intake');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this intake? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingIntakeId(intakeId);
      
      const response = await fetch(`${BASE_URL}/tenant/course/${courseId}/intake/${intakeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();
      
      if (result.success) {
        showMessage('success', 'Intake deleted successfully');
        // Remove the deleted intake from local state
        setIntakes(prev => prev.filter(intake => intake.id !== intakeId));
      } else {
        throw new Error(result.message || 'Failed to delete intake');
      }
    } catch (error) {
      console.error('Error deleting intake:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to delete intake');
    } finally {
      setDeletingIntakeId(null);
    }
  };

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' }
  ];

  if (isLoadingOptions && intakeOptions.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading intake options...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {intakes.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No intakes added yet.</p>
          <button
            type="button"
            onClick={addNewIntake}
            className="mt-4 flex items-center gap-2 mx-auto text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
          >
            <Plus size={16} />
            Add New Intake
          </button>
        </div>
      ) : (
        <>
          {intakes.map((intake, intakeIndex) => (
            <div
              key={intake.id || `new-${intakeIndex}`}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Intake {intakeIndex + 1} {intake.id && `(ID: ${intake.id})`}
                </h4>
                {!intake.id && (
                  <button
                    type="button"
                    onClick={() => removeIntake(intakeIndex)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Intake Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Intake Year *
                  </label>
                  <select
                    value={intake.intake_year || ""}
                    onChange={(e) => updateIntake(intakeIndex, "intake_year", e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Select year</option>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Intake Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Intake *
                  </label>
                  <select
                    value={intake.intake_id || ""}
                    onChange={(e) => updateIntake(intakeIndex, "intake_id", e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    disabled={isLoadingOptions}
                  >
                    <option value="">{isLoadingOptions ? "Loading..." : "Select intake"}</option>
                    {intakeOptions?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Status *
                  </label>
                  <select
                    value={intake.status || "upcoming"}
                    onChange={(e) => updateIntake(intakeIndex, "status", e.target.value as any)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Course Start Date *
                  </label>
                  <DatePicker
                    selected={intake.course_start_date ? new Date(intake.course_start_date) : null}
                    onChange={(date) =>
                      updateIntake(
                        intakeIndex,
                        "course_start_date",
                        date ? date.toISOString().split("T")[0] : ""
                      )
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={50}
                    scrollableYearDropdown
                    isClearable
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                {/* Application Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Application Start Date *
                  </label>
                  <DatePicker
                    selected={intake.application_start_date ? new Date(intake.application_start_date) : null}
                    onChange={(date) =>
                      updateIntake(
                        intakeIndex,
                        "application_start_date",
                        date ? date.toISOString().split("T")[0] : ""
                      )
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={50}
                    scrollableYearDropdown
                    isClearable
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                {/* Application Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Application Deadline *
                  </label>
                  <DatePicker
                    selected={intake.application_deadline ? new Date(intake.application_deadline) : null}
                    onChange={(date) =>
                      updateIntake(
                        intakeIndex,
                        "application_deadline",
                        date ? date.toISOString().split("T")[0] : ""
                      )
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select deadline"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={50}
                    scrollableYearDropdown
                    isClearable
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
              </div>

              {/* Is Active Checkbox */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id={`is_active_${intake.id || intakeIndex}`}
                  checked={intake.is_active}
                  onChange={(e) => updateIntake(intakeIndex, "is_active", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 bg-transparent text-brand-600 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-brand-500"
                />
                <label 
                  htmlFor={`is_active_${intake.id || intakeIndex}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Active
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  type="button"
                  onClick={() => saveIntake(intake, intakeIndex)}
                  disabled={savingIntakeId === (intake.id || intakeIndex)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingIntakeId === (intake.id || intakeIndex) ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Intake
                    </>
                  )}
                </button>
                
                {intake.id && (
                  <button
                    type="button"
                    onClick={() => deleteIntake(intake.id!)}
                    disabled={deletingIntakeId === intake.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingIntakeId === intake.id ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete Intake
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addNewIntake}
            className="flex items-center gap-2 px-4 py-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium border border-brand-300 dark:border-brand-700 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20"
          >
            <Plus size={16} />
            Add New Intake
          </button>
        </>
      )}
    </div>
  );
};

export default IntakesManager;