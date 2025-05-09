"use client";

import { cn } from "@/src/lib/utils";
import {
  BarChart3,
  Calendar,
  CreditCard,
  File,
  FolderKanban,
  Home,
  Mail,
  Settings,
  ShoppingCart,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type NavItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navSections: NavSection[] = [
    {
      title: "Menu",
      items: [
        { title: "Dashboard", icon: <Home className="w-4 h-4" />, href: "/dashboard" },
        { title: "Analytics", icon: <BarChart3 className="w-4 h-4" />, href: "/dashboard/analytics" }
      ]
    },
    {
      title: "Business",
      items: [
        { title: "Orders", icon: <ShoppingCart className="w-4 h-4" />, href: "/dashboard/orders", badge: "5" },
        { title: "Customers", icon: <Users className="w-4 h-4" />, href: "/dashboard/customers" },
        { title: "Invoices", icon: <File className="w-4 h-4" />, href: "/dashboard/invoices" },
      ]
    },
    {
      title: "Applications",
      items: [
        { title: "Calendar", icon: <Calendar className="w-4 h-4" />, href: "/dashboard/calendar" },
        { title: "Projects", icon: <FolderKanban className="w-4 h-4" />, href: "/dashboard/projects" },
        { title: "Inbox", icon: <Mail className="w-4 h-4" />, href: "/dashboard/inbox", badge: "12" },
        { title: "Payments", icon: <CreditCard className="w-4 h-4" />, href: "/dashboard/payments" },
      ]
    },
    {
      title: "System",
      items: [
        { title: "Settings", icon: <Settings className="w-4 h-4" />, href: "/dashboard/settings" },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 border-r border-border/40 bg-background transition-transform lg:z-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-border/40 px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-semibold text-lg">AdminDash</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="h-[calc(100vh-4rem)]">
          <div className="py-4 px-3">
            {navSections.map((section, i) => (
              <div key={i} className="mb-6">
                <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, j) => (
                    <Link
                      key={j}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/50",
                        pathname === item.href 
                          ? "bg-accent text-accent-foreground" 
                          : "text-foreground/70 hover:text-foreground"
                      )}
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        {item.title}
                      </div>
                      {item.badge && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="rounded-lg bg-accent/80 p-4">
            <p className="mb-2 text-sm font-medium">Need help?</p>
            <p className="text-xs text-muted-foreground mb-3">Check our documentation</p>
            <Button size="sm" className="w-full">View Documentation</Button>
          </div>
        </div>
      </aside>
    </>
  );
}