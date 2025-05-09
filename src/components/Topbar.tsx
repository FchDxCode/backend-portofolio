"use client";

import { Bell, ChevronDown, Menu, Search, User } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTheme } from "next-themes";
import { cn } from "@/src/lib/utils";

interface TopbarProps {
  toggleSidebar: () => void;
}

export default function Topbar({ toggleSidebar }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme } = useTheme();
  
  return (
    <div className="w-full sticky top-0 z-30 bg-background border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile sidebar toggle */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Brand/Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="font-semibold text-lg hidden sm:inline-block">AdminDash</span>
        </div>

        {/* Search - Expandable on mobile */}
        <div className={cn(
          "relative transition-all duration-300 ease-in-out",
          searchOpen ? "flex-1" : "w-64 hidden md:block"
        )}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search" 
            placeholder="Search..."
            className="w-full h-9 rounded-md border border-input px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        
        {/* Mobile search toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="py-2 cursor-pointer">
                  <div className="flex gap-4 items-start">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${i === 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium text-sm">New update available</p>
                      <p className="text-xs text-muted-foreground">Dashboard v2.0.1 is now available</p>
                      <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-center">
                <Button variant="ghost" size="sm" className="w-full text-sm text-blue-500">
                  View all notifications
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Switcher */}
          <ThemeSwitcher />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm hidden sm:block">Admin</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}