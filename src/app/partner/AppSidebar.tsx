"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  ChevronDownIcon,
  HorizontaLDots,
} from "@/icons/index";

import {
  LayoutDashboard,
  Users,
  Book,
  FileText,
  Mail,
  Wallet,
  Settings,
  ArrowLeft,
  Percent,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTenantLogo } from "@/hooks/useTenantLogo";

// Types for API response
interface ChildModule {
  sub_module_id?: number;
  id?: number;
  module_id: number;
  name: string;
  slug: string;
  icon: string;
  route: string;
  sort_order: number;
  status: number;
  child_modules: ChildModule[];
}

interface Module {
  id: number;
  name: string;
  sort_order: number;
  status: number;
  sub_modules: ChildModule[];
}

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

// SVG parser helper
const parseSVGIcon = (iconString: string): React.ReactNode => {
  if (!iconString || iconString.trim() === '') {
    return <div className="w-5 h-5" />;
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
  
  return <div className="w-5 h-5" />;
};

const getIcon = parseSVGIcon;

// Map API modules to NavItems
const mapApiToNavItems = (modules: Module[]): MenuSection[] => {
  return modules.map(module => {
    const items: NavItem[] = (module.sub_modules || [])
      .filter(subModule => subModule.status === 1)
      // .sort((a, b) => a.sort_order - b.sort_order)
      .map(subModule => {
        const navItem: NavItem = {
          name: subModule.name,
          icon: getIcon(subModule.icon),
          path: subModule.route ? `/partner/${subModule.route}` : "",
        };

        // Map child modules if they exist
        if (subModule.child_modules && subModule.child_modules.length > 0) {
          navItem.subItems = subModule.child_modules
            .filter(child => child.status === 1)
            // .sort((a, b) => a.sort_order - b.sort_order)
            .map(child => ({
              name: child.name,
              icon: getIcon(child.icon),
              path: `/partner/${child.route}`,
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
  const router = useRouter();
  const { adminToken, adminReLoginFromAgent, user } = useAuth();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { logoUrl, companyName } = useTenantLogo();

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // State for dynamic modules
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;
  const { token } = useAuth();

  // Static items that don't come from API
  const staticNavItems: NavItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/partner",
    },
  ];

  // Create computed navigation items based on adminToken
  const [computedNavItems, setComputedNavItems] = useState<NavItem[]>(staticNavItems);
  
  useEffect(() => {
    const updatedItems = [...staticNavItems];
    
    if (adminToken) {
      updatedItems.unshift({
        name: "Go to Admin Panel",
        icon: <ArrowLeft size={18} />,
        path: "#",
      });
    }
    
    setComputedNavItems(updatedItems);
  }, [adminToken]);

  // Fetch modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/modules`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        
        const data = await response.json();
        
        // Filter active modules (status === 1) and sort by sort_order
        const activeModules = data
          .filter((module: Module) => module.status === 1)
          // .sort((a: Module, b: Module) => a.sort_order - b.sort_order);

          
        
        const sections = mapApiToNavItems(activeModules);
       
        setMenuSections(sections);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load modules');
        console.error('Error fetching modules:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchModules();
    }
  }, [token]);

  const isActive = useCallback(
    (path?: string): boolean => {
      if (!path) return false;

      // Remove /partner prefix from pathname for comparison
      const cleanPathname = pathname.replace(/^\/partner/, '');
      const normalizedPath = path.replace(/^\/partner/, '').replace(/\/$/, '');
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

  const handleAdminReLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/agent/admin/login`, {
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      
      const data = await response.json();

      if (data.status == "success") {
        const { user, token } = data.data;
        adminReLoginFromAgent(user, token);
        router.push("/admin/partners/agents");
      }

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      alert("Login failed");
    }     
  };

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
          item.name == "Dashbaord" ?
          (
            <Link
              href={"/"}
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
          : (item.path && (
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
            </Link>)
          )
        )}
      </li>
    );
  };

  const renderMainMenuItems = () => (
    <div>
      <h2
        className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
          !isExpanded && !isHovered
            ? "lg:justify-center"
            : "justify-start"
        }`}
      >
        {isExpanded || isHovered || isMobileOpen ? (
          "Admin Controls"
        ) : (
          <HorizontaLDots />
        )}
      </h2>
      <ul className="flex flex-col gap-4">
        {computedNavItems.map((item) => {
          if (item.name === "Go to Admin Panel" && adminToken) {
            return (
              <li key={item.name}>
                <div
                  onClick={handleAdminReLogin}
                  className={`menu-item group cursor-pointer`}
                  style={{ paddingLeft: `16px` }}
                >
                  <span className="menu-item-icon-inactive flex items-center justify-center w-5 h-5">
                    {item.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text dark:text-white">
                      {item.name}
                    </span>
                  )}
                </div>
              </li>
            );
          }
          return (
            <NavItemComponent 
              key={item.name} 
              item={item} 
              sectionIndex={-1} 
            />
          );
        })}
      </ul>
    </div>
  );

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
        
        // Remove /partner prefix from currentPath for comparison
        const cleanCurrentPath = currentPath.replace(/^\/partner/, '');
        const cleanItemPath = item.path?.replace(/^\/partner/, '') || '';
        
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
    
    // Find and open menus for main nav items (sectionIndex = -1)
    findAndOpenParentMenus(computedNavItems, pathname, [], -1);
    
    // Find and open menus for dynamic sections
    menuSections.forEach((section, index) => {
      findAndOpenParentMenus(section.items, pathname, [], index);
    });
  }, [pathname, computedNavItems, menuSections]);

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

  if (loading) {
    return (
      <aside className="fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen w-[290px] border-r border-gray-200 z-50">
        <div className="py-8 flex justify-center">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="h-9 w-auto object-contain" />
          ) : (
            <span className="dark:text-white text-black font-semibold text-xl">{companyName}</span>
          )}
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
        <Link href="/partner">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="flex justify-center items-center">
                {logoUrl ? (
                  <img src={logoUrl} alt={companyName} className="h-9 w-auto object-contain" />
                ) : (
                  <span className="dark:text-white text-black font-semibold text-xl">{companyName}</span>
                )}
              </div>
            </>
          ) : (
            logoUrl ? (
              <img src={logoUrl} alt={companyName} className="h-9 w-auto object-contain" />
            ) : (
              <span className="dark:text-white text-black font-semibold text-xl">{companyName}</span>
            )
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {/* Main Menu Section */}
            {adminToken && renderMainMenuItems()}

            {/* Dynamic Sections from API */}
            {menuSections.map((section, index) => renderMenuSection(section, index))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;