"use client";

import { useState } from "react";
import { Search, RefreshCcw, Printer } from "lucide-react";
import Image from "next/image";

export default function ActivityLogPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDateRange, setSelectedDateRange] = useState("");

    return (
        <div className="flex min-h-screen bg-[#111827] ">
            <div className="flex-1">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">
                            Activity Logs
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Manage and track all system activities in one place.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                        <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors">
                            <Printer className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search + Filter */}
                <div className="flex justify-between items-center mb-6">
                    {/* Search Bar */}
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search activity logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1f2937] text-white pl-10 pr-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <select
                            value={selectedDateRange}
                            onChange={(e) =>
                                setSelectedDateRange(e.target.value)
                            }
                            className="bg-[#1f2937] text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">From - To</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="thisMonth">This Month</option>
                            <option value="lastMonth">Last Month</option>
                            <option value="thisYear">This Year</option>
                        </select>
                    </div>
                </div>

                {/* Table Section */}
                <div className="border border-gray-700 rounded-xl bg-[#1f2937] p-6">
                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center py-16">
                        <Image
                            src="/images/empty-state.png" // Replace with your actual image path
                            alt="No data"
                            className="w-40 mb-4 opacity-80"
                        />
                        <p className="text-gray-400 text-lg">
                            Sorry <span className="text-yellow-500">🥹</span> No
                            data found.
                        </p>
                    </div>
                </div>

                {/* Pagination - Dark Theme */}
                <div className="flex justify-between items-center mt-6 text-gray-400">
                    <span className="text-sm">Showing 0 of 0 entries</span>
                    <div className="flex space-x-2">
                        <button
                            disabled
                            className="px-3 py-1 rounded-lg bg-gray-800 text-gray-500 cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                            1
                        </button>
                        <button
                            disabled
                            className="px-3 py-1 rounded-lg bg-gray-800 text-gray-500 cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
