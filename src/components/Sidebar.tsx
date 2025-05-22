"use client";

import { cn } from "@/src/lib/utils";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  CreditCard,
  File,
  FileText,
  FolderKanban,
  Globe,
  Home,
  LifeBuoy,
  Mail,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Trash,
  TrendingUp,
  Users,
  X,
  Activity,
  Award,
  Briefcase,
  Phone,
  Shield,
  User,
  Layers,
  CheckSquare
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

  const navSections: NavSection[] = [
    {
      title: "Dashboard",
      items: [
        { 
          title: "Overview", 
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
      title: "Content Management",
      items: [
        { 
          title: "Services", 
          icon: <Briefcase className="w-4 h-4" />, 
          href: "/services", 
          submenu: [
            { title: "Brand Management", href: "/brand" },
            { title: "Service Benefits", href: "/service-benefit" },
            { title: "Tech Stack Skills", href: "/tech-stack-skill" },
            { title: "Tech Stack", href: "/tech-stack" },
            { title: "Featured Services", href: "/featured-services" },
            { title: "FAQ", href: "/faq" },
          ]
        },
        {
          title: "Package Pricing",
          icon: <Package className="w-4 h-4" />,
          href: "/package-pricing",
          submenu: [
            { title: "Package Pricing", href: "/package-pricing" },
            { title: "Package Benefit", href: "/package-benefit" },
            { title: "Package Exclusion", href: "/package-exclusion" },
          ]
        },
        { 
          title: "Service Process", 
          icon: <Activity className="w-4 h-4" />, 
          href: "/service-process",
          submenu: [
            { title: "Process Activities", href: "/process-activity-services" },
            { title: "Service Process", href: "/services-process" },
          ]
        },
        { 
          title: "Articles", 
          icon: <FileText className="w-4 h-4" />, 
          href: "/articles",
          submenu: [
            { title: "All Articles", href: "/article" },
            { title: "Categories", href: "/category-article" },
            { title: "Tags", href: "/article-tag" }
          ]
        },
        { 
          title: "Portfolio", 
          icon: <Star className="w-4 h-4" />, 
          href: "/portfolio",
          submenu: [
            { title: "Projects", href: "/proyek" },
            { title: "Experience", href: "/experience" },
            { title: "Experience Categories", href: "/category-experience" },
            { title: "Certificates", href: "/certificate" },
          ]
        },
      ]
    },
    {
      title: "Page Management",
      items: [
        { 
          title: "Hero Sections", 
          icon: <Layers className="w-4 h-4" />, 
          href: "/hero-sections",
          submenu: [
            { title: "Home Hero", href: "/home-hero" },
            { title: "About Hero", href: "/about-hero" },
            { title: "Service Hero", href: "/service-hero" },
            { title: "Hero Call Me", href: "/hero-call-me" },
          ]
        },
        { 
          title: "Interactive Elements", 
          icon: <MessageSquare className="w-4 h-4" />, 
          href: "/interactive",
          submenu: [
            { title: "Call to Action", href: "/cta" },
            { title: "Call Me Banner", href: "/callme-banner-item" },
            { title: "Hire Me Section", href: "/hire-me" },
          ]
        },
        { 
          title: "Legal Pages", 
          icon: <Shield className="w-4 h-4" />, 
          href: "/legal",
          submenu: [
            { title: "Privacy Policy", href: "/privacy-policy" },
            { title: "Terms of Service", href: "/term-of-services" },
            { title: "Cookie Policy", href: "/cookie-policy" },
          ]
        },
        { 
          title: "Contact", 
          icon: <Phone className="w-4 h-4" />, 
          href: "/contact" 
        },
        {
          title: "Promise", 
          icon: <CheckSquare className="w-4 h-4" />, 
          href: "/promise-item",
        }
      ]
    },
    {
      title: "System",
      items: [
        { 
          title: "Website Settings", 
          icon: <Settings className="w-4 h-4" />, 
          href: "/web-setting" 
        },
        { 
          title: "Trash", 
          icon: <Trash className="w-4 h-4" />, 
          href: "/trash" 
        },
      ]
    }
  ];

  // Auto-expand menu if current path is in submenu
  const initializeExpandedMenus = () => {
    const expanded: { [key: string]: boolean } = {};
    navSections.forEach(section => {
      section.items.forEach(item => {
        if (item.submenu) {
          const hasActiveSubmenu = item.submenu.some(sub => pathname === sub.href);
          if (hasActiveSubmenu) {
            expanded[item.title] = true;
          }
        }
      });
    });
    return expanded;
  };

  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>(() => 
    initializeExpandedMenus()
  );

  const toggleSubmenu = (section: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActiveItem = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some(sub => pathname === sub.href);
    }
    return false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 border-r border-border bg-background transition-transform duration-300 ease-in-out lg:z-0 lg:translate-x-0",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 shadow-lg">
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">F</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-foreground">Fachru Admin</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </div>
          <button 
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
            {navSections.map((section, i) => (
              <div key={i} className="space-y-2">
                <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, j) => (
                    <div key={j}>
                      {/* Main Menu Item */}
                      {item.submenu ? (
                        <button
                          onClick={() => toggleSubmenu(item.title)}
                          className={cn(
                            "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                            isActiveItem(item)
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "text-foreground/70 hover:bg-accent hover:text-foreground border border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex items-center justify-center w-5 h-5 transition-colors",
                              isActiveItem(item) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                              {item.icon}
                            </div>
                            <span className="truncate">{item.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <span className={cn(
                                "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium text-white",
                                item.badgeColor || "bg-primary"
                              )}>
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                expandedMenus[item.title] ? "rotate-90" : ""
                              )}
                            />
                          </div>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group border",
                            pathname === item.href 
                              ? "bg-primary/10 text-primary border-primary/20" 
                              : "text-foreground/70 hover:bg-accent hover:text-foreground border-transparent"
                          )}
                          onClick={onClose}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex items-center justify-center w-5 h-5 transition-colors",
                              pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                              {item.icon}
                            </div>
                            <span className="truncate">{item.title}</span>
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

                      {/* Submenu */}
                      {item.submenu && (
                        <div className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          expandedMenus[item.title] ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                        )}>
                          <div className="ml-8 space-y-1 py-1">
                            {item.submenu.map((subItem, k) => (
                              <Link
                                key={k}
                                href={subItem.href}
                                className={cn(
                                  "flex items-center text-sm px-3 py-2 rounded-md transition-all duration-200 group border-l-2",
                                  pathname === subItem.href
                                    ? "bg-primary/5 text-primary font-medium border-l-primary" 
                                    : "text-foreground/60 hover:text-foreground hover:bg-accent/50 border-l-transparent hover:border-l-muted-foreground/30"
                                )}
                                onClick={onClose}
                              >
                                <span className="truncate">{subItem.title}</span>
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
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border bg-accent/30">
            <button className="w-full flex items-center gap-3 justify-center rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground transition-all duration-200 group">
              <LifeBuoy className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span>Help & Support</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}