
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import DeadlineTypeTable from "./DeadlineTypeTable";

export const metadata: Metadata = {
  title: "Deadline Types - Universities",
  description:
    "List of Deadline Types",
  // other metadata
};

export default function DeadlineTypes() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Deadline Types" />
      <div className="space-y-6">
        
          <DeadlineTypeTable />
       
      </div>
    </div>
  );
}
