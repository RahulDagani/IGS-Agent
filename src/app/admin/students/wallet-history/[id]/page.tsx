
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import WalletHistoryTable from "./WalletHistoryTable";

export const metadata: Metadata = {
  title: "Student Wallet History",
  description:
    "List of Student Wallet Transactions on your Student Platform",
  // other metadata
};

export default function WalletHistory() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Wallet History" />
      <div className="space-y-6">
        
          <WalletHistoryTable />
       
      </div>
    </div>
  );
}
