"use client";

import { 
  Bell, 
  ChevronDown, 
  Menu, 
  Search, 
  User, 
  MessageSquare, 
  HelpCircle, 
  Settings as SettingsIcon,
  LogOut,
  UserCircle,
  Command
} from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/src/lib/utils";
import { signOutAction } from "@/src/services/AuthServices";
import Link from "next/link";

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
    <header className={cn(
      "w-full sticky top-0 z-40 transition-all duration-300 ease-in-out border-b",
      scrolled 
        ? "bg-background/95 backdrop-blur-md shadow-lg border-border/60" 
        : "bg-background/90 backdrop-blur-sm border-border/40",
      "supports-[backdrop-filter]:bg-background/85"
    )}>
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile sidebar toggle */}
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden group relative overflow-hidden rounded-xl p-2 hover:bg-accent/80 transition-all duration-200 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Menu className="h-5 w-5 relative z-10" />
          </button>

          {/* Search */}
          <div className={cn(
            "relative transition-all duration-300 ease-in-out",
            searchOpen ? "w-full max-w-md" : "w-96 hidden md:block"
          )}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors duration-200 z-10" />
              <input
                type="search" 
                placeholder="Search anything..."
                className="relative w-full h-11 rounded-xl border border-border/50 bg-background/50 pl-12 pr-20 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
                <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border/60 bg-muted/50 px-2 text-[11px] font-medium text-muted-foreground/80">
                  <Command className="h-3 w-3" />
                </kbd>
                <span className="text-xs text-muted-foreground/60">K</span>
              </div>
            </div>
          </div>
          
          {/* Mobile search toggle */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden group relative overflow-hidden rounded-xl p-2 hover:bg-accent/80 transition-all duration-200 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Search className="h-5 w-5 relative z-10" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Help */}
          <button className="group relative overflow-hidden rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 active:scale-95 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <HelpCircle className="h-5 w-5 relative z-10" />
          </button>
          
          {/* Messages */}
          <div className="relative group">
            <button className="group/btn relative overflow-hidden rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-sky-600/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <MessageSquare className="h-5 w-5 relative z-10" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-[10px] font-medium text-white shadow-lg">
                3
              </span>
            </button>
            
            {/* Messages Dropdown */}
            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-2xl bg-card/95 backdrop-blur-xl border border-border/50 transition-all duration-300 transform scale-95 group-hover:scale-100 z-50">
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-sky-500/5 to-sky-600/5 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground">Messages</h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/10 text-xs font-medium text-sky-600">3</span>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 hover:bg-accent/30 border-b border-border/30 last:border-0 transition-all duration-200 group/item">
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                          <span className="text-white font-medium text-sm">U{i}</span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground group-hover/item:text-primary transition-colors">User {i}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">Hey! I wanted to discuss the new project requirements and timeline...</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">{i * 5} min ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border/50 bg-accent/20 rounded-b-2xl">
                <Link 
                  href="/messages"
                  className="block text-center text-xs font-medium text-primary hover:text-primary/80 py-2 px-4 rounded-lg hover:bg-primary/5 transition-all duration-200"
                >
                  View all messages
                </Link>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative group">
            <button className="group/btn relative overflow-hidden rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <Bell className="h-5 w-5 relative z-10" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] font-medium text-white shadow-lg animate-pulse">
                5
              </span>
            </button>
            
            {/* Notifications Dropdown */}
            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-2xl bg-card/95 backdrop-blur-xl border border-border/50 transition-all duration-300 transform scale-95 group-hover:scale-100 z-50">
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-xs font-medium text-red-600">5</span>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 hover:bg-accent/30 border-b border-border/30 last:border-0 transition-all duration-200 group/item">
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        i <= 2 ? "bg-red-500 shadow-lg shadow-red-500/20" : "bg-muted-foreground/30"
                      )}></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground group-hover/item:text-primary transition-colors">
                          {i <= 2 ? "New system update" : "Update completed"}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Dashboard v2.{i}.0 {i <= 2 ? "is now available for download" : "has been installed successfully"}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">{i * 15} min ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border/50 bg-accent/20 rounded-b-2xl">
                <Link 
                  href="/notifications"
                  className="block text-center text-xs font-medium text-primary hover:text-primary/80 py-2 px-4 rounded-lg hover:bg-primary/5 transition-all duration-200"
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
          
          {/* Divider */}
          <div className="h-6 w-px bg-border/60 mx-1"></div>
          
          {/* User Menu */}
          <div className="relative group">
            <button className="group/btn flex items-center gap-3 h-10 pl-1 pr-3 rounded-xl hover:bg-accent/80 transition-all duration-200 active:scale-95">
              <div className="relative">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg overflow-hidden">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-medium text-sm text-foreground group-hover/btn:text-primary transition-colors">Admin</p>
                <p className="text-xs text-muted-foreground/70">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block group-hover/btn:text-foreground transition-all duration-200 group-hover/btn:rotate-180" />
            </button>
            
            {/* User Dropdown */}
            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-2xl bg-card/95 backdrop-blur-xl border border-border/50 transition-all duration-300 transform scale-95 group-hover:scale-100 z-50">
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@fachru.com</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <Link href="/profile" className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-accent/50 transition-all duration-200 group/item">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 group-hover/item:bg-blue-500/20 transition-colors">
                    <UserCircle className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Profile Settings</span>
                </Link>
                
                <Link href="/settings" className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-accent/50 transition-all duration-200 group/item">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 group-hover/item:bg-purple-500/20 transition-colors">
                    <SettingsIcon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Account Settings</span>
                </Link>
                
                <div className="h-px bg-border/50 my-2"></div>
                
                <button 
                  onClick={async () => {
                    try {
                      await signOutAction();
                    } catch (error) {
                      console.error("Logout error:", error);
                    }
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 group/item"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 group-hover/item:bg-red-500/20 transition-colors">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}