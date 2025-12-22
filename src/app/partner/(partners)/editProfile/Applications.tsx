import React, { useState } from 'react';
import { Search, Calendar, School, GraduationCap, Plus, FileUp, Pencil, ChevronDown, Paperclip, Send } from 'lucide-react';

interface Program {
  id: number;
  status: string;
  ackNo: string;
  date: string;
  course: string;
  university: string;
}

const programs: Program[] = [
  {
    id: 1,
    status: 'Submitted',
    ackNo: 'ACK2024056789',
    date: '2024-12-01',
    course: 'MSc Computer Science',
    university: 'University of Technology, Sydney'
  },
  {
    id: 2,
    status: 'Under Review',
    ackNo: 'ACK2024056790',
    date: '2024-12-02',
    course: 'MBA in Business Analytics',
    university: 'Harvard Business School'
  },
  {
    id: 3,
    status: 'Accepted',
    ackNo: 'ACK2024056791',
    date: '2024-12-03',
    course: 'PhD in Data Science',
    university: 'Stanford University'
  }
];

export default function Applications() {
  const [activeTab, setActiveTab] = useState<'applied' | 'apply'>('applied');
  const [activeProgram, setActiveProgram] = useState<number>(1);
  const [commentTab, setCommentTab] = useState<'Igs' | 'student'>('Igs');

  const selected = programs.find(item => item.id === activeProgram) || programs[0];

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Top Tabs */}
      <div className="flex justify-center gap-10 border-b dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('apply')}
          className={`pb-3 font-medium ${
            activeTab === 'apply'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Apply To Programs
        </button>
        <button
          onClick={() => setActiveTab('applied')}
          className={`pb-3 font-medium ${
            activeTab === 'applied'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Applied Programs
        </button>
      </div>

      {activeTab === 'applied' ? (
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT LIST */}
          <div className="col-span-4 space-y-4">
            {programs.map(item => (
              <div
                key={item.id}
                onClick={() => setActiveProgram(item.id)}
                className={`cursor-pointer border dark:border-gray-700 rounded-md p-4 relative bg-white dark:bg-gray-800 ${
                  activeProgram === item.id
                    ? 'border-blue-500 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-sm font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 inline-block px-2 py-1 rounded mb-2">
                  {item.status}
                </div>

                <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <p><span className="font-medium dark:text-gray-200">Ack. No:</span> {item.ackNo}</p>
                  <p><span className="font-medium dark:text-gray-200">Date:</span> {item.date}</p>
                  <p><span className="font-medium dark:text-gray-200">Course:</span> {item.course}</p>
                  <p><span className="font-medium dark:text-gray-200">University:</span> {item.university}</p>
                </div>

                {activeProgram === item.id && (
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-b-[10px] border-l-[10px] border-transparent border-l-blue-500 dark:border-l-blue-400" />
                )}
              </div>
            ))}
          </div>

          {/* RIGHT DETAILS */}
          <div className="col-span-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selected.date}</p>
                <p className="text-lg font-semibold underline mt-1 dark:text-white">
                  {selected.ackNo}
                </p>
                <h2 className="text-xl font-semibold mt-2 dark:text-white">
                  {selected.course}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {selected.university}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">May-2026</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm px-3 py-1 rounded-md font-medium">
                  Pending from Partner – Academic Documents
                </span>
                <button className="p-2 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Pencil size={16} className="dark:text-gray-300" />
                </button>
                <button className="p-2 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ChevronDown size={16} className="dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Fee Status */}
            <div className="mt-6">
              <p className="text-gray-500 dark:text-gray-400">
                Application Fee Status:{' '}
                <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded text-sm font-medium">
                  No Application Fee
                </span>
              </p>
            </div>

            {/* COMMENTS */}
            <div className="mt-8">
              <div className="flex gap-6 border-b dark:border-gray-700">
                <button
                  onClick={() => setCommentTab('Igs')}
                  className={`pb-2 font-medium ${
                    commentTab === 'Igs'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Igs Team
                </button>
                <button
                  onClick={() => setCommentTab('student')}
                  className={`pb-2 font-medium ${
                    commentTab === 'student'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Student
                </button>
              </div>

              {/* Input */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write comments..."
                  className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <button className="p-2 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">
                  <Paperclip size={18} />
                </button>
                <button className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md">
                  <Send size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" className="dark:bg-gray-700" />
                <span>Hide this message and attachment from counselor</span>
              </div>

              {/* Comment Bubble */}
              <div className="mt-6 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-semibold">
                  SG
                </div>
                <div className="bg-blue-700 dark:bg-blue-600 text-white rounded-lg p-4 max-w-xl">
                  <p className="font-medium mb-1">Swaranjali Gaikwad</p>
                  <p>
                    Dear Team,<br />
                    As per the telephonic communication on +91 9390676799
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Apply To Programs Tab Content */
        <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-6 relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              Quick Add Program
            </h1>

            <button className="flex items-center gap-2 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30">
              <Search size={16} />
              Search Program
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-5xl">
              We only show eligible programs for this student for the selected intake,
              year and university. To understand why certain programs are not eligible
              for this student, please go to Search Program.
            </p>

            {/* Filters */}
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Year */}
              <div className="col-span-3">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-md cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                    Select Year
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              {/* Intake */}
              <div className="col-span-3">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-md cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                    Select Intake
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              {/* University */}
              <div className="col-span-3">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-md cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <School size={18} className="text-blue-600 dark:text-blue-400" />
                    Select University
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              {/* Program */}
              <div className="col-span-2">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-md cursor-pointer">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <GraduationCap size={18} className="text-blue-600 dark:text-blue-400" />
                    Select Program
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              {/* Add Button */}
              <div className="col-span-1">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-3 rounded-md">
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Selected Programs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 mt-6 p-6 min-h-[420px] flex flex-col">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">
              Selected Programs{' '}
              <span className="text-gray-500 dark:text-gray-400 font-normal text-sm">
                (Max 10 programs)
              </span>
            </h2>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              {/* Illustration placeholder */}
              <div className="w-56 h-40 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-blue-400 dark:text-blue-300 text-sm">
                  Illustration Placeholder
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Let's get started, add programs to proceed with applications.
              </p>
            </div>
          </div>

          {/* Upload Documents Floating Button */}
          <button className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg">
            <FileUp size={18} />
            Upload documents
          </button>
        </div>
      )}

      {/* Whats New */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2">
        <div className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 rounded-l-md rotate-90 origin-bottom-right font-medium">
          What's new
        </div>
      </div>
    </div>
  );
}