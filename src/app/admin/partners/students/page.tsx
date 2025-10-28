
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import StudentTable from "./StudentsTable";

export const metadata: Metadata = {
  title: "Agents Students",
  description:
    "List of All Agent wise Students on your Partner Platform",
  // other metadata
};

export default function StudentsTable() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Students" />
      <div className="space-y-6">
        
          <StudentTable />
       
      </div>
    </div>
  );
}
