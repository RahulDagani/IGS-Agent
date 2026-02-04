"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { ChevronDownIcon, HorizontaLDots } from "@/icons/index";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ApiModule {
  id: number;
  module_id: number;
  name: string;
  slug: string;
  icon: string;
  route: string;
  sort_order: number;
  status: number;
  child_modules: ApiModule[];
}

interface ApiMainModule {
  id: number;
  name: string;
  sort_order: number;
  status: number;
  sub_modules: ApiModule[];
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavItem[];
}

// Function to convert API modules to NavItem structure
const convertApiToNavItems = (apiData: ApiMainModule[]): NavItem[] => {
  if (!apiData || apiData.length === 0) return [];
  
  // Assuming the first main module contains the menu items
  const mainModule = apiData[0];
  
  const convertModuleToNavItem = (module: ApiModule): NavItem => {
    // Parse SVG icon string to React element
    const parseSVGIcon = (svgString: string): React.ReactNode => {
      try {
        // Extract the SVG content and create a React element
        // This is a simplified parser - you might need to adjust based on actual SVG structure
        const svgRegex = /<svg[\s\S]*?<\/svg>/;
        const match = svgString.match(svgRegex);
        
        if (match) {
          // Create a wrapper div with dangerouslySetInnerHTML
          // Note: This approach has security implications if the SVG comes from untrusted sources
          return (
            <div 
              dangerouslySetInnerHTML={{ __html: match[0] }}
              className="w-5 h-5 flex items-center justify-center"
            />
          );
        }
        
        // Fallback to default icon if SVG parsing fails
        return <LayoutDashboard size={18} />;
      } catch (error) {
        console.error("Error parsing SVG icon:", error);
        return <LayoutDashboard size={18} />;
      }
    };

    return {
      name: module.name,
      icon: parseSVGIcon(module.icon),
      path: `/${module.route}`,
      subItems: module.child_modules && module.child_modules.length > 0 
        ? module.child_modules.map(convertModuleToNavItem)
        : undefined
    };
  };

  // Convert sub_modules to NavItems
  return mainModule.sub_modules.map(convertModuleToNavItem);
};

// Fallback static data in case API fails
const fallbackNavItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/",
  },
  {
    name: "Programs",
    path: "/programs",
    icon: <LayoutDashboard size={18} />,
  },
  {
    name: "Applications",
    path: "/applications",
    icon: <LayoutDashboard size={18} />,
  },
  {
    name: "Wallet",
    path: "/wallet",
    icon: <LayoutDashboard size={18} />,
  },
  {
    name: "Resources",
    icon: <LayoutDashboard size={18} />,
    path: "/resources",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>(fallbackNavItems);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const {token} = useAuth();
  
  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/modules`,{
          headers:{
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ApiMainModule[] = await response.json();
        const convertedItems = convertApiToNavItems(data);
        
        if (convertedItems.length > 0) {
          setNavItems(convertedItems);
        }
      } catch (error) {
        console.error("Failed to fetch menu data:", error);
        // Keep fallback data if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, []);

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

  const renderMainMenuItems = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              {(isExpanded || isHovered || isMobileOpen) && (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <ul className="flex flex-col gap-4">
        {navItems.map((item) => (
          <NavItemComponent key={item.name} item={item} />
        ))}
      </ul>
    );
  };

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
  }, [pathname, navItems]);

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
      </div>
    </aside>
  );
};

export default AppSidebar;