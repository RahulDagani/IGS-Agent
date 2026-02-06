"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { User, Calendar, Phone, Mail, MapPin, Globe, Users, Plus, AlertTriangle, Award, BookOpen, ChevronDown, ChevronUp, Briefcase, GraduationCap } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Country, State, City } from "country-state-city";
import { useAuth } from "@/context/AuthContext";
import TestScores from "./TestScores";
import AcademicInterests from "./AcademicInterests";
import WorkExperience from "./WorkExperience";
import AcademicQualifications from "./AcademicQualifications";

interface StudentFormData {
  // Personal Info
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
  
  // Address
  country_code: string;
  state_code: string;
  city_code: string;
  address: string;
  postal_code: string;
  
  // Emergency Contact
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
}

export default function ProfileForm() {
  const {studentId} = useParams();
  const router = useRouter();
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const [formData, setFormData] = useState<StudentFormData>({
    // Personal Info
    salutation: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    passport_number: "",
    dob: null,
    gender: "",
    citizenship: "",
    
    // Address
    country_code: "",
    state_code: "",
    city_code: "",
    address: "",
    postal_code: "",
    
    // Emergency Contact
    emergency_c_name: "",
    emergency_c_relation: "",
    emergency_c_email: "",
    emergency_c_phone: "",
  });

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    address: false,
    emergency: false,
  });

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/student`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const { data } = await response.json();
         
          // Transform API data to match form structure
          if (data) {
            setFormData(prev => ({
              ...prev,
              salutation: data.salutation || "",
              first_name: data.first_name || "",
              middle_name: data.middle_name || "",
              last_name: data.last_name || "",
              email: data.email || "",
              phone: data.phone || "",
              passport_number: data.passport_number || "",
              dob: data.dob ? new Date(data.dob) : null,
              gender: data.gender || "",
              citizenship: data.citizenship || "",
              country_code: data.country_code || "",
              state_code: data.state_code || "",
              city_code: data.city_code || "",
              address: data.address || "",
              postal_code: data.postal_code || "",
              emergency_c_name: data.emergency_c_name || "",
              emergency_c_relation: data.emergency_c_relation || "",
              emergency_c_email: data.emergency_c_email || "",
              emergency_c_phone: data.emergency_c_phone || "",
            }));

            setSelectedCountry(data.country_code);
            setSelectedState(data.state_code);
          }
        } else {
          setError('Failed to fetch student data');
          console.error('Failed to fetch student data');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isSectionComplete = (sectionId: string): boolean => {
    switch (sectionId) {
      case "personal":
        return !!(formData.salutation && 
                 formData.first_name.trim() && 
                 formData.last_name.trim() && 
                 formData.email.trim() && 
                 /^\S+@\S+\.\S+$/.test(formData.email) &&
                 formData.phone.trim() && 
                 formData.dob && 
                 formData.gender);
                 
      case "address":
        return !!(formData.address.trim() && 
                 formData.country_code && 
                 formData.state_code && 
                 formData.city_code && 
                 formData.postal_code.trim() && 
                 formData.citizenship);
                 
      case "emergency":
        return !!(formData.emergency_c_name.trim() && 
                 formData.emergency_c_relation && 
                 formData.emergency_c_phone.trim() &&
                 (!formData.emergency_c_email || /^\S+@\S+\.\S+$/.test(formData.emergency_c_email)));
                 
      default:
        return false;
    }
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
        if (!formData.dob) errors.dob = "Date of birth is required";
        if (!formData.gender) errors.gender = "Gender is required";
        break;
        
      case "address":
        if (!formData.address.trim()) errors.address = "Address is required";
        if (!formData.country_code) errors.country_code = "Country is required";
        if (!formData.state_code) errors.state_code = "State/Province is required";
        if (!formData.city_code) errors.city_code = "City is required";
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
    const { name, value, type } = e.target;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Update country and state selections for dependent dropdowns
    if (name === 'country_code') {
      setSelectedCountry(value);
      setSelectedState("");
      setFormData(prev => ({
        ...prev,
        state_code: "",
        city_code: ""
      }));
    } else if (name === 'state_code') {
      setSelectedState(value);
      setFormData(prev => ({
        ...prev,
        city_code: ""
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      dob: date
    }));
    
    // Clear date error when user selects a date
    if (fieldErrors.dob) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dob;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all sections before submission
    const isPersonalValid = validateSection("personal");
    const isAddressValid = validateSection("address");
    const isEmergencyValid = validateSection("emergency");
    
    if (!isPersonalValid || !isAddressValid || !isEmergencyValid) {
      setValidationMessage("Please fix all validation errors before submitting.");
      // Expand sections with errors
      setExpandedSections({
        personal: isPersonalValid ? expandedSections.personal : true,
        address: isAddressValid ? expandedSections.address : true,
        emergency: isEmergencyValid ? expandedSections.emergency : true,
      });
      return;
    }

    setIsSubmitting(true);
    setValidationMessage("");

    try {
      // Transform data for API
      const apiData = {
        salutation: formData.salutation,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        passport_number: formData.passport_number,
        country_code: formData.country_code,
        state_code: formData.state_code,
        city_code: formData.city_code,
        dob: formData.dob ? formData.dob.toISOString().split('T')[0] : null,
        gender: formData.gender,
        citizenship: formData.citizenship,
        address: formData.address,
        postal_code: formData.postal_code,
        emergency_c_name: formData.emergency_c_name,
        emergency_c_relation: formData.emergency_c_relation,
        emergency_c_email: formData.emergency_c_email,
        emergency_c_phone: formData.emergency_c_phone,
      };

      const response = await fetch(`${BASE_URL}/student`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();
      if (!result.success) {
        setValidationMessage(result.message);
      } else {
        setValidationMessage("Student data saved successfully!");
      }
      
    } catch (error) {
      console.error('Error saving student data:', error);
      setValidationMessage("An error occurred while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get countries, states, and cities
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

  const formSections: FormSection[] = [
    { 
      id: "personal", 
      title: "Personal Information", 
      icon: User, 
      description: "Provide your basic personal details",
      completed: isSectionComplete("personal")
    },
    { 
      id: "address", 
      title: "Current Address", 
      icon: MapPin, 
      description: "Enter your current residential address",
      completed: isSectionComplete("address")
    },
    { 
      id: "emergency", 
      title: "Emergency Contact", 
      icon: Users, 
      description: "Add your emergency contact information",
      completed: isSectionComplete("emergency")
    },
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
          <div className="flex justify-center text-red-500">
            <AlertTriangle />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Failed to Fetch Saved data</p>
        </div>
      </div>
    );
  }

  const renderPersonalInfoSection = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Salutation */}
        <div>
          <label htmlFor="salutation" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Salutation *
          </label>
          <select
            id="salutation"
            name="salutation"
            value={formData.salutation}
            onChange={handleInputChange}
            required
            className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
              fieldErrors.salutation ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <option value="">Select Salutation</option>
            {salutations.map(salutation => (
              <option key={salutation} value={salutation}>{salutation}</option>
            ))}
          </select>
          {fieldErrors.salutation && <p className="mt-1 text-sm text-red-500">{fieldErrors.salutation}</p>}
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            First Name *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <User size={18} />
            </span>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              required
              className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                fieldErrors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
          </div>
          {fieldErrors.first_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.first_name}</p>}
        </div>

        {/* Middle Name */}
        <div>
          <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Middle Name
          </label>
          <input
            type="text"
            id="middle_name"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleInputChange}
            placeholder="Enter your middle name"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Last Name *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Enter your last name"
            required
            className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
              fieldErrors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {fieldErrors.last_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.last_name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Email *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Mail size={18} />
            </span>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
          </div>
          {fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Date of Birth *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10">
              <Calendar size={18} />
            </span>
            <DatePicker
              selected={formData.dob}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select date of birth"
              className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                fieldErrors.dob ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              required
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
            />
          </div>
          {fieldErrors.dob && <p className="mt-1 text-sm text-red-500">{fieldErrors.dob}</p>}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Gender *
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
            className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
              fieldErrors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <option value="">Select Gender</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
          {fieldErrors.gender && <p className="mt-1 text-sm text-red-500">{fieldErrors.gender}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Phone Number *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Phone size={18} />
            </span>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
              className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                fieldErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
          </div>
          {fieldErrors.phone && <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>}
        </div>

        {/* Passport Number */}
        <div>
          <label htmlFor="passport_number" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Passport Number
          </label>
          <input
            type="text"
            id="passport_number"
            name="passport_number"
            value={formData.passport_number}
            onChange={handleInputChange}
            placeholder="Enter your passport number"
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>
    </div>
  );

  const renderAddressSection = () => (
    <div className="space-y-5">
      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          Address *
        </label>
        <div className="relative">
          <span className="absolute top-4 left-4 text-gray-500 dark:text-gray-400">
            <MapPin size={18} />
          </span>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter your complete address"
            rows={3}
            required
            className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none ${
              fieldErrors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          />
        </div>
        {fieldErrors.address && <p className="mt-1 text-sm text-red-500">{fieldErrors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Country */}
        <div>
          <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Country *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Globe size={18} />
            </span>
            <select
              id="country_code"
              name="country_code"
              value={formData.country_code}
              onChange={handleInputChange}
              required
              className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
                fieldErrors.country_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
              ))}
            </select>
          </div>
          {fieldErrors.country_code && <p className="mt-1 text-sm text-red-500">{fieldErrors.country_code}</p>}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            State/Province *
          </label>
          <select
            id="state_code"
            name="state_code"
            value={formData.state_code}
            onChange={handleInputChange}
            required
            className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
              fieldErrors.state_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
            ))}
          </select>
          {fieldErrors.state_code && <p className="mt-1 text-sm text-red-500">{fieldErrors.state_code}</p>}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            City *
          </label>
          <select
            id="city_code"
            name="city_code"
            value={formData.city_code}
            onChange={handleInputChange}
            required
            className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
              fieldErrors.city_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
          {fieldErrors.city_code && <p className="mt-1 text-sm text-red-500">{fieldErrors.city_code}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Postal Code */}
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Postal Code *
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleInputChange}
            placeholder="Enter your postal code"
            required
            className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
              fieldErrors.postal_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {fieldErrors.postal_code && <p className="mt-1 text-sm text-red-500">{fieldErrors.postal_code}</p>}
        </div>

        {/* Citizenship */}
        <div>
          <label htmlFor="citizenship" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Citizenship *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Globe size={18} />
            </span>
            <select
              id="citizenship"
              name="citizenship"
              value={formData.citizenship}
              onChange={handleInputChange}
              required
              className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
                fieldErrors.citizenship ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <option value="">Select Citizenship</option>
              {countries.map(country => (
                <option key={country.isoCode} value={country.name}>{country.name}</option>
              ))}
            </select>
          </div>
          {fieldErrors.citizenship && <p className="mt-1 text-sm text-red-500">{fieldErrors.citizenship}</p>}
        </div>
      </div>
    </div>
  );

  const renderEmergencyContactSection = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Emergency Contact Name */}
        <div>
          <label htmlFor="emergency_c_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Emergency Contact Name *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <User size={18} />
            </span>
            <input
              type="text"
              id="emergency_c_name"
              name="emergency_c_name"
              value={formData.emergency_c_name}
              onChange={handleInputChange}
              placeholder="Enter emergency contact full name"
              required
              className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                fieldErrors.emergency_c_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
          </div>
          {fieldErrors.emergency_c_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_name}</p>}
        </div>

        {/* Relationship */}
        <div>
          <label htmlFor="emergency_c_relation" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Relationship *
          </label>
          <select
            id="emergency_c_relation"
            name="emergency_c_relation"
            value={formData.emergency_c_relation}
            onChange={handleInputChange}
            required
            className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none ${
              fieldErrors.emergency_c_relation ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <option value="">Select Relationship</option>
            {relationships.map(relationship => (
              <option key={relationship} value={relationship}>{relationship}</option>
            ))}
          </select>
          {fieldErrors.emergency_c_relation && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_relation}</p>}
        </div>

        {/* Emergency Contact Phone */}
        <div>
          <label htmlFor="emergency_c_phone" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Phone Number *
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Phone size={18} />
            </span>
            <input
              type="tel"
              id="emergency_c_phone"
              name="emergency_c_phone"
              value={formData.emergency_c_phone}
              onChange={handleInputChange}
              placeholder="Enter emergency contact phone"
              required
              className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                fieldErrors.emergency_c_phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
          </div>
          {fieldErrors.emergency_c_phone && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_phone}</p>}
        </div>

        {/* Emergency Contact Email */}
        <div>
          <label htmlFor="emergency_c_email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Mail size={18} />
            </span>
            <input
              type="email"
              id="emergency_c_email"
              name="emergency_c_email"
              value={formData.emergency_c_email}
              onChange={handleInputChange}
              placeholder="Enter emergency contact email"
              className={`dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                fieldErrors.emergency_c_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
          </div>
          {fieldErrors.emergency_c_email && <p className="mt-1 text-sm text-red-500">{fieldErrors.emergency_c_email}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">

        {validationMessage && (
          <div className="px-5 py-4 sm:px-6 sm:py-5">
          <p className={`mt-1 text-sm ${
            validationMessage.includes("successfully") 
              ? "text-green-500 dark:text-green-400" 
              : "text-red-500 dark:text-red-400"
          }`}>
            {validationMessage}
          </p>
          </div>
        )}
      
      
      {/* Main Tab Navigation */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="flex overflow-x-auto">
          {mainTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as MainTab)}
                className={`flex items-center flex-col flex-1 gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeMainTab === tab.id
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <IconComponent size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Profile Tab Content */}
        {activeMainTab === "profile" && (
          <form onSubmit={handleSubmit}>
            {/* Form Sections */}
            <div className="space-y-6">
              {formSections.map((section) => {
                const IconComponent = section.icon;
                const isExpanded = expandedSections[section.id];
                
                return (
                  <div 
                    key={section.id} 
                    className={`rounded-xl border ${
                      isExpanded 
                        ? 'border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/10' 
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {/* Section Header */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between p-5 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          section.completed 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {section.title}
                          </h3>
                          {section.description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {section.completed && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L4.5 8.5L2 6"/>
                            </svg>
                            Completed
                          </span>
                        )}
                        <span className="text-gray-400 dark:text-gray-500">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                    </button>

                    {/* Section Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-5 dark:border-gray-800">
                        {section.id === "personal" && renderPersonalInfoSection()}
                        {section.id === "address" && renderAddressSection()}
                        {section.id === "emergency" && renderEmergencyContactSection()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !formSections.every(section => section.completed)}
                  className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save All Sections
                      <Plus size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Test Scores Tab Content */}
        {activeMainTab === "testscores" && <TestScores />}

        {/* Academic Interests Tab Content */}
        {activeMainTab === "interests" && <AcademicInterests />}

        {/* Work Experience Tab Content */}
        {activeMainTab === "workexperience" && <WorkExperience />}

        {activeMainTab === "academics" && <AcademicQualifications />}
      </div>
    </div>
  );
}