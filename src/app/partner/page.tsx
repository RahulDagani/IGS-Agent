import type { Metadata } from "next"; 

import PartnerDashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "Partner platform | Apply Tech",
  description: "This is a complete solution for Agents to manage student study abroad applications.",
};




export default async function Partner() {
  return (
    <PartnerDashboard />
  );
}