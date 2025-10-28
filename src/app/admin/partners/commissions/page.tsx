
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import CommissionsTable from "./Commissions";

export const metadata: Metadata = {
  title: "Commissions",
  description:
    "List of Agent Commissions on your Partner Platform",
  // other metadata
};

export default function Commissions() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Commissions" />
      <div className="space-y-6">
        
          <CommissionsTable />
       
      </div>
    </div>
  );
}
