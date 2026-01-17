"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  PlusCircle, 
  User, 
  Building, 
  FileText, 
  DollarSign,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Users,
  School,
  BookOpen,
  Percent
} from "lucide-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

interface Agent {
  agent_id: number;
  name: string | null;
  email: string;
  agent_share: number; // Added this field
}

interface University {
  university_id: number;
  university_name: string;
}

interface Application {
  application_id: number;
  acknowledgement_no: string;
  agent_id: number;
  student_name: string;
  intake_year: number;
  intake_name: string;
  study_level: string;
  tuition_fee: string;
  currency_code: string;
  university_id: number;
  university_name: string;
  application_status: string;
  selected?: boolean;
}

interface ApplicationFormData {
  application_id: number;
  commissionable_tuition_fee: number;
  commission_amt: number;
  bank_charges: number;
  comm_after_charges: number;
  less_gst_amt: number;
  net_commission_amt: number;
  partner_share: number;
  conversion_currency: string;
  exchange_rate: number;
  shared_amt_inr: number;
  gross_comm_payable: number;
  tds_amt: number;
  net_pay: number;
}

interface Currency {
  id: number;
  from_currency: string;
  to_currency: string;
  conversion_rate: string;
}

interface FormData {
  agent_id: number | null;
  university_id: number | null;
  po_number: string;
  po_date: string;
  payment_type: string;
  commission_type: string;
  currency: string;
  exchange_rate: number;
  applications: ApplicationFormData[];
}

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
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [availableApplications, setAvailableApplications] = useState<Application[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([]);

  // Dropdown states
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [showApplicationDropdown, setShowApplicationDropdown] = useState(false);

  // Search states
  const [agentSearch, setAgentSearch] = useState("");
  const [universitySearch, setUniversitySearch] = useState("");
  const [applicationSearch, setApplicationSearch] = useState("");

  // Form data
  const [formData, setFormData] = useState<FormData>({
    agent_id: null,
    university_id: null,
    po_number: "",
    po_date: new Date().toISOString().split('T')[0],
    payment_type: "INSTALLMENT",
    commission_type: "FIXED",
    currency: "USD",
    exchange_rate: 83.07,
    applications: []
  });

  // Selected items
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);

  // Filtered lists
  const filteredAgents = agents.filter(agent => 
    (agent.name?.toLowerCase() || "").includes(agentSearch.toLowerCase()) ||
    agent.email.toLowerCase().includes(agentSearch.toLowerCase()) ||
    agent.agent_id.toString().includes(agentSearch)
  );

  const filteredUniversities = universities.filter(university =>
    university.university_name.toLowerCase().includes(universitySearch.toLowerCase()) ||
    university.university_id.toString().includes(universitySearch)
  );

  const filteredApplications = availableApplications.filter(app =>
    app.student_name.toLowerCase().includes(applicationSearch.toLowerCase()) ||
    app.application_id.toString().includes(applicationSearch) ||
    app.acknowledgement_no.toLowerCase().includes(applicationSearch.toLowerCase())
  );

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
    fetchCurrencies();
  }, []);

  // Fetch universities when agent is selected
  useEffect(() => {
    if (formData.agent_id && selectedAgent) {
      fetchUniversities(formData.agent_id);
    }
  }, [formData.agent_id]);

  // Fetch applications when university is selected
  useEffect(() => {
    if (formData.agent_id && formData.university_id && selectedUniversity) {
      fetchApplications(formData.agent_id, formData.university_id);
    }
  }, [formData.university_id]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote/agents`,
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
      
      if (data.success) {
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

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/tenant/currency/list`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch currencies: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCurrencies(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch currencies");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async (currencyId: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tenant/currency/get/${currencyId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return parseFloat(data.data.conversion_rate);
      } else {
        throw new Error(data.message || "Failed to fetch exchange rate");
      }
    } catch (err) {
      console.error("Error fetching exchange rate:", err);
      return 1;
    }
  };

  const fetchUniversities = async (agentId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote/universities?agent_id=${agentId}`,
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
      
      if (data.success) {
        setUniversities(data.data || []);
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
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote/applications?agent_id=${agentId}&university_id=${universityId}`,
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
      
      const data = await response.json();
      
      if (data.success) {
        const apps = data.data || [];
        setAvailableApplications(apps);
        setSelectedApplications([]);
        setFormData(prev => ({ ...prev, applications: [] }));
      } else {
        throw new Error(data.message || "Failed to fetch applications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelect = async (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData(prev => ({ ...prev, agent_id: agent.agent_id, university_id: null }));
    setSelectedUniversity(null);
    setUniversities([]);
    setAvailableApplications([]);
    setSelectedApplications([]);
    setFormData(prev => ({ ...prev, applications: [] }));
    setShowAgentDropdown(false);
    setAgentSearch("");
  };

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setFormData(prev => ({ ...prev, university_id: university.university_id }));
    setShowUniversityDropdown(false);
    setUniversitySearch("");
  };

  const handleApplicationSelect = async (application: Application) => {
    // Check if already selected
    const isSelected = selectedApplications.some(a => a.application_id === application.application_id);
    
    if (isSelected) {
      // Remove from selected
      setSelectedApplications(prev => prev.filter(a => a.application_id !== application.application_id));
      setFormData(prev => ({
        ...prev,
        applications: prev.applications.filter(a => a.application_id !== application.application_id)
      }));
    } else {
      // Add to selected with default values
      setSelectedApplications(prev => [...prev, application]);
      
      // Get default currency and exchange rate
      const defaultCurrency = currencies.find(c => c.from_currency === application.currency_code);
      let exchangeRate = 1;
      
      if (defaultCurrency) {
        exchangeRate = await fetchExchangeRate(defaultCurrency.id);
      }
      
      const initialData: ApplicationFormData = {
        application_id: application.application_id,
        commissionable_tuition_fee: parseFloat(application.tuition_fee) || 0,
        commission_amt: 0,
        bank_charges: 0,
        comm_after_charges: 0,
        less_gst_amt: 0,
        net_commission_amt: 0,
        partner_share: selectedAgent?.agent_share || 0,
        conversion_currency: application.currency_code,
        exchange_rate: exchangeRate,
        shared_amt_inr: 0,
        gross_comm_payable: 0,
        tds_amt: 0,
        net_pay: 0
      };
      
      setFormData(prev => ({
        ...prev,
        applications: [...prev.applications, initialData]
      }));
    }
  };

  const handleApplicationUpdate = (applicationId: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedApps = prev.applications.map(app => {
        if (app.application_id === applicationId) {
          const updatedApp = { ...app, [field]: value };
          
          // Recalculate derived fields
          updatedApp.comm_after_charges = updatedApp.commission_amt - updatedApp.bank_charges;
          updatedApp.net_commission_amt = updatedApp.commission_amt - (updatedApp.bank_charges + updatedApp.less_gst_amt);
          updatedApp.shared_amt_inr = updatedApp.net_commission_amt * updatedApp.exchange_rate;
          updatedApp.gross_comm_payable = Math.round(updatedApp.shared_amt_inr * (updatedApp.partner_share / 100));
          updatedApp.net_pay = updatedApp.gross_comm_payable - updatedApp.tds_amt;
          
          return updatedApp;
        }
        return app;
      });
      
      return { ...prev, applications: updatedApps };
    });
  };

