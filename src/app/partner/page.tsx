import type { Metadata } from "next"; 
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import Badge from "@/components/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

export const metadata: Metadata = {
  title:
    "Partner platform | Apply Tech",
  description: "This is a complete solution for Agents to manage student study abroad applications.",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
       
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
             Total Students
            </span>
            <div className="flex align-middle">
               <h4 className=" font-bold text-gray-800 text-title-sm dark:text-white/90">
              88 
              
            </h4>
            
            <span className="my-auto ml-2">
    <Badge color="success" >
            <ArrowUpIcon className="text-success-500" />
            9.05%
          </Badge>
            </span>
            
            </div>
           
          </div>
           <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                              <GroupIcon className="text-gray-800 dark:text-white/90" />


        </div>

          
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
       
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
             Total Applications
            </span>
            <div className="flex align-middle">
               <h4 className=" font-bold text-gray-800 text-title-sm dark:text-white/90">
              526 
              
            </h4>
            
            <span className="my-auto ml-2">
    <Badge color="error" >
            <ArrowUpIcon className="text-error-500" />
            9.05%
          </Badge>
            </span>
            
            </div>
           
          </div>
           <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                              <BoxIconLine className="text-gray-800 dark:text-white/90" />


        </div>

          
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
       
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
            Enrolled Applications
            </span>
            <div className="flex align-middle">
               <h4 className=" font-bold text-gray-800 text-title-sm dark:text-white/90">
              360 
              
            </h4>
            
            <span className="my-auto ml-2">
    <Badge color="error" >
            <ArrowDownIcon className="text-error-500" />
            9.05%
          </Badge>
            </span>
            
            </div>
           
          </div>
           <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                              <BoxIconLine className="text-gray-800 dark:text-white/90" />


        </div>

          
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
       
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
             Total Loan applications
            </span>
            <div className="flex align-middle">
               <h4 className=" font-bold text-gray-800 text-title-sm dark:text-white/90">
              22 
              
            </h4>
            
            <span className="my-auto ml-2">
    <Badge color="success" >
            <ArrowDownIcon className="text-success-500" />
            9.05%
          </Badge>
            </span>
            
            </div>
           
          </div>
           <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                              <BoxIconLine className="text-gray-800 dark:text-white/90" />


        </div>

          
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

     
    </div>

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>
    </div>
  );
}
