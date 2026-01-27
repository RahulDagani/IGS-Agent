"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Globe, GraduationCap, Pencil, Percent, University, Calendar } from "lucide-react";
import { Country } from "country-state-city";
import { useAuth } from "@/context/AuthContext";

interface CommissionFormData {
  // country_code: string;
  university_id: string;
  study_level_id: string;
  tenant_commission: string;
  commission_type: string;
  no_of_installments: string; // Added this field
  remark: string;
}

interface UniversityType {
  id: number;
  university: string;
}

interface StudyLevel {
  id: number;
  name: string;
  slug: string;
}

interface CountryType {
  code: string;
  name: string;
}

interface CommissionData {
  id: number;
  tenant_id: number;
  // country_code: string;
  university_id: number;
  study_level_id: number;
  tenant_commission: string;
  commission_type: string;
  no_of_installments: string; // Added this field (or it might be no_of_installments from API)
  remark: string;
  created_at: string;
  updated_at: string;
}

export default function EditCommission() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  
  const [formData, setFormData] = useState<CommissionFormData>({
    // country_code: "",
    university_id: "",
    study_level_id: "",
    tenant_commission: "",
    commission_type: "percentage",
    no_of_installments: "1", // Default to 1 installment
    remark: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [countries, setCountries] = useState<CountryType[]>([]);
  const [universities, setUniversities] = useState<UniversityType[]>([]);
  const [studyLevels, setStudyLevels] = useState<StudyLevel[]>([]);

  // Fetch commission data and initial form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch commission data
        const commissionResponse = await fetch(`${BASE_URL}/tenant/agent/commissions/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!commissionResponse.ok) {
          throw new Error(`Failed to fetch commission: ${commissionResponse.status}`);
        }

        const commissionResult = await commissionResponse.json();
        
        if (!commissionResult.success) {
          throw new Error("Failed to load commission data");
        }

        const commissionData: CommissionData = commissionResult.data;

        // Fetch countries
        // const allCountries = Country.getAllCountries();
        // const countriesData: CountryType[] = allCountries.map(country => ({
        //   code: country.isoCode,
        //   name: country.name
        // }));

        // Fetch universities
        const universitiesResponse = await fetch(`${BASE_URL}/tenant/university/names`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!universitiesResponse.ok) {
          throw new Error(`Failed to fetch universities: ${universitiesResponse.status}`);
        }

        const universitiesResult = await universitiesResponse.json();
        const universitiesData: UniversityType[] = universitiesResult.data;

        // Fetch study levels
        const studyLevelsResponse = await fetch(`${BASE_URL}/tenant/option/apply_tenant_study_levels`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!studyLevelsResponse.ok) {
          throw new Error(`Failed to fetch study levels: ${studyLevelsResponse.status}`);
        }

        const studyLevelsResult = await studyLevelsResponse.json();
        const studyLevelsData: StudyLevel[] = studyLevelsResult.data;

        // Set all data
        // setCountries(countriesData);
        setUniversities(universitiesData);
        setStudyLevels(studyLevelsData);

        // Set form data with commission data
        // Note: The API might return the field as no_of_installments instead of no_of_installments
        // Adjust the property name based on your actual API response
        setFormData({
          // country_code: commissionData.country_code,
          university_id: commissionData.university_id.toString(),
          study_level_id: commissionData.study_level_id.toString(),
          tenant_commission: commissionData.tenant_commission,
          commission_type: commissionData.commission_type,
          no_of_installments: commissionData.no_of_installments?.toString() || "1", // Use API value or default to 1
          remark: commissionData.remark,
        });

      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && token) {
      fetchData();
    }
  }, [id, token, BASE_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Only allow numbers for no_of_installments, but let user clear the field
    if (name === "no_of_installments") {
      // Allow only numbers or empty string
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCommissionTypeChange = (value: string) => {
    // Extract numeric value from commission input
    const numericValue = formData.tenant_commission.replace(/[^0-9.]/g, '');
    setFormData(prev => ({
      ...prev,
      commission_type: value,
      tenant_commission: numericValue
    }));
  };

  const handleCommissionValueChange = (value: string) => {
    // Remove any existing percentage or dollar signs
    const cleanValue = value.replace(/[%$]/g, '');
    
    setFormData(prev => ({
      ...prev,
      tenant_commission: cleanValue
    }));
  };

  const getCommissionDisplayValue = () => {
    if (!formData.tenant_commission) return "";
    
    const numericValue = formData.tenant_commission.replace(/[^0-9.]/g, '');
    if (formData.commission_type === "percentage") {
      return `${numericValue}%`;
    } else {
      return `$${numericValue}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.university_id || !formData.study_level_id || !formData.tenant_commission) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate no_of_installments
      if (!formData.no_of_installments.trim()) {
        setError("Total installments is required");
        return;
      }

      const totalInstallments = parseInt(formData.no_of_installments);
      if (isNaN(totalInstallments) || totalInstallments < 1) {
        setError("Total installments must be a positive number (1 or greater)");
        return;
      }

      // Prepare data for API - using no_of_installments as the API key
      const apiData = {
        // country_code: formData.country_code,
        university_id: parseInt(formData.university_id),
        study_level_id: parseInt(formData.study_level_id),
        tenant_commission: parseFloat(formData.tenant_commission),
        commission_type: formData.commission_type,
        no_of_installments: totalInstallments, // Using no_of_installments as per API requirement
        remark: formData.remark || "Standard commission"
      };

      // Make API call to update commission
      const response = await fetch(`${BASE_URL}/tenant/agent/commissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Commission updated successfully:", result);
      
      // Redirect back to commissions list
      router.push('/admin/partners/accounts/commission');
      router.refresh();
      
    } catch (error) {
      console.error('Error updating commission:', error);
      setError(error instanceof Error ? error.message : "Failed to update commission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading commission data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Edit Commission
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update commission structure for tenants.
        </p>
      </div>
      
      <div className="space-y-6 border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="-mx-2.5 flex flex-wrap gap-y-5">
            {/* Country Field */}
            {/* <div className="w-full px-2.5">
              <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Country
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <Globe size={18} />
                </span>
                <select
                  id="country_code"
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleChange}
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div> */}

            {/* University Name Field */}
            <div className="w-full px-2.5">
              <label htmlFor="university_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                University Name
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <University size={18} />
                </span>
                <select
                  id="university_id"
                  name="university_id"
                  value={formData.university_id}
                  onChange={handleChange}
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                >
                  <option value="">Select University</option>
                  {universities.map(university => (
                    <option key={university.id} value={university.id}>
                      {university.university}
                    </option>
                  ))}
                </select>
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>

            {/* Study Level Field */}
            <div className="w-full px-2.5">
              <label htmlFor="study_level_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Study Level
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <GraduationCap size={18} />
                </span>
                <select
                  id="study_level_id"
                  name="study_level_id"
                  value={formData.study_level_id}
                  onChange={handleChange}
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                >
                  <option value="">Select Study Level</option>
                  {studyLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>

            {/* Commission Type and Value Fields */}
            <div className="w-full px-2.5">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Tenant Commission
              </label>
              <div className="flex gap-3">
                {/* Commission Type */}
                <div className="flex-1">
                  <div className="relative">
                    <select
                      name="commission_type"
                      value={formData.commission_type}
                      onChange={(e) => handleCommissionTypeChange(e.target.value)}
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                    >
                      <option value="percentage">Percentage </option>
                      <option value="fixed">Fixed Amount </option>
                    </select>
                    <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                      <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Commission Value */}
                <div className="flex-1">
                  <div className="relative">
                    {/* <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Percent size={18} />
                    </span> */}
                    <input
                      type="text"
                      name="tenant_commission"
                      value={getCommissionDisplayValue()}
                      onChange={(e) => handleCommissionValueChange(e.target.value)}
                      placeholder={formData.commission_type === "percentage" ? "e.g., 15%" : "e.g., 500"}
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Installments Field */}
            <div className="w-full px-2.5">
              <label htmlFor="no_of_installments" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Total Installments
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <Calendar size={18} />
                </span>
                <input
                  type="text"
                  id="no_of_installments"
                  name="no_of_installments"
                  value={formData.no_of_installments}
                  onChange={handleChange}
                  placeholder="e.g., 1, 2, 3, etc."
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Number of installments for commission payment (e.g., 1 for one-time payment, 2 for two installments, etc.)
              </p>
            </div>

            {/* Remark Field */}
            <div className="w-full px-2.5">
              <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Remark
              </label>
              <div className="relative">
                <span className="absolute top-4 left-4 text-gray-500 dark:text-gray-400">
                  <Pencil size={18} />
                </span>
                <textarea
                  id="remark"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Additional notes or comments about this commission"
                  rows={4}
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full px-2.5">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      Update Commission
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z" fill="white"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}