const handleCurrencyChange = async (applicationId: number, currencyId: number) => {
  try {
    const exchangeRate = await fetchExchangeRate(currencyId);
    const selectedCurrency = currencies.find(c => c.id === currencyId);
    
    if (!selectedCurrency) return;
    
    setFormData(prev => {
      const updatedApps = prev.applications.map(app => {
        if (app.application_id === applicationId) {
          const updatedApp = { 
            ...app, 
            // Store the to_currency as conversion_currency
            conversion_currency: selectedCurrency.to_currency,
            exchange_rate: exchangeRate 
          };
          
          // Recalculate with new exchange rate
          updatedApp.shared_amt_inr = updatedApp.net_commission_amt * exchangeRate;
          updatedApp.gross_comm_payable = Math.round(updatedApp.shared_amt_inr * (updatedApp.partner_share / 100));
          updatedApp.net_pay = updatedApp.gross_comm_payable - updatedApp.tds_amt;
          
          return updatedApp;
        }
        return app;
      });
      
      return { ...prev, applications: updatedApps };
    });
  } catch (err) {
    console.error("Error changing currency:", err);
    setError("Failed to update exchange rate");
  }
};


  const handleRemoveApplication = (applicationId: number) => {
    setSelectedApplications(prev => prev.filter(a => a.application_id !== applicationId));
    setFormData(prev => ({
      ...prev,
      applications: prev.applications.filter(a => a.application_id !== applicationId)
    }));
  };

  const handleClearAgent = () => {
    setSelectedAgent(null);
    setFormData(prev => ({ ...prev, agent_id: null, university_id: null }));
    setSelectedUniversity(null);
    setUniversities([]);
    setAvailableApplications([]);
    setSelectedApplications([]);
    setFormData(prev => ({ ...prev, applications: [] }));
  };

  const handleClearUniversity = () => {
    setSelectedUniversity(null);
    setFormData(prev => ({ ...prev, university_id: null }));
    setAvailableApplications([]);
    setSelectedApplications([]);
    setFormData(prev => ({ ...prev, applications: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.agent_id || !formData.university_id) {
      setError("Please select agent and university");
      return;
    }
    
    if (formData.applications.length === 0) {
      setError("Please select at least one application");
      return;
    }

    // Validate application data
    const invalidApps = formData.applications.filter(app => 
      !app.commission_amt || app.commission_amt <= 0
    );
    
    if (invalidApps.length > 0) {
      setError("Please fill all required fields for selected applications");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        agent_id: formData.agent_id,
        university_id: formData.university_id,
        po_number: formData.po_number,
        po_date: formData.po_date,
        payment_type: formData.payment_type,
        commission_type: formData.commission_type,
        currency: formData.currency,
        exchange_rate: formData.exchange_rate,
        applications: formData.applications
      };
     
      const response = await fetch(
        `${BASE_URL}/tenant/agent/commissionnote`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to create commission note: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            agent_id: null,
            university_id: null,
            po_number: "",
            po_date: new Date().toISOString().split('T')[0],
            payment_type: "INSTALLMENT",
            commission_type: "FIXED",
            currency: "USD",
            exchange_rate: 83.07,
            applications: []
          });
          setSelectedAgent(null);
          setSelectedUniversity(null);
          setSelectedApplications([]);
          setSuccess(false);
        }, 3000);

        router.push(`/admin/partners/commission-payments`);
        
      } else {
        throw new Error(data.message || "Failed to create commission note");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals
  const totalCommission = formData.applications.reduce((sum, app) => sum + (app.commission_amt || 0), 0);
  const totalBankCharges = formData.applications.reduce((sum, app) => sum + (app.bank_charges || 0), 0);
  const totalLessGST = formData.applications.reduce((sum, app) => sum + (app.less_gst_amt || 0), 0);
  const totalNetCommission = formData.applications.reduce((sum, app) => sum + (app.net_commission_amt || 0), 0);
  const totalSharedAmtINR = formData.applications.reduce((sum, app) => sum + (app.shared_amt_inr || 0), 0);
  const totalGrossCommPayable = formData.applications.reduce((sum, app) => sum + (app.gross_comm_payable || 0), 0);
  const totalTDS = formData.applications.reduce((sum, app) => sum + (app.tds_amt || 0), 0);
  const totalNetPay = formData.applications.reduce((sum, app) => sum + (app.net_pay || 0), 0);

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
          <span>Add Commission Note</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create a new commission note for agent payments
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-green-800 dark:text-green-300 font-medium">
              Commission note created successfully!
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Commission Note Details
          </h2>
          
          <div className="space-y-6">
            {/* Agent Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Select Agent *</span>
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowAgentDropdown(!showAgentDropdown);
                    setShowUniversityDropdown(false);
                    setShowApplicationDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    {selectedAgent ? (
                      <>
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {selectedAgent.name || "Unnamed Agent"}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedAgent.email}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Share: {selectedAgent.agent_share}%
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Select an agent...</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedAgent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearAgent();
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                    {showAgentDropdown ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {showAgentDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                      <input
                        type="text"
                        value={agentSearch}
                        onChange={(e) => setAgentSearch(e.target.value)}
                        placeholder="Search agents..."
                        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="py-1">
                      {filteredAgents.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No agents found
                        </div>
                      ) : (
                        filteredAgents.map((agent) => (
                          <button
                            key={agent.agent_id}
                            type="button"
                            onClick={() => handleAgentSelect(agent)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-3"
                          >
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {agent.name || "Unnamed Agent"}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {agent.email}
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Share: {agent.agent_share}%
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {agent.agent_id}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* University Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <School className="h-5 w-5 text-purple-600" />
                <span>Select University *</span>
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedAgent) {
                      setError("Please select an agent first");
                      return;
                    }
                    setShowUniversityDropdown(!showUniversityDropdown);
                    setShowAgentDropdown(false);
                    setShowApplicationDropdown(false);
                  }}
                  disabled={!selectedAgent}
                  className="w-full px-4 py-3 text-left bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    {selectedUniversity ? (
                      <>
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {selectedUniversity.university_name}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        {selectedAgent ? "Select a university..." : "Select agent first"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedUniversity && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearUniversity();
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                    {showUniversityDropdown ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {showUniversityDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                      <input
                        type="text"
                        value={universitySearch}
                        onChange={(e) => setUniversitySearch(e.target.value)}
                        placeholder="Search universities..."
                        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="py-1">
                      {filteredUniversities.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No universities found
                        </div>
                      ) : (
                        filteredUniversities.map((university) => (
                          <button
                            key={university.university_id}
                            type="button"
                            onClick={() => handleUniversitySelect(university)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-3"
                          >
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {university.university_name}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {university.university_id}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Application Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span>Select Applications *</span>
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedUniversity) {
                      setError("Please select a university first");
                      return;
                    }
                    setShowApplicationDropdown(!showApplicationDropdown);
                    setShowAgentDropdown(false);
                    setShowUniversityDropdown(false);
                  }}
                  disabled={!selectedUniversity}
                  className="w-full px-4 py-3 text-left bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500 dark:text-gray-400">
                      {selectedUniversity ? 
                        `Select applications (${selectedApplications.length} selected)` : 
                        "Select university first"}
                    </span>
                  </div>
                  {showApplicationDropdown ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {showApplicationDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-auto">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                      <input
                        type="text"
                        value={applicationSearch}
                        onChange={(e) => setApplicationSearch(e.target.value)}
                        placeholder="Search applications..."
                        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="py-1">
                      {filteredApplications.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No applications found
                        </div>
                      ) : (
                        filteredApplications.map((application) => {
                          const isSelected = selectedApplications.some(
                            a => a.application_id === application.application_id
                          );
                          
                          return (
                            <button
                              key={application.application_id}
                              type="button"
                              onClick={() => handleApplicationSelect(application)}
                              className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-3 ${
                                isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? "border-blue-500 bg-blue-500" 
                                  : "border-gray-300 dark:border-gray-500"
                              }`}>
                                {isSelected && (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {application.student_name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {application.study_level} - {application.intake_name} {application.intake_year}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  App ID: {application.application_id} • Fee: {application.currency_code} {application.tuition_fee}
                                </div>
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                application.application_status === "Commission fully received"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}>
                                {application.application_status}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selected Applications Summary */}
              {selectedApplications.length > 0 && (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Selected Applications ({selectedApplications.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApplications([]);
                        setFormData(prev => ({ ...prev, applications: [] }));
                      }}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedApplications.map((app) => (
                      <div
                        key={app.application_id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {app.student_name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {app.application_id} • {app.study_level}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveApplication(app.application_id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Commission Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* PO Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Purchase Order Details</span>
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PO Number *
                  </label>
                  <input
                    type="text"
                    value={formData.po_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, po_number: e.target.value }))}
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="Enter PO number"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PO Date *
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.po_date ? new Date(formData.po_date) : null}
                      onChange={(date) => setFormData(prev => ({ 
                        ...prev, 
                        po_date: date ? date.toISOString().split("T")[0] : "" 
                      }))}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={50}
                      scrollableYearDropdown
                      className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white/90"
                    />
                  </div>
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <span>Payment Details</span>
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Type
                  </label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_type: e.target.value }))}
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  >
                    <option value="INSTALLMENT">Installment</option>
                    <option value="FULL">Full Payment</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Commission Type
                  </label>
                  <select
                    value={formData.commission_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, commission_type: e.target.value }))}
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  >
                    <option value="FIXED">Fixed</option>
                    <option value="PERCENTAGE">Percentage</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

    {/* Application Details Table */}
{/* Application Details Table */}
{selectedApplications.length > 0 && (
  <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
      Application Commission Details
    </h3>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Student
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Commissionable Tuition Fee
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Commission Amt
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Bank Charges
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Less GST Amt
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Partner Share (%)
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Conversion Currency
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              TDS Amount
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {selectedApplications.map((app) => {
            const appData = formData.applications.find(
              a => a.application_id === app.application_id
            );
            
            if (!appData) return null;
            
            return (
              <>
                {/* Main Row - Input Fields */}
                <tr key={`${app.application_id}-main`} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {app.student_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        App ID: {app.application_id}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-sm text-gray-500">
                        {app.currency_code}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={appData.commissionable_tuition_fee === 0 ? '' : appData.commissionable_tuition_fee}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleApplicationUpdate(app.application_id, "commissionable_tuition_fee", 0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              handleApplicationUpdate(app.application_id, "commissionable_tuition_fee", numValue);
                            }
                          }
                        }}
                        className="text-gray-700 dark:text-gray-300 w-[180px] px-3 py-1.5 pl-12 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-sm text-gray-500">
                        {app.currency_code}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={appData.commission_amt === 0 ? '' : appData.commission_amt}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleApplicationUpdate(app.application_id, "commission_amt", 0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              handleApplicationUpdate(app.application_id, "commission_amt", numValue);
                            }
                          }
                        }}
                        className="text-gray-700 dark:text-gray-300 w-[180px] px-3 py-1.5 pl-12 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-sm text-gray-500">
                        {app.currency_code}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={appData.bank_charges === 0 ? '' : appData.bank_charges}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleApplicationUpdate(app.application_id, "bank_charges", 0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              handleApplicationUpdate(app.application_id, "bank_charges", numValue);
                            }
                          }
                        }}
                        className="text-gray-700 dark:text-gray-300 w-[180px] px-3 py-1.5 pl-12 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-sm text-gray-500">
                        {app.currency_code}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={appData.less_gst_amt === 0 ? '' : appData.less_gst_amt}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleApplicationUpdate(app.application_id, "less_gst_amt", 0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              handleApplicationUpdate(app.application_id, "less_gst_amt", numValue);
                            }
                          }
                        }}
                        className="text-gray-700 dark:text-gray-300 w-[180px] px-3 py-1.5 pl-12 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <input
                          type="number"
                          step="0.01"
                          value={appData.partner_share === 0 ? '' : appData.partner_share}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              handleApplicationUpdate(app.application_id, "partner_share", 0);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                handleApplicationUpdate(app.application_id, "partner_share", numValue);
                              }
                            }
                          }}
                          className="text-gray-700 dark:text-gray-300 w-32 px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Percent className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
  <select
    value={(() => {
      // Try to find a currency where to_currency matches appData.conversion_currency
      // If multiple exist, prefer the one where from_currency matches the application's currency_code
      const matchingCurrencies = currencies.filter(c => c.to_currency === appData.conversion_currency);
      
      if (matchingCurrencies.length === 0) return "";
      
      // If there's only one match, use it
      if (matchingCurrencies.length === 1) return matchingCurrencies[0].id;
      
      // If multiple matches, try to find the one where from_currency matches app.currency_code
      const exactMatch = matchingCurrencies.find(c => c.from_currency === app.currency_code);
      if (exactMatch) return exactMatch.id;
      
      // Otherwise, use the first one
      return matchingCurrencies[0].id;
    })()}
    onChange={(e) => {
      const value = e.target.value;
      if (value) {
        handleCurrencyChange(app.application_id, parseInt(value));
      }
    }}
    className="text-gray-700 dark:text-gray-300 w-[180px] px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="">Select Currency</option>
    {currencies.map((currency) => (
      <option key={currency.id} value={currency.id}>
        {currency.from_currency} → {currency.to_currency}
      </option>
    ))}
  </select>
