import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Calendar, 
  School, 
  GraduationCap, 
  Plus, 
  FileUp, 
  Pencil, 
  ChevronDown, 
  Paperclip, 
  Send, 
  Upload, 
  X, 
  Eye, 
  Download, 
  MessageCircle,
  Image as ImageIcon, 
  FileText 
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Programs from '@/app/admin/students/programs/Programs';
import { Country, State } from 'country-state-city';

interface Application {
  id: number;
  uuid: string;
  tenant_id: number;
  agent_id: number;
  student_user_id: number;
  course_id: number;
  course_intake_id: number;
  study_level_id: number;
  current_status_id: number;
  status_label: string;
  course_name: string;
  course_slug: string;
  university_name: string;
  university_slug: string;
  university_id: number;
  university_logo: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  email_verified: number;
  created_at: string;
  role_name: string;
  role_key: string;
}

interface AssignUserModalProps {
  applicationId: number;
  currentAssignedTo: number | null;
  currentAssignedName: string | null;
  applicationUuid: string;
  courseName: string;
  universityName: string;
  onClose: () => void;
  onUserAssign: (assignedTo: number | null) => void;
  token: string | null;
}

interface ApplicationDetail {
  id: number;
  uuid: string;
  tenant_id: number;
  agent_id: number;
  student_user_id: number;
  course_id: number;
  course_intake_id: number;
  study_level_id: number;
  current_status_id: number;
  status_key: string;
  status_label: string;
  status_sort_order: number;
  course_name: string;
  course_slug: string;
  duration_min: number;
  duration_max: number;
  duration_unit: string;
  tuition_fee: string;
  application_fee: string;
  currency_code: string;
  study_level_name: string;
  discipline_id: number;
  discipline_name: string;
  university_name: string;
  university_slug: string;
  university_id: number;
  university_logo: string;
  university_country: string;
  university_state: string;
  university_city: string;
  intake_year: number;
  intake: string;
  intake_id: number;
  submission_deadline: string;
  seat_availability: string | null;
  turnaround_time: string | null;
  conversion_rate: string | null;
  overall_score_label: string | null;
  overall_score_intent: string | null;
  created_at: string;
  updated_at: string;

  application_login: string;
  application_password: string;

    assigned_to_name?: string | null;
  assigned_to?: number | null;
}

interface SpecificDocument {
  id: number;
  application_id: number;
  document_name: string;
  document_type: string;
  is_mandatory: number;
  file_url: string | null;
  uploaded_at: string | null;
  uploaded_by: number | null;
  status: string;
  remarks: string | null;
  is_deleted: number;
  created_at: string;
}

interface ApplicationDetailResponse {
  application: ApplicationDetail;
  specific_documents: {
    list: SpecificDocument[];
    status: string;
  };
}

interface StatusOption {
  id: number;
  status_key: string;
  status_label: string;
  sort_order: number;
  is_default: number;
  is_active: number;
  created_at: string;
  updated_at: string | null;
}

interface StatusModalProps {
  applicationId: number;
  currentStatusId: number;
  applicationUuid: string;
  courseName: string;
  universityName: string;
  onClose: () => void;
  onStatusUpdate: (newStatusId: number) => void;
  token: string | null;
}

interface DocumentUploadState {
  documentId: number;
  file: File | null;
  isUploading: boolean;
  progress: number;
}

interface ChatMessage {
  id: number;
  tenant_id: number;
  agent_id: number;
  application_id: number;
  comment: string;
  file: string | null;
  who_has_created: 'student' | 'tenant';
  created_by: number;
  is_internal_note: number;
  is_deleted: number;
  deleted_by: number | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
  created_by_email: string;
  file_url: string | null;
}

interface ChatUploadState {
  file: File | null;
  preview: string | null;
  isUploading: boolean;
}

const getCountryName = (code: string | undefined | null) => {
  if (!code) return '';
  const country = Country.getCountryByCode(code);
  return country ? country.name : code;
};

const getStateName = (state_code: string | undefined | null, country_code: string | undefined | null) => {
  if (!state_code || !country_code) return '';
  const state = State.getStateByCodeAndCountry(state_code, country_code);
  return state ? state.name : state_code;
};


