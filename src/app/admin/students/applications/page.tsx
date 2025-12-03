
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import Applications from "./Applications";

export const metadata: Metadata = {
  title: "Student Applications",
  description:
    "List of All Applications on your Student Platform",
  // other metadata
};

export default function Application() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Student Applications" />
      <div className="space-y-6">
        
          <Applications />
       
      </div>
    </div>
  );
}
