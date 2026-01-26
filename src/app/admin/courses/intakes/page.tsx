
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import IntakesTable from "./IntakeTable";

export const metadata: Metadata = {
  title: "Intakes - Universities",
  description:
    "List of Intakes",
  // other metadata
};

export default function Intakes() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Intakes" />
      <div className="space-y-6">
        
          <IntakesTable />
       
      </div>
    </div>
  );
}
