
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import StudyLevelsTable from "./StudyLevelTable";

export const metadata: Metadata = {
  title: "Study Levels - Universities",
  description:
    "List of Study levels",
  // other metadata
};

export default function StudyLevels() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Study levels" />
      <div className="space-y-6">
        
          <StudyLevelsTable />
       
      </div>
    </div>
  );
}
