"use client"

import React, { useState, useEffect } from "react";
import { Calendar, Trash2, Save, Plus, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Deadline {
  id?: number;
  deadline_type_id: string;
  deadline_date: string;
  notes: string;
}

interface Intake {
  id?: number;
  course_id?: number;
  intake_id: string;
  intake_year: string;
  is_active: boolean;
  deadlines: Deadline[];
}

interface IntakeOption {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface DeadlineTypeOption {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface CourseIntakeAPI {
  id: number;
  course_id: number;
  intake_id: number;
  intake_year: number;
  deadlines: {
    id: number;
    deadline_type_id: number;
    deadline_date: string;
    extended_date: string | null;
    notes: string;
  }[];
}

interface IntakesManagerProps {
  courseId: string;
  token: string | null;
}

const IntakesManager: React.FC<IntakesManagerProps> = ({ courseId, token }) => {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [intakeOptions, setIntakeOptions] = useState<IntakeOption[]>([]);
  const [deadlineTypeOptions, setDeadlineTypeOptions] = useState<DeadlineTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [savingIntakeId, setSavingIntakeId] = useState<number | null>(null);
  const [deletingIntakeId, setDeletingIntakeId] = useState<number | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch intakes data
  const fetchIntakes = async (deadlineTypes: DeadlineTypeOption[] = deadlineTypeOptions) => {
    if (!token || !courseId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/tenant/course/${courseId}/intakes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const apiIntakes: CourseIntakeAPI[] = result.data;
        const formattedIntakes: Intake[] = apiIntakes.map(intake => {
          // Create a map of existing deadlines for this intake
          const existingDeadlinesMap = new Map(
            intake.deadlines.map(d => [d.deadline_type_id.toString(), d])
          );
          
          // For each deadline type option, create a deadline object
          // Use existing data if available, otherwise create empty one
          const deadlines = deadlineTypes.map(deadlineType => {
            const existingDeadline = existingDeadlinesMap.get(deadlineType.id.toString());
            return {
              id: existingDeadline?.id,
              deadline_type_id: deadlineType.id.toString(),
              deadline_date: existingDeadline?.deadline_date?.split('T')[0] || "",
              notes: existingDeadline?.notes || ""
            };
          });

          return {
            id: intake.id,
            course_id: intake.course_id,
            intake_id: intake.intake_id.toString(),
            intake_year: intake.intake_year.toString(),
            is_active: true, // Assuming active if it exists
            deadlines
          };
        });
        setIntakes(formattedIntakes);
      } else {
        // If no intakes exist yet, create empty array
        setIntakes([]);
      }
    } catch (error) {
      console.error('Error fetching intakes:', error);
      showMessage('error', 'Failed to load intakes');
      setIntakes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch options
  const fetchOptions = async () => {
    try {
      const [intakesRes, deadlineTypesRes] = await Promise.all([
        fetch(`${BASE_URL}/tenant/option/apply_tenant_intakes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BASE_URL}/tenant/option/apply_tenant_course_intake_deadline_types`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [intakesData, deadlineTypesData] = await Promise.all([
        intakesRes.json(),
        deadlineTypesRes.json()
      ]);

      if (intakesData.success) setIntakeOptions(intakesData.data);
      if (deadlineTypesData.success) {
        setDeadlineTypeOptions(deadlineTypesData.data);
        
        // After loading deadline types, fetch intakes and pass the deadline types
        if (courseId) {
          fetchIntakes(deadlineTypesData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    if (token && courseId) {
      fetchOptions();
    }
  }, [token, courseId]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const addNewIntake = () => {
    // Create a new intake with all deadline types pre-populated
    const newDeadlines = deadlineTypeOptions.map(deadlineType => ({
      deadline_type_id: deadlineType.id.toString(),
      deadline_date: "",
      notes: ""
    }));

    setIntakes(prev => [...prev, {
      intake_id: "",
      intake_year: "",
      is_active: true,
      deadlines: newDeadlines
    }]);
  };

  const removeIntake = (index: number) => {
    setIntakes(prev => prev.filter((_, i) => i !== index));
  };

  const updateIntake = (index: number, field: keyof Intake, value: string | boolean) => {
    const updatedIntakes = [...intakes];
    updatedIntakes[index] = {
      ...updatedIntakes[index],
      [field]: value
    };
    setIntakes(updatedIntakes);
  };

  const updateDeadline = (intakeIndex: number, deadlineIndex: number, field: keyof Deadline, value: string) => {
    const updatedIntakes = [...intakes];
    const updatedDeadlines = [...updatedIntakes[intakeIndex].deadlines];
    updatedDeadlines[deadlineIndex] = {
      ...updatedDeadlines[deadlineIndex],
      [field]: value
    };
    updatedIntakes[intakeIndex].deadlines = updatedDeadlines;
    setIntakes(updatedIntakes);
  };

  const saveIntake = async (intake: Intake, index: number) => {
    if (!token || !courseId) {
      showMessage('error', 'Please log in to save intake');
      return;
    }

    // Validate intake
    if (!intake.intake_year || !intake.intake_id) {
      showMessage('error', 'Please fill all intake information');
      return;
    }

    // Filter out deadlines that have no date (user chose not to set a deadline)
    const deadlinesToSave = intake.deadlines.filter(deadline => 
      deadline.deadline_date.trim() !== ""
    );

    // Validate that at least one deadline has a date
    if (deadlinesToSave.length === 0) {
      showMessage('error', 'Please set at least one deadline date');
      return;
    }

    try {
      setSavingIntakeId(intake.id || index);
      
      const payload = {
        id: intake.id || undefined,
        course_id: parseInt(courseId),
        intake_id: parseInt(intake.intake_id),
        intake_year: parseInt(intake.intake_year),
        is_active: intake.is_active,
        deadlines: deadlinesToSave.map(deadline => ({
          id: deadline.id || undefined,
          deadline_type_id: parseInt(deadline.deadline_type_id),
          deadline_date: deadline.deadline_date,
          notes: deadline.notes || ""
        }))
      };

      // Remove undefined id for new intakes
      if (!intake.id) {
        delete payload.id;
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
        fetchIntakes(deadlineTypeOptions);
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
        fetchIntakes(deadlineTypeOptions);
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

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading intakes...</p>
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

      {intakes.map((intake, intakeIndex) => (
        <div
          key={intakeIndex}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Intake {intakeIndex + 1} {intake.id && `(ID: ${intake.id})`}
            </h4>

            
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              >
                <option value="">Select intake</option>
                {intakeOptions?.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            
          </div>

          {/* Deadlines Section - Updated UI without deadline type select */}
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Deadlines
            </h5>
            {intake.deadlines.map((deadline, deadlineIndex) => {
              const deadlineType = deadlineTypeOptions.find(
                option => option.id.toString() === deadline.deadline_type_id
              );
              
              return (
                <div key={deadlineIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
                  {/* <div className="flex justify-between items-center md:col-span-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {deadlineType?.name || `Deadline Type ${deadlineIndex + 1}`}
                      {deadline.id && ` (ID: ${deadline.id})`}
                    </span>
                  </div> */}

                  <div className="">
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">
                      Deadline Type
                    </label>
                    <input
                      type="text"
                      value={deadlineType?.name || ""}
                      disabled
                      placeholder="Optional notes"
                      className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90"
                    />
                  </div>
                  
                  {/* Deadline Date */}
                  <div className="">
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">
                      Deadline Date *
                    </label>
                    <DatePicker
                      selected={deadline.deadline_date ? new Date(deadline.deadline_date) : null}
                      onChange={(date) =>
                        updateDeadline(
                          intakeIndex,
                          deadlineIndex,
                          "deadline_date",
                          date?.toISOString().split("T")[0] || ""
                        )
                      }
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={50}
                      scrollableYearDropdown
                      isClearable
                      className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90"
                    />
                  </div>

                  {/* Notes */}
                  <div className="">
                    <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={deadline.notes || ""}
                      onChange={(e) => updateDeadline(intakeIndex, deadlineIndex, "notes", e.target.value)}
                      placeholder="Optional notes"
                      className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90"
                    />
                  </div>
                </div>
              );
            })}

            {/* Note about deadlines */}
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex gap-2 justify-end">
                    {/* Is Active */}
            <div className="flex items-center">
              {/* <input
                type="checkbox"
                checked={intake.is_active}
                onChange={(e) => updateIntake(intakeIndex, "is_active", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 bg-transparent text-brand-600 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-brand-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Active
              </label> */}
            </div>
              <button
                type="button"
                onClick={() => saveIntake(intake, intakeIndex)}
                disabled={savingIntakeId === (intake.id || intakeIndex)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingIntakeId === (intake.id || intakeIndex) ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={12} />
                    Save
                  </>
                )}
              </button>
              
              {intake.id && (
                <button
                  type="button"
                  onClick={() => deleteIntake(intake.id!)}
                  disabled={deletingIntakeId === intake.id}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingIntakeId === intake.id ? (
                    <>
                      <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={12} />
                      Delete
                    </>
                  )}
                </button>
              )}
              
              {/* <button
                type="button"
                onClick={() => removeIntake(intakeIndex)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <X size={12} />
                Remove
              </button> */}
            </div>
              {/* <p>Note: All deadline types are displayed. Set dates for applicable deadlines, leave empty if not applicable.</p> */}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addNewIntake}
        className="flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
      >
        <Plus size={16} />
        Add New Intake
      </button>
    </div>
  );
};

export default IntakesManager;