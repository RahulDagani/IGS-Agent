
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import WalletTable from "./WalletTable";

export const metadata: Metadata = {
  title: "Students Wallet",
  description:
    "List of Wallets on your Student Platform",
  // other metadata
};

export default function Wallets() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Student Wallets" />
      <div className="space-y-6">
        
          <WalletTable />
       
      </div>
    </div>
  );
}
