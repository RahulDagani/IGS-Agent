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
  
];


const studentItems: NavItem[] = [
  {
        name: "Students",
        path: "/students",
        icon: <Users size={18} />,
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
        name: "Commissions",
        path: "/commissions",
        icon: <Percent size={18} />,
      },
      {
        name: "Wallet",
        path: "/wallet",
        icon: <Wallet size={18} />,
      },
]

const accountItems: NavItem[] = [
  
      {
        name: "Resources",
        icon: <Mail size={18} />,
        path: "/resources",
      },
      {
        name: "Account",
        path: "/profile",
        icon: <Settings size={18} />,
      },
      {
        name: "Users",
        path: "/users",
        icon: <Settings size={18} />,
      },
]


const AppSidebar: React.FC = () => {
  const router = useRouter();
  const {adminToken, adminReLoginFromAgent, user} = useAuth();

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Create computed navigation items based on adminToken
  const [computedNavItems, setComputedNavItems] = useState<NavItem[]>(navItems);
  
  useEffect(() => {
    // Update navigation items when adminToken changes
    const updatedItems = [...navItems];
    
    if (adminToken) {
      // Add "Go to Admin Panel" item when adminToken exists
      updatedItems.unshift({
        name: "Go to Admin Panel",
        icon: <ArrowLeft size={18} />,
        path: "#",
      });
    }
    
    setComputedNavItems(updatedItems);
  }, [adminToken]); // This effect runs when adminToken changes


  const isActive = useCallback((path: string | undefined): boolean => {
    if (!path) return false;
    return pathname === path;
  }, [pathname]);


  const isAgent = user ? user.role == "agent" : false;

  const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_BASE;

  const handleAdminReLogin = async () =>{
   
    try {
      const response = await fetch(`${BASE_URL}/agent/admin/login`, {
        headers:{
        "Authorization" : `Bearer ${adminToken}`
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

      // Redirect to intended page or admin dashboard
      
    } catch (error) {
      alert("Login failed");
    }     
  }

  // Recursive component for nested menu items
 const NavItemComponent: React.FC<{ 
   item: NavItem; 
   level?: number;
   parentKey?: string;
   section?: string; // Add section identifier
 }> = ({ item, level = 0, parentKey = '', section = '' }) => {
   // Include section in the itemKey to make it unique
   const itemKey = parentKey 
     ? `${section}-${parentKey}-${item.name}` 
     : `${section}-${item.name}`;
     
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
                     section={section}
                   />
                 ))}
               </ul>
             </div>
           )}
         </>
       ) : (
         item.path && (
           <Link
             href={"/partner" + item.path}
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
      {computedNavItems.map((item) => {
        if (item.name === "Go to Admin Panel" && adminToken) {
          return (
            <li key={item.name}>
              <div
                onClick={handleAdminReLogin}
                className={`menu-item group cursor-pointer`}
                style={{ paddingLeft: `16px` }}
              >
                <span className={"menu-item-icon-inactive"}>
                  <ArrowLeft size={19}/>
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
            section="main" 
          />
        );
      })}
    </ul>
  );

  const renderStudentItems = () => (
  <ul className="flex flex-col gap-4">
    {isAgent 
    ? studentItems.map((item) => (
      <NavItemComponent key={item.name} item={item} section="" />
    ))
    : studentItems.filter((item)=>item.name != "Wallet").map((item) => (
      <NavItemComponent key={item.name} item={item} section="" />
    ))
    }
  </ul>
);

  const renderAccountItems = () => (
  <ul className="flex flex-col gap-4">
    {accountItems.map((item) => (
      <NavItemComponent key={item.name} item={item} section="" />
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
    
    // Find and open menus for other items
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
         <Link href="/partner">
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
          

          
          <div className="">
                        <h2
                          className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                            !isExpanded && !isHovered
                              ? "lg:justify-center"
                              : "justify-start"
                          }`}
                        >
                          {isExpanded || isHovered || isMobileOpen ? (
                            "Student Area"
                          ) : (
                            <HorizontaLDots />
                          )}
                        </h2>
                        {renderStudentItems()}
                      </div>
                          {isAgent && <>
                       <div className="">
                        <h2
                          className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                            !isExpanded && !isHovered
                              ? "lg:justify-center"
                              : "justify-start"
                          }`}
                        >
                          {isExpanded || isHovered || isMobileOpen ? (
                            "Account Settings"
                          ) : (
                            <HorizontaLDots />
                          )}
                        </h2>
                        {renderAccountItems()}
                      </div></>}

                      </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? null : null}
      </div>
    </aside>
  );
};

export default AppSidebar;