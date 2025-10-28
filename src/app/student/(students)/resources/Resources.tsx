
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "All Resources",
  // other metadata
};

export default function Resources() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Resources" />
      <div className="space-y-6">
        
          <Resources />
       
      </div>
    </div>
  );
}
