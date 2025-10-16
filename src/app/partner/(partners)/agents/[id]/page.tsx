
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import AgentDetails from "./AgentDetails";

export const metadata: Metadata = {
  title: "Agent Details",
  description:
    "Agent Details",
  // other metadata
};

export default function AgentsTable() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Agents Details" />
      <div className="space-y-6">
          <AgentDetails />
      </div>
    </div>
  );
}
