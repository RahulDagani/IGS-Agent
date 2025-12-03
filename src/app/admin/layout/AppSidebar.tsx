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

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  User,
  Book,
  FileText,
  Percent,
  UserPlus,
  Handshake,
  Filter,
  Settings,
  University,
  Newspaper,
  Mail,
  Wallet,
} from "lucide-react";


interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavItem[];
}

interface NavItemOther {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { 
    name: string; 
    path: string; 
    pro?: boolean; 
    new?: boolean;
  }[];
}

const partnerItems: NavItem[] = [
  {
    name: "Agencies",
    icon: <Users size={18} />,
    subItems: [
      {
        name: "Agents",
        path: "/partners/agents",
        icon: <Handshake size={18} />,
      },
      {
        name: "Students",
        path: "/partners/agents/students",
        icon: <User size={18} />,
      },
      {
        name: "Applications",
        path: "/partners/applications",
        icon: <FileText size={18} />,
      },
      {
        name: "Wallet",
        path: "/partners/wallets",
        icon: <Wallet size={18} />,
      },
      // {
      //   name: "Support",
      //   icon: <Mail size={18} />,
      //   path: "/partners/wallets",
      // },
    ],
  },
  {
    name: "Commissions",
    icon: <Percent size={18} />,
    path: "/partners/commissions",
  },
  {
    name: "Setup ",
    icon: <Settings size={18} />,
    subItems: [
      {
        name: "Pages",
        path: "/partners/commissions",
        icon: <Book size={18} />,
      },
      {
        name: "Resources",
        path: "/partners/resources",
        icon: <Newspaper size={18} />,
      },
      
    ],
  },
]

const studentItems: NavItem[] = [
  {
    name: "Students",
    icon: <Users size={18} />,
    path: "/students",
  },
  {
    name: "Applications",
    icon: <FileText size={18} />,
    path: "/students/applications",
  },
  {
    name: "Wallet",
    icon: <Wallet size={18} />,
    path: "/students/wallets",
  },
  // {
  //   name: "Support",
  //   icon: <Mail size={18} />,
  //   path: "/students",
  // },
  {
    name: "Setup ",
    icon: <Settings size={18} />,
    subItems: [
      {
        name: "Pages",
        path: "/students",
        icon: <Book size={18} />,
      },
      {
        name: "Resources",
        path: "/students/resources",
        icon: <Newspaper size={18} />,
      },
      
    ],
  },
]

const universityAndCoursesItems: NavItem[] = [
  {
    name: "Universities",
    icon: <University size={18} />,
    path: "/universities",
  },
  {
    name: "Courses",
    icon: <LayoutDashboard size={18} />,
    path: "/universities/courses",
  },
  {
    name: "Master Data",
    icon: <Filter size={18} />,
    subItems: [
      {
        name: "Partners",
        path: "/universities/partners",
        icon: <GraduationCap size={18} />,
      },
      {
        name: "University Types",
        path: "/universities/types",
        icon: <GraduationCap size={18} />,
      },
      {
        name: "Collaborations",
        path: "/universities/collaborations",
        icon: <GraduationCap size={18} />,
      },
      {
        name: "Study Levels",
        path: "/universities/study-levels",
        icon: <GraduationCap size={18} />,
      },
      {
        name: "Disciplines",
        path: "/universities/disciplines",
        icon: <GraduationCap size={18} />,
      },
      {
        name: "Intakes",
        path: "/universities/intakes",
        icon: <GraduationCap size={18} />,
      },
      
    ],
  },
]

const userItems: NavItem[] = [
  {
    name: "Users",
    icon: <UserPlus size={18} />,
    path: "/users",
  },
  {
    name: "Roles",
    icon: <Users size={18} />,
    path: "/roles",
  },
]

export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/",
  }
];