const StatusUpdateModal: React.FC<StatusModalProps> = ({
  applicationId,
  currentStatusId,
  applicationUuid,
  courseName,
  universityName,
  onClose,
  onStatusUpdate,
  token
}) => {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(currentStatusId);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = 'https://api.applystore.org/api';

  useEffect(() => {
    fetchStatusOptions();
  }, []);

  const fetchStatusOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/tenant/application/statuses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatusOptions(data.data);
      } else {
        setError('Failed to load status options');
      }
    } catch (error) {
      console.error('Error fetching status options:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatusId || selectedStatusId === currentStatusId) {
      onClose();
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/tenant/student/application/status/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_status_id: selectedStatusId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onStatusUpdate(selectedStatusId);
        onClose();
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentStatusLabel = () => {
    const currentStatus = statusOptions.find(status => status.id === currentStatusId);
    return currentStatus ? currentStatus.status_label : 'Loading...';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99999 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">
            Update Application Status
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            disabled={updating}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Application ID: <span className="font-medium dark:text-gray-300">{applicationUuid}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Course: <span className="font-medium dark:text-gray-300">{courseName}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              University: <span className="font-medium dark:text-gray-300">{universityName}</span>
            </p>
            <div className="pt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current Status:
              </p>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {getCurrentStatusLabel()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Update Status To
            </label>
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading status options...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={fetchStatusOptions}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <select
                value={selectedStatusId}
                onChange={(e) => setSelectedStatusId(Number(e.target.value))}
                className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                disabled={updating}
              >
                <option value="">Select a status</option>
                {statusOptions
                  .filter(status => status.is_active === 1)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.status_label}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {selectedStatusId !== currentStatusId && selectedStatusId > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                You are changing status from <span className="font-medium">{getCurrentStatusLabel()}</span> to{' '}
                <span className="font-medium">
                  {statusOptions.find(s => s.id === selectedStatusId)?.status_label}
                </span>
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            disabled={updating}
          >
            Cancel
          </button>
          <button
            onClick={handleStatusUpdate}
            disabled={updating || !selectedStatusId || selectedStatusId === currentStatusId || loading}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              updating || !selectedStatusId || selectedStatusId === currentStatusId || loading
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
            }`}
          >
            {updating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignUserModal: React.FC<AssignUserModalProps> = ({
  applicationId,
  currentAssignedTo,
  currentAssignedName,
  applicationUuid,
  courseName,
  universityName,
  onClose,
  onUserAssign,
  token
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(currentAssignedTo);
  const [loading, setLoading] = useState<boolean>(true);
  const [assigning, setAssigning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = 'https://api.applystore.org/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/tenant/custom/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (selectedUserId === currentAssignedTo) {
      onClose();
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/tenant/student/application/assign/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assigned_to: selectedUserId || 0
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onUserAssign(selectedUserId);
        onClose();
      } else {
        setError(data.message || 'Failed to assign user');
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      setError('Network error. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setAssigning(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/tenant/student/application/assign/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assigned_to: 0
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onUserAssign(null);
        onClose();
      } else {
        setError(data.message || 'Failed to unassign user');
      }
    } catch (error) {
      console.error('Error unassigning user:', error);
      setError('Network error. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99999 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">
            Assign Application to User
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            disabled={assigning}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Application ID: <span className="font-medium dark:text-gray-300">{applicationUuid}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Course: <span className="font-medium dark:text-gray-300">{courseName}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              University: <span className="font-medium dark:text-gray-300">{universityName}</span>
            </p>
            <div className="pt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Currently Assigned To:
              </p>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {currentAssignedName || 'Not assigned'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign To User
            </label>
            {loading ? (
              <div className="py-4 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading users...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                disabled={assigning}
              >
                <option value="">Select a user (or Re-Assigned to IGS)</option>
                {users
                  .filter(user => user.status === 'active')
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role_name} - {user.email})
                    </option>
                  ))}
              </select>
            )}
            
          </div>

          {selectedUserId !== currentAssignedTo && selectedUserId !== null && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                You are assigning this application to{' '}
                <span className="font-medium">
                  {users.find(u => u.id === selectedUserId)?.name}
                </span>
              </p>
            </div>
          )}

          {selectedUserId === null && currentAssignedTo !== null && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                You are removing the assignment from{' '}
                <span className="font-medium">{currentAssignedName}</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between p-6 border-t dark:border-gray-700">
          <div className="flex gap-3">
            {currentAssignedTo !== null && (
              <button
                onClick={handleUnassign}
                disabled={assigning}
                className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800"
              >
                Re-Assign Igs
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              disabled={assigning}
            >
              Cancel
            </button>
            <button
              onClick={handleAssignUser}
              disabled={assigning || selectedUserId === currentAssignedTo}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                assigning || selectedUserId === currentAssignedTo
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
              }`}
            >
              {assigning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {'Assigning...'}
                </>
              ) : (
                'Assign User'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Applications() {
  const { studentId } = useParams();
  const [activeTab, setActiveTab] = useState<'applied' | 'apply'>('applied');
  const [activeProgram, setActiveProgram] = useState<number | null>(null);

  const [commentTab, setCommentTab] = useState<'Igs' | 'student' | 'specific-doc'>('Igs');
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationDetail, setApplicationDetail] = useState<ApplicationDetail | null>(null);
  const [specificDocuments, setSpecificDocuments] = useState<SpecificDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [chatUploadState, setChatUploadState] = useState<ChatUploadState>({
    file: null,
    preview: null,
    isUploading: false
  });
  const [hideFromCounselor, setHideFromCounselor] = useState<boolean>(false);
  
  const [uploadStates, setUploadStates] = useState<DocumentUploadState[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

    const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [selectedApplicationForStatus, setSelectedApplicationForStatus] = useState<{
    id: number;
    uuid: string;
    courseName: string;
    universityName: string;
    currentStatusId: number;
  } | null>(null);

  const [showCredentialsModal, setShowCredentialsModal] = useState<boolean>(false);
  const [editingCredentials, setEditingCredentials] = useState<{
    application_login: string;
    application_password: string;
  }>({
    application_login: '',
    application_password: ''
  });
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const activeProgramFromUrl = searchParams.get("app");

  const BASE_URL = 'https://api.applystore.org/api';
  const {token} = useAuth();

    const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
    const [selectedApplicationForAssign, setSelectedApplicationForAssign] = useState<{
      id: number;
      uuid: string;
      courseName: string;
      universityName: string;
      assignedTo: number | null;
      assignedName: string | null;
    } | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchApplications();
    }
  }, [studentId]);

  useEffect(() => {
    if (applications.length > 0 && !activeProgram) {
      setActiveProgram(applications[0].id);
    
    }
  }, [applications]);

  useEffect(() => {
    if (activeProgramFromUrl) {
      setActiveProgram(Number(activeProgramFromUrl));
      setActiveTab("applied");
    }
  }, [activeProgramFromUrl]);

  useEffect(() => {
    if (activeProgram) {
      fetchApplicationDetails(activeProgram);
      loadMessages(activeProgram);
    }
  }, [activeProgram]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

    const handleStatusUpdateSuccess = (newStatusId: number) => {
    if(activeProgram){
      fetchApplicationDetails(activeProgram)
    }

};

const handleOpenStatusModal = (application: Application) => {
  setSelectedApplicationForStatus({
    id: application.id,
    uuid: application.uuid,
    courseName: application.course_name,
    universityName: application.university_name,
    currentStatusId: application.current_status_id
  });
  setShowStatusModal(true);
};

  const handleLoginDetails = (applicationId?: number) => {
  return () => {
    if (applicationDetail) {
      setEditingCredentials({
        application_login: applicationDetail.application_login || '',
        application_password: applicationDetail.application_password || ''
      });
      setShowCredentialsModal(true);
    }
  };
};

const updateCredentials = async () => {
  if (!activeProgram || !editingCredentials.application_login || !editingCredentials.application_password) {
    alert('Please fill in both login and password');
    return;
  }

  try {
    setIsUpdatingCredentials(true);
    
    const response = await fetch(`${BASE_URL}/tenant/student/application/credentials/${activeProgram}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        application_login: editingCredentials.application_login,
        application_password: editingCredentials.application_password
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Update the local state with new credentials
      if (applicationDetail) {
        setApplicationDetail({
          ...applicationDetail,
          application_login: editingCredentials.application_login,
          application_password: editingCredentials.application_password
        });
      }
      setShowCredentialsModal(false);
      alert('Credentials updated successfully!');
    } else {
      alert(data.message || 'Failed to update credentials');
    }
  } catch (error) {
    console.error('Error updating credentials:', error);
    alert('Failed to update credentials. Please try again.');
  } finally {
    setIsUpdatingCredentials(false);
  }
};

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/tenant/student/applications/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDetails = async (applicationId: number) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`${BASE_URL}/tenant/student/application/student/detail/${studentId}/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data: { success: boolean; data: ApplicationDetailResponse } = await response.json();
      if (data.success) {
        setApplicationDetail(data.data.application);
        setSpecificDocuments(data.data.specific_documents.list);
        
        const initialUploadStates = data.data.specific_documents.list.map(doc => ({
          documentId: doc.id,
          file: null,
          isUploading: false,
          progress: 0
        }));
        setUploadStates(initialUploadStates);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadMessages = async (applicationId: number) => {
    try {
      setIsLoadingMessages(true);
      
      let endpoint = '';
      
      
        endpoint = `${BASE_URL}/tenant/student/application/comments/${applicationId}`;
      

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeProgram && (commentTab === 'Igs' || commentTab === 'student')) {
      loadMessages(activeProgram);
    }
  }, [commentTab, activeProgram]);

  const handleFileSelect = (documentId: number, file: File) => {
    setSelectedFile(file);
    setSelectedDocument(documentId);
    
    setUploadStates(prev => prev.map(state => 
      state.documentId === documentId 
        ? { ...state, file, isUploading: false, progress: 0 }
        : state
    ));
  };

  const handleChatFileSelect = (file: File) => {
    setChatUploadState({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      isUploading: false
    });
  };

  const removeChatFile = () => {
    if (chatUploadState.preview) {
      URL.revokeObjectURL(chatUploadState.preview);
    }
    setChatUploadState({
      file: null,
      preview: null,
      isUploading: false
    });
  };

  const uploadDocument = async (applicationId: number, documentId: number, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      formData.append('document_id', documentId.toString());
      formData.append('file', file);

      setUploadStates(prev => prev.map(state => 
        state.documentId === documentId 
          ? { ...state, isUploading: true, progress: 0 }
          : state
      ));
      setIsUploading(true);

      xhr.open('PUT', `${BASE_URL}/tenant/student/application/upload/document/${applicationId}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
          setUploadStates(prev => prev.map(state => 
            state.documentId === documentId 
              ? { ...state, progress }
              : state
          ));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          fetchApplicationDetails(applicationId);
          setUploadStates(prev => prev.map(state => 
            state.documentId === documentId 
              ? { ...state, isUploading: false, progress: 100 }
              : state
          ));
          setIsUploading(false);
          setSelectedFile(null);
          setSelectedDocument(null);
          resolve();
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => {
        setUploadStates(prev => prev.map(state => 
          state.documentId === documentId 
            ? { ...state, isUploading: false, progress: 0 }
            : state
        ));
        setIsUploading(false);
        reject(new Error('Upload failed'));
      };

      xhr.send(formData);
    });
  };

  const sendMessage = async () => {
    if (!activeProgram || (!newMessage.trim() && !chatUploadState.file)) return;

    try {
      setChatUploadState(prev => ({ ...prev, isUploading: true }));

      const formData = new FormData();
      if (newMessage.trim()) {
        formData.append('comment', newMessage.trim());
      }
      if (chatUploadState.file) {
        formData.append('file', chatUploadState.file);
      }
      if (hideFromCounselor) {
        formData.append('is_internal_note', '1');
      }

      if (studentId) {
        formData.append('student_id', String(studentId));
      }
      

      const response = await fetch(`${BASE_URL}/tenant/student/application/comments/${activeProgram}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        if (commentTab === 'student') {
          const messagesResponse = await fetch(`${BASE_URL}/tenant/student/application/comments/${activeProgram}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const messagesData = await messagesResponse.json();
          if (messagesData.success) {
            setMessages(messagesData.data);
          }
        } else {
          loadMessages(activeProgram);
        }
        
        setNewMessage('');
        removeChatFile();
        setHideFromCounselor(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setChatUploadState(prev => ({ ...prev, isUploading: false }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocument || !activeProgram) return;

    try {
      await uploadDocument(activeProgram, selectedDocument, selectedFile);
      await fetchApplicationDetails(activeProgram);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleOpenAssignModal = (application: ApplicationDetail) => {
    setSelectedApplicationForAssign({
      id: application.id,
      uuid: application.uuid,
      courseName: application.course_name,
      universityName: application.university_name,
      assignedTo: application.assigned_to || null,
      assignedName: application.assigned_to_name || null
    });
    setShowAssignModal(true);
  };

  const getDocumentUploadState = (documentId: number) => {
    return uploadStates.find(state => state.documentId === documentId);
  };

      const handleUserAssignSuccess = (assignedTo: number | null) => {
    if (activeProgram) {
      // Refresh the application details to get updated assigned user info
      fetchApplicationDetails(activeProgram);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'document-pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'received':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    }
  };

  const getFileIcon = (fileName: string | null) => {
    if (!fileName) return <FileText size={16} />;
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
      return <ImageIcon size={16} />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText size={16} />;
    }
    return <Paperclip size={16} />;
  };

  const renderMessages = () => {
    if (isLoadingMessages) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
        </div>
      );
    }

    if (messages?.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <MessageCircle size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
         
        </div>
      );
    }

    return messages?.map((message) => {
      const isStudent = message.who_has_created === 'student';
      const isTenant = message.who_has_created === 'tenant';
      
      const senderName = message.created_by_name || 
                        (isStudent ? 'You' : 'IGS Team');

      return (
        <div key={message.id} className="flex gap-3 mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            isStudent 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
          }`}>
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div className={`rounded-lg p-4 max-w-xl ${
            isStudent
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <p className={`font-medium ${
                isStudent
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {senderName}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatMessageTime(message.created_at)}
              </span>
            </div>
            
            {message.comment && (
              <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                {message.comment}
              </p>
            )}
            
            {message.file_url && (
              <div className="mt-2">
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {getFileIcon(message.file)}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                    {message.file?.split('/').pop() || 'Attachment'}
                  </span>
                  <Eye size={14} className="text-gray-500 dark:text-gray-400" />
                </a>
              </div>
            )}
            
            {message.is_internal_note === 1 && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                Hidden from counselor
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-center gap-10 border-b dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('apply')}
          className={`pb-3 font-medium ${
            activeTab === 'apply'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Apply To Programs
        </button>
        <button
          onClick={() => setActiveTab('applied')}
          className={`pb-3 font-medium ${
            activeTab === 'applied'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Applied Programs
        </button>
      </div>

      {activeTab === 'applied' ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 space-y-4">
            {applications.map(item => (
              <div
                key={item.id}
                onClick={() => setActiveProgram(item.id)}
                className={`cursor-pointer border dark:border-gray-700 rounded-md p-4 relative bg-white dark:bg-gray-800 ${
                  activeProgram === item.id
                    ? 'border-blue-500 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`text-sm font-semibold inline-block px-2 py-1 rounded mb-2 ${getStatusColor(item.status_label)}`}>
                  {item.status_label}
                </div>

                <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <p><span className="font-medium dark:text-gray-200">Course:</span> {item.course_name}</p>
                  <p><span className="font-medium dark:text-gray-200">University:</span> {item.university_name}</p>
                  <p><span className="font-medium dark:text-gray-200">Acknowledgment Number:</span> {item.uuid}</p>
                  <p><span className="font-medium dark:text-gray-200">Date:</span> {formatDate(item.created_at)}</p>
                </div>

                {activeProgram === item.id && (
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-b-[10px] border-l-[10px] border-transparent border-l-blue-500 dark:border-l-blue-400" />
                )}
              </div>
            ))}
          </div>

          {detailLoading ? (
            <div className="col-span-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-6 flex items-center justify-center">
              <div className="text-gray-600 dark:text-gray-400">Loading details...</div>
            </div>
          ) : applicationDetail ? (
            <div className="col-span-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(applicationDetail.created_at)}
                  </p> */}
                  <h2 className="text-2xl font-semibold mt-2 dark:text-white">
                    {applicationDetail.course_name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {applicationDetail.university_name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {applicationDetail.university_city}, {getStateName(applicationDetail.university_state, applicationDetail.university_country) }, {getCountryName(applicationDetail.university_country)}
                  </p>
                  <p className="text-sm font-semibold underline mt-1 dark:text-white">
                    {applicationDetail.uuid}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-4">
                    Intake : {applicationDetail.intake} {applicationDetail.intake_year}
                  </p>
                </div>

                <div className="">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className={`text-sm px-3 py-1 rounded-md font-medium ${getStatusColor(applicationDetail.status_label)}`}>
                                    {applicationDetail.status_label}
                                  </span>
                                      
                      
                                  <button 
                                    onClick={() => handleOpenStatusModal({
                                      id: applicationDetail.id,
                                      uuid: applicationDetail.uuid,
                                      course_name: applicationDetail.course_name,
                                      university_name: applicationDetail.university_name,
                                      current_status_id: applicationDetail.current_status_id
                                    } as Application)}
                                    className="p-2 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <Pencil size={16} className="dark:text-gray-300" />
                                  </button>
                
                                 </div>
                                
                
                                    <div className="flex items-center justify-between gap-2">
                                      
                                            {/* Add assigned user info */}
                          
                                          <span className="text-sm px-3 py-1 rounded-md font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                            Assigned: {applicationDetail.assigned_to_name || 'IGS-ADMIN'}
                                          </span>
                                        
                                                    
                
                                                    <button 
                                          onClick={() => handleOpenAssignModal(applicationDetail)}
                                          className="p-2 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                          title="Assign to User"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                          </svg>
                                        </button>
                                    </div>
                
                                </div>
              </div>

              <div className="mt-2 flex gap-3">
                <div className="text-gray-500 dark:text-gray-400">
                  Application Fee:{' '}
                  <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded text-sm font-medium">
                    {parseFloat(applicationDetail.application_fee) > 0 
                      ? `${applicationDetail.currency_code} ${applicationDetail.application_fee}`
                      : 'No Application Fee'}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 ">
                  Tuition Fee:{' '}
                  <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded text-sm font-medium">
                    {applicationDetail.currency_code} {applicationDetail.tuition_fee}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex gap-3">
                <div className="text-gray-500 dark:text-gray-400">
                  Application Login:{' '}
                  <span className="ml-2 rounded text-sm font-medium">
                    {`${applicationDetail.application_login || "N/A"}`}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 ">
                  Application Password:{' '}
                  <span className="ml-2 rounded text-sm font-medium">
                    {`${applicationDetail.application_password || "N/A"}`}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 " >
                  {activeProgram ? <span 
  onClick={handleLoginDetails(activeProgram)} 
  className="ml-2 rounded text-sm font-medium text-blue-500 cursor-pointer underline hover:text-blue-600 dark:hover:text-blue-400"
>
  Edit
</span> : null}
                </div>
              </div>

              <div className="mt-2">
                <div className="flex gap-6 border-b dark:border-gray-700">
                  <button
                    onClick={() => setCommentTab('Igs')}
                    className={`pb-2 font-medium ${
                      commentTab === 'Igs'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    Comments
                  </button>
                 
                  {/* <button
                    onClick={() => setCommentTab('specific-doc')}
                    className={`pb-2 font-medium flex ${
                      commentTab === 'specific-doc'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    Specific Documents
                    <span className="num ml-1 bg-red-700 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      {specificDocuments.filter(doc => !doc.file_url).length}
                    </span>
                  </button> */}
                </div>

                {(commentTab === 'Igs' || commentTab === 'student') && (
                  <div className="mt-6">
                    <div className="h-64 overflow-y-auto mb-4 pr-2">
                      {renderMessages()}
                      <div ref={messagesEndRef} />
                    </div>

                    {chatUploadState.preview && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            File Preview
                          </span>
                          <button
                            onClick={removeChatFile}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded flex items-center justify-center">
                            <ImageIcon size={20} className="text-blue-500 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                              {chatUploadState.file?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {chatUploadState.file?.size ? Math.round(chatUploadState.file.size / 1024) : 0} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Write your message..."
                        className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                        rows={3}
                        disabled={chatUploadState.isUploading}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            ref={chatFileInputRef}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleChatFileSelect(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                            disabled={chatUploadState.isUploading}
                          />
                          <button
                            onClick={() => chatFileInputRef.current?.click()}
                            disabled={chatUploadState.isUploading}
                            className={`p-2 rounded-md flex items-center gap-2 ${
                              chatUploadState.isUploading
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                            }`}
                          >
                            <Paperclip size={18} />
                            Attach File
                          </button>
                          
                          {/* <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={hideFromCounselor}
                              onChange={(e) => setHideFromCounselor(e.target.checked)}
                              className="dark:bg-gray-700 rounded"
                              disabled={chatUploadState.isUploading}
                            />
                            <span>Hide this message and attachment from counselor</span>
                          </div> */}
                        </div>
                        
                        <button
                          onClick={sendMessage}
                          disabled={(!newMessage.trim() && !chatUploadState.file) || chatUploadState.isUploading}
                          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                            (!newMessage.trim() && !chatUploadState.file) || chatUploadState.isUploading
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                          }`}
                        >
                          {chatUploadState.isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {commentTab === 'specific-doc' && (
                  <div className="mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      {specificDocuments.map(doc => {
                        const uploadState = getDocumentUploadState(doc.id);
                        const isUploading = uploadState?.isUploading || false;
                        const progress = uploadState?.progress || 0;

                        return (
                          <div key={doc.id} className="border dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium dark:text-white">{doc.document_name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {doc.is_mandatory ? 'Mandatory' : 'Optional'} • {doc.document_type}
                                </p>
                              </div>
                              {doc.status === 'uploaded' && (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded">
                                  Uploaded
                                </span>
                              )}
                            </div>

                            {doc.file_url ? (
                              <>
                              <div className="flex items-center gap-2 mb-4">
                                <a
                                  href={`${BASE_URL}/${doc.file_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  <Eye size={16} />
                                  View Document
                                </a>
                                <span className="text-gray-400">•</span>
                                <a
                                  href={`${BASE_URL}/${doc.file_url}`}
                                  download
                                  className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:underline"
                                >
                                  <Download size={16} />
                                  Download
                                </a>
                              </div>
                              <div className="space-y-3">
                                <input
                                  type="file"
                                  id={`file-upload-${doc.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileSelect(doc.id, e.target.files[0]);
                                    }
                                  }}
                                  disabled={isUploading}
                                />
                                
                                {selectedFile && selectedDocument === doc.id ? (
                                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                    <span className="text-sm truncate dark:text-gray-300">{selectedFile.name}</span>
                                    <button
                                      onClick={() => {
                                        setSelectedFile(null);
                                        setSelectedDocument(null);
                                      }}
                                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    htmlFor={`file-upload-${doc.id}`}
                                    className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer ${
                                      isUploading 
                                        ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700' 
                                        : 'border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500'
                                    }`}
                                  >
                                    <Upload size={20} className="text-blue-500 dark:text-blue-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {isUploading ? 'Uploading...' : 'Click to upload'}
                                    </span>
                                  </label>
                                )}

                                {isUploading && (
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                )}

                                {selectedFile && selectedDocument === doc.id && !isUploading && (
                                  <button
                                    onClick={handleUpload}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                                  >
                                    <Upload size={16} />
                                    Upload Document
                                  </button>
                                )}
                              </div>
                              </>
                            ) : (
                              <div className="space-y-3">
                                <input
                                  type="file"
                                  id={`file-upload-${doc.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileSelect(doc.id, e.target.files[0]);
                                    }
                                  }}
                                  disabled={isUploading}
                                />
                                
                                {selectedFile && selectedDocument === doc.id ? (
                                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                    <span className="text-sm truncate dark:text-gray-300">{selectedFile.name}</span>
                                    <button
                                      onClick={() => {
                                        setSelectedFile(null);
                                        setSelectedDocument(null);
                                      }}
                                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    htmlFor={`file-upload-${doc.id}`}
                                    className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer ${
                                      isUploading 
                                        ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700' 
                                        : 'border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500'
                                    }`}
                                  >
                                    <Upload size={20} className="text-blue-500 dark:text-blue-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {isUploading ? 'Uploading...' : 'Click to upload'}
                                    </span>
                                  </label>
                                )}

                                {isUploading && (
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                )}

                                {selectedFile && selectedDocument === doc.id && !isUploading && (
                                  <button
                                    onClick={handleUpload}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                                  >
                                    <Upload size={16} />
                                    Upload Document
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="col-span-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-6 flex items-center justify-center">
              <div className="text-gray-600 dark:text-gray-400">Select an application to view details</div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 relative">
          <Programs studentId={String(studentId)}/>
        </div>
      )}

      {/* <div className="fixed right-0 top-1/2 -translate-y-1/2">
        <div className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 rounded-l-md rotate-90 origin-bottom-right font-medium">
          What's new
        </div>
      </div> */}

      {showCredentialsModal && (
  <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-99999 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
      <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold dark:text-white">
          Edit Application Credentials
        </h3>
        <button
          onClick={() => setShowCredentialsModal(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          disabled={isUpdatingCredentials}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Application Login
          </label>
          <input
            type="text"
            value={editingCredentials.application_login}
            onChange={(e) => setEditingCredentials(prev => ({
              ...prev,
              application_login: e.target.value
            }))}
            className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Enter application login"
            disabled={isUpdatingCredentials}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Application Password
          </label>
          <input
            type="text"
            value={editingCredentials.application_password}
            onChange={(e) => setEditingCredentials(prev => ({
              ...prev,
              application_password: e.target.value
            }))}
            className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Enter application password"
            disabled={isUpdatingCredentials}
          />
        </div>
        
       
      </div>
      
      <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
        <button
          onClick={() => setShowCredentialsModal(false)}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          disabled={isUpdatingCredentials}
        >
          Cancel
        </button>
        <button
          onClick={updateCredentials}
          disabled={isUpdatingCredentials || !editingCredentials.application_login || !editingCredentials.application_password}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            isUpdatingCredentials || !editingCredentials.application_login || !editingCredentials.application_password
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
          }`}
        >
          {isUpdatingCredentials ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            'Update Credentials'
          )}
        </button>
      </div>
    </div>
  </div>
)}


 {showAssignModal && selectedApplicationForAssign && (
        <AssignUserModal
          applicationId={selectedApplicationForAssign.id}
          currentAssignedTo={selectedApplicationForAssign.assignedTo}
          currentAssignedName={selectedApplicationForAssign.assignedName}
          applicationUuid={selectedApplicationForAssign.uuid}
          courseName={selectedApplicationForAssign.courseName}
          universityName={selectedApplicationForAssign.universityName}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedApplicationForAssign(null);
          }}
          onUserAssign={handleUserAssignSuccess}
          token={token}
        />
      )}

{showStatusModal && selectedApplicationForStatus && (
  <StatusUpdateModal
    applicationId={selectedApplicationForStatus.id}
    currentStatusId={selectedApplicationForStatus.currentStatusId}
    applicationUuid={selectedApplicationForStatus.uuid}
    courseName={selectedApplicationForStatus.courseName}
    universityName={selectedApplicationForStatus.universityName}
    onClose={() => {
      setShowStatusModal(false);
      setSelectedApplicationForStatus(null);
    }}
    onStatusUpdate={handleStatusUpdateSuccess}
    token={token}
  />
)}
    </div>
  );
}