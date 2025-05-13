"use client";

import { cn } from "@/src/lib/utils";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  CreditCard,
  File,
  FilePlus,
  FolderKanban,
  Gift,
  Home,
  LifeBuoy,
  Mail,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Trash,
  TrendingUp,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type NavItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  badgeColor?: string;
  submenu?: { title: string; href: string }[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    // Pre-expand the menu containing the current path
    Menu: pathname.startsWith("/dashboard"),
    Business: pathname.includes("/dashboard/orders") || 
             pathname.includes("/dashboard/customers") || 
             pathname.includes("/dashboard/invoices")
  });

  // Toggle submenu expanded state
  const toggleSubmenu = (section: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navSections: NavSection[] = [
    {
      title: "Menu",
      items: [
        { 
          title: "Dashboard", 
          icon: <Home className="w-4 h-4" />, 
          href: "/"
        },
        { 
          title: "Analytics", 
          icon: <TrendingUp className="w-4 h-4" />, 
          href: "/analytics",
          badge: "New",
          badgeColor: "bg-blue-500"
        }
      ]
    },
    {
      title: "Business",
      items: [
        { 
          title: "Orders", 
          icon: <ShoppingCart className="w-4 h-4" />, 
          href: "/dashboard/orders", 
          badge: "5", 
          badgeColor: "bg-emerald-500",
          submenu: [
            { title: "All Orders", href: "/dashboard/orders" },
            { title: "Pending", href: "/dashboard/orders/pending" },
            { title: "Completed", href: "/dashboard/orders/completed" }
          ]
        },
        { 
          title: "Customers", 
          icon: <Users className="w-4 h-4" />, 
          href: "/dashboard/customers",
          submenu: [
            { title: "All Customers", href: "/dashboard/customers" },
            { title: "Add New", href: "/dashboard/customers/new" }
          ]
        },
        { 
          title: "Products", 
          icon: <Package className="w-4 h-4" />, 
          href: "/dashboard/products"
        },
        { 
          title: "Invoices", 
          icon: <File className="w-4 h-4" />, 
          href: "/dashboard/invoices" 
        },
        { 
          title: "Discounts", 
          icon: <Tag className="w-4 h-4" />, 
          href: "/dashboard/discounts" 
        },
      ]
    },
    {
      title: "Single Page",
      items: [
        { 
          title: "About Hero", 
          icon: <Calendar className="w-4 h-4" />, 
          href: "/about-hero" 
        },
        { 
          title: "Home Hero", 
          icon: <FolderKanban className="w-4 h-4" />, 
          href: "/home-hero" 
        },
        { 
          title: "Hire Me", 
          icon: <FolderKanban className="w-4 h-4" />, 
          href: "/hire-me" 
        },
        { 
          title: "Messages", 
          icon: <MessageSquare className="w-4 h-4" />, 
          href: "/dashboard/messages", 
          badge: "3",
          badgeColor: "bg-sky-500"
        },
        { 
          title: "Inbox", 
          icon: <Mail className="w-4 h-4" />, 
          href: "/dashboard/inbox", 
          badge: "12",
          badgeColor: "bg-amber-500"
        },
        { 
          title: "Payments", 
          icon: <CreditCard className="w-4 h-4" />, 
          href: "/dashboard/payments" 
        },
      ]
    },
    {
      title: "System",
      items: [
        { 
          title: "Settings", 
          icon: <Settings className="w-4 h-4" />, 
          href: "/dashboard/settings" 
        },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 border-r border-border bg-background transition-transform duration-300 ease-in-out lg:w-72 lg:z-0 lg:translate-x-0",
          open ? "translate-x-0 shadow-lg" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center border-b border-border px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-md overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">A</span>
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
            </div>
            <span className="font-semibold text-lg tracking-tight">Fachru Admin</span>
          </div>
          <button 
            className="ml-auto lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 overflow-y-auto py-4 px-3 lg:px-4 scrollbar-thin">
            {navSections.map((section, i) => (
              <div key={i} className="mb-6">
                <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex flex-col">
                      {/* Main Menu Item */}
                      <div className={cn(
                        "relative group",
                        item.submenu ? "cursor-pointer" : ""
                      )}>
                        {item.submenu ? (
                          <button
                            onClick={() => toggleSubmenu(item.title)}
                            className={cn(
                              "w-full flex items-center justify-between rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                              expandedMenus[item.title] || pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== "/dashboard")
                                ? "bg-accent text-accent-foreground" 
                                : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-5">
                                {item.icon}
                              </div>
                              <span>{item.title}</span>
                            </div>
                            <div className="flex items-center">
                              {item.badge && (
                                <span className={cn(
                                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium text-white mr-2",
                                  item.badgeColor || "bg-primary"
                                )}>
                                  {item.badge}
                                </span>
                              )}
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                  expandedMenus[item.title] ? "rotate-180" : ""
                                )}
                              />
                            </div>
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center justify-between rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                              pathname === item.href 
                                ? "bg-accent text-accent-foreground" 
                                : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                            )}
                            onClick={(e) => {
                              if (item.href === pathname) {
                                e.preventDefault();
                              } else {
                                onClose();
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-5">
                                {item.icon}
                              </div>
                              <span>{item.title}</span>
                            </div>
                            {item.badge && (
                              <span className={cn(
                                "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium text-white",
                                item.badgeColor || "bg-primary"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )}
                      </div>

                      {/* Submenu */}
                      {item.submenu && (
                        <div className={cn(
                          "pl-12 pr-3 overflow-hidden transition-all duration-300 ease-in-out",
                          expandedMenus[item.title] ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                        )}>
                          <div className="py-1 space-y-1">
                            {item.submenu.map((subItem, k) => (
                              <Link
                                key={k}
                                href={subItem.href}
                                className={cn(
                                  "flex text-sm px-3 py-1.5 rounded-md transition-colors",
                                  pathname === subItem.href
                                    ? "bg-accent/80 text-accent-foreground font-medium" 
                                    : "text-foreground/60 hover:text-foreground hover:bg-accent/30"
                                )}
                                onClick={onClose}
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="px-4 mb-6">
              <div className="h-px bg-border mb-4" />
              
              <Link
                href="/dashboard/trash"
                className="flex items-center justify-between rounded-md px-4 py-2.5 text-sm font-medium text-foreground/70 hover:bg-accent/50 hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash className="w-4 h-4" />
                  <span>Trash</span>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border mt-auto">
            
            
            <div className="mt-4">
              <button className="w-full flex items-center gap-2 justify-center rounded-md border border-border py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
                <LifeBuoy className="h-4 w-4" />
                <span>Help & Support</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}