
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import CountriesTable from "./CountriesTable";

export const metadata: Metadata = {
  title: "Countries - Universities",
  description:
    "List of Countries",
  // other metadata
};

export default function Countries() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Countries" />
      <div className="space-y-6">
        
          <CountriesTable />
       
      </div>
    </div>
  );
}
