"use client"
import React, { useState, useEffect } from "react";
import { Briefcase, Building, MapPin, Calendar, DollarSign, Clock, Edit, Plus, Save, X, AlertCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";

interface WorkExperience {
  id?: number;
  organisation_name: string;
  organisation_address: string;
  position_title: string;
  job_profile: string;
  salary_mode: string;
  employment_type: string;
  working_from: string;
  working_upto: string | null;
  is_currently_working: number;
}

interface WorkExperienceFormData {
  organisation_name: string;
  organisation_address: string;
  position_title: string;
  job_profile: string;
  salary_mode: string;
  employment_type: string;
  working_from: string;
  working_upto: string | null;
  is_currently_working: number;
}

const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onClick, disabled }, ref) => (
    <input type="text" value={value || ""} onClick={onClick} ref={ref} readOnly disabled={disabled} placeholder="Select date"
      className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  )
);
CustomDateInput.displayName = "CustomDateInput";

export default function WorkExperience() {
  const { token } = useAuth();
  const { id: studentId } = useParams();
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const salaryModes = ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Other'];
  const employmentTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];

  const [formData, setFormData] = useState<WorkExperienceFormData>({
    organisation_name: "", organisation_address: "", position_title: "",
    job_profile: "", salary_mode: "", employment_type: "",
    working_from: "", working_upto: null, is_currently_working: 0,
  });

  useEffect(() => { fetchExperiences(); }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/agent/student/work/experience/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch work experiences');
      const result = await response.json();
      if (result.success) {
        setExperiences((result.data || []).map((exp: WorkExperience) => ({
          ...exp,
          working_from: exp.working_from ? exp.working_from.split('T')[0] : '',
          working_upto: exp.working_upto ? exp.working_upto.split('T')[0] : null,
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch work experiences');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.organisation_name.trim()) errors.organisation_name = "Organization name is required";
    if (!formData.organisation_address.trim()) errors.organisation_address = "Organization address is required";
    if (!formData.position_title.trim()) errors.position_title = "Position title is required";
    if (!formData.job_profile.trim()) errors.job_profile = "Job profile is required";
    if (!formData.salary_mode) errors.salary_mode = "Salary mode is required";
    if (!formData.employment_type) errors.employment_type = "Employment type is required";
    if (!formData.working_from) errors.working_from = "Start date is required";
    if (!formData.is_currently_working && !formData.working_upto) errors.working_upto = "End date is required when not currently working";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (formErrors[name]) setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked ? 1 : 0, ...(name === 'is_currently_working' && checked ? { working_upto: null } : {}) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | null, field: 'working_from' | 'working_upto') => {
    const value = date ? date.toISOString().split('T')[0] : '';
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const resetForm = () => {
    setFormData({ organisation_name: "", organisation_address: "", position_title: "", job_profile: "", salary_mode: "", employment_type: "", working_from: "", working_upto: null, is_currently_working: 0 });
    setFormErrors({}); setEditingId(null); setIsAdding(false);
  };

  const handleEdit = (experience: WorkExperience) => {
    setFormData({
      organisation_name: experience.organisation_name, organisation_address: experience.organisation_address,
      position_title: experience.position_title, job_profile: experience.job_profile,
      salary_mode: experience.salary_mode, employment_type: experience.employment_type,
      working_from: experience.working_from.split('T')[0],
      working_upto: experience.working_upto ? experience.working_upto.split('T')[0] : null,
      is_currently_working: experience.is_currently_working,
    });
    setEditingId(experience.id || null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${BASE_URL}/agent/student/work/experience/${editingId}/${studentId}`
        : `${BASE_URL}/agent/student/work/experience/${studentId}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save work experience');
      setSuccessMessage(result.message);
      resetForm();
      fetchExperiences();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save work experience');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present';
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const date = new Date(datePart);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading work experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Work Experience</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add your professional work experience details</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          <Plus size={16} /> Add Experience
        </button>
      </div>

      {successMessage && <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20"><p className="text-sm font-medium text-green-800 dark:text-green-400">{successMessage}</p></div>}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-400" /><p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p></div>
        </div>
      )}

      {(isAdding || editingId !== null) && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {editingId ? 'Edit Work Experience' : 'Add New Work Experience'}
            </h3>
            <button onClick={resetForm} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Organization Name *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"><Building size={18} /></span>
                  <input type="text" name="organisation_name" value={formData.organisation_name} onChange={handleInputChange}
                    placeholder="Enter organization name"
                    className={`h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm dark:bg-gray-900 dark:text-white/90 ${formErrors.organisation_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                </div>
                {formErrors.organisation_name && <p className="mt-1 text-sm text-red-500">{formErrors.organisation_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Position Title *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"><Briefcase size={18} /></span>
                  <input type="text" name="position_title" value={formData.position_title} onChange={handleInputChange}
                    placeholder="Enter your position title"
                    className={`h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm dark:bg-gray-900 dark:text-white/90 ${formErrors.position_title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                </div>
                {formErrors.position_title && <p className="mt-1 text-sm text-red-500">{formErrors.position_title}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Organization Address *</label>
                <div className="relative">
                  <span className="absolute top-4 left-4 text-gray-500"><MapPin size={18} /></span>
                  <textarea name="organisation_address" value={formData.organisation_address} onChange={handleInputChange}
                    placeholder="Enter complete organization address" rows={3}
                    className={`w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm dark:bg-gray-900 dark:text-white/90 resize-none ${formErrors.organisation_address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                </div>
                {formErrors.organisation_address && <p className="mt-1 text-sm text-red-500">{formErrors.organisation_address}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Job Profile / Responsibilities *</label>
                <textarea name="job_profile" value={formData.job_profile} onChange={handleInputChange}
                  placeholder="Describe your job profile, responsibilities, and achievements" rows={4}
                  className={`w-full rounded-lg border bg-transparent px-4 py-3 text-sm dark:bg-gray-900 dark:text-white/90 resize-none ${formErrors.job_profile ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                {formErrors.job_profile && <p className="mt-1 text-sm text-red-500">{formErrors.job_profile}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Salary Mode *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"><DollarSign size={18} /></span>
                  <select name="salary_mode" value={formData.salary_mode} onChange={handleInputChange}
                    className={`h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm appearance-none dark:bg-gray-900 dark:text-white/90 ${formErrors.salary_mode ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                    <option value="">Select Salary Mode</option>
                    {salaryModes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {formErrors.salary_mode && <p className="mt-1 text-sm text-red-500">{formErrors.salary_mode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Employment Type *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"><Clock size={18} /></span>
                  <select name="employment_type" value={formData.employment_type} onChange={handleInputChange}
                    className={`h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm appearance-none dark:bg-gray-900 dark:text-white/90 ${formErrors.employment_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                    <option value="">Select Employment Type</option>
                    {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {formErrors.employment_type && <p className="mt-1 text-sm text-red-500">{formErrors.employment_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Start Date *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 z-10"><Calendar size={18} /></span>
                  <DatePicker
                    selected={formData.working_from ? new Date(formData.working_from) : null}
                    onChange={(date) => handleDateChange(date, 'working_from')}
                    dateFormat="yyyy-MM-dd" placeholderText="Select start date"
                    showYearDropdown showMonthDropdown dropdownMode="select" yearDropdownItemNumber={50} scrollableYearDropdown isClearable
                    customInput={<CustomDateInput />}
                  />
                </div>
                {formErrors.working_from && <p className="mt-1 text-sm text-red-500">{formErrors.working_from}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  End Date {!formData.is_currently_working && '*'}
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 z-10"><Calendar size={18} /></span>
                  <DatePicker
                    selected={formData.working_upto ? new Date(formData.working_upto) : null}
                    onChange={(date) => handleDateChange(date, 'working_upto')}
                    dateFormat="yyyy-MM-dd" placeholderText="Select end date"
                    showYearDropdown showMonthDropdown dropdownMode="select" yearDropdownItemNumber={50} scrollableYearDropdown isClearable
                    disabled={formData.is_currently_working === 1}
                    customInput={<CustomDateInput disabled={formData.is_currently_working === 1} />}
                  />
                </div>
                {formErrors.working_upto && <p className="mt-1 text-sm text-red-500">{formErrors.working_upto}</p>}
              </div>

              <div className="flex items-center md:col-span-2">
                <input type="checkbox" id="is_currently_working" name="is_currently_working"
                  checked={formData.is_currently_working === 1} onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800" />
                <label htmlFor="is_currently_working" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  I am currently working in this role
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                Cancel
              </button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
                <Save size={16} /> {editingId ? 'Update Experience' : 'Save Experience'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Briefcase className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">No work experience added</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first work experience.</p>
            <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              <Plus size={16} /> Add Experience
            </button>
          </div>
        ) : (
          experiences.map((experience) => (
            <div key={experience.id} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{experience.position_title}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Building className="mr-2 h-4 w-4" />{experience.organisation_name}
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="mr-2 h-4 w-4" />{experience.organisation_address}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      <DollarSign className="mr-1 h-3 w-3" />{experience.salary_mode}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <Clock className="mr-1 h-3 w-3" />{experience.employment_type}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      <Calendar className="mr-1 h-3 w-3" />{formatDate(experience.working_from)} - {formatDate(experience.working_upto)}
                      {experience.is_currently_working === 1 && ' (Current)'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Responsibilities:</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{experience.job_profile}</p>
                  </div>
                </div>
                <button onClick={() => handleEdit(experience)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800" title="Edit">
                  <Edit size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
