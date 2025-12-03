"use client"
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface ProfileData {
  id: number;
  email: string;
  name: string;
  phone_number: string;
  company_name: string;
  profile: string;
  created_at: string;
  updated_at: string;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function SuperAdminProfilePage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    id: 0,
    email: "",
    name: "",
    phone_number: "",
    company_name: "",
    profile: "",
    created_at: "",
    updated_at: ""
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${BASE_URL}/tenant/profile`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setProfileData(result.data);
          if (result.data.profile) {
            setProfileImagePreview(result.data.profile);
          }
        } else {
          throw new Error(result.message || "Failed to fetch profile data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching profile");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [BASE_URL, token]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, WebP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!profileData.name.trim()) {
        throw new Error("Name is required");
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', profileData.name.trim());
      formData.append('email', profileData.email);
      formData.append('phone_number', profileData.phone_number);
      formData.append('company_name', profileData.company_name);
      
      // Only append profile image if a new one is selected
      if (profileImage) {
        formData.append('profile', profileImage);
      }

      const response = await fetch(`${BASE_URL}/tenant/profile`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess("Profile updated successfully!");
        setProfileData(result.data); // Update with latest data from server
        if (result.data.profile) {
          setProfileImagePreview(result.data.profile);
        }
        // Clear the file input
        setProfileImage(null);
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating profile");
      console.error("Error updating profile:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate password fields
      if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
        throw new Error("All password fields are required");
      }

      if (passwordData.new_password !== passwordData.confirm_password) {
        throw new Error("New passwords do not match");
      }

      if (passwordData.new_password.length < 6) {
        throw new Error("New password must be at least 6 characters long");
      }

      const response = await fetch(`${BASE_URL}/tenant/password`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update password: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess("Password updated successfully!");
        // Clear password fields
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });
      } else {
        throw new Error(result.message || "Failed to update password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating password");
      console.error("Error updating password:", err);
    } finally {
      setChangingPassword(false);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview("");
    // You might want to send a request to remove the profile image from server
    // This would depend on your API implementation
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600 dark:text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your super admin account details and security settings
        </p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center">
            <div className="text-red-800 dark:text-red-400 text-sm">
              {error}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center">
            <div className="text-green-800 dark:text-green-400 text-sm">
              {success}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white dark:border-white/[0.05] dark:bg-white/[0.03] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Information
          </h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="profile_image"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleProfileImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPEG, PNG, GIF, WebP. Max 5MB.
                  </p>
                </div>
                {(profileImagePreview || profileImage) && (
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:border-white/[0.05] dark:bg-white/[0.03] dark:border-gray-600 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>

            {/* company_name */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={profileData.company_name}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:border-white/[0.05] dark:bg-white/[0.03] dark:border-gray-600 dark:text-white"
                placeholder="Enter your company name"
              />
            </div>

            {/* Email (Readonly) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                readOnly
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email address cannot be changed
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={profileData.phone_number}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:border-white/[0.05] dark:bg-white/[0.03] dark:border-gray-600 dark:text-white"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Account Metadata */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Account Created</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(profileData.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(profileData.updated_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">User ID</span>
                  <span className="text-gray-900 dark:text-white">
                    {profileData.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:border-white/[0.05] dark:bg-white/[0.03] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Change Password
          </h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password *
              </label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:border-white/[0.05] dark:bg-white/[0.03] dark:border-gray-600 dark:text-white"
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password *
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:border-white/[0.05] dark:bg-white/[0.03] dark:border-gray-600 dark:text-white"
                placeholder="Enter new password (min. 6 characters)"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:border-white/[0.05] dark:bg-white/[0.03] dark:border-gray-600 dark:text-white"
                placeholder="Confirm new password"
              />
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password Requirements:
              </h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Minimum 6 characters</li>
                <li>• New password and confirmation must match</li>
                <li>• Current password is required for verification</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}