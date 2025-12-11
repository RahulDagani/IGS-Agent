"use client";

import Image from "next/image";
import { CheckCircle, BookOpen, Users, BadgeCheck } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full bg-white py-20 border-b border-gray-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-10 items-center">
        
        {/* LEFT SIDE */}
        <div>
          {/* Top Badge */}
          <div className="inline-flex items-center gap-3 bg-white border px-5 py-2 rounded-full shadow-sm">
            <span className="bg-[#21C55D]/20 text-[#21C55D] px-3 py-1 rounded-full text-sm font-semibold">
              New
            </span>
            <span className="text-sm font-medium text-gray-800">
              Empower Your Learning Journey
            </span>
          </div>

          {/* Heading */}
          <h1 className=" text-[42px] md:text-[56px] font-bold text-[#0E2A47] leading-tight mt-6">
            The #1 Place To Learn,
            Grow, And Succeed
          </h1>

          {/* Description */}
          <p className="mt-4 text-lg text-gray-600 max-w-xl">
            Real-world projects and certifications to take your learning further with
            LearnUp Learning Platform.
          </p>

          {/* Bullet Points */}
          <div className="mt-6 space-y-3">
            <Feature label="World's Top Instructors" />
            <Feature label="Skill-Based Training" />
            <Feature label="Future-Proof Your Career" />
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 mt-8">
           
            <Link href="/apply" className="bg-[#0566FF] text-white px-8 py-3 rounded-md font-medium hover:bg-blue-600 transition">
              Apply Now
            </Link>

            <button className="border border-gray-300 px-8 py-3 rounded-md font-medium text-gray-800 hover:bg-gray-50 transition">
              Browse Our Courses
            </button>
          </div>
        </div>

        {/* RIGHT SIDE IMAGES + BADGES */}
        <div className="relative flex justify-center">

          {/* Center Boy Image */}
          <div className="z-10">
            <Image
              src="/images/site/hero.png"
              alt="Boy Student"
              width={480}
              height={480}
              className="rounded-xl"
            />
          </div>

          {/* Students Badge */}
          <div className="absolute bottom-4 z-20 right-0 bg-white shadow-xl rounded-2xl px-6 py-4 flex flex-col gap-1">
            <p className="text-2xl font-bold text-[#0E2A47]">75k+</p>
            <p className="text-gray-600 text-sm">Students Enrolled with us</p>

           
          </div>

          {/* Top Features Boxes */}
          <div className="absolute -top-10 left-0 space-y-3 hidden md:block z-20">
            <FeatureCard icon={<BookOpen size={16} />} text="200+ Programes" />
            <FeatureCard icon={<Users size={16} />} text="80+ Expert Instructors" />
            <FeatureCard icon={<BadgeCheck size={16} />} text="Certified Learning" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* FEATURE ITEM */
const Feature = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle size={20} className="text-[#21C55D]" />
    <span className="text-gray-700 text-lg">{label}</span>
  </div>
);

/* SMALL WHITE FEATURE CARD */
const FeatureCard = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="flex items-center gap-2 bg-white shadow-md px-4 py-2 rounded-full">
    <div className="text-[#0E2A47]">{icon}</div>
    <span className="text-sm text-gray-800 font-medium">{text}</span>
  </div>
);
