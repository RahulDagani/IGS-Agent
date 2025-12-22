'use client';

import { useState } from 'react';
import {
  CheckCircle,
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'your' | 'Igs'>('your');
  const [mandatoryOpen, setMandatoryOpen] = useState(true);
  const [nonMandatoryOpen, setNonMandatoryOpen] = useState(true);

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 ">
      {/* Tabs */}
      <div className="flex justify-center gap-10 border-b dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('your')}
          className={`pb-3 font-medium ${
            activeTab === 'your'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Your Documents
        </button>
        <button
          onClick={() => setActiveTab('Igs')}
          className={`pb-3 font-medium ${
            activeTab === 'Igs'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Igs Documents
        </button>
      </div>

      {activeTab === 'your' && (
        <>
          {/* Mandatory Documents */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md mb-6">
            <div
              onClick={() => setMandatoryOpen(!mandatoryOpen)}
              className="flex justify-between items-center px-6 py-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold">
                <FileText />
                Mandatory Documents
              </div>
              {mandatoryOpen ? <Minus className="dark:text-gray-300" /> : <Plus className="dark:text-gray-300" />}
            </div>

            {mandatoryOpen && (
              <div className="px-6 pb-6 space-y-6">
                {/* Document Item */}
                <div className="border-l-4 border-green-500 dark:border-green-400 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 font-semibold dark:text-white">
                        <CheckCircle className="text-green-600 dark:text-green-400" />
                        Std. 10th Marksheet *
                      </div>

                      <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <p>
                          <strong className="dark:text-gray-200">Institution(s) Required For:</strong>{' '}
                          Dublin Business School
                        </p>
                        <p>
                          <strong className="dark:text-gray-200">Uploaded On:</strong> 16-12-2025 03:29 PM
                        </p>
                        <p>
                          <strong className="dark:text-gray-200">Uploaded By:</strong> Mr. Tirumala Rao Marrapu
                          (Partner)
                        </p>
                      </div>
                    </div>

                    <button className="flex items-center gap-2 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30">
                      <UploadCloud size={16} />
                      Replace File
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="bg-white dark:bg-gray-800 border dark:border-gray-600 px-3 py-1 rounded-md text-sm dark:text-gray-300">
                      10th.pdf
                    </span>
                    <Trash2 className="text-red-500 dark:text-red-400 cursor-pointer" size={18} />
                  </div>
                </div>

                {/* Another mandatory item */}
                <div className="border-l-4 border-green-500 dark:border-green-400 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 font-semibold dark:text-white">
                        <CheckCircle className="text-green-600 dark:text-green-400" />
                        Std. 12th Marksheet *
                      </div>

                      <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <p>
                          <strong className="dark:text-gray-200">Institution(s) Required For:</strong> Dublin
                          Business School, Wittenborg University of Applied
                          Sciences
                        </p>
                        <p>
                          <strong className="dark:text-gray-200">Uploaded On:</strong> 16-12-2025 03:29 PM
                        </p>
                      </div>
                    </div>

                    <button className="flex items-center gap-2 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30">
                      <UploadCloud size={16} />
                      Replace File
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Non Mandatory Documents */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md">
            <div
              onClick={() => setNonMandatoryOpen(!nonMandatoryOpen)}
              className="flex justify-between items-center px-6 py-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold">
                <FileText />
                Non-Mandatory Documents
              </div>
              {nonMandatoryOpen ? <Minus className="dark:text-gray-300" /> : <Plus className="dark:text-gray-300" />}
            </div>

            {nonMandatoryOpen && (
              <div className="px-6 pb-6 space-y-4">
                <div className="border-l-4 border-blue-500 dark:border-blue-400 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold dark:text-white">Bank balance certificate</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      <strong className="dark:text-gray-200">Institution(s) Required For:</strong> Wittenborg
                      University of Applied Sciences
                    </p>
                  </div>

                  <button className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                    <UploadCloud size={16} />
                    Upload
                  </button>
                </div>

                <div className="border-l-4 border-blue-500 dark:border-blue-400 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold dark:text-white">Financial Affidavit</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      <strong className="dark:text-gray-200">Institution(s) Required For:</strong> Wittenborg
                      University of Applied Sciences
                    </p>
                  </div>

                  <button className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                    <UploadCloud size={16} />
                    Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'Igs' && (
        <div className="space-y-6">
          {/* PROGRAM 1 */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md">
            {/* Program Header */}
            <div className="flex justify-between items-start px-6 py-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="dark:text-gray-300">📄</span>
                </div>
                <div>
                  <h3 className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    MBM (MSc) with specialization in Applied Artificial Intelligence
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Wittenborg University of Applied Sciences
                    <span className="mx-2 text-gray-400">•</span>
                    Netherlands
                    <span className="mx-2 text-gray-400">•</span>
                    May-2026
                  </p>
                </div>
              </div>

              <button className="text-xl text-gray-500 dark:text-gray-400">−</button>
            </div>

            {/* Visa Related Document */}
            <div className="mx-6 mb-6 border-l-4 border-green-500 dark:border-green-400 bg-gray-50 dark:bg-gray-700/50 rounded-md p-5">
              {/* Header Row */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 font-semibold dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xs">
                    ✓
                  </span>
                  Visa Related Document
                </div>

                <div className="flex gap-3">
                  <button className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    + Add all to Student Platform
                  </button>
                  <button className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    ⬇ Download All
                  </button>
                </div>
              </div>

              {/* File Card */}
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md p-5 flex justify-between items-start">
                <div>
                  <p className="font-semibold mb-2 dark:text-white">Netherland Visa.png</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="dark:text-gray-300">Uploaded on:</strong> 16-12-2025 04:34 PM
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="dark:text-gray-300">Uploaded by:</strong> Swaranjali Gaikwad
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                    + Add to Student Platform
                  </button>
                  <button className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    ⬇ Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRAM 2 */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md">
            <div className="flex justify-between items-start px-6 py-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="dark:text-gray-300">📄</span>
                </div>
                <div>
                  <h3 className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    Master of Business Administration (MBA) (ILEP: 0041/0127)
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Dublin Business School
                    <span className="mx-2 text-gray-400">•</span>
                    Ireland
                    <span className="mx-2 text-gray-400">•</span>
                    Sep-2026
                  </p>
                </div>
              </div>

              <button className="text-xl text-gray-500 dark:text-gray-400">−</button>
            </div>

            <div className="mx-6 mb-6 border-l-4 border-green-500 dark:border-green-400 bg-gray-50 dark:bg-gray-700/50 rounded-md p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 font-semibold dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xs">
                    ✓
                  </span>
                  Visa Related Document
                </div>

                <div className="flex gap-3">
                  <button className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    + Add all to Student Platform
                  </button>
                  <button className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    ⬇ Download All
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md p-5 flex justify-between items-start">
                <div>
                  <p className="font-semibold mb-2 dark:text-white">
                    updated Ireland VISA Guide.pdf
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="dark:text-gray-300">Uploaded on:</strong> 16-12-2025 05:49 PM
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="dark:text-gray-300">Uploaded by:</strong> Vimla Bhagat
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                    + Add to Student Platform
                  </button>
                  <button className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    ⬇ Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}