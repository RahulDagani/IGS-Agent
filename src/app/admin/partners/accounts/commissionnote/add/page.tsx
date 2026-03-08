"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Building, 
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  School,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  Percent,
  Globe,
  Info,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Agent {
  agent_id: number;
  business_name: string;
  eligible_items: number;
  total_commission: string;
}

interface University {
  university_id: number;
  university: string;
  eligible_items: number;
}

// New interface for admin input field metadata
interface AdminInputField {
  label: string;
  name: string;  // Note: there's a typo in API: "nane" vs "name"
  value: number | null;
  currency?: string;
  required: boolean;
}

// Admin inputs is now an object with dynamic keys
interface AdminInputs {
  [key: string]: AdminInputField;
}

interface Application {
  s_no: number;
  invoice_item_id: number;
  application_id: number;
  student_name: string;
  intake_year: number;
  course_name: string;
  course_level: string;
  commissionable_tuition_fee: {
    value: number | null;
    currency: string;
  };
  commission_amount: {
    value: number;
    currency: string;
  };
  partner_share_percentage: number;
  pay_status: string;
  invoice_currency: string;
  default_currency: string;
  admin_inputs: AdminInputs;
}

interface ApplicationsResponse {
  status: string;
  data: {
    items: Application[];
    summary: {
      total_items: number;
      default_currency: string;
      forex_cases: number;
      same_currency_cases: number;
    };
    instructions: {
      note: string;
      forex_case: string;
      inr_case: string;
    };
  };
}

type Step = 'agents' | 'universities' | 'applications';

