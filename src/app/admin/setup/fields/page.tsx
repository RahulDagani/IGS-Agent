// app/admin/forms/page.tsx
"use client"
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FolderOpen,
  Type,
  List 
} from "lucide-react";

interface Section {
  id: string;
  name: string;
  role: string;
  order: number;
  created_at: string;
  updated_at: string;
  fields: Field[];
}

interface Field {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  order: number;
  section: Section;
}

type SortField = keyof Section | "";
type SortDirection = "asc" | "desc";

export default function FormsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section? All fields in this section will also be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSections(sections.filter(section => section.id !== id));
      } else {
        alert('Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = sections.filter((section) => {
      const matchesSearch = 
        section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.fields.some(field => 
          field.field_label.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      return matchesSearch;
    });

    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [sections, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof Section) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Section) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type size={16} />;
      case 'select': return <List size={16} />;
      case 'email': return <Type size={16} />;
      case 'number': return <Type size={16} />;
      case 'date': return <Type size={16} />;
      default: return <Type size={16} />;
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Form Builder
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage form sections and fields for different roles
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/forms/sections/add" className="shrink-0">
            <button className="h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs hover:bg-green-50 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500/10 dark:focus:border-brand-800 flex items-center gap-2">
              <Plus size={16} />
              Add Section
            </button>
          </Link>
          
          <Link href="/admin/forms/fields/add" className="shrink-0">
            <button className="h-11 px-4 rounded-lg border-2 border-brand-500 bg-transparent text-sm text-brand-500 shadow-theme-xs hover:bg-brand-50 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-brand-500 dark:text-brand-500 dark:hover:bg-brand-500/10 dark:focus:border-brand-800 flex items-center gap-2">
              <Plus size={16} />
              Add Field
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sections or fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Sections and Fields Table */}
      <div className="space-y-6">
        {filteredAndSortedData.map((section) => (
          <div key={section.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {/* Section Header */}
            <div className="border-b border-gray-100 dark:border-white/[0.05] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderOpen size={20} className="text-brand-500" />
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white/90">
                      {section.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Role: {section.role} • {section.fields.length} fields
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/forms/sections/${section.id}/edit`}>
                    <button className="p-2 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400">
                      <Edit size={16} />
                    </button>
                  </Link>
                  <button 
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Fields Table */}
            {section.fields.length > 0 && (
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[600px]">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        {[
                          { key: "field_label", label: "Field Label" },
                          { key: "field_name", label: "Field Name" },
                          { key: "field_type", label: "Type" },
                          { key: "is_required", label: "Required" },
                        ].map(({ key, label }) => (
                          <TableCell
                            key={key}
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            {label}
                          </TableCell>
                        ))}
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {section.fields.map((field) => (
                        <TableRow key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="px-5 py-4 text-start">
                            <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {field.field_label}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {field.field_name}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                            <div className="flex items-center gap-2 text-gray-500 text-theme-sm dark:text-gray-400">
                              {getFieldTypeIcon(field.field_type)}
                              {field.field_type}
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              field.is_required 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {field.is_required ? 'Required' : 'Optional'}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/forms/fields/${field.id}/edit`}>
                                <button className="p-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400">
                                  <Edit size={14} />
                                </button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {section.fields.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                No fields in this section yet.
              </div>
            )}
          </div>
        ))}

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
              No sections found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by creating your first form section.
            </p>
            <Link href="/admin/forms/sections/add">
              <button className="h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs hover:bg-green-50 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500/10 dark:focus:border-brand-800 flex items-center gap-2 mx-auto">
                <Plus size={16} />
                Add Your First Section
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedData.length} of {sections.length} sections
      </div>
    </div>
  );
}