"use client";
import { useState, useEffect } from "react";
import { 
  Search, Filter, Calendar, Check, X, Eye, Plus, 
  ChevronRight, Users, Building, FileText, Download,
  Trash2, MoreVertical, ExternalLink, RefreshCw
} from "lucide-react";

// Mock data - replace with actual API calls later
const mockAgents = [
  { id: 1, name: "John Smith", email: "john@example.com", share: 70 },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", share: 65 },
  { id: 3, name: "Mike Wilson", email: "mike@example.com", share: 75 },
];

const mockUniversities = [
  { id: 1, name: "University of Oxford" },
  { id: 2, name: "Harvard University" },
  { id: 3, name: "Stanford University" },
  { id: 4, name: "MIT" },
  { id: 5, name: "University of Cambridge" },
];

const mockApplications = [
  { 
    id: 1, 
    ackNo: "APP-2024-001", 
    studentName: "Alice Johnson",
    university: "University of Oxford",
    course: "Computer Science",
    intake: "Fall 2024",
    status: "Offer Received",
    commissionableFee: 25000,
    currency: "GBP",
    totalInstallments: 3,
    paidInstallments: 2,
    selected: false
  },
  { 
    id: 2, 
    ackNo: "APP-2024-002", 
    studentName: "Bob Williams",
    university: "Harvard University",
    course: "Business Administration",
    intake: "Spring 2024",
    status: "Enrolled",
    commissionableFee: 45000,
    currency: "USD",
    totalInstallments: 3,
    paidInstallments: 1,
    selected: false
  },
  { 
    id: 3, 
    ackNo: "APP-2024-003", 
    studentName: "Carol Davis",
    university: "Stanford University",
    course: "Data Science",
    intake: "Winter 2024",
    status: "Visa Approved",
    commissionableFee: 38000,
    currency: "USD",
    totalInstallments: 2,
    paidInstallments: 2,
    selected: false
  },
  { 
    id: 4, 
    ackNo: "APP-2024-004", 
    studentName: "David Miller",
    university: "MIT",
    course: "Engineering",
    intake: "Fall 2024",
    status: "Application Submitted",
    commissionableFee: 42000,
    currency: "USD",
    totalInstallments: 3,
    paidInstallments: 0,
    selected: false
  },
  { 
    id: 5, 
    ackNo: "APP-2024-005", 
    studentName: "Emma Wilson",
    university: "University of Cambridge",
    course: "Medicine",
    intake: "Fall 2024",
    status: "Offer Received",
    commissionableFee: 52000,
    currency: "GBP",
    totalInstallments: 4,
    paidInstallments: 1,
    selected: false
  },
];

const mockCommissionNotes = [
  { id: 1, installment: "1/3", amount: 5000, currency: "GBP", date: "2024-01-15", status: "Paid" },
  { id: 2, installment: "2/3", amount: 5000, currency: "GBP", date: "2024-02-15", status: "Paid" },
];

