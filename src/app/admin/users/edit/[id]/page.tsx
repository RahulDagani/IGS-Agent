"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { User, Mail, Phone, IdCard, Shield, Eye, Edit, Trash, Plus } from "lucide-react";

interface UserFormData {
  name: string;
  email: string;
  employeeCode: string;
  mobile: string;
  role: "admin" | "manager" | "staff" | "viewer";
  status: "active" | "inactive";
  password: string;
  confirmPassword: string;
}

interface Permission {
  moduleApp: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

interface ModulePermissions {
  platform: string;
  modules: Permission[];
}

// Mock function to fetch user data
const fetchUser = async (id: string): Promise<UserFormData & { permissions?: ModulePermissions[] }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(id)
  const mockData = {
    name: "John Smith",
    email: "john.smith@university.com",
    employeeCode: "EMP001",
    mobile: "+1 (555) 123-4567",
    role: "admin" as const,
    status: "active" as const,
    password: "",
    confirmPassword: "",
    permissions: [
      {
        platform: "Student Platform",
        modules: [
          { moduleApp: "Applications", view: true, add: true, edit: true, delete: false },
          { moduleApp: "Wallet", view: true, add: false, edit: false, delete: false },
          { moduleApp: "Students", view: true, add: true, edit: true, delete: true },
        ]
      },
      {
        platform: "Agent Platform",
        modules: [
          { moduleApp: "Agents", view: true, add: true, edit: true, delete: false },
          { moduleApp: "Students", view: true, add: false, edit: false, delete: false },
          { moduleApp: "Applications", view: true, add: false, edit: true, delete: false },
          { moduleApp: "Wallets", view: true, add: false, edit: false, delete: false },
        ]
      },
      {
        platform: "University Platform",
        modules: [
          { moduleApp: "Universities", view: true, add: true, edit: true, delete: true },
          { moduleApp: "Courses", view: true, add: true, edit: true, delete: false },
        ]
      }
    ]
  };
  
  return mockData;
};

const defaultPermissions: ModulePermissions[] = [
  {
    platform: "Student Platform",
    modules: [
      { moduleApp: "Applications", view: false, add: false, edit: false, delete: false },
      { moduleApp: "Wallet", view: false, add: false, edit: false, delete: false },
      { moduleApp: "Students", view: false, add: false, edit: false, delete: false },
    ]
  },
  {
    platform: "Agent Platform",
    modules: [
      { moduleApp: "Agents", view: false, add: false, edit: false, delete: false },
      { moduleApp: "Students", view: false, add: false, edit: false, delete: false },
      { moduleApp: "Applications", view: false, add: false, edit: false, delete: false },
      { moduleApp: "Wallets", view: false, add: false, edit: false, delete: false },
    ]
  },
  {
    platform: "University Platform",
    modules: [
      { moduleApp: "Universities", view: false, add: false, edit: false, delete: false },
      { moduleApp: "Courses", view: false, add: false, edit: false, delete: false },
    ]
  }
];

// Define valid permission types
type PermissionType = 'view' | 'add' | 'edit' | 'delete';

