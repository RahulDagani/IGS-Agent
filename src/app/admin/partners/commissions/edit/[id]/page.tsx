"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Globe, GraduationCap, Pencil, Percent, University } from "lucide-react";

interface CommissionFormData {
  country: string;
  universityName: string;
  studyLevel: string;
  agentCommission: string;
  remark: string;
}

// Mock function to fetch commission data - replace with actual API call
const fetchCommission = async (id: string): Promise<CommissionFormData> => {
  // Simulate API call
  console.log(id);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data - replace with actual API call
  const mockData: CommissionFormData = {
    country: "USA",
    universityName: "Harvard University",
    studyLevel: "Undergraduate",
    agentCommission: "15%",
    remark: "Standard commission rate for all undergraduate programs"
  };
  
  return mockData;
};

export default function EditCommission() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [formData, setFormData] = useState<CommissionFormData>({
    country: "",
    universityName: "",
    studyLevel: "",
    agentCommission: "",
    remark: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCommission = async () => {
      try {
        const data = await fetchCommission(id);
        setFormData(data);
      } catch (error) {
        console.error('Error loading commission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadCommission();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Updated commission data:", formData);
      // Here you would typically make an API call to update the commission
      // await fetch(`/api/commissions/${id}`, { method: 'PUT', body: JSON.stringify(formData) });
      
      // Redirect back to commissions list
      router.push('/commissions');
      router.refresh();
    } catch (error) {
      console.error('Error updating commission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const studyLevels = [
    "Undergraduate",
    "Postgraduate", 
    "PhD",
    "Diploma",
    "Certificate",
    "Foundation"
  ];

  const countries = [
    "USA",
    "UK", 
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Netherlands",
    "Ireland",
    "New Zealand",
    "Singapore"
  ];

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
          Update commission structure for agents.
        </p>
      </div>
      
      <div className="space-y-6 border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <div className="-mx-2.5 flex flex-wrap gap-y-5">
            {/* Country Field */}
            <div className="w-full px-2.5">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Country
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                    <Globe size={18} />

                </span>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>

            {/* University Name Field */}
            <div className="w-full px-2.5">
              <label htmlFor="universityName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                University Name
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                 <University size={18} />
                </span>
               <select
                  id="university"
                  name="university"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                >
                  <option value="">Select University</option>
                  {countries.map(country => (
                    <option key={country} value={country}>University of {country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Study Level Field */}
            <div className="w-full px-2.5">
              <label htmlFor="studyLevel" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Study Level
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <GraduationCap size={18} />
                </span>
                <select
                  id="studyLevel"
                  name="studyLevel"
                  value={formData.studyLevel}
                  onChange={handleChange}
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                >
                  <option value="">Select Study Level</option>
                  {studyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>

            {/* Agent Commission Field */}
            <div className="w-full px-2.5">
              <label htmlFor="agentCommission" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Agent Commission
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <Percent size={18} />
                </span>
                <input
                  type="text"
                  id="agentCommission"
                  name="agentCommission"
                  value={formData.agentCommission}
                  onChange={handleChange}
                  placeholder="e.g., 15% or $500"
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
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