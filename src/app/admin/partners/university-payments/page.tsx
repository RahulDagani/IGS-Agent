
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import PaymentsTable from "./Payment";

export const metadata: Metadata = {
  title: "Commissions",
  description:
    "List of Commission Payments on your Partner Platform",
  // other metadata
};

export default function Commissions() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Commission Payments" /> */}
      <div className="space-y-6">
        
          <PaymentsTable />
       
      </div>
    </div>
  );
}
