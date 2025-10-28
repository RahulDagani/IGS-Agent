
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import WalletTable from "./WalletTable";

export const metadata: Metadata = {
  title: "Agents Wallet",
  description:
    "List of Agents Wallets on your Partner Platform",
  // other metadata
};

export default function AgentsTable() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Agent Wallets" />
      <div className="space-y-6">
        
          <WalletTable />
       
      </div>
    </div>
  );
}
