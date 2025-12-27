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
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
  who_has_created: 'agent' | 'tenant';
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

export default function Applications() {
  const { id: studentId } = useParams();
  const [activeTab, setActiveTab] = useState<'applied' | 'apply'>('applied');
  const [activeProgram, setActiveProgram] = useState<number | null>(null);
  const [commentTab, setCommentTab] = useState<'Igs' | 'agent' | 'specific-doc'>('Igs');
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const BASE_URL = 'https://api.applystore.org/api';
  const {token} = useAuth();

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
    if (activeProgram) {
      fetchApplicationDetails(activeProgram);
      loadMessages(activeProgram);
    }
  }, [activeProgram]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/agent/applications/student/${studentId}`, {
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
      const response = await fetch(`${BASE_URL}/agent/application/student/detail/${studentId}/${applicationId}`, {
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
      if (commentTab === 'Igs') {
        endpoint = `${BASE_URL}/agent/application/comments/${applicationId}?who_has_created=tenant`;
      } else if (commentTab === 'agent') {
        endpoint = `${BASE_URL}/agent/application/comments/${applicationId}?who_has_created=agent`;
      }

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
    if (activeProgram && (commentTab === 'Igs' || commentTab === 'agent')) {
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

      xhr.open('PUT', `${BASE_URL}/agent/application/upload/document/${applicationId}`);
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

      const response = await fetch(`${BASE_URL}/agent/application/comments/${activeProgram}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        if (commentTab === 'agent') {
          const messagesResponse = await fetch(`${BASE_URL}/agent/application/comments/${activeProgram}?who_has_created=agent`, {
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

  const getDocumentUploadState = (documentId: number) => {
    return uploadStates.find(state => state.documentId === documentId);
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
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
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

    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <MessageCircle size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {commentTab === 'Igs' 
              ? 'No messages from IGS team' 
              : commentTab === 'agent'
              ? 'No messages'
              : 'You haven\'t sent any messages'}
          </p>
        </div>
      );
    }

    return messages.map((message) => {
      const isAgent = message.who_has_created === 'agent';
      const isTenant = message.who_has_created === 'tenant';
      
      const senderName = message.created_by_name || 
                        (isAgent ? 'You' : 
                         isTenant ? 'IGS Team' : 
                         'Student');

      return (
        <div key={message.id} className="flex gap-3 mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            isAgent 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
          }`}>
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div className={`rounded-lg p-4 max-w-xl ${
            isAgent
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <p className={`font-medium ${
                isAgent
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
                  <p><span className="font-medium dark:text-gray-200">ID:</span> {item.uuid}</p>
                  <p><span className="font-medium dark:text-gray-200">Date:</span> {formatDate(item.created_at)}</p>
                  <p><span className="font-medium dark:text-gray-200">Course:</span> {item.course_name}</p>
                  <p><span className="font-medium dark:text-gray-200">University:</span> {item.university_name}</p>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(applicationDetail.created_at)}
                  </p>
                  <p className="text-lg font-semibold underline mt-1 dark:text-white">
                    {applicationDetail.uuid}
                  </p>
                  <h2 className="text-xl font-semibold mt-2 dark:text-white">
                    {applicationDetail.course_name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {applicationDetail.university_name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {applicationDetail.intake} {applicationDetail.intake_year}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {applicationDetail.university_city}, {applicationDetail.university_state}, {applicationDetail.university_country}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-sm px-3 py-1 rounded-md font-medium ${getStatusColor(applicationDetail.status_label)}`}>
                    {applicationDetail.status_label}
                  </span>
                  {/* <button className="p-2 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Pencil size={16} className="dark:text-gray-300" />
                  </button>
                  <button className="p-2 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronDown size={16} className="dark:text-gray-300" />
                  </button> */}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-gray-500 dark:text-gray-400">
                  Application Fee:{' '}
                  <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded text-sm font-medium">
                    {parseFloat(applicationDetail.application_fee) > 0 
                      ? `${applicationDetail.currency_code} ${applicationDetail.application_fee}`
                      : 'No Application Fee'}
                  </span>
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Tuition Fee:{' '}
                  <span className="ml-2 font-medium">
                    {applicationDetail.currency_code} {applicationDetail.tuition_fee}
                  </span>
                </p>
              </div>

              <div className="mt-8">
                <div className="flex gap-6 border-b dark:border-gray-700">
                  <button
                    onClick={() => setCommentTab('Igs')}
                    className={`pb-2 font-medium ${
                      commentTab === 'Igs'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    Igs Team Messages
                  </button>
                  <button
                    onClick={() => setCommentTab('agent')}
                    className={`pb-2 font-medium ${
                      commentTab === 'agent'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-400 border-b-2'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    Your Messages
                  </button>
                  <button
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
                  </button>
                </div>

                {(commentTab === 'Igs' || commentTab === 'agent') && (
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
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={hideFromCounselor}
                              onChange={(e) => setHideFromCounselor(e.target.checked)}
                              className="dark:bg-gray-700 rounded"
                              disabled={chatUploadState.isUploading}
                            />
                            <span>Hide this message and attachment from counselor</span>
                          </div>
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
        <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              Quick Add Program
            </h1>

            <button className="flex items-center gap-2 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30">
              <Search size={16} />
              Search Program
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-5xl">
              We only show eligible programs for this student for the selected intake,
              year and university. To understand why certain programs are not eligible
              for this student, please go to Search Program.
            </p>

            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-md cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                    Select Year
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              <div className="col-span-3">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-md cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                    Select Intake
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              <div className="col-span-3">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-md cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <School size={18} className="text-blue-600 dark:text-blue-400" />
                    Select University
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              <div className="col-span-2">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-md cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <GraduationCap size={18} className="text-blue-600 dark:text-blue-400" />
                    Select Program
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              <div className="col-span-1">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-3 rounded-md">
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 mt-6 p-6 min-h-[420px] flex flex-col">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">
              Selected Programs{' '}
              <span className="text-gray-500 dark:text-gray-400 font-normal text-sm">
                (Max 10 programs)
              </span>
            </h2>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="w-56 h-40 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-blue-400 dark:text-blue-300 text-sm">
                  Illustration Placeholder
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Let's get started, add programs to proceed with applications.
              </p>
            </div>
          </div>

          <button className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg">
            <FileUp size={18} />
            Upload documents
          </button>
        </div>
      )}

      <div className="fixed right-0 top-1/2 -translate-y-1/2">
        <div className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 rounded-l-md rotate-90 origin-bottom-right font-medium">
          What's new
        </div>
      </div>
    </div>
  );
}