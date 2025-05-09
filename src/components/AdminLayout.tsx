"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 lg:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}