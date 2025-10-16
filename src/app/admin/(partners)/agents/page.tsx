
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import AgentTable from "./AgentsTable";

export const metadata: Metadata = {
  title: "Agents",
  description:
    "List of All Agents on your Partner Platform",
  // other metadata
};

export default function AgentsTable() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Agents Table" />
      <div className="space-y-6">
        
          <AgentTable />
       
      </div>
    </div>
  );
}
