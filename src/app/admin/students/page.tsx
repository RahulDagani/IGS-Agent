
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import StudentTable from "./StudentsTable";

export const metadata: Metadata = {
  title: "Students",
  description:
    "List of All Students on your Student Platform",
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
