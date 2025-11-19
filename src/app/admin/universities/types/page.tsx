
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import TypesTable from "./TypesTable";

export const metadata: Metadata = {
  title: "University Types",
  description:
    "List of University Partners",
  // other metadata
};

export default function UniversityTypes() {
  return (
    <div>
      <PageBreadcrumb pageTitle="University Types" />
      <div className="space-y-6">
        
          <TypesTable />
       
      </div>
    </div>
  );
}