const AddCommissionNote = () => {
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Data states
  const [agents, setAgents] = useState<Agent[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Selected items
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<number[]>([]);

  // Admin input values for selected applications - store by field name
  const [adminInputValues, setAdminInputValues] = useState<Record<number, Record<string, number | null>>>({});

  // Current step
  const [currentStep, setCurrentStep] = useState<Step>('agents');
  const [summaryInstructions, setSummaryInstructions] = useState<{
    note: string;
    forex_case: string;
    inr_case: string;
  } | null>(null);

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${BASE_URL}/tenant/commission-note/agents`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success") {
        setAgents(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch agents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async (agentId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${BASE_URL}/tenant/commission-note/universities/${agentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch universities: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success") {
        setUniversities(data.data || []);
        setCurrentStep('universities');
      } else {
        throw new Error(data.message || "Failed to fetch universities");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (agentId: number, universityId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${BASE_URL}/tenant/commission-note/applications/${agentId}/${universityId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.status}`);
      }
      
      const data: ApplicationsResponse = await response.json();
      
      if (data.status === "success") {
        setApplications(data.data.items || []);
        setSummaryInstructions(data.data.instructions);
        setCurrentStep('applications');
        // Initialize admin input values
        initializeAdminInputs(data.data.items);
      } else {
        throw new Error("Failed to fetch applications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Initialize admin input values for all applications
  const initializeAdminInputs = (apps: Application[]) => {
    const initialValues: Record<number, Record<string, number | null>> = {};
    apps.forEach(app => {
      if (app.admin_inputs) {
        initialValues[app.invoice_item_id] = {};
        Object.entries(app.admin_inputs).forEach(([key, field]) => {
          // Use the correct field name from the API (handle typo if needed)
          const fieldName = field.name || key;
          initialValues[app.invoice_item_id][fieldName] = field.value;
        });
      }
    });
    setAdminInputValues(initialValues);
  };

  // Handle admin input change
  const handleAdminInputChange = (
    invoiceItemId: number,
    fieldName: string,
    value: string
  ) => {
    setAdminInputValues(prev => ({
      ...prev,
      [invoiceItemId]: {
        ...(prev[invoiceItemId] || {}),
        [fieldName]: value === '' ? null : parseFloat(value)
      }
    }));
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setSelectedUniversity(null);
    setApplications([]);
    setSelectedApplicationIds([]);
    setAdminInputValues({});
    fetchUniversities(agent.agent_id);
  };

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setSelectedApplicationIds([]);
    setAdminInputValues({});
    if (selectedAgent) {
      fetchApplications(selectedAgent.agent_id, university.university_id);
    }
  };

  const handleApplicationSelect = (invoiceItemId: number) => {
    setSelectedApplicationIds(prev => {
      if (prev.includes(invoiceItemId)) {
        return prev.filter(id => id !== invoiceItemId);
      } else {
        return [...prev, invoiceItemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedApplicationIds.length === applications.length) {
      setSelectedApplicationIds([]);
    } else {
      setSelectedApplicationIds(applications.map(app => app.invoice_item_id));
    }
  };

  const handleBack = () => {
    if (currentStep === 'universities') {
      setCurrentStep('agents');
      setSelectedAgent(null);
      setUniversities([]);
    } else if (currentStep === 'applications') {
      setCurrentStep('universities');
      setSelectedUniversity(null);
      setApplications([]);
      setSelectedApplicationIds([]);
      setAdminInputValues({});
    }
  };

  // Validate admin inputs for selected applications
  const validateAdminInputs = (): boolean => {
    const selectedApps = applications.filter(app => 
      selectedApplicationIds.includes(app.invoice_item_id)
    );

    for (const app of selectedApps) {
      if (app.admin_inputs) {
        const appInputs = adminInputValues[app.invoice_item_id] || {};
        
        for (const [key, field] of Object.entries(app.admin_inputs)) {
          const fieldName = field.name || key;
          if (field.required && (!appInputs[fieldName] || appInputs[fieldName] === null)) {
            setError(`${field.label} is required for ${app.student_name}`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedAgent || !selectedUniversity || selectedApplicationIds.length === 0) {
      setError("Please select agent, university, and at least one application");
      return;
    }

    // Validate required admin inputs
    if (!validateAdminInputs()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Build items_data array for all selected applications
      const itemsData = applications
        .filter(app => selectedApplicationIds.includes(app.invoice_item_id))
        .map(app => {
          const adminInputs = adminInputValues[app.invoice_item_id] || {};
          
          // Build item object with invoice_item_id
          const item: any = {
            invoice_item_id: app.invoice_item_id
          };
          
          // Add admin input fields using their correct field names
          if (app.admin_inputs) {
            Object.entries(app.admin_inputs).forEach(([key, field]) => {
              const fieldName = field.name || key;
              const value = adminInputs[fieldName];
              if (value !== undefined && value !== null) {
                item[fieldName] = value;
              }
            });
          }
          
          return item;
        });

      // Create single payload object with agent_id, university_id, and items_data array
      const payload = {
        agent_id: selectedAgent.agent_id,
        university_id: selectedUniversity.university_id,
        items_data: itemsData
      };

      const response = await fetch(
        `${BASE_URL}/tenant/commission-note`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );
      
      const data = await response.json();
      
      if (data.status === "success") {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/partners/accounts/commissionnote');
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to create commission note");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if an application requires admin inputs
  const requiresAdminInputs = (application: Application): boolean => {
    return application.admin_inputs !== undefined && 
           Object.keys(application.admin_inputs).length > 0;
  };

  // Check if admin inputs are filled for an application
  const areAdminInputsFilled = (application: Application): boolean => {
    if (!application.admin_inputs) return true;
    
    const appInputs = adminInputValues[application.invoice_item_id] || {};
    
    for (const [key, field] of Object.entries(application.admin_inputs)) {
      const fieldName = field.name || key;
      if (field.required && (!appInputs[fieldName] || appInputs[fieldName] === null)) {
        return false;
      }
    }
    return true;
  };

  // Calculate totals from selected applications
  const selectedApplications = applications.filter(app => 
    selectedApplicationIds.includes(app.invoice_item_id)
  );

  const totals = {
    totalCommission: selectedApplications.reduce((sum, app) => sum + (app.commission_amount?.value || 0), 0),
    totalItems: selectedApplications.length
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Commission Note
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Select agent, university, and applications to create a commission note
        </p>
      </div>

      {/* Breadcrumb/Step indicator */}
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={handleBack}
          disabled={currentStep === 'agents'}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
            currentStep === 'agents'
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-2">
          <StepIndicator step={1} currentStep={currentStep} stepName="agents" label="Select Agent" />
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <StepIndicator step={2} currentStep={currentStep} stepName="universities" label="Select University" />
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <StepIndicator step={3} currentStep={currentStep} stepName="applications" label="Select Applications" />
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-green-800 dark:text-green-300 font-medium">
              Commission note created successfully! Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Agents Table */}
      {!loading && currentStep === 'agents' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Select Agent</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Eligible Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Commission
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {agents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <tr
                      key={agent.agent_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleAgentSelect(agent)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.business_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {agent.agent_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                          {agent.eligible_items} items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          ${parseFloat(agent.total_commission).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgentSelect(agent);
                          }}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                        >
                          Select
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Universities Table */}
      {!loading && currentStep === 'universities' && selectedAgent && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <School className="h-5 w-5 text-purple-600" />
              <span>Universities for {selectedAgent.business_name}</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select a university to view eligible applications
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Eligible Items
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {universities.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No universities found for this agent
                    </td>
                  </tr>
                ) : (
                  universities.map((university) => (
                    <tr
                      key={university.university_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleUniversitySelect(university)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {university.university}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {university.university_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                          {university.eligible_items} items
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUniversitySelect(university);
                          }}
                          className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                        >
                          Select
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applications Table */}
      {!loading && currentStep === 'applications' && selectedAgent && selectedUniversity && (
        <div className="space-y-6">
          {/* Instructions Banner */}
          {summaryInstructions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-800 dark:text-blue-300 font-medium">
                    {summaryInstructions.note}
                  </p>
                  <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                    {summaryInstructions.forex_case}
                  </p>
                  <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                    {summaryInstructions.inr_case}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Applications for {selectedUniversity.university}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Select the applications to include in this commission note
                  </p>
                </div>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {selectedApplicationIds.length === applications.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Student & Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Commission Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Partner Share
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pay Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Admin Inputs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr
                        key={application.invoice_item_id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedApplicationIds.includes(application.invoice_item_id)
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedApplicationIds.includes(application.invoice_item_id)}
                            onChange={() => handleApplicationSelect(application.invoice_item_id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {application.student_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            App ID: {application.application_id}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Course: {application.course_name} - {application.course_level} - {application.intake_year}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                            #{application.s_no}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Commission: </span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {application.commission_amount.currency} {application.commission_amount.value?.toFixed(2)}
                              </span>
                            </div>
                            {application.commissionable_tuition_fee.value ? (
                              <div className="text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Tuition Fee: </span>
                                <span className="font-medium">
                                  {application.commissionable_tuition_fee.currency} {application.commissionable_tuition_fee.value}
                                </span>
                              </div>
                            ): ""}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {application.partner_share_percentage}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                            {application.pay_status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {application.admin_inputs && Object.keys(application.admin_inputs).length > 0 && (
                            <div className="space-y-3 min-w-[200px]">
                              {Object.entries(application.admin_inputs).map(([key, field]) => {
                                const fieldName = field.name || key;
                                return (
                                  <div key={key} className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {field.label}
                                      {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <div className="relative">
                                      {field.currency && (
                                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                          {field.currency}
                                        </span>
                                      )}
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={adminInputValues[application.invoice_item_id]?.[fieldName] ?? ''}
                                        onChange={(e) => handleAdminInputChange(
                                          application.invoice_item_id,
                                          fieldName,
                                          e.target.value
                                        )}
                                        placeholder={'Enter value'}
                                        className={`w-full px-2 py-1 text-sm  text-black dark:text-white border rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                                          field.currency ? 'pl-9' : 'pl-2'
                                        } ${
                                          field.required && 
                                          !adminInputValues[application.invoice_item_id]?.[fieldName]
                                            ? 'border-red-300 dark:border-red-700'
                                            : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        disabled={!selectedApplicationIds.includes(application.invoice_item_id)}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {requiresAdminInputs(application) && (
                            <div className="flex items-center space-x-1">
                              {areAdminInputsFilled(application) ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className={`text-xs ${
                                areAdminInputsFilled(application)
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-yellow-600 dark:text-yellow-400'
                              }`}>
                                {areAdminInputsFilled(application) ? 'Ready' : 'Inputs Required'}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary and Submit */}
          {selectedApplicationIds.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Selected Applications Summary ({selectedApplicationIds.length} items)
              </h3>
              
              {selectedApplications.some(app => 
                requiresAdminInputs(app) && !areAdminInputsFilled(app)
              ) && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Some selected applications require admin inputs. Please fill all required fields.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Total Commission</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedApplications[0]?.commission_amount.currency} {totals.totalCommission.toFixed(2)}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Percent className="h-4 w-4" />
                    <span className="text-sm">Default Currency</span>
                  </div>
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedApplications[0]?.default_currency}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Items Selected</span>
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {selectedApplicationIds.length}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedApplications.some(app => 
                    requiresAdminInputs(app) && !areAdminInputsFilled(app)
                  )}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Create Commission Note</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ 
  step, 
  currentStep, 
  stepName, 
  label 
}: { 
  step: number; 
  currentStep: Step; 
  stepName: Step; 
  label: string;
}) => {
  const isActive = currentStep === stepName;
  const isCompleted = 
    (stepName === 'agents' && currentStep !== 'agents') ||
    (stepName === 'universities' && (currentStep === 'applications'));

  return (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : isCompleted
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}>
        {isCompleted ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <span className="text-sm font-medium">{step}</span>
        )}
      </div>
      <span className={`ml-2 text-sm font-medium ${
        isActive 
          ? 'text-blue-600 dark:text-blue-400' 
          : isCompleted
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400'
      }`}>
        {label}
      </span>
    </div>
  );
};

export default AddCommissionNote;