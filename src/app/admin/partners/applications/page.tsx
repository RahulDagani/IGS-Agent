
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import Applications from "./Applications";

export const metadata: Metadata = {
  title: "Agent Applications",
  description:
    "List of All Applications on your Partner Platform",
  // other metadata
};

export default function AgentsTable() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Agent Applications" /> */}
      <div className="space-y-6">
        
          <Applications />
       
      </div>
    </div>
  );
}
