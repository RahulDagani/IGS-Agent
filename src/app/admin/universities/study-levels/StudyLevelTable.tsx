"use client"
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Edit, Trash, Plus, GraduationCap, BookOpen } from "lucide-react";

interface StudyLevel {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

// Define the table data using the interface
const tableData: StudyLevel[] = [
  {
    id: 1,
    name: "Bachelors",
    description: "Bachelor's degree programs and associate degrees",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Masters",
    description: "Master's degrees and graduate certificates",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "PhD",
    description: "Doctoral research programs",
    status: "active",
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    name: "Diploma",
    description: "Diploma and advanced diploma programs",
    status: "active",
    createdAt: "2024-04-05",
  },
  
  
];

type SortField = keyof StudyLevel | "";
type SortDirection = "asc" | "desc";

interface AddEditStudyLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studyLevelData: { name: string; description: string; status: "active" | "inactive" }) => void;
  mode: "add" | "edit";
  initialData?: StudyLevel;
}

const AddEditStudyLevelModal: React.FC<AddEditStudyLevelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    status: initialData?.status || "active" as "active" | "inactive",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        status: initialData.status,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "active",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving study level:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "active",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-999999 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {mode === "add" ? "Add New Study Level" : "Edit Study Level"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Study Level Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Study Level Name *
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <GraduationCap size={18} />
                </span>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Bachelors, Masters, PhD"
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Description *
              </label>
              <div className="relative">
                <span className="absolute top-4 left-4 text-gray-500 dark:text-gray-400">
                  <BookOpen size={18} />
                </span>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter a brief description of this study level..."
                  rows={3}
                  required
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 resize-none"
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
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "active" | "inactive" }))}
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
              className="flex-1 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === "add" ? "Adding..." : "Updating..."}
                </div>
              ) : (
                mode === "add" ? "Add Study Level" : "Update Study Level"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function StudyLevelsTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedStudyLevel, setSelectedStudyLevel] = useState<StudyLevel | null>(null);
  const [studyLevels, setStudyLevels] = useState<StudyLevel[]>(tableData);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = studyLevels.filter((studyLevel) => {
      const matchesSearch = 
        studyLevel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studyLevel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studyLevel.status.toLowerCase().includes(searchTerm.toLowerCase());
      
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
  }, [studyLevels, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof StudyLevel) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof StudyLevel) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusColor = (status: StudyLevel["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "primary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddStudyLevel = async (studyLevelData: { name: string; description: string; status: "active" | "inactive" }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newStudyLevel: StudyLevel = {
      id: Math.max(...studyLevels.map(sl => sl.id)) + 1,
      name: studyLevelData.name,
      description: studyLevelData.description,
      status: studyLevelData.status,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setStudyLevels(prev => [...prev, newStudyLevel]);
  };

  const handleEditStudyLevel = async (studyLevelData: { name: string; description: string; status: "active" | "inactive" }) => {
    if (!selectedStudyLevel) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setStudyLevels(prev => prev.map(studyLevel =>
      studyLevel.id === selectedStudyLevel.id
        ? { ...studyLevel, name: studyLevelData.name, description: studyLevelData.description, status: studyLevelData.status }
        : studyLevel
    ));
    
    setSelectedStudyLevel(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this study level? This action cannot be undone.")) {
      setStudyLevels(prev => prev.filter(studyLevel => studyLevel.id !== id));
    }
  };

  const handleEditClick = (studyLevel: StudyLevel) => {
    setSelectedStudyLevel(studyLevel);
    setIsEditModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedStudyLevel(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Study Levels</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {filteredAndSortedData.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Levels</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredAndSortedData.filter(sl => sl.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Inactive Levels</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {filteredAndSortedData.filter(sl => sl.status === 'inactive').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Popular Levels</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {filteredAndSortedData.filter(sl => 
              ['Bachelors', 'Masters', 'PhD'].includes(sl.name)
            ).length}
          </div>
        </div>
      </div>

      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, description, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddClick}
            className="dark:border-green-500 h-11 px-4 rounded-lg border-2 border-green-500 bg-transparent text-sm text-green-500 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-green-500 dark:focus:border-brand-800 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Study Level
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    { key: "id", label: "ID" },
                    { key: "name", label: "Study Level" },
                    { key: "description", label: "Description" },
                    { key: "status", label: "Status" },
                    { key: "createdAt", label: "Created At" },
                    { key: "action", label: "Action" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => key !== "action" ? handleSort(key as keyof StudyLevel) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key !== "action" && (
                          <span className="text-xs">{getSortIcon(key as keyof StudyLevel)}</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((studyLevel) => (
                    <TableRow key={studyLevel.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          #{studyLevel.id}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <GraduationCap size={16} className="text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {studyLevel.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-600 text-theme-sm dark:text-gray-400 max-w-[300px]">
                          {studyLevel.description}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={getStatusColor(studyLevel.status)}
                        >
                          {studyLevel.status.charAt(0).toUpperCase() + studyLevel.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(studyLevel.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(studyLevel)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit Study Level"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(studyLevel.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Study Level"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      
                      className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      {searchTerm ? "No study levels found matching your search." : "No study levels available."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedData.length} of {studyLevels.length} study levels
      </div>

      {/* Add Modal */}
      <AddEditStudyLevelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddStudyLevel}
        mode="add"
      />

      {/* Edit Modal */}
      <AddEditStudyLevelModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudyLevel(null);
        }}
        onSave={handleEditStudyLevel}
        mode="edit"
        initialData={selectedStudyLevel || undefined}
      />
    </div>
  );
}