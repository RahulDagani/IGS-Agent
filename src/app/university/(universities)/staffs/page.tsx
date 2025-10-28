'use client';

import { useState } from 'react';
import { 
   
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  Shield,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Image from 'next/image';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  mobile: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastActive: string;
  profileImage?: string;
}

export default function StaffTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Mock data - replace with actual API call
  const staffData: Staff[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@university.edu',
      role: 'admin',
      mobile: '+1 (555) 123-4567',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-12-19',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@university.edu',
      role: 'employee',
      mobile: '+1 (555) 987-6543',
      status: 'active',
      joinDate: '2024-02-20',
      lastActive: '2024-12-19',
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert.j@university.edu',
      role: 'manager',
      mobile: '+1 (555) 456-7890',
      status: 'inactive',
      joinDate: '2024-03-10',
      lastActive: '2024-12-10',
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@university.edu',
      role: 'employee',
      mobile: '+1 (555) 234-5678',
      status: 'active',
      joinDate: '2024-04-05',
      lastActive: '2024-12-19',
    },
  ];

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'employee':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const handleDelete = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Handle delete logic here
    console.log('Deleting staff:', selectedStaff);
    setShowDeleteModal(false);
    setSelectedStaff(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Staffs" />
      <div className="space-y-6">
    <div className=" rounded-lg shadow-sm">

      {/* Filters and Search */}
      <div className="pb-5 border-b border-gray-200 dark:border-gray-900">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-900 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-900 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-900 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>

          
          <Link href="/university/staffs/add" className="shrink-0">
          <button className="h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Staff
          </button>
        </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead >
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {/* Staff Member */}
                  <td className="px-5 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {staff.profileImage ? (
                          <Image
                            className="h-10 w-10 rounded-full"
                            src={staff.profileImage}
                            alt={staff.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {staff.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {staff.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {staff.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(staff.role)}`}>
                      {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1 mb-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-xs">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-xs">{staff.mobile}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(staff.status)}`}>
                      {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                    </span>
                  </td>

                  {/* Join Date */}
                  <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDate(staff.joinDate)}
                  </td>

                  {/* Last Active */}
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(staff.lastActive)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-500">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => handleDelete(staff)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No staff found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No staff members match your search criteria.
            </p>
          </div>
        )}

        {/* Pagination (optional) */}
        <div className="px-5 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-400">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredStaff.length}</span> of{' '}
              <span className="font-medium">{filteredStaff.length}</span> results
            </div>
            {/* Add pagination buttons here if needed */}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 overflow-y-auto h-full w-full z-999999">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Delete Staff Member
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete <strong>{selectedStaff.name}</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 justify-center px-4 py-3">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}