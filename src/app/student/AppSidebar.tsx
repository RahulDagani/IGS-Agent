"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  
  ChevronDownIcon,
  HorizontaLDots,
  
} from "@/icons/index";

import {
  LayoutDashboard,
  GraduationCap,
  Book,
  FileText,
  Mail,
  Wallet,
} from "lucide-react";



interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavItem[];
}


export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/",
  },
  {
        name: "Apply",
        path: "/apply",
        icon: <GraduationCap size={18} />,
      },
      {
        name: "Programs",
        path: "/programs",
        icon: <Book size={18} />,
      },
      {
        name: "Applications",
        path: "/applications",
        icon: <FileText size={18} />,
      },
      {
        name: "Wallet",
        path: "/wallet",
        icon: <Wallet size={18} />,
      },
      {
        name: "Resources",
        icon: <Mail size={18} />,
        path: "/resources",
      },

];


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string | undefined): boolean => {
    if (!path) return false;
    return pathname === path;
  }, [pathname]);

  // Recursive component for nested menu items
  const NavItemComponent: React.FC<{ 
    item: NavItem; 
    level?: number;
    parentKey?: string;
  }> = ({ item, level = 0, parentKey = '' }) => {
    const itemKey = parentKey ? `${parentKey}-${item.name}` : item.name;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isSubmenuOpen = openSubmenus.has(itemKey);

    return (
      <li>
        {hasSubItems ? (
          <>
            <button
              onClick={() => handleSubmenuToggle(itemKey)}
              className={`menu-item group w-full text-left ${
                isSubmenuOpen ? "menu-item-active" : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
              style={{ paddingLeft: `${level * 20 + 16}px` }}
            >
              <span className={isSubmenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                {item.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{item.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    isSubmenuOpen ? "rotate-180 text-brand-500" : ""
                  }`}
                />
              )}
            </button>
            
            {(isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => { subMenuRefs.current[itemKey] = el; }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isSubmenuOpen ? `${subMenuRefs.current[itemKey]?.scrollHeight || 0}px` : "0px",
                }}
              >
                <ul className="flex flex-col gap-1 mt-1">
                  {item.subItems!.map((subItem) => (
                    <NavItemComponent 
                      key={subItem.name} 
                      item={subItem} 
                      level={level + 1}
                      parentKey={itemKey}
                    />
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          item.path && (
            <Link
              href={"/student" + item.path}
              className={`menu-item group ${
                isActive(item.path) ? "menu-item-active" : "menu-item-inactive"
              }`}
              style={{ paddingLeft: `${level * 20 + 16}px` }}
            >
              <span className={isActive(item.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                {item.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{item.name}</span>
              )}
            </Link>
          )
        )}
      </li>
    );
  };

  const renderMainMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {navItems.map((item) => (
        <NavItemComponent key={item.name} item={item} />
      ))}
    </ul>
  );

  const handleSubmenuToggle = (itemKey: string) => {
    setOpenSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  // Auto-open submenus based on current path
  useEffect(() => {
    const findAndOpenParentMenus = (items: NavItem[], currentPath: string, parentKeys: string[] = []): boolean => {
      for (const item of items) {
        const itemKey = parentKeys.length > 0 ? `${parentKeys.join('-')}-${item.name}` : item.name;
        
        if (item.path === currentPath) {
          // Open all parent menus
          parentKeys.forEach((key, index) => {
            const parentKey = parentKeys.slice(0, index + 1).join('-');
            setOpenSubmenus(prev => new Set(prev).add(parentKey));
          });
          return true;
        }

        if (item.subItems) {
          const found = findAndOpenParentMenus(item.subItems, currentPath, [...parentKeys, item.name]);
          if (found) {
            setOpenSubmenus(prev => new Set(prev).add(itemKey));
            return true;
          }
        }
      }
      return false;
    };

    setOpenSubmenus(new Set());
    
    // Find and open menus for main nav items
    findAndOpenParentMenus(navItems, pathname);
    
    
  }, [pathname]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/student">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
            <div className="flex justify-center items-center">
              <Image
                className=""
                src="/images/logo/logo.png"
                alt="Logo"
                width={45}
                height={45}
              />
              <span className="dark:text-white ms-1 text-black font-semibold text-2xl">
                ApplyTech
              </span>
            </div>
            </>
          ) : (
           <Image
                className=""
                src="/images/logo/logo.png"
                alt="Logo"
                width={32}
                height={32}
              />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMainMenuItems()}
              
            </div>

          
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? null : null}
      </div>
    </aside>
  );
};

export default AppSidebar;