
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import CollaborationTable from "./CollaborationTable";

export const metadata: Metadata = {
  title: "University Collaborations",
  description:
    "List of University Collaborations",
  // other metadata
};

export default function Collaborations() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Collaborations" />
      <div className="space-y-6">
        
          <CollaborationTable />
       
      </div>
    </div>
  );
}
