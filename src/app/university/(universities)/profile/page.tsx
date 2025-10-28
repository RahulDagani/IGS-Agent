"use client"
import React, { useState } from "react";
import {  DollarSign, Play, Download } from "lucide-react";
import Image from "next/image";

interface CourseDetails {
  id: number;
  courseName: string;
  university: string;
  country: string;
  description: string;
  universityLogo: string;
  videoLink: string;
  brochureLink: string;
  tuitionLink: string;
  isIGSPartner: boolean;
  universityType: string;
  isShortlisted: boolean;
  aboutCourse: string;
  admissionRequirements: {
    transcripts: string;
    englishProficiency: string;
    finances: string;
  };
  applicationDeadline: string;
  applicationProcedure: string;
  galleryImages: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen = false, onToggle }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors rounded-lg"
        onClick={onToggle}
      >
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h4>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
};

const CourseDetailsPage: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const courseData: CourseDetails = {
    id: 2162,
    courseName: "Biomedical Engineering",
    university: "University Of North Texas",
    country: "United States of America",
    description: "The University of North Texas is a public research university in the Dallas–Fort Worth metroplex. UNT's main campus is in Denton, Texas, and it also has a satellite campus in Frisco, Texas. It offers 114 bachelor's, 97 master's, and 39 doctoral degree programs.",
    universityLogo: "https://indoglobalstudies.org/assets/images/university-logo/1729764622-university-of-north-texas-logo-477F29AACD-seeklogo_com.png",
    videoLink: "https://www.youtube.com/watch?v=W8Km41EMjqs",
    brochureLink: "https://indoglobalstudies.org/assets/brochers/university-brocher/1729764622-EmptyBrochure.pdf",
    tuitionLink: "https://www.unt.edu/admissions/tuition-costs-aid.html",
    isIGSPartner: true,
    universityType: "Public",
    isShortlisted: false,
    aboutCourse: `
      <h2 style="color:#B22222;"><strong>Master of Science in Biomedical Engineering</strong></h2>
      <p>Students pursuing graduate programs within the Department of Biomedical Engineering have the ability to use their knowledge and skillset to create practical applications in health care and within their communities. Current and past students have sought to increase physical patient mobility, diagnose and cure cancer, and develop bioresorbable implants for surgeries.</p>
      <p>At UNT, you'll also be able to complement your education and research with conferences and other professional development opportunities throughout your time here at College of Engineering. Students seeking one of our graduate degrees will learn what it means to be a UNT Eagle and to create a lasting impact in your community.</p>
      <p>Our program offers both a thesis and non-thesis option so you can carve out the path that works best for you and your future career goals.</p>
      <p><a href="https://www.unt.edu/academics/programs/biomedical-engineering-masters.html">https://www.unt.edu/academics/programs/biomedical-engineering-masters.html</a></p>
    `,
    admissionRequirements: {
      transcripts: `
        <p>UNT requires official school transcripts, diploma and degree certificates from all universities attended. After we process your application from ApplyTexas, you will receive an email with access to the MyUNT portal to upload scans of your official documents to be used for evaluation.</p>
        <ul>
          <li>These MUST be in both English and your native language, if applicable. English translations must be from either the academic institution or a certified translator.</li>
          <li>UNT will also accept credential evaluation reports from NACES-member evaluation companies.* For more details on this option, see below.</li>
          <li>Once all documents are received, we will evaluate and forward them to the academic program for an admission decision.</li>
          <li>If admitted, students are required to submit original, official documents before registering for classes.</li>
        </ul>
      `,
      englishProficiency: `
        <p>UNT degree program applicants are required to demonstrate English Language Proficiency which can be met through a variety of options including TOEFL, IELTS and DuoLingo. You can find more details about score requirements, how to submit scores and more on our complete list of ways to demonstrate English Language Proficiency.</p>
        <p>If you do not meet these requirements, we encourage you to consider UNT's Intensive English Language Institute.</p>
      `,
      finances: `
        <p>If you will be studying on an F-1 or J-1 visa, you must show proof of financial support. Once admitted, to request an I-20 to attend UNT, you must submit all required documents via iNorthTX – UNT's new online system for managing international student and scholar cases.</p>
        <p>Sponsored students should contact the UNT Sponsored and Special Programs office.</p>
      `
    },
    applicationDeadline: `
      <p>Contact your academic program for information regarding program-specific deadlines as they may be earlier than the priority dates listed below. Applying by the following dates increases your chance of I-20 processing, if admitted.</p>
      <p><strong>International Application Priority Dates</strong></p>
      <p><strong>Fall: April 15</strong><br>
      <strong>Spring: Oct. 15</strong><br>
      <strong>Summer: Jan. 1</strong></p>
    `,
    applicationProcedure: `
      <p>Please send student details, documents and online application login credentials to admissions@indoglobalstudies.org without submitting the application.</p>
      <p>IGS team will submit the application through channel partner.</p>
    `,
    galleryImages: [
      "https://via.placeholder.com/400x300?text=Campus+1",
      "https://via.placeholder.com/400x300?text=Campus+2",
      "https://via.placeholder.com/400x300?text=Lab+Facilities",
      "https://via.placeholder.com/400x300?text=Student+Life"
    ],
    location: {
      latitude: 33.2148,
      longitude: -97.1331,
      address: "Denton, Texas, USA"
    }
  };

  const toggleAccordion = (accordion: string) => {
    setOpenAccordion(openAccordion === accordion ? null : accordion);
  };


  const handleApply = () => {
    // Handle apply with IGS logic
    console.log("Apply with IGS clicked for course:", courseData.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="course-details-head bg-white dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* University Logo */}
              <div className="lg:col-span-1 flex justify-center items-center p-6 bg-white rounded-xl border border-gray-200 dark:border-gray-700">
                <Image
                  width={200}
                  height={200}
                  src={courseData.universityLogo}
                  alt={courseData.university}
                  className="max-w-full h-auto max-h-32 object-contain"
                />
              </div>

              {/* Course Info */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {courseData.courseName}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    at {courseData.university} of {courseData.country}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
                    {courseData.description}
                  </p>
                </div>

                {/* Action Buttons and Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a
                    href={courseData.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Play size={16} />
                    Video Link
                  </a>
                  
                  <a
                    href={courseData.brochureLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <Download size={16} />
                    Brochure
                  </a>
                  
                  <a
                    href={courseData.tuitionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <DollarSign size={16} />
                    Tuition URL
                  </a>
                  
                  <div className="hidden md:block"></div> {/* Spacer */}
                  
                  <div className="flex items-center justify-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    {courseData.isIGSPartner ? "IGS Partners" : "Not IGS Partner"}
                  </div>
                  
                  <div className="flex items-center justify-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    {courseData.universityType}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-4">
                 
                  
                  <button
                    onClick={handleApply}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Info Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 px-3 relative">
            Course info
            <span className="absolute bottom-0 left-3 w-6 h-1.5 bg-blue-500 rounded-full mt-1"></span>
          </h2>

          {/* Accordion Section */}
          <div className="space-y-4">
            {/* Gallery Accordion */}
            <AccordionItem
              title="Gallery"
              isOpen={openAccordion === 'gallery'}
              onToggle={() => toggleAccordion('gallery')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {courseData.galleryImages.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* About the Course Accordion */}
            <AccordionItem
              title="About the course"
              isOpen={openAccordion === 'about'}
              onToggle={() => toggleAccordion('about')}
            >
              <div 
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: courseData.aboutCourse }}
              />
            </AccordionItem>

            {/* Admission Requirements Accordion */}
            <AccordionItem
              title="Admission Requirements"
              isOpen={openAccordion === 'admission'}
              onToggle={() => toggleAccordion('admission')}
            >
              <div className="space-y-6">
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-white mb-3">Transcripts</h5>
                  <div 
                    className="prose prose-gray dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: courseData.admissionRequirements.transcripts }}
                  />
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-white mb-3">English Language Proficiency</h5>
                  <div 
                    className="prose prose-gray dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: courseData.admissionRequirements.englishProficiency }}
                  />
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-white mb-3">Statement of Finances and proof of funding documents</h5>
                  <div 
                    className="prose prose-gray dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: courseData.admissionRequirements.finances }}
                  />
                </div>
              </div>
            </AccordionItem>

            {/* Application Deadline Accordion */}
            <AccordionItem
              title="Application Deadline"
              isOpen={openAccordion === 'deadline'}
              onToggle={() => toggleAccordion('deadline')}
            >
              <div 
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: courseData.applicationDeadline }}
              />
            </AccordionItem>

            {/* Application Procedure Accordion */}
            <AccordionItem
              title="Application Procedure"
              isOpen={openAccordion === 'procedure'}
              onToggle={() => toggleAccordion('procedure')}
            >
              <div 
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: courseData.applicationProcedure }}
              />
            </AccordionItem>
          </div>

          {/* Map Section */}
          <div className="mt-12 rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3357.238366489743!2d${courseData.location.longitude}!3d${courseData.location.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDEyJzUzLjMiTiA5N8KwMDgnMDAuMyJX!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus`}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Location of ${courseData.university}`}
            />
          </div>
        </div>
      </section>

      {/* Recommended Courses Section - You can uncomment and implement this later */}
      {/*
      <section className="bg-gray-100 dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 px-3 relative">
            Recommended for you
            <span className="absolute bottom-0 left-3 w-6 h-1.5 bg-green-500 rounded-full mt-1"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add recommended courses here *//*}
          </div>
        </div>
      </section>
      */}
    </div>
  );
};

export default CourseDetailsPage;