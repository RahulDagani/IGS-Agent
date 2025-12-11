"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface CTAData {
  id: number;
  heading: string;
  description: string;
  image_url: string;
  team_count: number;
  experience_years: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export default function CTA() {
  const [ctaData, setCtaData] = useState<CTAData | null>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  // Fetch CTA data from API
  useEffect(() => {
    const fetchCTAData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch CTA data");
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setCtaData(data.data);
        }
      } catch (error) {
        console.error("Error fetching CTA data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCTAData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="w-full bg-[#F7EFE6] px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Text Side - Skeleton */}
          <div>
            <div className="h-16 md:h-20 lg:h-24 bg-gray-300 rounded-lg animate-pulse mb-8"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse mb-4 w-5/6"></div>
          </div>

          {/* Right Image Side - Skeleton */}
          <div className="relative">
            <div className="border-[3px] border-gray-300 rounded-[30px] overflow-hidden h-80 bg-gray-300 animate-pulse"></div>
            {/* Experience Badge Skeleton */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2">
              <div className="bg-gray-300 border-[3px] border-gray-400 p-6 rounded-[20px] w-[170px] h-[120px] animate-pulse rotate-[-8deg]"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#F7EFE6] px-6 md:px-12 lg:px-20 py-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* LEFT TEXT SIDE */}
        <div>
          <h2 className="text-5xl font-black leading-[1.1] mb-8">
            {ctaData?.heading || "Empowering Agencies Through Real Experience."}
          </h2>

          <div className="text-lg leading-relaxed text-gray-900 space-y-4">
            {ctaData?.description ? (
              ctaData.description.split('. ').map((sentence, index) => (
                sentence.trim() && (
                  <p key={index} className="mb-2">
                    {sentence.trim()}{sentence.endsWith('.') ? '' : '.'}
                  </p>
                )
              ))
            ) : (
              <>
                <p className="mb-2">
                  {`We deeply understand how education agencies operate. With 20+ years of industry experience, we built ApplyTech to empower agencies with the exact tools they've always needed.`}
                </p>
                <p className="mb-6">
                  {`Our expert team combines technology, design, and business strategy to deliver a platform that solves real challenges and drives agency growth with efficiency and confidence.`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* RIGHT IMAGE SIDE */}
        <div className="relative">
          <div className="border-[3px] border-black rounded-[30px] overflow-hidden">
            <Image
              src={ctaData?.image_url || "/images/site/site2.png"}
              alt="Team"
              width={600}
              height={600}
              className="object-cover w-full h-full"
              onError={(e) => {
                // Fallback to default image if API image fails to load
                (e.target as HTMLImageElement).src = "/images/site/site2.png";
              }}
            />
          </div>

          {/* YELLOW EXPERIENCE BADGE */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2">
            <div className="bg-[#FFD524] border-[3px] border-black p-6 rounded-[20px] shadow-[4px_4px_0px_#000] text-center rotate-[-8deg] w-[170px]">
              <p className="text-5xl font-black leading-none">
                {ctaData?.experience_years || 20}+
              </p>
              <p className="text-sm mt-2 font-semibold">Years of experience</p>
            </div>
          </div>

          {/* Optional: Team Count Badge */}
          {ctaData?.team_count && (
            <div className="absolute -right-6 bottom-10">
              <div className="bg-[#FFD524] border-[3px] border-black p-4 rounded-[20px] shadow-[4px_4px_0px_#000] text-center rotate-[6deg] w-[140px]">
                <p className="text-3xl font-black leading-none">
                  {ctaData.team_count}+
                </p>
                <p className="text-xs mt-1 font-semibold">Team members</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}