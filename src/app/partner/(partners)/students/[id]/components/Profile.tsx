"use client"
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { User, Calendar, MapPin, Users, AlertTriangle, Award, BookOpen, ChevronDown, ChevronUp, Briefcase, GraduationCap, CheckCircle, XCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Country, State, City } from "country-state-city";
import { useAuth } from "@/context/AuthContext";
import TestScores from "./TestScores";
import AcademicInterests from "./AcademicInterests";
import WorkExperience from "./WorkExperience";
import AcademicQualifications from "./AcademicQualifications";
import phoneCountries from "country-list-with-dial-code-and-flag";

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
  country_code: string;
  state_code: string;
  city_code: string;
  address: string;
  postal_code: string;
  emergency_c_name: string;
  emergency_c_relation: string;
  emergency_c_email: string;
  emergency_c_phone: string;
}

interface SectionStatus {
  isSaving: boolean;
  message: string;
  messageType: 'success' | 'error' | '';
}

interface PhoneCountry {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

const PhoneInput = ({ value, onChange, name, error, disabled = false, selectedCountry, onCountryChange, placeholder = "Phone number" }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; error?: string;
  disabled?: boolean; selectedCountry: PhoneCountry; onCountryChange: (country: PhoneCountry) => void; placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const allCountries = phoneCountries.getAll() as PhoneCountry[];
  const filteredCountries = allCountries.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dial_code.includes(searchTerm) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (selectedCountry && newValue.startsWith(selectedCountry.dial_code)) newValue = newValue.substring(selectedCountry.dial_code.length);
    newValue = newValue.replace(/\D/g, '');
    onChange({ ...e, target: { ...e.target, name, value: newValue } });
  };

