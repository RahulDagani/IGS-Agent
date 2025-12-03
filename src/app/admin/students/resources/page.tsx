"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Video, 
  Newspaper, 
  Link as LinkIcon,
  Users,
  User,
  Building2,
  Globe,
  Search,
  Eye,
  Download,
  X
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface Resource {
  id: number
  tenant_id: number
  title: string
  description: string
  resource_type: 'video' | 'news' | 'guide' | 'link'
  audience_type: 'student' | 'agent' | 'university' | 'all'
  url: string
  thumbnail: string | null
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ApiResponse {
  success: boolean
  message: string
  data: Resource[]
  pagination: Pagination
}

interface SingleResourceResponse {
  success: boolean
  message: string
  data: Resource
}

const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE

// Debounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default function ResourcesPage() {
  const router = useRouter()
  const { token } = useAuth()
  
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500) // 500ms delay
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  })
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  // Form states - FIXED: Use separate states for add and edit forms
  const [addFormData, setAddFormData] = useState({
    title: "",
    description: "",
    resource_type: "guide" as Resource['resource_type'],
    audience_type: "student" as Resource['audience_type'],
    url: "",
    thumbnail: null as File | null
  })
  
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    resource_type: "guide" as Resource['resource_type'],
    audience_type: "student" as Resource['audience_type'],
    url: "",
    thumbnail: null as File | null | string
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  // Resource type options
  const resourceTypes = [
    { value: "video", label: "Video", icon: Video },
    { value: "news", label: "News", icon: Newspaper },
    { value: "guide", label: "Guide", icon: FileText },
    { value: "link", label: "Link", icon: LinkIcon }
  ]

  // Audience type options
  const audienceTypes = [
    { value: "student", label: "Student", icon: User },
    { value: "agent", label: "Agent", icon: Users },
    { value: "university", label: "University", icon: Building2 },
    { value: "all", label: "All", icon: Globe }
  ]

  // Fetch resources with useCallback to prevent unnecessary re-renders
  const fetchResources = useCallback(async (page = 1, search = "") => {
    try {
      setLoading(true)
      const response = await fetch(
        `${BASE_URL}/tenant/resources?page=${page}&limit=20${search ? `&search=${search}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) throw new Error('Failed to fetch resources')
      
      const result: ApiResponse = await response.json()
      
      if (result.success) {
        setResources(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch single resource
  const fetchResourceById = async (id: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tenant/resources/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) throw new Error('Failed to fetch resource')
      
      const result: SingleResourceResponse = await response.json()
      
      if (result.success) {
        return result.data
      }
    } catch (error) {
      console.error('Error fetching resource:', error)
    }
    return null
  }

  // Use debounced search term in useEffect
  useEffect(() => {
    fetchResources(1, debouncedSearchTerm)
  }, [debouncedSearchTerm, fetchResources])

  // Handle search - only update local state
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchResources(newPage, debouncedSearchTerm)
    }
  }

  // Reset add form
  const resetAddForm = () => {
    setAddFormData({
      title: "",
      description: "",
      resource_type: "guide",
      audience_type: "student",
      url: "",
      thumbnail: null
    })
    setThumbnailPreview(null)
  }

  // Reset edit form
  const resetEditForm = () => {
    setEditFormData({
      title: "",
      description: "",
      resource_type: "guide",
      audience_type: "student",
      url: "",
      thumbnail: null
    })
    setThumbnailPreview(null)
  }

  // Open Add Modal
  const openAddModal = () => {
    resetAddForm()
    setShowAddModal(true)
  }

  // Open Edit Modal
  const openEditModal = async (resource: Resource) => {
    setSelectedResource(resource)
    setEditFormData({
      title: resource.title,
      description: resource.description,
      resource_type: resource.resource_type,
      audience_type: resource.audience_type,
      url: resource.url,
      thumbnail: resource.thumbnail
    })
    if (resource.thumbnail) {
      setThumbnailPreview(resource.thumbnail)
    }
    setShowEditModal(true)
  }

  // Open View Modal
  const openViewModal = async (resource: Resource) => {
    const fullResource = await fetchResourceById(resource.id)
    if (fullResource) {
      setSelectedResource(fullResource)
      setShowViewModal(true)
    }
  }

  // Open Delete Modal
  const openDeleteModal = (resource: Resource) => {
    setSelectedResource(resource)
    setShowDeleteModal(true)
  }

  // Handle add form input changes
  const handleAddInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle edit form input changes
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle thumbnail file change for add form
  const handleAddThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAddFormData(prev => ({ ...prev, thumbnail: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle thumbnail file change for edit form
  const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditFormData(prev => ({ ...prev, thumbnail: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle add form submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', addFormData.title)
      formDataToSend.append('description', addFormData.description)
      formDataToSend.append('resource_type', addFormData.resource_type)
      formDataToSend.append('audience_type', addFormData.audience_type)
      formDataToSend.append('url', addFormData.url)
      
      if (addFormData.thumbnail instanceof File) {
        formDataToSend.append('thumbnail', addFormData.thumbnail)
      }

      const response = await fetch(`${BASE_URL}/tenant/resources`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      })

      if (!response.ok) throw new Error('Failed to add resource')

      const result = await response.json()
      
      if (result.success) {
        setShowAddModal(false)
        resetAddForm()
        fetchResources(1, debouncedSearchTerm) // Refresh list
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error adding resource:', error)
      alert(`Error adding resource: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResource) return

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', editFormData.title)
      formDataToSend.append('description', editFormData.description)
      formDataToSend.append('resource_type', editFormData.resource_type)
      formDataToSend.append('audience_type', editFormData.audience_type)
      formDataToSend.append('url', editFormData.url)
      
      if (editFormData.thumbnail instanceof File) {
        formDataToSend.append('thumbnail', editFormData.thumbnail)
      } else if (editFormData.thumbnail === null) {
        formDataToSend.append('thumbnail', '')
      }

      const response = await fetch(`${BASE_URL}/tenant/resources/${selectedResource.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      })

      if (!response.ok) throw new Error('Failed to update resource')

      const result = await response.json()
      
      if (result.success) {
        setShowEditModal(false)
        resetEditForm()
        fetchResources(1, debouncedSearchTerm) // Refresh list
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error updating resource:', error)
      alert(`Error updating resource: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedResource) return

    try {
      const response = await fetch(`${BASE_URL}/tenant/resources/${selectedResource.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to delete resource')

      const result = await response.json()
      
      if (result.success) {
        setShowDeleteModal(false)
        fetchResources(1, debouncedSearchTerm) // Refresh list
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert(`Error deleting resource: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get resource type icon
  const getResourceTypeIcon = (type: Resource['resource_type']) => {
    const typeConfig = resourceTypes.find(t => t.value === type)
    return typeConfig ? React.createElement(typeConfig.icon, { size: 20 }) : <FileText size={20} />
  }

  // Get audience type icon
  const getAudienceTypeIcon = (type: Resource['audience_type']) => {
    const typeConfig = audienceTypes.find(t => t.value === type)
    return typeConfig ? React.createElement(typeConfig.icon, { size: 20 }) : <Users size={20} />
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Modal Component
  const Modal = React.memo(({ 
    isOpen, 
    onClose, 
    children, 
    title 
  }: { 
    isOpen: boolean, 
    onClose: () => void, 
    children: React.ReactNode,
    title: string 
  }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-99999 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="relative z-99999 w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  })

  Modal.displayName = 'Modal'

  // Add Form
  const AddResourceForm = React.memo(() => (
    <form onSubmit={handleAddSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={addFormData.title}
          onChange={handleAddInputChange}
          placeholder="Enter resource title"
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={addFormData.description}
          onChange={handleAddInputChange}
          placeholder="Enter resource description"
          rows={3}
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
      </div>

      {/* Resource Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Resource Type *
        </label>
        <select
          name="resource_type"
          value={addFormData.resource_type}
          onChange={handleAddInputChange}
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {resourceTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Audience Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Audience Type *
        </label>
        <select
          name="audience_type"
          value={addFormData.audience_type}
          onChange={handleAddInputChange}
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {audienceTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL *
        </label>
        <input
          type="url"
          name="url"
          value={addFormData.url}
          onChange={handleAddInputChange}
          placeholder="https://example.com/resource"
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Thumbnail
        </label>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleAddThumbnailChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300"
          />
          {thumbnailPreview && (
            <div className="relative mt-2 w-32 h-32">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="rounded-lg border border-gray-300 dark:border-gray-700 object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => {
                  setThumbnailPreview(null)
                  setAddFormData(prev => ({ ...prev, thumbnail: null }))
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adding...
            </span>
          ) : (
            'Add Resource'
          )}
        </button>
      </div>
    </form>
  ))

  AddResourceForm.displayName = 'AddResourceForm'

  // Edit Form
  const EditResourceForm = React.memo(() => (
    <form onSubmit={handleEditSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={editFormData.title}
          onChange={handleEditInputChange}
          placeholder="Enter resource title"
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={editFormData.description}
          onChange={handleEditInputChange}
          placeholder="Enter resource description"
          rows={3}
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
      </div>

      {/* Resource Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Resource Type *
        </label>
        <select
          name="resource_type"
          value={editFormData.resource_type}
          onChange={handleEditInputChange}
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {resourceTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Audience Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Audience Type *
        </label>
        <select
          name="audience_type"
          value={editFormData.audience_type}
          onChange={handleEditInputChange}
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {audienceTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL *
        </label>
        <input
          type="url"
          name="url"
          value={editFormData.url}
          onChange={handleEditInputChange}
          placeholder="https://example.com/resource"
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Thumbnail
        </label>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleEditThumbnailChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300"
          />
          {thumbnailPreview && (
            <div className="relative mt-2 w-32 h-32">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="rounded-lg border border-gray-300 dark:border-gray-700 object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => {
                  setThumbnailPreview(null)
                  setEditFormData(prev => ({ ...prev, thumbnail: null }))
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Updating...
            </span>
          ) : (
            'Update Resource'
          )}
        </button>
      </div>
    </form>
  ))

  EditResourceForm.displayName = 'EditResourceForm'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your educational resources</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Resource
        </button>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No resources</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new resource.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Resource
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Audience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {resource.thumbnail ? (
                            <img
                              src={resource.thumbnail}
                              alt={resource.title}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              {getResourceTypeIcon(resource.resource_type)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {resource.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {resource.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                          {getResourceTypeIcon(resource.resource_type)}
                          <span className="text-sm text-gray-900 dark:text-white capitalize">
                            {resource.resource_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                          {getAudienceTypeIcon(resource.audience_type)}
                          <span className="text-sm text-gray-900 dark:text-white capitalize">
                            {resource.audience_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(resource.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* <button
                            onClick={() => openViewModal(resource)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
                            title="View"
                          >
                            <Eye size={16} />
                          </button> */}
                          <button
                            onClick={() => openEditModal(resource)}
                            className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(resource)}
                            className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-medium">{resources.length}</span> of{" "}
                    <span className="font-medium">{pagination.total}</span> resources
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Resource"
      >
        <AddResourceForm />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Resource"
      >
        <EditResourceForm />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Resource Details"
      >
        {selectedResource && (
          <div className="space-y-4">
            {selectedResource.thumbnail && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={selectedResource.thumbnail}
                  alt={selectedResource.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedResource.title}
              </h4>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {selectedResource.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Resource Type</p>
                <div className="flex items-center gap-2 mt-1">
                  {getResourceTypeIcon(selectedResource.resource_type)}
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {selectedResource.resource_type}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Audience</p>
                <div className="flex items-center gap-2 mt-1">
                  {getAudienceTypeIcon(selectedResource.audience_type)}
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {selectedResource.audience_type}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">URL</p>
              <a
                href={selectedResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <LinkIcon size={16} />
                {selectedResource.url}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {formatDate(selectedResource.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {formatDate(selectedResource.updated_at)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  window.open(selectedResource.url, '_blank')
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Download size={16} />
                Open Resource
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Resource"
      >
        {selectedResource && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                    Delete Resource
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                    Are you sure you want to delete &quot;{selectedResource.title}&quot;? This action cannot be undone.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Resource
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}