const othersItems: NavItemOther[] = [
   {
    icon: <PieChartIcon />,
    name: "Setup",
    path: "/setup/general"
    
  },
  //  {
  //   icon: <PieChartIcon />,
  //   name: "Activity log",
  //   path: "/activity-log"
  // },
  {
    icon: <BoxCubeIcon />,
    name: "Account",
    subItems: [
      { name: "Billing", path: "/billing", pro: false },
      // { name: "Profile", path: "/profile", pro: false },
      // { name: "Logout", path: "/logout", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Domain",
    subItems: [

      { name: "Domain Management", path: "/domains", pro: false },
      { name: "Domain Request", path: "/domains/requests", pro: false },
    ],
  },
  // {
  //   icon: <BoxCubeIcon />,
  //   name: "Resources",
  //   subItems: [
  //     { name: "Database Backup", path: "/db-backup", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = useCallback((path: string | undefined): boolean => {
  //   if (!path) return false;
  //   return pathname === path;
  // }, [pathname]);

//   const isActive = useCallback(
//   (path?: string): boolean => {
//     if (!path) return false;

//     // Normalize trailing slashes (optional)
//     const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
//     const cleanCurrent = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

//     console.log(cleanCurrent, cleanPath)

//     // Match exact or child routes
//     return cleanCurrent === cleanPath || cleanCurrent.startsWith(`${cleanPath}/`);
//   },
//   [pathname]
// );

const isActive = useCallback(
  (path?: string): boolean => {
    if (!path) return false;

    // Special case for home/dashboard
    if (path === "/") {
      return pathname === "/admin";
    }

    // For other paths, check if the current pathname matches or starts with /admin + the given path
    const targetPath = `/admin${path}`;
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  },
  [pathname]
);


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
              href={"/admin" + item.path}
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

  const renderPartnerItems = () => (
    <ul className="flex flex-col gap-4">
      {partnerItems.map((item) => (
        <NavItemComponent key={item.name} item={item} />
      ))}
    </ul>
  );

  const renderStudentItems = () => (
    <ul className="flex flex-col gap-4">
      {studentItems.map((item) => (
        <NavItemComponent key={item.name} item={item} />
      ))}
    </ul>
  );

  const renderUniversityItems = () => (
    <ul className="flex flex-col gap-4">
      {universityAndCoursesItems.map((item) => (
        <NavItemComponent key={item.name} item={item} />
      ))}
    </ul>
  );

  const renderUserItems = () => (
    <ul className="flex flex-col gap-4">
      {userItems.map((item) => (
        <NavItemComponent key={item.name} item={item} />
      ))}
    </ul>
  );

  const renderOtherItems = () => (
    <ul className="flex flex-col gap-4">
      {othersItems.map((item, index) => {
        const itemKey = `others-${index}`;
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isSubmenuOpen = openSubmenus.has(itemKey);

        return (
          <li key={item.name}>
            {hasSubItems ? (
              <>
                <button
                  onClick={() => handleSubmenuToggle(itemKey)}
                  className={`menu-item group ${
                    isSubmenuOpen ? "menu-item-active" : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
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
                    <ul className="mt-2 space-y-1 ml-9">
                      {item.subItems!.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={"/admin" + subItem.path}
                            className={`menu-dropdown-item ${
                              isActive(subItem.path)
                                ? "menu-dropdown-item-active"
                                : "menu-dropdown-item-inactive"
                            }`}
                          >
                            {subItem.name}
                            <span className="flex items-center gap-1 ml-auto">
                              {subItem.new && (
                                <span className="menu-dropdown-badge">new</span>
                              )}
                              {subItem.pro && (
                                <span className="menu-dropdown-badge">pro</span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              item.path && (
                <Link
                  href={"/admin" + item.path}
                  className={`menu-item group ${
                    isActive(item.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
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
      })}
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
    
    // Find and open menus for other items
    othersItems.forEach((item, index) => {
      const itemKey = `others-${index}`;
      if (item.path === pathname) {
        setOpenSubmenus(prev => new Set(prev).add(itemKey));
      }
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(subItem => subItem.path === pathname);
        if (hasActiveSubItem) {
          setOpenSubmenus(prev => new Set(prev).add(itemKey));
        }
      }
    });
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
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
        }`}
      >
        <Link href="/admin">
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
              {/* <span className="dark:text-white ms-1 text-black font-semibold text-2xl">
                ApplyTech
              </span> */}
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

             <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Partner Platform"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderPartnerItems()}
            </div>

             <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  " Student Platform"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderStudentItems()}
            </div>

             <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  " Universities & Courses"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderUniversityItems()}
            </div>

 <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  " User Management"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderUserItems()}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderOtherItems()}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? null : null}
      </div>
    </aside>
  );
};

export default AppSidebar;