  return (
    <div>
      <div className="flex">
        <div className="relative mr-2">
          <button type="button" onClick={() => setIsOpen(!isOpen)} disabled={disabled}
            className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-gray-700 dark:text-gray-300">{selectedCountry.dial_code}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              <div className="absolute left-0 z-20 w-72 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input type="text" placeholder="Search country..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" autoFocus />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button key={country.code} type="button" onClick={() => { onCountryChange(country); setIsOpen(false); setSearchTerm(""); }}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                      <span className="text-xl mr-3">{country.flag}</span>
                      <span className="flex-1 text-left text-gray-700 dark:text-gray-300">{country.name}</span>
                      <span className="text-gray-500 dark:text-gray-400">{country.dial_code}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && <div className="px-3 py-4 text-sm text-center text-gray-500">No countries found</div>}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex-1">
          <input type="tel" name={name} placeholder={placeholder} value={value} onChange={handlePhoneChange} disabled={disabled}
            className={`h-11 w-full rounded-lg border px-4 py-3 text-sm dark:bg-gray-900 dark:text-white/90 border-gray-300 dark:border-gray-700 ${error ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default function ProfileForm() {
  const { id: studentId } = useParams();
  const [activeMainTab, setActiveMainTab] = useState<string>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const [formData, setFormData] = useState<StudentFormData>({
    salutation: "", first_name: "", middle_name: "", last_name: "", email: "", phone: "",
    passport_number: "", dob: null, gender: "", citizenship: "",
    country_code: "", state_code: "", city_code: "", address: "", postal_code: "",
    emergency_c_name: "", emergency_c_relation: "", emergency_c_email: "", emergency_c_phone: "",
  });

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ personal: true, address: false, emergency: false });
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<PhoneCountry | null>(null);
  const [selectedEmergencyPhoneCountry, setSelectedEmergencyPhoneCountry] = useState<PhoneCountry | null>(null);
  const [sectionStatus, setSectionStatus] = useState<Record<string, SectionStatus>>({
    personal: { isSaving: false, message: '', messageType: '' },
    address: { isSaving: false, message: '', messageType: '' },
    emergency: { isSaving: false, message: '', messageType: '' },
  });

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/agent/student/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const { data } = await response.json();
          if (data) {
            const allCountries = phoneCountries.getAll() as PhoneCountry[];
            const originalPhone = data.phone || '';
            const originalEmergencyPhone = data.emergency_c_phone || '';
            let detectedPhoneCountry = allCountries.find(c => originalPhone.startsWith(c.dial_code));
            let phoneWithoutCode = detectedPhoneCountry ? originalPhone.substring(detectedPhoneCountry.dial_code.length) : originalPhone;
            if (!detectedPhoneCountry) detectedPhoneCountry = allCountries.find(c => c.code === "US") || allCountries[0];
            let detectedEmergencyCountry = allCountries.find(c => originalEmergencyPhone.startsWith(c.dial_code));
            let emergencyWithoutCode = detectedEmergencyCountry ? originalEmergencyPhone.substring(detectedEmergencyCountry.dial_code.length) : originalEmergencyPhone;
            if (!detectedEmergencyCountry) detectedEmergencyCountry = allCountries.find(c => c.code === "US") || allCountries[0];
            setFormData(prev => ({
              ...prev,
              salutation: data.salutation || "", first_name: data.first_name || "", middle_name: data.middle_name || "",
              last_name: data.last_name || "", email: data.email || "", phone: phoneWithoutCode,
              passport_number: data.passport_number || "", dob: data.dob ? new Date(data.dob) : null,
              gender: data.gender || "", citizenship: data.citizenship || "",
              country_code: data.country_code || "", state_code: data.state_code || "", city_code: data.city_code || "",
              address: data.address || "", postal_code: data.postal_code || "",
              emergency_c_name: data.emergency_c_name || "", emergency_c_relation: data.emergency_c_relation || "",
              emergency_c_email: data.emergency_c_email || "", emergency_c_phone: emergencyWithoutCode,
            }));
            setSelectedCountry(data.country_code || "");
            setSelectedState(data.state_code || "");
            setSelectedPhoneCountry(detectedPhoneCountry);
            setSelectedEmergencyPhoneCountry(detectedEmergencyCountry);
          }
        } else {
          setError('Failed to fetch student data');
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to fetch student data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getSectionIdFromFieldName = (fieldName: string): string | null => {
    const personalFields = ['salutation', 'first_name', 'middle_name', 'last_name', 'email', 'phone', 'passport_number', 'dob', 'gender'];
    const addressFields = ['country_code', 'state_code', 'city_code', 'address', 'postal_code', 'citizenship'];
    const emergencyFields = ['emergency_c_name', 'emergency_c_relation', 'emergency_c_email', 'emergency_c_phone'];
    if (personalFields.includes(fieldName)) return 'personal';
    if (addressFields.includes(fieldName)) return 'address';
    if (emergencyFields.includes(fieldName)) return 'emergency';
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    const sectionId = getSectionIdFromFieldName(name);
    if (sectionId && sectionStatus[sectionId]?.message) {
      setSectionStatus(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], message: '', messageType: '' } }));
    }
    if (name === 'phone' || name === 'emergency_c_phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else if (name === 'country_code') {
      setSelectedCountry(value);
      setSelectedState("");
      setFormData(prev => ({ ...prev, country_code: value, state_code: "", city_code: "" }));
    } else if (name === 'state_code') {
      setSelectedState(value);
      setFormData(prev => ({ ...prev, state_code: value, city_code: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, dob: date }));
    if (fieldErrors.dob) setFieldErrors(prev => { const n = { ...prev }; delete n.dob; return n; });
  };

  const validateSection = (sectionId: string): boolean => {
    const errors: Record<string, string> = {};
    if (sectionId === 'personal') {
      if (!formData.salutation) errors.salutation = "Salutation is required";
      if (!formData.first_name.trim()) errors.first_name = "First name is required";
      if (!formData.last_name.trim()) errors.last_name = "Last name is required";
      if (!formData.email.trim()) errors.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format";
      if (!formData.phone.trim()) errors.phone = "Phone number is required";
      if (!formData.dob) errors.dob = "Date of birth is required";
      if (!formData.gender) errors.gender = "Gender is required";
    } else if (sectionId === 'address') {
      if (!formData.address.trim()) errors.address = "Address is required";
      if (!formData.country_code) errors.country_code = "Country is required";
      if (!formData.state_code) errors.state_code = "State/Province is required";
      if (!formData.city_code) errors.city_code = "City is required";
      if (!formData.postal_code.trim()) errors.postal_code = "Postal code is required";
      if (!formData.citizenship) errors.citizenship = "Citizenship is required";
    } else if (sectionId === 'emergency') {
      if (!formData.emergency_c_name.trim()) errors.emergency_c_name = "Emergency contact name is required";
      if (!formData.emergency_c_relation) errors.emergency_c_relation = "Relationship is required";
      if (!formData.emergency_c_phone.trim()) errors.emergency_c_phone = "Emergency contact phone is required";
      if (formData.emergency_c_email && !/^\S+@\S+\.\S+$/.test(formData.emergency_c_email)) errors.emergency_c_email = "Invalid email format";
    }
    setFieldErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const saveSection = async (sectionId: string, nextSectionId?: string) => {
    if (!validateSection(sectionId)) {
      setSectionStatus(prev => ({ ...prev, [sectionId]: { isSaving: false, message: 'Please fill all required fields', messageType: 'error' } }));
      return;
    }
    setSectionStatus(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], isSaving: true, message: '', messageType: '' } }));
    try {
      let formattedPhone = formData.phone;
      if (formData.phone && selectedPhoneCountry) {
        let clean = formData.phone.startsWith(selectedPhoneCountry.dial_code) ? formData.phone.substring(selectedPhoneCountry.dial_code.length) : formData.phone;
        formattedPhone = selectedPhoneCountry.dial_code + clean;
      }
      let formattedEmergencyPhone = formData.emergency_c_phone;
      if (formData.emergency_c_phone && selectedEmergencyPhoneCountry) {
        let clean = formData.emergency_c_phone.startsWith(selectedEmergencyPhoneCountry.dial_code) ? formData.emergency_c_phone.substring(selectedEmergencyPhoneCountry.dial_code.length) : formData.emergency_c_phone;
        formattedEmergencyPhone = selectedEmergencyPhoneCountry.dial_code + clean;
      }

      let apiData: any = {};
      if (sectionId === 'personal') {
        apiData = { salutation: formData.salutation, first_name: formData.first_name, middle_name: formData.middle_name, last_name: formData.last_name, email: formData.email, phone: formattedPhone, passport_number: formData.passport_number, dob: formData.dob ? formData.dob.toISOString().split('T')[0] : null, gender: formData.gender };
      } else if (sectionId === 'address') {
        apiData = { country_code: formData.country_code, state_code: formData.state_code, city_code: formData.city_code, address: formData.address, postal_code: formData.postal_code, citizenship: formData.citizenship };
      } else if (sectionId === 'emergency') {
        apiData = { emergency_c_name: formData.emergency_c_name, emergency_c_relation: formData.emergency_c_relation, emergency_c_email: formData.emergency_c_email, emergency_c_phone: formattedEmergencyPhone };
      }

      const response = await fetch(`${BASE_URL}/agent/student/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData),
      });
      const result = await response.json();
      if (!result.success) {
        setSectionStatus(prev => ({ ...prev, [sectionId]: { isSaving: false, message: result.message || 'Failed to save', messageType: 'error' } }));
      } else {
        setSectionStatus(prev => ({ ...prev, [sectionId]: { isSaving: false, message: 'Saved successfully!', messageType: 'success' } }));
        if (nextSectionId) {
          setTimeout(() => { setExpandedSections(prev => ({ ...prev, [sectionId]: false, [nextSectionId]: true })); }, 1000);
        }
      }
    } catch (err) {
      setSectionStatus(prev => ({ ...prev, [sectionId]: { isSaving: false, message: 'An error occurred. Please try again.', messageType: 'error' } }));
    }
  };

  const isSectionComplete = (sectionId: string): boolean => {
    if (sectionId === 'personal') return !!(formData.salutation && formData.first_name.trim() && formData.last_name.trim() && formData.email.trim() && /^\S+@\S+\.\S+$/.test(formData.email) && formData.phone.trim() && formData.dob && formData.gender);
    if (sectionId === 'address') return !!(formData.address.trim() && formData.country_code && formData.state_code && formData.city_code && formData.postal_code.trim() && formData.citizenship);
    if (sectionId === 'emergency') return !!(formData.emergency_c_name.trim() && formData.emergency_c_relation && formData.emergency_c_phone.trim() && (!formData.emergency_c_email || /^\S+@\S+\.\S+$/.test(formData.emergency_c_email)));
    return false;
  };

  const countries = Country.getAllCountries();
  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry) : [];
  const cities = selectedState ? City.getCitiesOfState(selectedCountry, selectedState) : [];
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

  const formSections = [
    { id: "personal", title: "Personal Information", icon: User, description: "Provide your basic personal details", completed: isSectionComplete("personal") },
    { id: "address", title: "Current Address", icon: MapPin, description: "Enter your current residential address", completed: isSectionComplete("address") },
    { id: "emergency", title: "Emergency Contact", icon: Users, description: "Add your emergency contact information", completed: isSectionComplete("emergency") },
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
          <AlertTriangle className="mx-auto text-red-500 h-8 w-8" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Failed to load student data</p>
        </div>
      </div>
    );
  }

  const inputCls = (fieldName: string) =>
    `h-11 w-full rounded-lg border bg-transparent px-4 py-3 text-sm dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${fieldErrors[fieldName] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`;
  const inputClsPl = (fieldName: string) =>
    `h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${fieldErrors[fieldName] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`;

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeMainTab === tab.id
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Information Tab */}
      {activeMainTab === "profile" && (
        <div className="space-y-4">
          {formSections.map((section) => {
            const isExpanded = expandedSections[section.id];
            const status = sectionStatus[section.id];
            const Icon = section.icon;
            return (
              <div key={section.id} className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${section.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {section.completed
                        ? <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                        : <Icon size={18} className="text-gray-400" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{section.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{section.description}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 px-6 pb-6 pt-5 dark:border-gray-800">
                    {/* Status Messages */}
                    {status.message && (
                      <div className={`mb-4 rounded-lg p-3 text-sm ${status.messageType === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {status.message}
                      </div>
                    )}

                    {/* Personal Info Fields */}
                    {section.id === "personal" && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Salutation *</label>
                            <select name="salutation" value={formData.salutation} onChange={handleInputChange} className={`appearance-none ${inputCls('salutation')}`}>
                              <option value="">Select Salutation</option>
                              {salutations.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {fieldErrors.salutation && <p className="mt-1 text-sm text-red-500">{fieldErrors.salutation}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">First Name *</label>
                            <div className="relative">
                              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"><User size={18} /></span>
                              <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Enter your first name" className={inputClsPl('first_name')} />
                            </div>
                            {fieldErrors.first_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.first_name}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Middle Name</label>
                            <input type="text" name="middle_name" value={formData.middle_name} onChange={handleInputChange} placeholder="Enter your middle name" className={inputCls('middle_name')} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Last Name *</label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Enter your last name" className={inputCls('last_name')} />
                            {fieldErrors.last_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.last_name}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" className={inputCls('email')} />
                            {fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Phone *</label>
                            {selectedPhoneCountry && (
                              <PhoneInput name="phone" value={formData.phone} onChange={handleInputChange} error={fieldErrors.phone}
                                selectedCountry={selectedPhoneCountry} onCountryChange={setSelectedPhoneCountry} placeholder="Phone number" />
                            )}
                            {fieldErrors.phone && !selectedPhoneCountry && <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Date of Birth *</label>
                            <DatePicker
                              selected={formData.dob} onChange={handleDateChange} dateFormat="yyyy-MM-dd" placeholderText="Select date of birth"
                              showYearDropdown showMonthDropdown dropdownMode="select" yearDropdownItemNumber={80} scrollableYearDropdown isClearable maxDate={new Date()}
                              className={`h-11 w-full rounded-lg border px-4 py-3 text-sm dark:bg-gray-900 dark:text-white/90 ${fieldErrors.dob ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                            />
                            {fieldErrors.dob && <p className="mt-1 text-sm text-red-500">{fieldErrors.dob}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Gender *</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange} className={`appearance-none ${inputCls('gender')}`}>
                              <option value="">Select Gender</option>
                              {genders.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            {fieldErrors.gender && <p className="mt-1 text-sm text-red-500">{fieldErrors.gender}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Passport Number</label>
                            <input type="text" name="passport_number" value={formData.passport_number} onChange={handleInputChange} placeholder="Enter passport number" className={inputCls('passport_number')} />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                          <button type="button" onClick={() => saveSection("personal", "address")} disabled={status.isSaving}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                            {status.isSaving ? 'Saving...' : 'Save & Next'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Address Fields */}
                    {section.id === "address" && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Country *</label>
                            <div className="relative">
                              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"><MapPin size={18} /></span>
                              <select name="country_code" value={formData.country_code} onChange={handleInputChange} className={`appearance-none ${inputClsPl('country_code')}`}>
                                <option value="">Select Country</option>
                                {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                              </select>
                            </div>
                            {fieldErrors.country_code && <p className="mt-1 text-sm text-red-500">{fieldErrors.country_code}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">State/Province *</label>
                            <select name="state_code" value={formData.state_code} onChange={handleInputChange} disabled={!selectedCountry} className={`appearance-none ${inputCls('state_code')} ${!selectedCountry ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <option value="">Select State/Province</option>
                              {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                            </select>
                            {fieldErrors.state_code && <p className="mt-1 text-sm text-red-500">{fieldErrors.state_code}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">City *</label>
                            <select name="city_code" value={formData.city_code} onChange={handleInputChange} disabled={!selectedState} className={`appearance-none ${inputCls('city_code')} ${!selectedState ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <option value="">Select City</option>
                              {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            {fieldErrors.city_code && <p className="mt-1 text-sm text-red-500">{fieldErrors.city_code}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Postal Code *</label>
                            <input type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange} placeholder="Enter postal code" className={inputCls('postal_code')} />
                            {fieldErrors.postal_code && <p className="mt-1 text-sm text-red-500">{fieldErrors.postal_code}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Citizenship *</label>
                            <select name="citizenship" value={formData.citizenship} onChange={handleInputChange} className={`appearance-none ${inputCls('citizenship')}`}>
                              <option value="">Select Citizenship</option>
                              {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                            </select>
                            {fieldErrors.citizenship && <p className="mt-1 text-sm text-red-500">{fieldErrors.citizenship}</p>}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Address *</label>
                            <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} placeholder="Enter your full address"
                              className={`w-full rounded-lg border bg-transparent px-4 py-3 text-sm dark:bg-gray-900 dark:text-white/90 resize-none ${fieldErrors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                            {fieldErrors.address && <p className="mt-1 text-sm text-red-500">{fieldErrors.address}</p>}
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                          <button type="button" onClick={() => saveSection("address", "emergency")} disabled={status.isSaving}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                            {status.isSaving ? 'Saving...' : 'Save & Next'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact Fields */}
                    {section.id === "emergency" && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Contact Name *</label>
                            <div className="relative">
                              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"><Users size={18} /></span>
                              <input type="text" name="emergency_c_name" value={formData.emergency_c_name} onChange={handleInputChange} placeholder="Full name" className={inputClsPl('emergency_c_name')} />
                            </div>
                            {fieldErrors.emergency_c_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_name}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Relationship *</label>
                            <select name="emergency_c_relation" value={formData.emergency_c_relation} onChange={handleInputChange} className={`appearance-none ${inputCls('emergency_c_relation')}`}>
                              <option value="">Select Relationship</option>
                              {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {fieldErrors.emergency_c_relation && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_relation}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Email</label>
                            <input type="email" name="emergency_c_email" value={formData.emergency_c_email} onChange={handleInputChange} placeholder="Emergency contact email" className={inputCls('emergency_c_email')} />
                            {fieldErrors.emergency_c_email && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_email}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Phone *</label>
                            {selectedEmergencyPhoneCountry && (
                              <PhoneInput name="emergency_c_phone" value={formData.emergency_c_phone} onChange={handleInputChange} error={fieldErrors.emergency_c_phone}
                                selectedCountry={selectedEmergencyPhoneCountry} onCountryChange={setSelectedEmergencyPhoneCountry} placeholder="Emergency phone" />
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                          <button type="button" onClick={() => saveSection("emergency")} disabled={status.isSaving}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                            {status.isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeMainTab === "academics" && <AcademicQualifications />}
      {activeMainTab === "testscores" && <TestScores />}
      {activeMainTab === "interests" && <AcademicInterests />}
      {activeMainTab === "workexperience" && <WorkExperience />}
    </div>
  );
}
