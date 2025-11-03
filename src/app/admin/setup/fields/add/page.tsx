// app/admin/forms/fields/add/page.tsx
"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Type, List, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FieldFormData {
  section_id: string;
  role: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  order: number;
  options: string[];
}

interface Section {
  id: string;
  name: string;
  role: string;
}

export default function AddField() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<FieldFormData>({
    section_id: "",
    role: "student",
    field_name: "",
    field_label: "",
    field_type: "text",
    is_required: false,
    order: 0,
    options: [],
  });

  const [errors, setErrors] = useState<Partial<FieldFormData>>({});
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'order' ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FieldFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // Generate field name from label
    if (name === 'field_label' && !formData.field_name) {
      const fieldName = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '');
      setFormData(prev => ({ ...prev, field_name: fieldName }));
    }
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FieldFormData> = {};

    if (!formData.section_id) {
      newErrors.section_id = "Section is required";
    }

    if (!formData.field_name.trim()) {
      newErrors.field_name = "Field name is required";
    }

    if (!formData.field_label.trim()) {
      newErrors.field_label = "Field label is required";
    }

    if (formData.field_type === 'select' && formData.options.length === 0) {
      newErrors.options = ["At least one option is required for select fields"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          options: formData.field_type === 'select' ? formData.options : null
        }),
      });

      if (response.ok) {
        router.push('/admin/forms');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create field');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      alert('Failed to create field');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/forms">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Add New Field
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create a new form field for data collection
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Field Details
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define the field properties and behavior.
          </p>
        </div>
        
        <div className="space-y-6 border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Section */}
                <div className="md:col-span-2">
                  <label htmlFor="section_id" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Section *
                  </label>
                  <select
                    id="section_id"
                    name="section_id"
                    value={formData.section_id}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  >
                    <option value="">Select a section</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name} ({section.role})
                      </option>
                    ))}
                  </select>
                  {errors.section_id && (
                    <p className="mt-1 text-sm text-red-500">{errors.section_id}</p>
                  )}
                </div>

                {/* Field Label */}
                <div>
                  <label htmlFor="field_label" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Field Label *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Type size={18} />
                    </span>
                    <input
                      type="text"
                      id="field_label"
                      name="field_label"
                      value={formData.field_label}
                      onChange={handleInputChange}
                      placeholder="Enter field label"
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>
                  {errors.field_label && (
                    <p className="mt-1 text-sm text-red-500">{errors.field_label}</p>
                  )}
                </div>

                {/* Field Name */}
                <div>
                  <label htmlFor="field_name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Field Name *
                  </label>
                  <input
                    type="text"
                    id="field_name"
                    name="field_name"
                    value={formData.field_name}
                    onChange={handleInputChange}
                    placeholder="Enter field name"
                    required
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                  {errors.field_name && (
                    <p className="mt-1 text-sm text-red-500">{errors.field_name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Internal field name (auto-generated from label)
                  </p>
                </div>

                {/* Field Type */}
                <div>
                  <label htmlFor="field_type" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Field Type *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <List size={18} />
                    </span>
                    <select
                      id="field_type"
                      name="field_type"
                      value={formData.field_type}
                      onChange={handleInputChange}
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="select">Select</option>
                      <option value="textarea">Text Area</option>
                    </select>
                  </div>
                </div>

                {/* Order */}
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>

                {/* Required */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_required"
                    name="is_required"
                    checked={formData.is_required}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label htmlFor="is_required" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required Field
                  </label>
                </div>
              </div>

              {/* Select Options */}
              {formData.field_type === 'select' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Select Options *
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Enter an option"
                        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      />
                      <button
                        type="button"
                        onClick={addOption}
                        className="h-11 px-4 rounded-lg border border-gray-300 bg-transparent text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Add
                      </button>
                    </div>
                    
                    {formData.options.length > 0 && (
                      <div className="border rounded-lg divide-y dark:border-gray-700 dark:divide-gray-700">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex items-center justify-between p-3">
                            <span className="text-sm text-gray-800 dark:text-white/90">{option}</span>
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {errors.options && (
                      <p className="mt-1 text-sm text-red-500">{errors.options}</p>
                    )}
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Add options for the select dropdown. Users will see these choices.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6">
              <Link href="/admin/forms" className="flex-1">
                <button
                  type="button"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Field"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}