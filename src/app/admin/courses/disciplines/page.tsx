
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import DisciplinesTable from "./DisciplinesTable";

export const metadata: Metadata = {
  title: "Disciplines - Universities",
  description:
    "List of Disciplines",
  // other metadata
};

export default function Disciplines() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Disciplines" />
      <div className="space-y-6">
        
          <DisciplinesTable />
       
      </div>
    </div>
  );
}
