
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import PartnersTable from "./PartnersTable";

export const metadata: Metadata = {
  title: "University Partners",
  description:
    "List of University Partners",
  // other metadata
};

export default function Partners() {
  return (
    <div>
      <PageBreadcrumb pageTitle="University Partners" />
      <div className="space-y-6">
        
          <PartnersTable />
       
      </div>
    </div>
  );
}
