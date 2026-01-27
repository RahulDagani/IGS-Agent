// Add these interfaces to your existing types
interface ChildModule {
  sub_module_id: number;
  name: string;
  slug: string;
  route: string;
  icon: string;
  sort_order: number;
  status: number;
}

interface SubModule {
  id: number;
  module_id: number;
  name: string;
  slug: string;
  icon: string;
  route: string | null;
  sort_order: number;
  status: number;
  child_modules: ChildModule[];
}

interface Module {
  id: number;
  name: string;
  sort_order: number;
  status: number;
  sub_modules: SubModule[];
}

// Update the NavItem interface to match API structure
interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavItem[];
}

interface MenuSection {
  title: string;
  items: NavItem[];
}

"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  BoxCubeIcon,
  ChevronDownIcon,
  HorizontaLDots,
  PieChartIcon,
} from "@/icons/index";

import { useAuth } from "@/context/AuthContext";

// SVG parser helper
const parseSVGIcon = (iconString: string): React.ReactNode => {
  if (!iconString || iconString.trim() === '') {
    return <div className="w-5 h-5" />; // Empty placeholder if no icon
  }
  
  try {
    const svgMatch = iconString.match(/<svg[\s\S]*?<\/svg>/);
    if (svgMatch) {
      return (
        <span
          className="inline-flex items-center justify-center w-5 h-5"
          dangerouslySetInnerHTML={{ 
            __html: svgMatch[0]
              .replace(/width="[^"]*"/, 'width="18"')
              .replace(/height="[^"]*"/, 'height="18"')
              .replace(/class="/g, 'className="')
          }}
        />
      );
    }
  } catch (error) {
    console.error('Error parsing SVG:', error);
  }
  
  return <div className="w-5 h-5" />; // Fallback empty div
};

const getIcon = parseSVGIcon;

// Map API modules to NavItems
const mapApiToNavItems = (modules: Module[]): MenuSection[] => {
  return modules.map(module => {
    const items: NavItem[] = module.sub_modules
      .filter(subModule => subModule.status === 1)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(subModule => {
        const navItem: NavItem = {
          name: subModule.name,
          icon: getIcon(subModule.icon),
          path: subModule.route ? `/admin/${subModule.route}` : undefined,
        };

        // Map child modules if they exist
        if (subModule.child_modules && subModule.child_modules.length > 0) {
          navItem.subItems = subModule.child_modules
            .filter(child => child.status === 1)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(child => ({
              name: child.name,
              icon: getIcon(child.icon),
              path: `/admin/${child.route}`,
            }));
        }

        return navItem;
      });

    return {
      title: module.name,
      items: items,
    };
  });
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  const {token} = useAuth();

  // Fetch modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/modules`,{
          headers:{
            "Authorization" : `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        // Filter active modules (status === 1) and sort by sort_order
        const activeModules = data
          .filter((module: Module) => module.status === 1)
          .sort((a: Module, b: Module) => a.sort_order - b.sort_order);
        
        const sections = mapApiToNavItems(activeModules);
        setMenuSections(sections);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
        // Fallback to empty sections if API fails
        setMenuSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const isActive = useCallback(
    (path?: string): boolean => {
      if (!path) return false;

      // Remove /admin prefix from pathname for comparison
      const cleanPathname = pathname.replace(/^\/admin/, '');
      const normalizedPath = path.replace(/^\/admin/, '').replace(/\/$/, '');
      const normalizedCurrent = cleanPathname.replace(/\/$/, '');
      
      // Special case for home/dashboard
      if (normalizedPath === "" || normalizedPath === "/") {
        return normalizedCurrent === "" || normalizedCurrent === "/";
      }

      // For exact match
      if (normalizedCurrent === normalizedPath) {
        return true;
      }

      return false;
    },
    [pathname]
  );

  // Recursive component for nested menu items
const NavItemComponent: React.FC<{ 
  item: NavItem; 
  level?: number;
  parentKey?: string;
  sectionIndex?: number;
}> = ({ item, level = 0, parentKey = '', sectionIndex = 0 }) => {
  const itemKey = parentKey 
    ? `${sectionIndex}-${parentKey}-${item.name}` 
    : `${sectionIndex}-${item.name}`;
    
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
            <span className={`${isSubmenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"} flex items-center justify-center w-5 h-5`}>
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
                    sectionIndex={sectionIndex}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        item.path && (
          <Link
            href={item.path}
            className={`menu-item group ${
              isActive(item.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
            style={{ paddingLeft: `${level * 20 + 16}px` }}
          >
            <span className={`${isActive(item.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"} flex items-center justify-center w-5 h-5`}>
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

  // Auto-open submenus based on current path
  useEffect(() => {
    const findAndOpenParentMenus = (
      items: NavItem[], 
      currentPath: string, 
      parentKeys: string[] = [], 
      sectionIndex: number = 0
    ): boolean => {
      for (const item of items) {
        const itemKey = parentKeys.length > 0 
          ? `${sectionIndex}-${parentKeys.join('-')}-${item.name}` 
          : `${sectionIndex}-${item.name}`;
        
        // Remove /admin prefix from currentPath for comparison
        const cleanCurrentPath = currentPath.replace(/^\/admin/, '');
        const cleanItemPath = item.path?.replace(/^\/admin/, '') || '';
        
        if (cleanItemPath === cleanCurrentPath) {
          // Open all parent menus
          parentKeys.forEach((key, index) => {
            const parentKey = parentKeys.slice(0, index + 1).join('-');
            setOpenSubmenus(prev => new Set(prev).add(`${sectionIndex}-${parentKey}`));
          });
          return true;
        }

        if (item.subItems) {
          const found = findAndOpenParentMenus(
            item.subItems, 
            currentPath, 
            [...parentKeys, item.name],
            sectionIndex
          );
          if (found) {
            setOpenSubmenus(prev => new Set(prev).add(itemKey));
            return true;
          }
        }
      }
      return false;
    };

    setOpenSubmenus(new Set());
    
    // Find and open menus for all sections
    menuSections.forEach((section, index) => {
      findAndOpenParentMenus(section.items, pathname, [], index);
    });
  }, [pathname, menuSections]);

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

  const renderMenuSection = (section: MenuSection, index: number) => (
    <div key={section.title}>
      <h2
        className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
          !isExpanded && !isHovered
            ? "lg:justify-center"
            : "justify-start"
        }`}
      >
        {isExpanded || isHovered || isMobileOpen ? (
          section.title
        ) : (
          <HorizontaLDots />
        )}
      </h2>
      <ul className="flex flex-col gap-4">
        {section.items.map((item) => (
          <NavItemComponent 
            key={item.name} 
            item={item} 
            sectionIndex={index}
          />
        ))}
      </ul>
    </div>
  );

  if (loading) {
    return (
      <aside className="fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen w-[290px] border-r border-gray-200 z-50">
        <div className="py-8 flex justify-center">
          <Image
            src="/images/site/igslogo.png"
            alt="Logo"
            width={85}
            height={65}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">Loading menu...</div>
        </div>
      </aside>
    );
  }

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
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
        }`}
      >
        <Link href="/admin/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
            <div className="flex justify-center items-center">
              <Image
                className="mx-auto"
                src="/images/site/igslogo.png"
                alt="Logo"
                width={85}
                height={65}
              />
            </div>
            </>
          ) : (
           <Image
                className=""
                src="/images/site/igslogo.png"
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
            {menuSections.map((section, index) => renderMenuSection(section, index))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;