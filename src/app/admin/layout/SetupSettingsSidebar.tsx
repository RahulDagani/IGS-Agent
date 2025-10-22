"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Cog,
    Mail,
    MessageSquare,
    CreditCard,
    Wallet,
} from "lucide-react";

interface SidebarItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
    {
        name: "General Settings",
        href: "/admin/setup/general",
        icon: Cog,
    },
    {
        name: "Mail Configurations",
        href: "/admin/setup/mail-configuration",
        icon: Mail,
    },
    {
        name: "SMS Configurations",
        href: "/admin/setup/sms-configuration",
        icon: MessageSquare,
    },
    {
        name: "Currency Settings",
        href: "/admin/setup/currency",
        icon: CreditCard,
    },
    {
        name: "Payment Settings",
        href: "/admin/setup/payment",
        icon: Wallet,
    },
];

export default function SetupSettingsSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-full lg:w-72 bg-[#111827] border border-white/10 rounded-xl shadow-lg p-4">
            {/* Header */}
            <div className="mb-4 border-b border-gray-800 pb-3">
                <h2 className="text-lg font-semibold text-white">
                    Setup Settings
                </h2>
            </div>

            {/* Sidebar Links */}
            <nav className="space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                                isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
