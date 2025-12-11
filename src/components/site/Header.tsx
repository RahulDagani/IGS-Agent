"use client";

import { useState } from "react";
import { ChevronDown, LogIn, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/site/igslogo.png" // ← Replace with your exact logo path
            alt="Indoglobalstudies"
            width={88}
            height={58}
          />
          {/* <span className="text-[24px] font-semibold text-[#0E2A47]">ApplyTech</span> */}
          {/* Desktop Menu */}
        <nav className="hidden md:flex items-center ml-6 gap-8 text-[#0E2A47] font-medium">
          <NavItem title="Home" link="/home"/>
          <NavItem title="Universities" link="/universities"/>
          <NavItem title="Collaborations" link="/collaborations"/>
          <NavItem title="Contact" link="/contact"/>
        </nav>
        </div>

        

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button className="flex items-center gap-2 border border-[#0E2A47] text-[#0E2A47] px-6 py-2 rounded-full hover:bg-gray-50 transition">
            <User size={18} />
            Become a Partner
          </button>

          <button className="flex items-center gap-2 bg-[#0566FF] text-white px-6 py-2 rounded-full hover:bg-blue-600 transition">
            <LogIn size={18} />
            Sign In
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="space-y-1">
            <span className="block w-6 h-[2px] bg-black"></span>
            <span className="block w-6 h-[2px] bg-black"></span>
            <span className="block w-6 h-[2px] bg-black"></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 text-[#0E2A47]">
          <MobileNavItem title="Home" link="/home"/>
          <MobileNavItem title="Universities" link="/universities" />
          <MobileNavItem title="Collaborations" link="/collaborations" />
          <MobileNavItem title="Contact" link="/contact" />

          <button className="w-full flex items-center justify-center gap-2 border border-[#0E2A47] text-[#0E2A47] px-6 py-2 rounded-full">
            <User size={18} />
            Become a Partner
          </button>

          <button className="w-full flex items-center justify-center gap-2 bg-[#0566FF] text-white px-6 py-2 rounded-full">
            <LogIn size={18} />
            Sign In
          </button>
        </div>
      )}
    </header>
  );
}

/* Components */
const NavItem = ({ title, link }: { title: string, link: string }) => (
  <Link href={`${link}`}>
  <div className="flex items-center gap-1 cursor-pointer hover:text-[#0566FF]">
    {title}
    {/* <ChevronDown size={16} /> */}
  </div>
  </Link>
);

const MobileNavItem = ({ title, link }: { title: string, link: string }) => (
   <Link href={`${link}`}>
  <div className="flex items-center gap-2 py-1">
    <ChevronDown size={16} />
    {title}
  </div>
  </Link>
);
