'use client';

import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Eye, 
  Plus, 
  SquarePen, 
  Trash2,
  } from 'lucide-react';
import Link from 'next/link';

interface StaffFormData {
  name: string;
  email: string;
  role: string;
  mobile: string;
  status: string;
  profile_image: File | null;
  permissions: {
    [key: string]: {
      id: string;
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
}

interface PermissionSection {
  title: string;
  modules: string[];
}

export default function CreateStaff() {
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    role: '',
    mobile: '',
    status: 'active',
    profile_image: null,
    permissions: {
      programs: { id: '13', view: false, add: false, edit: false, delete: false },
      university: { id: '14', view: false, add: false, edit: false, delete: false },
      webinars: { id: '15', view: false, add: false, edit: false, delete: false },
      reports: { id: '16', view: false, add: false, edit: false, delete: false },
      applications: { id: '17', view: false, add: false, edit: false, delete: false },
    },
  });

  const [permissionError, setPermissionError] = useState(false);

  const permissionSections: PermissionSection[] = [
    {
      title: 'University Platform',
      modules: ['programs', 'university', 'webinars', 'reports', 'applications']
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      profile_image: file,
    }));
  };

  const handlePermissionChange = (
    module: string, 
    field: 'view' | 'add' | 'edit' | 'delete', 
    value: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [field]: value,
        },
      },
    }));
    setPermissionError(false);
  };

  const handleSelectAll = (section: PermissionSection, field: 'view' | 'add' | 'edit' | 'delete', value: boolean) => {
    setFormData(prev => {
      const newPermissions = { ...prev.permissions };
      section.modules.forEach(module => {
        if (newPermissions[module]) {
          newPermissions[module] = {
            ...newPermissions[module],
            [field]: value,
          };
        }
      });
      return {
        ...prev,
        permissions: newPermissions,
      };
    });
    setPermissionError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one permission is selected
    const hasPermission = Object.values(formData.permissions).some(
      permission => permission.view || permission.add || permission.edit || permission.delete
    );
    
    if (!hasPermission) {
      setPermissionError(true);
      return;
    }

    // Handle form submission here
    console.log('Form data:', formData);
    // Add your API call here
  };

  const getModuleDisplayName = (module: string) => {
    const names: { [key: string]: string } = {
      programs: 'Programs',
      universities: 'Universities',
      webinars: 'Webinars',
      reports: 'Reports',
      applications: 'Applications',
      students: 'Students',
    };
    return names[module] || module;
  };

  return (
    <div className="space-y-6">
    {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Webinar</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a new webinar session</p>
        </div>
        <Link href="/university/webinars">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Back to Webinars
          </button>
        </Link>
      </div>
    <div className="bg-white rounded-lg shadow-sm dark:bg-white/[0.03]">

      {/* Form */}
      <div className="space-y-6 border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      id="name"
                      placeholder="Enter full name"
                      required
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      name="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="email"
                      placeholder="Enter email address"
                      required
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      name="email"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Role *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Shield className="h-4 w-4" />
                    </span>
                    <select
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-blue-800 appearance-none"
                    >
                      <option value="">-- Select Role --</option>
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      id="mobile"
                      placeholder="+1 (555) 123-4567"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      name="mobile"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-blue-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Profile Image */}
                <div>
                  <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Profile Image
                  </label>
                  <div className="relative">
                    <input
                      id="profile_image"
                      className="h-11 w-full rounded-lg border border-none bg-transparent text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 focus:outline-none dark:border-none dark:bg-transparent dark:text-white/90 dark:file:bg-blue-900/20 dark:file:text-blue-300 dark:focus:border-blue-800"
                      type="file"
                      onChange={handleFileChange}
                      name="profile_image"
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">
                Permissions
              </h4>
              
              {permissionError && (
                <p className="text-red-500 text-sm mb-4 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Please assign at least one permission.
                </p>
              )}

              <div className="space-y-6">
                {permissionSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Section Header */}
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-800 dark:text-white/90">
                          {section.title}
                        </h5>
                        <button 
                          type="button" 
                          className="text-xs text-blue-500 hover:text-blue-600"
                          onClick={() => {
    (['view', 'add', 'edit', 'delete'] as const).forEach(field => {
      handleSelectAll(section, field, true);
    });
  }}
                        >
                          Select All
                        </button>
                      </div>
                    </div>

                    {/* Permissions Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Module
                            </th>
                            <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <div className="flex items-center justify-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>View</span>
                              </div>
                            </th>
                            <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <div className="flex items-center justify-center gap-1">
                                <Plus className="h-3 w-3" />
                                <span>Add</span>
                              </div>
                            </th>
                            <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <div className="flex items-center justify-center gap-1">
                                <SquarePen className="h-3 w-3" />
                                <span>Edit</span>
                              </div>
                            </th>
                            <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <div className="flex items-center justify-center gap-1">
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </div>
                            </th>
                          </tr>
                          {/* Select All Row */}
                          <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                              Select All
                            </th>
                            {['view', 'add', 'edit', 'delete'].map((field) => (
                              <th key={field} className="text-center p-3">
                                <input
                                  type="checkbox"
                                  checked={section.modules.every(
                                    module => formData.permissions[module]?.[field as keyof typeof formData.permissions[string]]
                                  )}
                                  onChange={(e) => handleSelectAll(section, field as 'view' | 'add' | 'edit' | 'delete', e.target.checked)}
                                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.modules.map((module) => (
                            <tr 
                              key={module} 
                              className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                            >
                              <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                                {getModuleDisplayName(module)}
                              </td>
                              {['view', 'add', 'edit', 'delete'].map((field) => (
                                <td key={field} className="text-center p-3">
                                  <input
                                    type="checkbox"
                                    checked={!!formData.permissions[module]?.[field as keyof typeof formData.permissions[string]]}
                                    onChange={(e) => handlePermissionChange(module, field as 'view' | 'add' | 'edit' | 'delete', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Create Staff
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}