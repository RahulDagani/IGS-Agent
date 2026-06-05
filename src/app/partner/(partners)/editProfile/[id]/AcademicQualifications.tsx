"use client"
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { BookOpen, GraduationCap, MapPin, Calendar, Award, Globe, Edit, Plus, Save, X, AlertCircle, School, Hash, Search } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/context/AuthContext";

interface AcademicRecord {
  id?: number;
  student_id?: number;
  country_id: number | null;
  country_name?: string;
  state_id: number | null;
  state_name?: string;
  city_id: number | null;
  city_name?: string;
  level_of_study: string;
  board_name: string;
  qualification_awarded: string;
  institution_name: string;
  grading_system: string;
  score: string;
  primary_language_of_instruction: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

interface AcademicFormData {
  country_id: number | null;
  country_name: string;
  state_id: number | null;
  state_name: string;
  city_id: number | null;
  city_name: string;
  level_of_study: string;
  board_name: string;
  qualification_awarded: string;
  institution_name: string;
  grading_system: string;
  score: string;
  primary_language_of_instruction: string;
  start_date: string;
  end_date: string;
}

// ── Location types & autocomplete components ──────────────────────────────────
interface LocationCountry { id: number; name: string; iso_code: string; flag?: string; }
interface LocationState { id: number; name: string; state_code: string; country_id: number; }
interface LocationCity { id: number; name: string; state_id: number; country_id: number; }

const CountryAutocomplete = ({ value, displayName, onChange, baseUrl, token, placeholder = "Search country..." }: {
  value: number | null; displayName: string; onChange: (c: LocationCountry | null) => void; baseUrl: string; token: string | null; placeholder?: string;
}) => {
  const [query, setQuery] = useState(""); const [suggestions, setSuggestions] = useState<LocationCountry[]>([]); const [fetching, setFetching] = useState(false); const [open, setOpen] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null); const containerRef = useRef<HTMLDivElement>(null);
  const fetchSuggestions = useCallback(async (q: string) => { if (!q.trim()) { setSuggestions([]); return; } setFetching(true); try { const res = await fetch(`${baseUrl}/location/countries?search=${encodeURIComponent(q)}&limit=10`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.success) setSuggestions(data.data); } finally { setFetching(false); } }, [baseUrl, token]);
  useEffect(() => { if (debRef.current) clearTimeout(debRef.current); debRef.current = setTimeout(() => fetchSuggestions(query), 300); return () => { if (debRef.current) clearTimeout(debRef.current); }; }, [query, fetchSuggestions]);
  useEffect(() => { const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setQuery(""); } }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const label = value && displayName ? displayName : null;
  return (
    <div ref={containerRef} className="relative">
      <div className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 flex items-center gap-2 cursor-text focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10" onClick={() => setOpen(true)}>
        {open ? <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={label ?? placeholder} className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none" />
          : <span className={`flex-1 text-sm truncate ${label ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-white/30"}`}>{label ?? placeholder}</span>}
        {value ? <button type="button" onClick={e => { e.stopPropagation(); onChange(null); setQuery(""); setSuggestions([]); setOpen(false); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>
          : <Search size={14} className="text-gray-400 flex-shrink-0 pointer-events-none" />}
      </div>
      {open && <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
        {fetching ? <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
          : !query.trim() ? <div className="px-4 py-3 text-sm text-gray-400">Type to search countries...</div>
          : suggestions.length === 0 ? <div className="px-4 py-3 text-sm text-gray-400">No countries found</div>
          : suggestions.map(c => <button key={c.id} type="button" onClick={() => { onChange(c); setOpen(false); setQuery(""); setSuggestions([]); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${c.id === value ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600" : "text-gray-800 dark:text-white/90"}`}>
            {c.flag && <span>{c.flag}</span>}<span>{c.name}</span><span className="ml-auto text-xs text-gray-400">{c.iso_code}</span>
          </button>)}
      </div>}
    </div>
  );
};

const StateAutocomplete = ({ countryId, value, displayName, onChange, baseUrl, token, placeholder = "Search state...", disabled = false }: {
  countryId: number | null; value: number | null; displayName: string; onChange: (s: LocationState | null) => void; baseUrl: string; token: string | null; placeholder?: string; disabled?: boolean;
}) => {
  const [query, setQuery] = useState(""); const [suggestions, setSuggestions] = useState<LocationState[]>([]); const [fetching, setFetching] = useState(false); const [open, setOpen] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null); const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setQuery(""); setSuggestions([]); setOpen(false); }, [countryId]);
  const fetchSuggestions = useCallback(async (q: string) => { if (!countryId || !q.trim()) { setSuggestions([]); return; } setFetching(true); try { const res = await fetch(`${baseUrl}/location/states?country_id=${countryId}&search=${encodeURIComponent(q)}&limit=10`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.success) setSuggestions(data.data); } finally { setFetching(false); } }, [baseUrl, token, countryId]);
  useEffect(() => { if (debRef.current) clearTimeout(debRef.current); debRef.current = setTimeout(() => fetchSuggestions(query), 300); return () => { if (debRef.current) clearTimeout(debRef.current); }; }, [query, fetchSuggestions]);
  useEffect(() => { const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setQuery(""); } }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const label = value && displayName ? displayName : null;
  if (disabled) return <div className="h-11 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 flex items-center opacity-50 cursor-not-allowed"><span className="text-sm text-gray-400 dark:text-white/30">{placeholder}</span></div>;
  return (
    <div ref={containerRef} className="relative">
      <div className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 flex items-center gap-2 cursor-text focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10" onClick={() => setOpen(true)}>
        {open ? <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={label ?? placeholder} className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none" />
          : <span className={`flex-1 text-sm truncate ${label ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-white/30"}`}>{label ?? placeholder}</span>}
        {value ? <button type="button" onClick={e => { e.stopPropagation(); onChange(null); setQuery(""); setSuggestions([]); setOpen(false); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>
          : <Search size={14} className="text-gray-400 flex-shrink-0 pointer-events-none" />}
      </div>
      {open && <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
        {fetching ? <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
          : !query.trim() ? <div className="px-4 py-3 text-sm text-gray-400">Type to search states...</div>
          : suggestions.length === 0 ? <div className="px-4 py-3 text-sm text-gray-400">No states found</div>
          : suggestions.map(s => <button key={s.id} type="button" onClick={() => { onChange(s); setOpen(false); setQuery(""); setSuggestions([]); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${s.id === value ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600" : "text-gray-800 dark:text-white/90"}`}>
            <span>{s.name}</span>{s.state_code && <span className="ml-auto text-xs text-gray-400">{s.state_code}</span>}
          </button>)}
      </div>}
    </div>
  );
};

const CityAutocomplete = ({ stateId, value, displayName, onChange, baseUrl, token, placeholder = "Search city...", disabled = false }: {
  stateId: number | null; value: number | null; displayName: string; onChange: (c: LocationCity | null) => void; baseUrl: string; token: string | null; placeholder?: string; disabled?: boolean;
}) => {
  const [query, setQuery] = useState(""); const [suggestions, setSuggestions] = useState<LocationCity[]>([]); const [fetching, setFetching] = useState(false); const [open, setOpen] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null); const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setQuery(""); setSuggestions([]); setOpen(false); }, [stateId]);
  const fetchSuggestions = useCallback(async (q: string) => { if (!stateId || !q.trim()) { setSuggestions([]); return; } setFetching(true); try { const res = await fetch(`${baseUrl}/location/cities?state_id=${stateId}&search=${encodeURIComponent(q)}&limit=10`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.success) setSuggestions(data.data); } finally { setFetching(false); } }, [baseUrl, token, stateId]);
  useEffect(() => { if (debRef.current) clearTimeout(debRef.current); debRef.current = setTimeout(() => fetchSuggestions(query), 300); return () => { if (debRef.current) clearTimeout(debRef.current); }; }, [query, fetchSuggestions]);
  useEffect(() => { const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setQuery(""); } }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const label = value && displayName ? displayName : null;
  if (disabled) return <div className="h-11 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 flex items-center opacity-50 cursor-not-allowed"><span className="text-sm text-gray-400 dark:text-white/30">{placeholder}</span></div>;
  return (
    <div ref={containerRef} className="relative">
      <div className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 flex items-center gap-2 cursor-text focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10" onClick={() => setOpen(true)}>
        {open ? <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={label ?? placeholder} className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none" />
          : <span className={`flex-1 text-sm truncate ${label ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-white/30"}`}>{label ?? placeholder}</span>}
        {value ? <button type="button" onClick={e => { e.stopPropagation(); onChange(null); setQuery(""); setSuggestions([]); setOpen(false); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>
          : <Search size={14} className="text-gray-400 flex-shrink-0 pointer-events-none" />}
      </div>
      {open && <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
        {fetching ? <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
          : !query.trim() ? <div className="px-4 py-3 text-sm text-gray-400">Type to search cities...</div>
          : suggestions.length === 0 ? <div className="px-4 py-3 text-sm text-gray-400">No cities found</div>
          : suggestions.map(c => <button key={c.id} type="button" onClick={() => { onChange(c); setOpen(false); setQuery(""); setSuggestions([]); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${c.id === value ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600" : "text-gray-800 dark:text-white/90"}`}>
            <span>{c.name}</span>
          </button>)}
      </div>}
    </div>
  );
};

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const CustomDateInput = React.forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ value, onClick, disabled }, ref) => (
    <input
      type="text"
      value={value || ""}
      onClick={onClick}
      ref={ref}
      readOnly
      disabled={disabled}
      placeholder="Select date"
      className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  )
);
CustomDateInput.displayName = "CustomDateInput";

const emptyForm: AcademicFormData = {
  country_id: null, country_name: "",
  state_id: null, state_name: "",
  city_id: null, city_name: "",
  level_of_study: "", board_name: "", qualification_awarded: "",
  institution_name: "", grading_system: "", score: "",
  primary_language_of_instruction: "", start_date: "", end_date: "",
};

export default function AcademicQualifications() {
  const { token } = useAuth();
  const { id: studentId } = useParams<{ id: string }>();
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AcademicFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const LOCATION_BASE = `${BASE_URL}/agent/student`;

  const studyLevels = [
    { value: "", label: "Select Level" },
    { value: "Grade 9", label: "Grade 9" },
    { value: "Grade 10", label: "Grade 10" },
    { value: "Grade 11", label: "Grade 11" },
    { value: "Grade 12", label: "Grade 12" },
    { value: "Diploma", label: "Diploma" },
    { value: "Undergraduate", label: "Undergraduate" },
    { value: "Postgraduate", label: "Postgraduate" },
    { value: "Doctorate", label: "Doctorate" },
    { value: "Other", label: "Other" }
  ];

  const gradingSystems = [
    { value: "", label: "Select Grading System" },
    { value: "Percentage", label: "Percentage" },
    { value: "CGPA", label: "CGPA" },
    { value: "GPA", label: "GPA" },
    { value: "Grade", label: "Grade" },
    { value: "Marks", label: "Marks" }
  ];

  const languages = ["English", "Hindi", "Spanish", "French", "German", "Chinese", "Other"];

  const shouldShowBoardField = () => ["Grade 9", "Grade 10", "Grade 11", "Grade 12"].includes(formData.level_of_study);

  useEffect(() => { fetchAcademicRecords(); }, []);

  const fetchAcademicRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/agent/student/academic/records/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch academic records');
      const result = await response.json();
      if (result.success) {
        setRecords((result.data || []).map((r: AcademicRecord) => ({
          ...r,
          start_date: r.start_date ? r.start_date.split('T')[0] : '',
          end_date: r.end_date ? r.end_date.split('T')[0] : '',
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch academic records');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.country_id) errors.country_id = "Country of study is required";
    if (!formData.state_id) errors.state_id = "State/Province is required";
    if (!formData.city_id) errors.city_id = "City of study is required";
    if (!formData.level_of_study.trim()) errors.level_of_study = "Level of study is required";
    if (shouldShowBoardField() && !formData.board_name.trim()) errors.board_name = "Board/University name is required";
    if (!formData.qualification_awarded.trim()) errors.qualification_awarded = "Qualification awarded is required";
    if (!formData.institution_name.trim()) errors.institution_name = "Institution name is required";
    if (!formData.grading_system.trim()) errors.grading_system = "Grading system is required";
    if (!formData.score.trim()) {
      errors.score = "Score/GPA is required";
    } else if (isNaN(parseFloat(formData.score))) {
      errors.score = "Please enter a valid number";
    }
    if (!formData.primary_language_of_instruction.trim()) errors.primary_language_of_instruction = "Primary language is required";
    if (!formData.start_date) errors.start_date = "Start date is required";
    if (!formData.end_date) errors.end_date = "End date is required";
    if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      errors.end_date = "End date must be after start date";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formErrors[name]) setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (name === 'level_of_study' && !["Grade 9", "Grade 10", "Grade 11", "Grade 12"].includes(value)) {
      setFormData(prev => ({ ...prev, level_of_study: value, board_name: "" }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null, field: 'start_date' | 'end_date') => {
    setFormData(prev => ({ ...prev, [field]: date ? date.toISOString().split('T')[0] : '' }));
    if (formErrors[field]) setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setFormErrors({});
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (record: AcademicRecord) => {
    setFormData({
      country_id: record.country_id,
      country_name: record.country_name || "",
      state_id: record.state_id,
      state_name: record.state_name || "",
      city_id: record.city_id,
      city_name: record.city_name || "",
      level_of_study: record.level_of_study,
      board_name: record.board_name,
      qualification_awarded: record.qualification_awarded,
      institution_name: record.institution_name,
      grading_system: record.grading_system,
      score: record.score,
      primary_language_of_instruction: record.primary_language_of_instruction,
      start_date: record.start_date.split('T')[0],
      end_date: record.end_date.split('T')[0],
    });
    setEditingId(record.id || null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${BASE_URL}/agent/student/academic/records/${editingId}/${studentId}`
        : `${BASE_URL}/agent/student/academic/records/${studentId}`;
      const payload = {
        country_id: formData.country_id,
        state_id: formData.state_id,
        city_id: formData.city_id,
        level_of_study: formData.level_of_study,
        board_name: formData.board_name,
        qualification_awarded: formData.qualification_awarded,
        institution_name: formData.institution_name,
        grading_system: formData.grading_system,
        score: parseFloat(formData.score),
        primary_language_of_instruction: formData.primary_language_of_instruction,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to save academic record');
      setSuccessMessage(result.message || 'Academic record saved successfully');
      resetForm();
      fetchAcademicRecords();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save academic record');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const date = new Date(datePart);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getStudyLevelLabel = (value: string) => studyLevels.find(l => l.value === value)?.label ?? value;
  const getGradingSystemLabel = (value: string) => gradingSystems.find(g => g.value === value)?.label ?? value;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading academic records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Academic Qualifications</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add your academic qualifications and educational background</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          <Plus size={16} />Add Qualification
        </button>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-400">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId !== null) && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {editingId ? 'Edit Academic Record' : 'Add New Academic Record'}
            </h3>
            <button onClick={resetForm} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Institution Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Institution Name *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><School size={18} /></span>
                  <input type="text" name="institution_name" value={formData.institution_name} onChange={handleInputChange} placeholder="Enter institution name"
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${formErrors.institution_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                </div>
                {formErrors.institution_name && <p className="mt-1 text-sm text-red-500">{formErrors.institution_name}</p>}
              </div>

              {/* Level of Study */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Level of Study *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><BookOpen size={18} /></span>
                  <select name="level_of_study" value={formData.level_of_study} onChange={handleInputChange}
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${formErrors.level_of_study ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                    {studyLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                {formErrors.level_of_study && <p className="mt-1 text-sm text-red-500">{formErrors.level_of_study}</p>}
              </div>

              {/* Qualification Awarded */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Qualification Awarded *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><Award size={18} /></span>
                  <input type="text" name="qualification_awarded" value={formData.qualification_awarded} onChange={handleInputChange} placeholder="e.g., Bachelor of Science"
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${formErrors.qualification_awarded ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                </div>
                {formErrors.qualification_awarded && <p className="mt-1 text-sm text-red-500">{formErrors.qualification_awarded}</p>}
              </div>

              {/* Board/University - conditional */}
              {shouldShowBoardField() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Board/University *</label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><GraduationCap size={18} /></span>
                    <input type="text" name="board_name" value={formData.board_name} onChange={handleInputChange} placeholder="e.g., CBSE, University of Delhi"
                      className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${formErrors.board_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                  </div>
                  {formErrors.board_name && <p className="mt-1 text-sm text-red-500">{formErrors.board_name}</p>}
                </div>
              )}

              {/* Grading System */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Grading System *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><Hash size={18} /></span>
                  <select name="grading_system" value={formData.grading_system} onChange={handleInputChange}
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${formErrors.grading_system ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                    {gradingSystems.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                {formErrors.grading_system && <p className="mt-1 text-sm text-red-500">{formErrors.grading_system}</p>}
              </div>

              {/* Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Score/GPA *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><Award size={18} /></span>
                  <input type="number" name="score" value={formData.score} onChange={handleInputChange} placeholder="Enter score" step="0.01" min="0"
                    className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${formErrors.score ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                </div>
                {formErrors.score && <p className="mt-1 text-sm text-red-500">{formErrors.score}</p>}
              </div>

              {/* Country of Study */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Country of Study *</label>
                <CountryAutocomplete
                  value={formData.country_id}
                  displayName={formData.country_name}
                  baseUrl={LOCATION_BASE}
                  token={token}
                  onChange={c => setFormData(prev => ({ ...prev, country_id: c?.id ?? null, country_name: c?.name ?? "", state_id: null, state_name: "", city_id: null, city_name: "" }))}
                  placeholder="Search country..."
                />
                {formErrors.country_id && <p className="mt-1 text-sm text-red-500">{formErrors.country_id}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">State/Province *</label>
                <StateAutocomplete
                  countryId={formData.country_id}
                  value={formData.state_id}
                  displayName={formData.state_name}
                  baseUrl={LOCATION_BASE}
                  token={token}
                  onChange={s => setFormData(prev => ({ ...prev, state_id: s?.id ?? null, state_name: s?.name ?? "", city_id: null, city_name: "" }))}
                  disabled={!formData.country_id}
                  placeholder="Search state..."
                />
                {formErrors.state_id && <p className="mt-1 text-sm text-red-500">{formErrors.state_id}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">City of Study *</label>
                <CityAutocomplete
                  stateId={formData.state_id}
                  value={formData.city_id}
                  displayName={formData.city_name}
                  baseUrl={LOCATION_BASE}
                  token={token}
                  onChange={c => setFormData(prev => ({ ...prev, city_id: c?.id ?? null, city_name: c?.name ?? "" }))}
                  disabled={!formData.state_id}
                  placeholder="Search city..."
                />
                {formErrors.city_id && <p className="mt-1 text-sm text-red-500">{formErrors.city_id}</p>}
              </div>

              {/* Primary Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Primary Language *</label>
                <select name="primary_language_of_instruction" value={formData.primary_language_of_instruction} onChange={handleInputChange}
                  className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${formErrors.primary_language_of_instruction ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                  <option value="">Select Language</option>
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {formErrors.primary_language_of_instruction && <p className="mt-1 text-sm text-red-500">{formErrors.primary_language_of_instruction}</p>}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Start Date *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10"><Calendar size={18} /></span>
                  <DatePicker selected={formData.start_date ? new Date(formData.start_date) : null} onChange={date => handleDateChange(date, 'start_date')}
                    dateFormat="yyyy-MM-dd" placeholderText="Select start date" showYearDropdown showMonthDropdown dropdownMode="select" yearDropdownItemNumber={20} scrollableYearDropdown isClearable
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 pl-11 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    customInput={<CustomDateInput />} />
                </div>
                {formErrors.start_date && <p className="mt-1 text-sm text-red-500">{formErrors.start_date}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">End Date *</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10"><Calendar size={18} /></span>
                  <DatePicker selected={formData.end_date ? new Date(formData.end_date) : null} onChange={date => handleDateChange(date, 'end_date')}
                    dateFormat="yyyy-MM-dd" placeholderText="Select end date" showYearDropdown showMonthDropdown dropdownMode="select" yearDropdownItemNumber={20} scrollableYearDropdown isClearable
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    customInput={<CustomDateInput />} />
                </div>
                {formErrors.end_date && <p className="mt-1 text-sm text-red-500">{formErrors.end_date}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
                <Save size={16} />{editingId ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records List */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <GraduationCap className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">No academic records added</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first academic qualification.</p>
            <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              <Plus size={16} />Add Qualification
            </button>
          </div>
        ) : (
          records.map(record => (
            <div key={record.id} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{getStudyLevelLabel(record.level_of_study)}</h3>
                      <div className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">{record.qualification_awarded}</div>
                      <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <School className="mr-2 h-4 w-4" />{record.institution_name}
                      </div>
                      {record.board_name && (
                        <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <GraduationCap className="mr-2 h-4 w-4" />{record.board_name}
                        </div>
                      )}
                      <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="mr-2 h-4 w-4" />
                        {[record.city_name, record.state_name, record.country_name].filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <button onClick={() => handleEdit(record)} className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" title="Edit">
                      <Edit size={18} />
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Score</div>
                      <div className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                        {record.score} <span className="text-sm font-normal text-gray-600 dark:text-gray-400">({getGradingSystemLabel(record.grading_system)})</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration</div>
                      <div className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{formatDate(record.start_date)} - {formatDate(record.end_date)}</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Language</div>
                      <div className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{record.primary_language_of_instruction}</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</div>
                      <div className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{record.country_name || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