export default function AddEditUser() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = Boolean(id);
  
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    employeeCode: "",
    mobile: "",
    role: "staff",
    status: "active",
    password: "",
    confirmPassword: "",
  });

  const [permissions, setPermissions] = useState<ModulePermissions[]>(defaultPermissions);

  useEffect(() => {
    const loadUser = async () => {
      if (isEdit) {
        try {
          const data = await fetchUser(id);
          setFormData({
            name: data.name,
            email: data.email,
            employeeCode: data.employeeCode,
            mobile: data.mobile,
            role: data.role,
            status: data.status,
            password: "",
            confirmPassword: "",
          });
          if (data.permissions) {
            setPermissions(data.permissions);
          }
          setShowPermissions(data.role === 'admin');
        } catch (error) {
          console.error('Error loading user:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUser();
  }, [id, isEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Show permissions table when role is set to admin
    if (name === 'role') {
      setShowPermissions(value === 'admin');
    }
  };

  const handlePermissionChange = (
    platformIndex: number,
    moduleIndex: number,
    permissionType: PermissionType,
    checked: boolean
  ) => {
    setPermissions(prev => {
      const newPermissions = [...prev];
      const moduleApp = newPermissions[platformIndex].modules[moduleIndex];
      
      // Use type assertion to ensure TypeScript knows this is valid
      (moduleApp[permissionType] as boolean) = checked;
      
      return newPermissions;
    });
  };

  const handleSelectAll = (platformIndex: number, permissionType: PermissionType, checked: boolean) => {
    setPermissions(prev => {
      const newPermissions = [...prev];
      newPermissions[platformIndex].modules.forEach(moduleApp => {
        // Use type assertion to ensure TypeScript knows this is valid
        (moduleApp[permissionType] as boolean) = checked;
      });
      return newPermissions;
    });
  };

  const handleSelectAllPlatform = (platformIndex: number, checked: boolean) => {
    setPermissions(prev => {
      const newPermissions = [...prev];
      newPermissions[platformIndex].modules.forEach(moduleApp => {
        moduleApp.view = checked;
        moduleApp.add = checked;
        moduleApp.edit = checked;
        moduleApp.delete = checked;
      });
      return newPermissions;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const submitData = {
        ...formData,
        ...(showPermissions && { permissions })
      };
      
      console.log("User data:", submitData);
      
      // Redirect back to users list
      router.push('/admin/users');
      router.refresh();
    } catch (error) {
      console.error('Error saving user:', error);
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
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {isEdit ? "Edit User" : "Add New User"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEdit ? "Update user information and permissions." : "Create a new user account with appropriate permissions."}
        </p>
      </div>
      
      <div className="space-y-6 border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
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
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Employee Code */}
                <div>
                  <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Employee Code *
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <IdCard size={18} />
                    </span>
                    <input
                      type="text"
                      id="employeeCode"
                      name="employeeCode"
                      value={formData.employeeCode}
                      onChange={handleInputChange}
                      placeholder="e.g., EMP001"
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Phone size={18} />
                    </span>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
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
                      <Shield size={18} />
                    </span>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 appearance-none"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
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
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Section - Only show for add or when changing password */}
            {!isEdit && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required={!isEdit}
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      required={!isEdit}
                      className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Permissions Section - Only show for admin role */}
            {showPermissions && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">Permissions</h4>
                <div className="space-y-6">
                  {permissions.map((platform, platformIndex) => (
                    <div key={platform.platform} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-800 dark:text-white/90">{platform.platform}</h5>
                          <button
                            type="button"
                            onClick={() => handleSelectAllPlatform(platformIndex, true)}
                            className="text-xs text-brand-500 hover:text-brand-600"
                          >
                            Select All
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Module</th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-center gap-1">
                                  <Eye size={14} />
                                  <span>View</span>
                                </div>
                              </th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-center gap-1">
                                  <Plus size={14} />
                                  <span>Add</span>
                                </div>
                              </th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-center gap-1">
                                  <Edit size={14} />
                                  <span>Edit</span>
                                </div>
                              </th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-center gap-1">
                                  <Trash size={14} />
                                  <span>Delete</span>
                                </div>
                              </th>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                              <th className="text-left p-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                                Select All
                              </th>
                              {(['view', 'add', 'edit', 'delete'] as PermissionType[]).map((permissionType) => (
                                <th key={permissionType} className="text-center p-3">
                                  <input
                                    type="checkbox"
                                    checked={platform.modules.every(moduleApp => moduleApp[permissionType])}
                                    onChange={(e) => handleSelectAll(platformIndex, permissionType, e.target.checked)}
                                    className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                  />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {platform.modules.map((moduleApp, moduleIndex) => (
                              <tr key={moduleApp.moduleApp} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <td className="p-3 text-sm text-gray-700 dark:text-gray-300">{moduleApp.moduleApp}</td>
                                {(['view', 'add', 'edit', 'delete'] as PermissionType[]).map((permissionType) => (
                                  <td key={permissionType} className="text-center p-3">
                                    <input
                                      type="checkbox"
                                      checked={moduleApp[permissionType]}
                                      onChange={(e) => handlePermissionChange(platformIndex, moduleIndex, permissionType, e.target.checked)}
                                      className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
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
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? "Updating..." : "Creating..."}
                </div>
              ) : (
                isEdit ? "Update User" : "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}