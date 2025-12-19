
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import ProgramCards from "./Programs";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "All Programs",
  // other metadata
};

export default function Programs() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Programs" />
      <div className="space-y-6">
        
          <ProgramCards />
       
      </div>
    </div>
  );
}
