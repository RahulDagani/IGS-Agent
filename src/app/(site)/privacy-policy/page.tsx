// app/privacy-policy/page.tsx
"use client";

import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import { Shield, FileText, Mail, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      {/* Full Background Header Section */}
      <div className="bg-white content">
        <section className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-b-3xl">
          {/* Privacy Policy Heading */}
          <h1 className="text-center text-6xl lg:text-[90px] font-serif font-bold py-20">
            Privacy Policy 
          </h1>
        </section>


        {/* Privacy Policy Content */}
        <div className="min-h-screen w-full bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
           
            {/* Introduction */}
            <div className="mb-12">
              <div className="flex md:items-center md:justify-between gap-3 mb-4 flex-col md:flex-row">
                <div className="flex items-center gap-3"><Shield className="text-blue-600" size={28} />
                <h2 className="text-3xl font-bold">1. Introduction</h2>
                </div>
                <div className="flex items-center gap-1 ">
                <span className="text-sm text-gray-400 font-bold">Last Updated - March 2026</span>
              </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to ApplyTech. We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our website{" "}
                <a 
                  href="https://applytech.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://applytech.org
                </a>
                , you agree to the terms of this Privacy Policy.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-blue-600" size={28} />
                <h2 className="text-3xl font-bold">2. Information We Collect</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect the following types of information when users interact with our website or services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4 space-y-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Business or service-related information</li>
                <li>Lead information submitted through forms or advertisements</li>
                <li>Any information voluntarily provided by users</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Information may be collected through:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mt-2 space-y-2">
                <li>Website forms</li>
                <li>Advertising lead forms</li>
                <li>Communication channels such as email or messaging platforms</li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                <li>To provide and improve our services</li>
                <li>To manage and respond to inquiries or leads</li>
                <li>To communicate with users regarding services or support</li>
                <li>To send automated responses or notifications</li>
                <li>To improve our website functionality and user experience</li>
              </ul>
            </div>

            {/* Third-Party Services */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">4. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our services may integrate with third-party platforms to manage communication and advertising. These may include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                <li>Meta (Facebook and Instagram advertising services)</li>
                <li>Google advertising services</li>
                <li>WhatsApp communication services</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                These platforms may collect and process information according to their own privacy policies.
              </p>
            </div>

            {/* Data Protection */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">5. Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                We take reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                However, no method of transmission over the internet is completely secure.
              </p>
            </div>

            {/* Data Sharing */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">6. Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell or rent personal data to third parties.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Information may only be shared:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mt-2 space-y-2">
                <li>To provide requested services</li>
                <li>With trusted service providers assisting in service operations</li>
                <li>When required by law or legal obligations</li>
              </ul>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">7. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website may use cookies and similar technologies to improve user experience and analyze website traffic.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Users may choose to disable cookies through their browser settings.
              </p>
            </div>

            {/* User Rights */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">8. User Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Users may request:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                <li>Access to their personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of their personal data</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Requests can be submitted using the contact details below.
              </p>
            </div>

            {/* Data Deletion Instructions */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">9. Data Deletion Instructions</h2>
              <p className="text-gray-700 leading-relaxed">
                Users who wish to delete their personal data may send a request by email with the subject {" "}
                <span className="font-semibold">"Data Deletion Request"</span>. We will review and process the request within a reasonable time.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions regarding this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span>{" "}
                  <a href="mailto:info@applytech.org" className="text-blue-600 hover:underline">
                    info@applytech.org
                  </a>
                </p>
                <p className="text-gray-700 mt-2">
                  <span className="font-semibold">Website:</span>{" "}
                  <a 
                    href="https://applytech.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://applytech.org
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}