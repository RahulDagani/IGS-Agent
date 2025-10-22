"use client";

import { useState } from "react";
import { Calendar, Zap, Building, Users, Globe, FileText, ShoppingCart } from "lucide-react";
import Image from "next/image";

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: {
    clients: string;
    domains: string;
    employees: string;
    suppliers: string;
    purchases: string;
    invoices: string;
  };
  recommended?: boolean;
}

export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string>("1");
  const [formData, setFormData] = useState({
    quantity: 1,
    paymentMethod: "",
    transactionId: "",
    document: null as File | null,
  });

  // Static plans data
  const plans: Plan[] = [
    {
      id: "1",
      name: "New Business",
      description: "Best for small businesses",
      monthlyPrice: 300,
      yearlyPrice: 3000, // $300 * 10 months (2 months free)
      features: {
        clients: "10",
        domains: "2",
        employees: "5",
        suppliers: "10",
        purchases: "999",
        invoices: "999",
      },
    },
    {
      id: "2",
      name: "Growing Business",
      description: "Best for medium businesses",
      monthlyPrice: 400,
      yearlyPrice: 4000, // $400 * 10 months (2 months free)
      features: {
        clients: "100",
        domains: "5",
        employees: "10",
        suppliers: "100",
        purchases: "9999",
        invoices: "9999",
      },
      recommended: true,
    },
    {
      id: "3",
      name: "Pro Marketer",
      description: "Best for large businesses",
      monthlyPrice: 500,
      yearlyPrice: 5000, // $500 * 10 months (2 months free)
      features: {
        clients: "Unlimited",
        domains: "Unlimited",
        employees: "Unlimited",
        suppliers: "Unlimited",
        purchases: "Unlimited",
        invoices: "Unlimited",
      },
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      document: file,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscription data:", {
      planId: selectedPlan,
      billingPeriod,
      ...formData,
    });
    alert("Subscription request submitted!");
  };

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
  const totalAmount = selectedPlanData 
    ? (billingPeriod === "monthly" 
        ? selectedPlanData.monthlyPrice * formData.quantity 
        : selectedPlanData.yearlyPrice * formData.quantity)
    : 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">

      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-6 mt-6 lg:mt-0 mb-6 bg-[#111827] rounded-xl shadow-lg border border-white/10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Trial Period Block */}
          <div className="card-body mb-8">
            <div className="trial-block bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-2">
                  You are on Trial Period for the New Business Plan
                </h4>
                <p className="text-gray-300">
                  You have <span className="text-yellow-400 font-semibold">3 days</span> left on your trial
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-horizontal">
            {/* Pricing Section */}
            <div className="pricing-wrap bg-gray-800/40 border border-gray-700 rounded-xl p-6 mb-8">
              <h6 className="text-lg font-semibold text-white mb-6 text-center">
                Subscribe to a plan below
              </h6>

              {/* Billing Period Tabs */}
              <div className="form-group col-md-12 col-xl-12 mb-8">
                <ul className="nav nav-tabs justify-center flex space-x-1 bg-gray-900/50 rounded-lg p-1">
                  <li className="nav-item">
                    <button
                      type="button"
                      onClick={() => setBillingPeriod("monthly")}
                      className={`nav-link px-6 py-2 rounded-md transition-all ${
                        billingPeriod === "monthly"
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Monthly
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      onClick={() => setBillingPeriod("yearly")}
                      className={`nav-link px-6 py-2 rounded-md transition-all ${
                        billingPeriod === "yearly"
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Yearly
                      {billingPeriod === "yearly" && (
                        <span className="ml-2 px-2 py-1 bg-green-500 text-xs rounded-full">
                          Save 17%
                        </span>
                      )}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {plans.map((plan) => (
                  <div key={plan.id}>
                    <input
                      id={plan.id}
                      type="radio"
                      name="plan_id"
                      value={plan.id}
                      checked={selectedPlan === plan.id}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="radio-plan hidden"
                    />
                    <label
                      htmlFor={plan.id}
                      className={`price-single block cursor-pointer border-2 rounded-xl p-6 transition-all hover:border-indigo-500 ${
                        selectedPlan === plan.id
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-gray-600 bg-gray-800/30"
                      } ${plan.recommended ? "ring-2 ring-yellow-400" : ""}`}
                    >
                      {plan.recommended && (
                        <div className="bg-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full absolute -top-2 left-1/2 transform -translate-x-1/2">
                          RECOMMENDED
                        </div>
                      )}
                      <div className="flex items-start mb-4">
                        <Image
                          src="/images/plans/default.png"
                          alt={plan.name}
                          className="w-16 h-16 mr-3 rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/64?text=${plan.name.charAt(0)}`;
                          }}
                        />
                        <div className="flex-1">
                          <span className="text-lg font-bold text-white block">
                            {plan.name}
                          </span>
                          <span className="text-sm text-gray-400 block mt-1">
                            {plan.description}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center text-sm text-gray-300">
                          <Users className="w-4 h-4 mr-2 text-blue-400" />
                          Client Limit: <span className="ml-1 font-semibold">{plan.features.clients}</span>
                        </li>
                        <li className="flex items-center text-sm text-gray-300">
                          <Globe className="w-4 h-4 mr-2 text-green-400" />
                          Domains Limit: <span className="ml-1 font-semibold">{plan.features.domains}</span>
                        </li>
                        <li className="flex items-center text-sm text-gray-300">
                          <Users className="w-4 h-4 mr-2 text-purple-400" />
                          Employee Limit: <span className="ml-1 font-semibold">{plan.features.employees}</span>
                        </li>
                        <li className="flex items-center text-sm text-gray-300">
                          <Building className="w-4 h-4 mr-2 text-orange-400" />
                          Supplier Limit: <span className="ml-1 font-semibold">{plan.features.suppliers}</span>
                        </li>
                        <li className="flex items-center text-sm text-gray-300">
                          <ShoppingCart className="w-4 h-4 mr-2 text-red-400" />
                          Purchase Limit: <span className="ml-1 font-semibold">{plan.features.purchases}</span>
                        </li>
                        <li className="flex items-center text-sm text-gray-300">
                          <FileText className="w-4 h-4 mr-2 text-indigo-400" />
                          Invoice Limit: <span className="ml-1 font-semibold">{plan.features.invoices}</span>
                        </li>
                      </ul>

                      <div className="price-badge mt-4 p-3 bg-gray-900/50 rounded-lg">
                        <span className="text-2xl font-bold text-white">
                          ${billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice} /
                        </span>
                        <span className="text-gray-300 ml-1">
                          {billingPeriod === "monthly" ? "Month" : "Year"}
                        </span>
                        {billingPeriod === "yearly" && (
                          <div className="text-green-400 text-sm mt-1">
                            Save ${plan.monthlyPrice * 12 - plan.yearlyPrice} per year
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Subscription Form */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                <div className="form-group row mb-6">
                  <label htmlFor="quantity" className="col-sm-3 col-form-label text-white font-medium">
                    Number of Months <span className="text-red-500">*</span>
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="form-group row mb-6">
                  <label htmlFor="payment_method" className="col-sm-3 col-form-label text-white font-medium">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <div className="col-sm-9">
                    <select
                      id="payment_method"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      required
                    >
                      <option value="" disabled>
                        Select a payment method
                      </option>
                      <option value="manual">Manual Payment</option>
                      <option value="bkash">bKash</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {formData.paymentMethod === "manual" && (
                  <div className="alert alert-warning bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                    <p className="text-yellow-400 text-sm">
                      Please send your payment to this Bkash number: <strong>01XXXXXXXXX</strong>
                    </p>
                  </div>
                )}

                <div className="form-group row mb-6">
                  <label htmlFor="transaction_id" className="col-sm-3 col-form-label text-white font-medium">
                    Transaction ID (If have any)
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      id="transaction_id"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      placeholder="123456XYZ789"
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="form-group row mb-6">
                  <label htmlFor="document_path" className="col-sm-3 col-form-label text-white font-medium">
                    Document (If have any)
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="file"
                      id="document_path"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                    />
                  </div>
                </div>

                {/* Total Amount Display */}
                <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-300">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-400">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {formData.quantity} {billingPeriod === "monthly" ? "month(s)" : "year(s)"} of {selectedPlanData?.name} plan
                  </p>
                </div>

                <div className="form-group">
                  <button
                    type="submit"
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}   