</td>
                  <td className="py-3 px-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-sm text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={appData.tds_amt === 0 ? '' : appData.tds_amt}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleApplicationUpdate(app.application_id, "tds_amt", 0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              handleApplicationUpdate(app.application_id, "tds_amt", numValue);
                            }
                          }
                        }}
                        className="text-gray-700 dark:text-gray-300 w-[180px] px-3 py-1.5 pl-8 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveApplication(app.application_id)}
                      className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                
                {/* Calculated Values Row */}
                <tr key={`${app.application_id}-calc`} className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Calculated Values
                    </div>
                  </td>
                  <td className="py-3 px-4" colSpan={2}>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Comm. After Charges:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {app.currency_code} {appData.comm_after_charges.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Net Commission Amt:</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {app.currency_code} {appData.net_commission_amt.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Exchange Rate:</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {appData.exchange_rate.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Shared Amt in INR:</span>
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          ₹{appData.shared_amt_inr.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Gross Comm. Payable:</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          ₹{appData.gross_comm_payable.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Pay Status:</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                          {formData.payment_type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Net Pay:</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          ₹{appData.net_pay.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"></td>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    </div>
    
    {/* Summary */}
    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
      <h4 className="font-medium text-gray-900 dark:text-white mb-4">Commission Summary</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Commission</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            ${totalCommission.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Bank Charges</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            ${totalBankCharges.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Less GST</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            ${totalLessGST.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Net Commission</div>
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            ${totalNetCommission.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Shared Amt (INR)</div>
          <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
            ₹{totalSharedAmtINR.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Gross Comm Payable</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            ₹{totalGrossCommPayable.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total TDS</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            ₹{totalTDS.toFixed(2)}
          </div>
        </div>
        <div className="lg:col-span-7 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Net Pay</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ₹{totalNetPay.toFixed(2)}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || selectedApplications.length === 0}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Commission Note...</span>
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
      </div>
    </div>
  </div>
)}
      </form>
    </div>
  );
};

export default AddCommissionNote;