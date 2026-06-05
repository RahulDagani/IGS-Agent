"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { User, Calendar, Phone, Mail, MapPin, Globe, Users, Award, BookOpen, ChevronDown, ChevronUp, Briefcase, GraduationCap, CheckCircle, XCircle, AlertTriangle, Search, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useRef } from "react";
import TestScores from "./TestScores";
import AcademicInterests from "./AcademicInterests";
import WorkExperience from "./WorkExperience";
import AcademicQualifications from "./AcademicQualifications";

interface StudentFormData {
  salutation: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  passport_number: string;
  dob: Date | null;
  gender: string;
  citizenship: string;
  country_id: number | null;
  country_name: string;
  state_id: number | null;
  state_name: string;
  city_id: number | null;
  city_name: string;
  address: string;
  postal_code: string;
  emergency_c_name: string;
  emergency_c_relation: string;
  emergency_c_email: string;
  emergency_c_phone: string;
}

type MainTab = "profile" | "testscores" | "interests" | "workexperience" | "academics";

interface FormSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description?: string;
  completed: boolean;
  apiEndpoint: string;
}

interface SectionStatus {
  isSaving: boolean;
  message: string;
  messageType: 'success' | 'error' | '';
}

interface CountryData {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

// ── Location autocomplete components ─────────────────────────────────────────
interface LocationCountry { id: number; name: string; iso_code: string; flag?: string; }
interface LocationState { id: number; name: string; state_code: string; country_id: number; }
interface LocationCity { id: number; name: string; state_id: number; country_id: number; }

const CountryAutocomplete = ({ value, displayName, onChange, baseUrl, token, placeholder = "Search country..." }: { value: number | null; displayName: string; onChange: (c: LocationCountry | null) => void; baseUrl: string; token: string | null; placeholder?: string; }) => {
  const [query, setQuery] = useState(""); const [suggestions, setSuggestions] = useState<LocationCountry[]>([]); const [fetching, setFetching] = useState(false); const [open, setOpen] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null); const containerRef = useRef<HTMLDivElement>(null);
  const fetchSuggestions = useCallback(async (q: string) => { if (!q.trim()) { setSuggestions([]); return; } setFetching(true); try { const res = await fetch(`${baseUrl}/location/countries?search=${encodeURIComponent(q)}&limit=10`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.success) setSuggestions(data.data); } finally { setFetching(false); } }, [baseUrl, token]);
  useEffect(() => { if (debRef.current) clearTimeout(debRef.current); debRef.current = setTimeout(() => fetchSuggestions(query), 300); return () => { if (debRef.current) clearTimeout(debRef.current); }; }, [query, fetchSuggestions]);
  useEffect(() => { const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setQuery(""); } }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const label = value && displayName ? displayName : null;
  return (<div ref={containerRef} className="relative"><div className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 flex items-center gap-2 cursor-text" onClick={() => setOpen(true)}>{open ? <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={label ?? placeholder} className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:outline-none" /> : <span className={`flex-1 text-sm truncate ${label ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-white/30"}`}>{label ?? placeholder}</span>}{value ? <button type="button" onClick={e => { e.stopPropagation(); onChange(null); setQuery(""); setSuggestions([]); setOpen(false); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button> : <Search size={14} className="text-gray-400 flex-shrink-0 pointer-events-none" />}</div>{open && <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">{fetching ? <div className="px-4 py-3 text-sm text-gray-400">Searching...</div> : !query.trim() ? <div className="px-4 py-3 text-sm text-gray-400">Type to search countries...</div> : suggestions.length === 0 ? <div className="px-4 py-3 text-sm text-gray-400">No countries found</div> : suggestions.map(c => <button key={c.id} type="button" onClick={() => { onChange(c); setOpen(false); setQuery(""); setSuggestions([]); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${c.id === value ? "bg-blue-50 text-blue-600" : "text-gray-800 dark:text-white/90"}`}>{c.flag && <span>{c.flag}</span>}<span>{c.name}</span><span className="ml-auto text-xs text-gray-400">{c.iso_code}</span></button>)}</div>}</div>);
};

const StateAutocomplete = ({ countryId, value, displayName, onChange, baseUrl, token, placeholder = "Search state...", disabled = false }: { countryId: number | null; value: number | null; displayName: string; onChange: (s: LocationState | null) => void; baseUrl: string; token: string | null; placeholder?: string; disabled?: boolean; }) => {
  const [query, setQuery] = useState(""); const [suggestions, setSuggestions] = useState<LocationState[]>([]); const [fetching, setFetching] = useState(false); const [open, setOpen] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null); const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setQuery(""); setSuggestions([]); setOpen(false); }, [countryId]);
  const fetchSuggestions = useCallback(async (q: string) => { if (!countryId || !q.trim()) { setSuggestions([]); return; } setFetching(true); try { const res = await fetch(`${baseUrl}/location/states?country_id=${countryId}&search=${encodeURIComponent(q)}&limit=10`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.success) setSuggestions(data.data); } finally { setFetching(false); } }, [baseUrl, token, countryId]);
  useEffect(() => { if (debRef.current) clearTimeout(debRef.current); debRef.current = setTimeout(() => fetchSuggestions(query), 300); return () => { if (debRef.current) clearTimeout(debRef.current); }; }, [query, fetchSuggestions]);
  useEffect(() => { const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setQuery(""); } }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const label = value && displayName ? displayName : null;
  if (disabled) return <div className="h-11 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 flex items-center opacity-50 cursor-not-allowed"><span className="text-sm text-gray-400">{placeholder}</span></div>;
  return (<div ref={containerRef} className="relative"><div className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 flex items-center gap-2 cursor-text" onClick={() => setOpen(true)}>{open ? <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={label ?? placeholder} className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:outline-none" /> : <span className={`flex-1 text-sm truncate ${label ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-white/30"}`}>{label ?? placeholder}</span>}{value ? <button type="button" onClick={e => { e.stopPropagation(); onChange(null); setQuery(""); setSuggestions([]); setOpen(false); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button> : <Search size={14} className="text-gray-400 flex-shrink-0 pointer-events-none" />}</div>{open && <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">{fetching ? <div className="px-4 py-3 text-sm text-gray-400">Searching...</div> : !query.trim() ? <div className="px-4 py-3 text-sm text-gray-400">Type to search states...</div> : suggestions.length === 0 ? <div className="px-4 py-3 text-sm text-gray-400">No states found</div> : suggestions.map(s => <button key={s.id} type="button" onClick={() => { onChange(s); setOpen(false); setQuery(""); setSuggestions([]); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${s.id === value ? "bg-blue-50 text-blue-600" : "text-gray-800 dark:text-white/90"}`}><span>{s.name}</span>{s.state_code && <span className="ml-auto text-xs text-gray-400">{s.state_code}</span>}</button>)}</div>}</div>);
};

const CityAutocomplete = ({ stateId, value, displayName, onChange, baseUrl, token, placeholder = "Search city...", disabled = false }: { stateId: number | null; value: number | null; displayName: string; onChange: (c: LocationCity | null) => void; baseUrl: string; token: string | null; placeholder?: string; disabled?: boolean; }) => {
  const [query, setQuery] = useState(""); const [suggestions, setSuggestions] = useState<LocationCity[]>([]); const [fetching, setFetching] = useState(false); const [open, setOpen] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null); const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setQuery(""); setSuggestions([]); setOpen(false); }, [stateId]);
  const fetchSuggestions = useCallback(async (q: string) => { if (!stateId || !q.trim()) { setSuggestions([]); return; } setFetching(true); try { const res = await fetch(`${baseUrl}/location/cities?state_id=${stateId}&search=${encodeURIComponent(q)}&limit=10`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.success) setSuggestions(data.data); } finally { setFetching(false); } }, [baseUrl, token, stateId]);
  useEffect(() => { if (debRef.current) clearTimeout(debRef.current); debRef.current = setTimeout(() => fetchSuggestions(query), 300); return () => { if (debRef.current) clearTimeout(debRef.current); }; }, [query, fetchSuggestions]);
  useEffect(() => { const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setQuery(""); } }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const label = value && displayName ? displayName : null;
  if (disabled) return <div className="h-11 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 flex items-center opacity-50 cursor-not-allowed"><span className="text-sm text-gray-400">{placeholder}</span></div>;
  return (<div ref={containerRef} className="relative"><div className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 flex items-center gap-2 cursor-text" onClick={() => setOpen(true)}>{open ? <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={label ?? placeholder} className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:outline-none" /> : <span className={`flex-1 text-sm truncate ${label ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-white/30"}`}>{label ?? placeholder}</span>}{value ? <button type="button" onClick={e => { e.stopPropagation(); onChange(null); setQuery(""); setSuggestions([]); setOpen(false); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button> : <Search size={14} className="text-gray-400 flex-shrink-0 pointer-events-none" />}</div>{open && <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">{fetching ? <div className="px-4 py-3 text-sm text-gray-400">Searching...</div> : !query.trim() ? <div className="px-4 py-3 text-sm text-gray-400">Type to search cities...</div> : suggestions.length === 0 ? <div className="px-4 py-3 text-sm text-gray-400">No cities found</div> : suggestions.map(c => <button key={c.id} type="button" onClick={() => { onChange(c); setOpen(false); setQuery(""); setSuggestions([]); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${c.id === value ? "bg-blue-50 text-blue-600" : "text-gray-800 dark:text-white/90"}`}><span>{c.name}</span></button>)}</div>}</div>);
};

const PhoneInput = ({
  value, onChange, name, error, disabled = false, selectedCountry, onCountryChange, allCountries = [], placeholder = "Phone number",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
  disabled?: boolean;
  selectedCountry: CountryData;
  onCountryChange: (country: CountryData) => void;
  allCountries?: CountryData[];
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? allCountries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial_code.includes(search) ||
        c.code.toLowerCase().startsWith(search.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  return (
    <div ref={containerRef}>
      <div className="flex gap-2">
        <div className="relative">
          <button type="button" onClick={handleOpen} disabled={disabled}
            className={`flex items-center gap-1.5 h-11 px-3 rounded-lg border bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
            <span className="text-base leading-none">{selectedCountry?.flag}</span>
            <span className="text-xs font-medium min-w-[36px]">{selectedCountry?.dial_code ?? "—"}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => { setIsOpen(false); setSearch(""); }} />
              <div className="absolute left-0 z-20 mt-1 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                onClick={e => e.stopPropagation()}>
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <input ref={searchRef} type="text" placeholder="Search country name or code..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {!search.trim() ? (
                    <div className="px-3 py-4 text-sm text-center text-gray-400 dark:text-gray-500">Type to search countries...</div>
                  ) : filtered.length > 0 ? filtered.map(c => (
                    <button key={c.code} type="button"
                      onClick={() => { onCountryChange(c); setIsOpen(false); setSearch(""); }}
                      className={`flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedCountry?.code === c.code ? "bg-brand-50 dark:bg-brand-900/20" : ""
                      }`}>
                      <span className="text-base w-6 text-center">{c.flag}</span>
                      <span className="flex-1 text-left text-gray-700 dark:text-gray-300 truncate">{c.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{c.dial_code}</span>
                    </button>
                  )) : (
                    <div className="px-3 py-4 text-sm text-center text-gray-400">No countries found</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <input type="tel" name={name} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled}
          className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 flex-1 rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
            error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
          } ${disabled ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50" : ""}`} />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default function ProfileForm({ onProfileSave }: { onProfileSave?: () => void }) {
  const router = useRouter();
  const { id: studentId } = useParams();
  const [activeMainTab, setActiveMainTab] = useState<string>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const activeTabFromUrl = searchParams.get("profileTab");

  const [formData, setFormData] = useState<StudentFormData>({
    salutation: "", first_name: "", middle_name: "", last_name: "",
    email: "", phone: "", passport_number: "", dob: null, gender: "", citizenship: "",
    country_id: null, country_name: "", state_id: null, state_name: "", city_id: null, city_name: "", address: "", postal_code: "",
    emergency_c_name: "", emergency_c_relation: "", emergency_c_email: "", emergency_c_phone: "",
  });

  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true, address: false, emergency: false,
  });
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<CountryData | null>(null);
  const [selectedEmergencyPhoneCountry, setSelectedEmergencyPhoneCountry] = useState<CountryData | null>(null);
  const [sectionStatus, setSectionStatus] = useState<Record<string, SectionStatus>>({
    personal: { isSaving: false, message: '', messageType: '' },
    address: { isSaving: false, message: '', messageType: '' },
    emergency: { isSaving: false, message: '', messageType: '' },
  });

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    if (activeTabFromUrl) setActiveMainTab(activeTabFromUrl);
  }, [activeTabFromUrl]);

  const extractPhoneWithoutDialCode = (fullPhone: string, dialCode: string): string => {
    if (!fullPhone) return '';
    return fullPhone.startsWith(dialCode) ? fullPhone.substring(dialCode.length) : fullPhone;
  };

  useEffect(() => {
    const init = async () => {
      // 1. Load countries from API
      let countriesList: CountryData[] = [];
      try {
        const r = await fetch(`${BASE_URL}/countries`);
        const d = await r.json();
        if (d.success) {
          countriesList = (d.data || []).map((c: any) => ({
            name: c.name,
            dial_code: c.phone_code,
            code: c.iso_code,
            flag: c.flag || "",
          }));
          setAllCountries(countriesList);
        }
      } catch {}

      // 2. Load student data
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/agent/student/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const { data } = await response.json();
          if (data) {
            const originalPhone = data.phone || '';
            const originalEmergencyPhone = data.emergency_c_phone || '';

            let detectedPhoneCountry = countriesList.find(c => originalPhone.startsWith(c.dial_code));
            const phoneWithoutCode = detectedPhoneCountry
              ? originalPhone.substring(detectedPhoneCountry.dial_code.length)
              : originalPhone;
            if (!detectedPhoneCountry) detectedPhoneCountry = countriesList.find(c => c.code === "IN") || countriesList[0];

            let detectedEmergencyCountry = countriesList.find(c => originalEmergencyPhone.startsWith(c.dial_code));
            const emergencyWithoutCode = detectedEmergencyCountry
              ? originalEmergencyPhone.substring(detectedEmergencyCountry.dial_code.length)
              : originalEmergencyPhone;
            if (!detectedEmergencyCountry) detectedEmergencyCountry = countriesList.find(c => c.code === "IN") || countriesList[0];

            setFormData(prev => ({
              ...prev,
              salutation: data.salutation || "",
              first_name: data.first_name || "",
              middle_name: data.middle_name || "",
              last_name: data.last_name || "",
              email: data.email || "",
              phone: phoneWithoutCode,
              passport_number: data.passport_number || "",
              dob: data.dob ? new Date(data.dob) : null,
              gender: data.gender || "",
              citizenship: data.citizenship || "",
              country_id: data.country_id || null,
              country_name: data.country_name || "",
              state_id: data.state_id || null,
              state_name: data.state_name || "",
              city_id: data.city_id || null,
              city_name: data.city_name || "",
              address: data.address || "",
              postal_code: data.postal_code || "",
              emergency_c_name: data.emergency_c_name || "",
              emergency_c_relation: data.emergency_c_relation || "",
              emergency_c_email: data.emergency_c_email || "",
              emergency_c_phone: emergencyWithoutCode,
            }));
            setSelectedPhoneCountry(detectedPhoneCountry ?? null);
            setSelectedEmergencyPhoneCountry(detectedEmergencyCountry ?? null);
          }
        } else {
          setError('Failed to fetch student data');
        }
      } catch (e) {
        console.error('Error fetching student data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const validateSection = (sectionId: string): boolean => {
    const errors: Record<string, string> = {};
    switch (sectionId) {
      case "personal":
        if (!formData.salutation) errors.salutation = "Salutation is required";
        if (!formData.first_name.trim()) errors.first_name = "First name is required";
        if (!formData.last_name.trim()) errors.last_name = "Last name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format";
        if (!formData.phone.trim()) errors.phone = "Phone number is required";
        if (!formData.passport_number.trim()) errors.passport_number = "Passport number is required";
        if (!formData.dob) errors.dob = "Date of birth is required";
        if (!formData.gender) errors.gender = "Gender is required";
        break;
      case "address":
        if (!formData.address.trim()) errors.address = "Address is required";
        if (!formData.country_id) errors.country_id = "Country is required";
        if (!formData.state_id) errors.state_id = "State/Province is required";
        if (!formData.city_id) errors.city_id = "City is required";
        if (!formData.postal_code.trim()) errors.postal_code = "Postal code is required";
        if (!formData.citizenship) errors.citizenship = "Citizenship is required";
        break;
      case "emergency":
        if (!formData.emergency_c_name.trim()) errors.emergency_c_name = "Emergency contact name is required";
        if (!formData.emergency_c_relation) errors.emergency_c_relation = "Relationship is required";
        if (!formData.emergency_c_phone.trim()) errors.emergency_c_phone = "Emergency contact phone is required";
        if (formData.emergency_c_email && !/^\S+@\S+\.\S+$/.test(formData.emergency_c_email)) {
          errors.emergency_c_email = "Invalid email format";
        }
        break;
    }
    setFieldErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });

    if (name === 'phone' || name === 'emergency_c_phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, dob: date }));
    if (fieldErrors.dob) setFieldErrors(prev => { const n = { ...prev }; delete n.dob; return n; });
  };

  const saveSection = async (sectionId: string, nextSectionId?: string) => {
    if (!validateSection(sectionId)) {
      setSectionStatus(prev => ({
        ...prev,
        [sectionId]: { isSaving: false, message: 'Please fill all required fields', messageType: 'error' }
      }));
      return;
    }

    setSectionStatus(prev => ({ ...prev, [sectionId]: { isSaving: true, message: '', messageType: '' } }));

    try {
      const formatPhone = (phone: string, country: CountryData | null) => {
        if (!phone || !country) return phone;
        const clean = phone.startsWith(country.dial_code) ? phone.substring(country.dial_code.length) : phone;
        return country.dial_code + clean;
      };

      let apiData: any = {};
      let endpoint = '';

      switch (sectionId) {
        case 'personal':
          endpoint = `/${studentId}/personal-info`;
          apiData = {
            salutation: formData.salutation,
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formatPhone(formData.phone, selectedPhoneCountry),
            passport_number: formData.passport_number,
            dob: formData.dob ? formData.dob.toISOString().split('T')[0] : null,
            gender: formData.gender,
          };
          break;
        case 'address':
          endpoint = `/${studentId}/address`;
          apiData = {
            country_id: formData.country_id,
            state_id: formData.state_id,
            city_id: formData.city_id,
            address: formData.address,
            postal_code: formData.postal_code,
            citizenship: formData.citizenship,
          };
          break;
        case 'emergency':
          endpoint = `/${studentId}/emergency-contact`;
          apiData = {
            emergency_c_name: formData.emergency_c_name,
            emergency_c_relation: formData.emergency_c_relation,
            emergency_c_email: formData.emergency_c_email,
            emergency_c_phone: formatPhone(formData.emergency_c_phone, selectedEmergencyPhoneCountry),
          };
          break;
      }

      const response = await fetch(`${BASE_URL}/agent/student${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!result.success) {
        setSectionStatus(prev => ({
          ...prev,
          [sectionId]: { isSaving: false, message: result.message || 'Failed to save', messageType: 'error' }
        }));
      } else {
        setSectionStatus(prev => ({
          ...prev,
          [sectionId]: { isSaving: false, message: 'Saved successfully!', messageType: 'success' }
        }));
        onProfileSave?.();
        if (nextSectionId) {
          setTimeout(() => {
            setExpandedSections(prev => ({ ...prev, [sectionId]: false, [nextSectionId]: true }));
          }, 1000);
        }
        if (sectionId === "emergency") {
          setTimeout(() => {
            router.push(`/partner/editProfile/${studentId}?tab=profile&profileTab=academics`);
          }, 1500);
        }
      }
    } catch (e) {
      console.error('Error saving section:', e);
      setSectionStatus(prev => ({
        ...prev,
        [sectionId]: { isSaving: false, message: 'An error occurred. Please try again.', messageType: 'error' }
      }));
    }
  };

  const isSectionComplete = (sectionId: string): boolean => {
    switch (sectionId) {
      case "personal":
        return !!(formData.salutation && formData.first_name.trim() && formData.last_name.trim() &&
          formData.email.trim() && /^\S+@\S+\.\S+$/.test(formData.email) &&
          formData.phone.trim() && formData.passport_number.trim() && formData.dob && formData.gender);
      case "address":
        return !!(formData.address.trim() && formData.country_id && formData.state_id &&
          formData.city_id && formData.postal_code.trim() && formData.citizenship);
      case "emergency":
        return !!(formData.emergency_c_name.trim() && formData.emergency_c_relation &&
          formData.emergency_c_phone.trim() &&
          (!formData.emergency_c_email || /^\S+@\S+\.\S+$/.test(formData.emergency_c_email)));
      default:
        return false;
    }
  };

  const salutations = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."];
  const genders = ["Male", "Female", "Other", "Prefer not to say"];
  const relationships = ["Parent", "Spouse", "Sibling", "Relative", "Friend", "Guardian"];

  const mainTabs = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "academics", label: "Academic Qualifications", icon: GraduationCap },
    { id: "testscores", label: "Test Scores", icon: Award },
    { id: "interests", label: "Academic Interests", icon: BookOpen },
    { id: "workexperience", label: "Work Experience", icon: Briefcase },
  ];

  const formSections: FormSection[] = [
    { id: "personal", title: "Personal Information", icon: User, description: "Provide your basic personal details", completed: isSectionComplete("personal"), apiEndpoint: `/agent/student/${studentId}/personal-info` },
    { id: "address", title: "Current Address", icon: MapPin, description: "Enter your current residential address", completed: isSectionComplete("address"), apiEndpoint: `/agent/student/${studentId}/address` },
    { id: "emergency", title: "Emergency Contact", icon: Users, description: "Add your emergency contact information", completed: isSectionComplete("emergency"), apiEndpoint: `/agent/student/${studentId}/emergency-contact` },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="flex justify-center text-red-500"><AlertTriangle /></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Failed to fetch saved data</p>
        </div>
      </div>
    );
  }

  const inputCls = (field: string) =>
    `shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${fieldErrors[field] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`;
  const selectCls = (field: string) =>
    `shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 appearance-none ${fieldErrors[field] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`;

  const renderPersonalInfoSection = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Salutation *</label>
          <select name="salutation" value={formData.salutation} onChange={handleInputChange} className={selectCls("salutation")}>
            <option value="">Select Salutation</option>
            {salutations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {fieldErrors.salutation && <p className="mt-1 text-sm text-red-500">{fieldErrors.salutation}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">First Name *</label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><User size={18} /></span>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Enter first name" className={`${inputCls("first_name")} pl-11`} />
          </div>
          {fieldErrors.first_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.first_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Middle Name</label>
          <input type="text" name="middle_name" value={formData.middle_name} onChange={handleInputChange} placeholder="Enter middle name" className={inputCls("middle_name")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Last Name *</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Enter last name" className={inputCls("last_name")} />
          {fieldErrors.last_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.last_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Gender *</label>
          <select name="gender" value={formData.gender} onChange={handleInputChange} className={selectCls("gender")}>
            <option value="">Select Gender</option>
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {fieldErrors.gender && <p className="mt-1 text-sm text-red-500">{fieldErrors.gender}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Date of Birth *</label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10"><Calendar size={18} /></span>
            <DatePicker selected={formData.dob} onChange={handleDateChange} dateFormat="yyyy-MM-dd" placeholderText="Select date of birth"
              className={`${inputCls("dob")} pl-11`} showYearDropdown dropdownMode="select" maxDate={new Date()} />
          </div>
          {fieldErrors.dob && <p className="mt-1 text-sm text-red-500">{fieldErrors.dob}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Email *</label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><Mail size={18} /></span>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" className={`${inputCls("email")} pl-11`} />
          </div>
          {fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Phone Number *</label>
          {selectedPhoneCountry && (
            <PhoneInput name="phone" value={formData.phone}
              onChange={handleInputChange} error={fieldErrors.phone}
              selectedCountry={selectedPhoneCountry} onCountryChange={setSelectedPhoneCountry}
              allCountries={allCountries} placeholder="Enter phone number" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Passport Number *</label>
          <input type="text" name="passport_number" value={formData.passport_number} onChange={handleInputChange} placeholder="Enter passport number" required className={inputCls("passport_number")} />
          {fieldErrors.passport_number && <p className="mt-1 text-sm text-red-500">{fieldErrors.passport_number}</p>}
        </div>
      </div>
    </div>
  );

  const renderAddressSection = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Address *</label>
        <div className="relative">
          <span className="absolute top-4 left-4 text-gray-500 dark:text-gray-400"><MapPin size={18} /></span>
          <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter complete address" rows={3}
            className={`shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 w-full rounded-lg border px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none ${fieldErrors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
        </div>
        {fieldErrors.address && <p className="mt-1 text-sm text-red-500">{fieldErrors.address}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Country *</label>
          <CountryAutocomplete
            value={formData.country_id}
            displayName={formData.country_name}
            baseUrl={`${BASE_URL}/agent/student`}
            token={token}
            onChange={c => setFormData(prev => ({ ...prev, country_id: c?.id ?? null, country_name: c?.name ?? "", state_id: null, state_name: "", city_id: null, city_name: "" }))}
            placeholder="Search country..."
          />
          {fieldErrors.country_id && <p className="mt-1 text-sm text-red-500">{fieldErrors.country_id}</p>}
        </div>
        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">State/Province *</label>
          <StateAutocomplete
            countryId={formData.country_id}
            value={formData.state_id}
            displayName={formData.state_name}
            baseUrl={`${BASE_URL}/agent/student`}
            token={token}
            onChange={s => setFormData(prev => ({ ...prev, state_id: s?.id ?? null, state_name: s?.name ?? "", city_id: null, city_name: "" }))}
            disabled={!formData.country_id}
            placeholder="Search state..."
          />
          {fieldErrors.state_id && <p className="mt-1 text-sm text-red-500">{fieldErrors.state_id}</p>}
        </div>
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">City *</label>
          <CityAutocomplete
            stateId={formData.state_id}
            value={formData.city_id}
            displayName={formData.city_name}
            baseUrl={`${BASE_URL}/agent/student`}
            token={token}
            onChange={c => setFormData(prev => ({ ...prev, city_id: c?.id ?? null, city_name: c?.name ?? "" }))}
            disabled={!formData.state_id}
            placeholder="Search city..."
          />
          {fieldErrors.city_id && <p className="mt-1 text-sm text-red-500">{fieldErrors.city_id}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Postal Code *</label>
          <input type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange} placeholder="Enter postal code" className={inputCls("postal_code")} />
          {fieldErrors.postal_code && <p className="mt-1 text-sm text-red-500">{fieldErrors.postal_code}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Citizenship *</label>
          <input
            type="text"
            name="citizenship"
            value={formData.citizenship}
            onChange={handleInputChange}
            placeholder="Enter your citizenship"
            className={inputCls("citizenship")}
          />
          {fieldErrors.citizenship && <p className="mt-1 text-sm text-red-500">{fieldErrors.citizenship}</p>}
        </div>
      </div>
    </div>
  );

  const renderEmergencyContactSection = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Contact Name *</label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><User size={18} /></span>
            <input type="text" name="emergency_c_name" value={formData.emergency_c_name} onChange={handleInputChange} placeholder="Emergency contact full name" className={`${inputCls("emergency_c_name")} pl-11`} />
          </div>
          {fieldErrors.emergency_c_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Relationship *</label>
          <select name="emergency_c_relation" value={formData.emergency_c_relation} onChange={handleInputChange} className={selectCls("emergency_c_relation")}>
            <option value="">Select Relationship</option>
            {relationships.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {fieldErrors.emergency_c_relation && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_relation}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Phone Number *</label>
          {selectedEmergencyPhoneCountry && (
            <PhoneInput name="emergency_c_phone" value={formData.emergency_c_phone}
              onChange={handleInputChange} error={fieldErrors.emergency_c_phone}
              selectedCountry={selectedEmergencyPhoneCountry} onCountryChange={setSelectedEmergencyPhoneCountry}
              allCountries={allCountries} placeholder="Emergency contact phone" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Email Address</label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"><Mail size={18} /></span>
            <input type="email" name="emergency_c_email" value={formData.emergency_c_email} onChange={handleInputChange} placeholder="Emergency contact email" className={`${inputCls("emergency_c_email")} pl-11`} />
          </div>
          {fieldErrors.emergency_c_email && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_email}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Main Tab Navigation */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="flex overflow-x-auto">
          {mainTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveMainTab(tab.id)}
                className={`flex items-center flex-col flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeMainTab === tab.id
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}>
                <Icon size={20} className="mb-2" />
                {tab.label}
                {(tab.id === "workexperience" || tab.id === "interests") && (
                  <span className="text-[12px]">(Optional)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {activeMainTab === "profile" && (
          <div className="space-y-6">
            {formSections.map((section, index) => {
              const Icon = section.icon;
              const isExpanded = expandedSections[section.id];
              const nextSection = formSections[index + 1];
              return (
                <div key={section.id} className={`rounded-xl border ${isExpanded ? 'border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/10' : 'border-gray-200 dark:border-gray-800'}`}>
                  <button type="button" onClick={() => toggleSection(section.id)} className="flex w-full items-center justify-between p-5 text-left">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${section.completed ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{section.title}</h3>
                        {section.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{section.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {section.completed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle size={12} /> Completed
                        </span>
                      )}
                      <span className="text-gray-400 dark:text-gray-500">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-5 dark:border-gray-800">
                      {section.id === "personal" && renderPersonalInfoSection()}
                      {section.id === "address" && renderAddressSection()}
                      {section.id === "emergency" && renderEmergencyContactSection()}
                      <div className="mt-6 flex items-center justify-between">
                        <button type="button" onClick={() => saveSection(section.id, nextSection?.id)}
                          disabled={sectionStatus[section.id].isSaving}
                          className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed">
                          {sectionStatus[section.id].isSaving ? (
                            <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>Saving...</>
                          ) : (
                            <>Save {section.title}{nextSection && <span className="text-xs"> & Continue</span>}</>
                          )}
                        </button>
                        {sectionStatus[section.id].message && (
                          <div className={`flex items-center gap-2 text-sm ${sectionStatus[section.id].messageType === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {sectionStatus[section.id].messageType === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <span>{sectionStatus[section.id].message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {activeMainTab === "testscores" && <TestScores />}
        {activeMainTab === "interests" && <AcademicInterests />}
        {activeMainTab === "workexperience" && <WorkExperience />}
        {activeMainTab === "academics" && <AcademicQualifications />}
      </div>
    </div>
  );
}
