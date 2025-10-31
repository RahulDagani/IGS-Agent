
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import StatesTable from "./StatesTable";

export const metadata: Metadata = {
  title: "States - Universities",
  description:
    "List of States",
  // other metadata
};

export default function States() {
  return (
    <div>
      <PageBreadcrumb pageTitle="States" />
      <div className="space-y-6">
        
          <StatesTable />
       
      </div>
    </div>
  );
}
