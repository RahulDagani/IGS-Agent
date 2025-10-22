"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import SetupSettingsSidebar from "@/app/admin/layout/SetupSettingsSidebar";

interface PaymentMethod {
  id: string;
  name: string;
  shortCode: string;
  note: string;
  status: "active" | "inactive";
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  
  // Static data for demonstration
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      name: "Bank Transfer",
      shortCode: "BANK_TRF",
      note: "Transfer funds directly to our bank account",
      status: "active"
    },
    {
      id: "2",
      name: "Account Payment",
      shortCode: "ACC_PAY",
      note: "Payment through customer account",
      status: "active"
    },
    {
      id: "3",
      name: "Cash Payment",
      shortCode: "CASH",
      note: "Pay with cash at our physical locations",
      status: "inactive"
    }
  ]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      setPaymentMethods(methods => methods.filter(method => method.id !== id));
    }
  };

  const handleStatusToggle = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method =>
        method.id === id
          ? {
              ...method,
              status: method.status === "active" ? "inactive" : "active"
            }
          : method
      )
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <SetupSettingsSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-6 mt-6 lg:mt-0 mb-6 bg-[#111827] rounded-xl shadow-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
            <p className="text-gray-400 mt-1">
              Manage your payment methods and configurations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => router.push("/admin/setup/payment/add")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
        </div>

        {/* Payment Methods Table */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">
                    Short Code
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">
                    Note
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.map((method) => (
                  <tr
                    key={method.id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-white">{method.name}</td>
                    <td className="py-4 px-6 text-gray-300 font-mono text-sm">
                      {method.shortCode}
                    </td>
                    <td className="py-4 px-6 text-gray-300 max-w-md">
                      {method.note}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleStatusToggle(method.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          method.status === "active"
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        }`}
                      >
                        {method.status === "active" ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {method.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/setup/payment/edit/${method.id}`
                            )
                          }
                          className="flex items-center gap-1  p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                        >
                          <Edit className="w-5 h-5" />
                          
                        </button>
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="flex items-center gap-1 p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                          
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paymentMethods.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No payment methods found.</p>
              <button
                onClick={() => router.push("/admin/setup/payment/add")}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all mx-auto"
              >
                <Plus className="w-4 h-4" /> Add Your First Payment Method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}