const CommissionNoteUI = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'agent' | 'university' | 'applications'>('agent');
  
  // Selection states
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [selectedApplications, setSelectedApplications] = useState<any[]>([]);
  
  // Data states
  const [applications, setApplications] = useState(mockApplications);
  const [filteredApplications, setFilteredApplications] = useState(mockApplications);
  
  // Filter states
  const [ackNoFilter, setAckNoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Commission note creation state
  const [showCommissionSection, setShowCommissionSection] = useState(false);
  const [commissionNotes, setCommissionNotes] = useState(mockCommissionNotes);

  // Initialize with first agent selected
  useEffect(() => {
    if (mockAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(mockAgents[0]);
    }
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = [...applications];
    
    if (ackNoFilter) {
      filtered = filtered.filter(app => 
        app.ackNo.toLowerCase().includes(ackNoFilter.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(app => 
        app.status.toLowerCase().includes(statusFilter.toLowerCase())
      );
    }
    
    if (dateRange.start && dateRange.end) {
      // Date filtering logic would go here
    }
    
    setFilteredApplications(filtered);
  }, [ackNoFilter, statusFilter, dateRange, applications]);

  const handleAgentSelect = (agent: any) => {
    setSelectedAgent(agent);
    setSelectedUniversity(null);
    setSelectedApplications([]);
    setActiveTab('university');
  };

  const handleUniversitySelect = (university: any) => {
    setSelectedUniversity(university);
    setActiveTab('applications');
  };

  const handleApplicationSelect = (application: any) => {
    const updatedApplications = applications.map(app => 
      app.id === application.id ? { ...app, selected: !app.selected } : app
    );
    
    setApplications(updatedApplications);
    
    const selected = updatedApplications.filter(app => app.selected);
    setSelectedApplications(selected);
  };

  const handleSelectAll = () => {
    const allSelected = applications.every(app => app.selected);
    const updatedApplications = applications.map(app => ({
      ...app,
      selected: !allSelected
    }));
    
    setApplications(updatedApplications);
    setSelectedApplications(!allSelected ? updatedApplications : []);
  };

  const handleCreateCommissionNote = () => {
    setShowCommissionSection(true);
  };

  const handleAddCommissionNote = (appId: number) => {
    // Logic to add new commission note
    console.log('Adding commission note for application:', appId);
  };

  const handleViewPreviousNotes = (appId: number) => {
    // Logic to view previous commission notes
    console.log('Viewing previous notes for application:', appId);
  };

  const renderAgentTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Agent</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAgents.map(agent => (
            <div
              key={agent.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedAgent?.id === agent.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAgentSelect(agent)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{agent.name}</h4>
                  <p className="text-sm text-gray-600">{agent.email}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">Share: {agent.share}%</span>
                    {selectedAgent?.id === agent.id && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAgent && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Selected Agent</p>
                <p className="text-sm text-gray-600">{selectedAgent.name} ({selectedAgent.email})</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('university')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>Next: Select University</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderUniversityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Select University</h3>
          <div className="text-sm text-gray-600">
            Agent: <span className="font-medium">{selectedAgent?.name}</span>
          </div>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search universities..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockUniversities.map(university => (
            <div
              key={university.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedUniversity?.id === university.id 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleUniversitySelect(university)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{university.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">Applications: {mockApplications.filter(a => a.university === university.name).length}</span>
                    {selectedUniversity?.id === university.id && (
                      <Check className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedUniversity && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Selected University</p>
                <p className="text-sm text-gray-600">{selectedUniversity.name}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('applications')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <span>Next: Select Applications</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderApplicationsTab = () => (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
          <div className="text-sm text-gray-600">
            Agent: {selectedAgent?.name} • University: {selectedUniversity?.name}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acknowledgement Number
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ACK No..."
                value={ackNoFilter}
                onChange={(e) => setAckNoFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Offer Received">Offer Received</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Visa Approved">Visa Approved</option>
              <option value="Application Submitted">Application Submitted</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {/* Selected Applications Banner */}
        {selectedApplications.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {selectedApplications.length} application(s) selected
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedApplications.map(app => app.studentName).join(', ')}
                </p>
              </div>
              <button
                onClick={handleCreateCommissionNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Commission Note</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Applications Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={applications.length > 0 && applications.every(app => app.selected)}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Select</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACK No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University & Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commissionable Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={app.selected || false}
                      onChange={() => handleApplicationSelect(app)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{app.ackNo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.studentName}</div>
                      <div className="text-sm text-gray-500">{app.course}</div>
                      <div className="text-xs text-gray-400">{app.intake}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{app.university}</div>
                    <div className="text-sm text-gray-500">{app.course}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      app.status === 'Enrolled' ? 'bg-green-100 text-green-800' :
                      app.status === 'Offer Received' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'Visa Approved' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {app.currency} {app.commissionableFee.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-900">
                        {app.paidInstallments}/{app.totalInstallments}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(app.paidInstallments / app.totalInstallments) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewPreviousNotes(app.id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">View ({app.paidInstallments})</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCommissionNoteSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Application Commission Details</h3>
          <div className="text-sm text-gray-600">
            Creating commission notes for {selectedApplications.length} selected applications
          </div>
        </div>
        
        {selectedApplications.map((app) => (
          <div key={app.id} className="mb-8 last:mb-0 border border-gray-200 rounded-lg overflow-hidden">
            {/* Application Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{app.studentName}</h4>
                  <div className="text-sm text-gray-600">
                    {app.ackNo} • {app.university} • {app.course}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Installments</div>
                  <div className="font-medium text-gray-900">
                    {app.paidInstallments}/{app.totalInstallments} paid
                  </div>
                </div>
              </div>
            </div>
            
            {/* Previous Commission Notes */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="font-medium text-gray-900 mb-3">Previous Commission Notes</h5>
              {commissionNotes.length > 0 ? (
                <div className="space-y-2">
                  {commissionNotes.map(note => (
                    <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{note.installment} Installment</div>
                        <div className="text-sm text-gray-600">
                          {note.currency} {note.amount.toLocaleString()} • {note.date}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        note.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {note.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No previous commission notes</p>
              )}
            </div>
            
            {/* New Commission Note Form */}
            <div className="p-6">
              <h5 className="font-medium text-gray-900 mb-4">Create New Commission Note</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Commissionable Tuition Fee
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Commission Amt
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Bank Charges
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Less GST Amt
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Partner Share (%)
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Conversion Currency
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        TDS Amount
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-sm text-gray-500">{app.currency}</span>
                          <input
                            type="number"
                            defaultValue={app.commissionableFee}
                            className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-sm text-gray-500">{app.currency}</span>
                          <input
                            type="number"
                            className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-sm text-gray-500">{app.currency}</span>
                          <input
                            type="number"
                            className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-sm text-gray-500">{app.currency}</span>
                          <input
                            type="number"
                            className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <input
                            type="number"
                            defaultValue={selectedAgent?.share || 0}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="%"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="GBP">GBP → INR</option>
                          <option value="USD">USD → INR</option>
                          <option value="EUR">EUR → INR</option>
                          <option value="AUD">AUD → INR</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-sm text-gray-500">₹</span>
                          <input
                            type="number"
                            className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleAddCommissionNote(app.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Add Note
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
        
        {/* Submit Section */}
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Commission Notes to Create</div>
              <div className="text-xl font-bold text-gray-900">{selectedApplications.length}</div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCommissionSection(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Create Commission Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Commission Note</h1>
        <p className="text-gray-600 mt-2">Follow the steps to create commission notes for applications</p>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('agent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'agent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  activeTab === 'agent' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  1
                </div>
                <span>Select Agent</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('university')}
              disabled={!selectedAgent}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'university'
                  ? 'border-purple-500 text-purple-600'
                  : !selectedAgent
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  activeTab === 'university' ? 'bg-purple-100 text-purple-600' : 
                  !selectedAgent ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  2
                </div>
                <span>Select University</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('applications')}
              disabled={!selectedAgent || !selectedUniversity}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-green-500 text-green-600'
                  : !selectedAgent || !selectedUniversity
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  activeTab === 'applications' ? 'bg-green-100 text-green-600' : 
                  !selectedAgent || !selectedUniversity ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  3
                </div>
                <span>Select Applications</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      {showCommissionSection ? (
        renderCommissionNoteSection()
      ) : (
        <>
          {activeTab === 'agent' && renderAgentTab()}
          {activeTab === 'university' && renderUniversityTab()}
          {activeTab === 'applications' && renderApplicationsTab()}
        </>
      )}
    </div>
  );
};

export default CommissionNoteUI;