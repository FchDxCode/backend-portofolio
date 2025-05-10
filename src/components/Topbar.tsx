"use client";

import { 
  Bell, 
  ChevronDown, 
  Menu, 
  Search, 
  User, 
  MessageSquare, 
  HelpCircle, 
  Settings as SettingsIcon
} from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/src/lib/utils";
import { signOutAction } from "@/src/services/AuthServices";
import Link from "next/link";
import Image from "next/image";

interface TopbarProps {
  toggleSidebar: () => void;
}

export default function Topbar({ toggleSidebar }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn(
      "w-full sticky top-0 z-30 transition-all duration-300 ease-in-out",
      scrolled 
        ? "bg-background/80 backdrop-blur-lg shadow-sm" 
        : "bg-background border-b border-border/40",
      "supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="flex h-16 items-center px-4 lg:px-6 gap-4">
        {/* Mobile sidebar toggle */}
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-accent transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand/Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="relative h-8 w-8 rounded-md overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">A</span>
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
          </div>
          <span className="font-semibold text-lg hidden sm:inline-block tracking-tight">Fachru Admin</span>
        </div>

        {/* Search - Expandable on mobile */}
        <div className={cn(
          "relative transition-all duration-300 ease-in-out",
          searchOpen ? "flex-1" : "w-64 hidden md:block"
        )}>
          <div className="relative group rounded-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors duration-200" />
            <input
              type="search" 
              placeholder="Search..."
              className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
            />
            <div className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px]">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px]">K</kbd>
            </div>
          </div>
        </div>
        
        {/* Mobile search toggle */}
        <button 
          onClick={() => setSearchOpen(!searchOpen)}
          className="inline-flex md:hidden items-center justify-center w-9 h-9 rounded-full hover:bg-accent transition-colors"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          {/* Help button */}
          <button className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>
          
          {/* Messages */}
          <div className="relative group">
            <button className="inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <MessageSquare className="h-[18px] w-[18px]" />
              <span className="absolute top-1 right-1.5 flex h-2 w-2 rounded-full bg-sky-500 ring-1 ring-white"></span>
            </button>
            <div className="hidden group-hover:block absolute top-full right-0 mt-1 w-80 p-0 rounded-lg shadow-lg bg-card border border-border animate-in fade-in-20 slide-in-from-top-5 z-50">
              <div className="p-3 border-b border-border">
                <h3 className="font-medium">Messages</h3>
              </div>
              <div className="max-h-60 overflow-y-auto scrollbar-thin">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 hover:bg-accent/50 border-b border-border last:border-0 transition-colors">
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-accent flex-shrink-0 overflow-hidden">
                        <div className="bg-gradient-to-br from-indigo-400 to-purple-400 h-full w-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">U{i}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">User {i}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">New message about the project updates</p>
                        <p className="text-xs text-muted-foreground mt-1">{i * 10} min ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <Link 
                  href="/dashboard/messages"
                  className="text-xs text-center w-full py-2 hover:bg-accent rounded-md transition-colors inline-block text-primary"
                >
                  View all messages
                </Link>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative group">
            <button className="inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-1 ring-white"></span>
            </button>
            <div className="hidden group-hover:block absolute top-full right-0 mt-1 w-80 p-0 rounded-lg shadow-lg bg-card border border-border animate-in fade-in-20 slide-in-from-top-5 z-50">
              <div className="p-3 border-b border-border">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div className="max-h-60 overflow-y-auto scrollbar-thin">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 hover:bg-accent/50 border-b border-border last:border-0 transition-colors">
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${i === 1 ? 'bg-blue-500' : 'bg-gray-300'} flex-shrink-0`}></div>
                      <div>
                        <p className="font-medium text-sm">New update available</p>
                        <p className="text-xs text-muted-foreground">Dashboard v2.0.{i} is now available</p>
                        <p className="text-xs text-muted-foreground mt-1">{i} hour ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <Link 
                  href="/dashboard/notifications"
                  className="text-xs text-center w-full py-2 hover:bg-accent rounded-md transition-colors inline-block text-primary"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
          
          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-full hover:bg-accent transition-colors">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 flex items-center justify-center overflow-hidden">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-sm hidden sm:block">Admin</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </button>
            
            <div className="hidden group-hover:block absolute top-full right-0 mt-1 w-56 p-1 rounded-lg shadow-lg bg-card border border-border animate-in fade-in-20 slide-in-from-top-5 z-50">
              <div className="px-3 py-2 mb-1">
                <p className="font-medium text-sm">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@example.com</p>
              </div>
              
              <div className="h-px bg-border my-1"></div>
              
              <Link href="/dashboard/profile" className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              
              <Link href="/dashboard/settings" className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              
              <div className="h-px bg-border my-1"></div>
              
              <button 
                onClick={async () => {
                  try {
                    await signOutAction();
                  } catch (error) {
                    console.error("Logout error:", error);
                  }
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}